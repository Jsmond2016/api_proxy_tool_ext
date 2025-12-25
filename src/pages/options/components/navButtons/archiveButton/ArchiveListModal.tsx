import React, { useState, useEffect } from "react"
import {
  Modal,
  Table,
  message,
  Button,
  Space,
  Tag,
  Descriptions,
  Popconfirm,
  Typography,
} from "antd"
import {
  ReloadOutlined,
  DeleteOutlined,
  RollbackOutlined,
} from "@ant-design/icons"
import { ArchiveRecord } from "@src/types"
import {
  getArchiveList,
  loadArchive,
  deleteArchive,
  initArchiveDB,
} from "@src/utils/archiveUtil"
import { useConfigStore, useActiveModuleIdStore } from "@src/store"
import { saveConfig } from "@src/utils/configUtil"
import {
  getIterationInfo,
  saveIterationInfo,
} from "../syncApifoxModalButton/apifoxCache"
import { parseDocLinks } from "@src/utils/docUtils"

const { Text } = Typography

interface ArchiveListModalProps {
  visible: boolean
  onCancel: () => void
}

const ArchiveListModal: React.FC<ArchiveListModalProps> = ({
  visible,
  onCancel,
}) => {
  const { config, setConfig } = useConfigStore()
  const { setActiveModuleId } = useActiveModuleIdStore()
  const [archives, setArchives] = useState<ArchiveRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [restoring, setRestoring] = useState<number | null>(null)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [selectedArchive, setSelectedArchive] = useState<ArchiveRecord | null>(
    null
  )
  const [detailVisible, setDetailVisible] = useState(false)

  // 加载归档列表
  const loadArchives = async () => {
    setLoading(true)
    try {
      await initArchiveDB()
      const list = await getArchiveList()
      setArchives(list)
    } catch (error) {
      console.error("Failed to load archives:", error)
      message.error("加载归档列表失败")
    } finally {
      setLoading(false)
    }
  }

  // 初始化时加载列表
  useEffect(() => {
    if (visible) {
      loadArchives()
    }
  }, [visible])

  // 恢复归档
  const handleRestore = async (archiveId: number) => {
    setRestoring(archiveId)
    try {
      const archiveRecord = await loadArchive(archiveId)
      const archiveData = archiveRecord.archiveData

      // 恢复配置：覆盖当前所有配置
      const restoredConfig = {
        isGlobalEnabled: config.isGlobalEnabled, // 保留全局开关状态
        modules: archiveData.modules.map((module) => ({ ...module })),
        apifoxConfig: archiveData.apifoxConfig
          ? { ...archiveData.apifoxConfig }
          : undefined,
        quickMockConfigs: archiveData.quickMockConfigs
          ? [...archiveData.quickMockConfigs]
          : undefined,
      }

      // 更新配置
      setConfig(restoredConfig)
      await saveConfig(restoredConfig)

      // 恢复迭代信息
      if (archiveData.iterationInfo) {
        const iterationInfoMap = await getIterationInfo()
        iterationInfoMap[archiveData.tag] = {
          tag: archiveData.iterationInfo.tag,
          requirementDocs: archiveData.iterationInfo.requirementDocs,
          technicalDocs: archiveData.iterationInfo.technicalDocs,
          prototypeDocs: archiveData.iterationInfo.prototypeDocs,
        }
        await saveIterationInfo(iterationInfoMap)
      }

      // 激活第一个模块（如果存在）
      if (restoredConfig.modules.length > 0) {
        setActiveModuleId(restoredConfig.modules[0].id)
      }

      message.success("恢复成功")
      onCancel()
    } catch (error) {
      console.error("Failed to restore archive:", error)
      message.error("恢复失败，请重试")
    } finally {
      setRestoring(null)
    }
  }

  // 删除归档
  const handleDelete = async (archiveId: number) => {
    setDeleting(archiveId)
    try {
      await deleteArchive(archiveId)
      message.success("删除成功")
      loadArchives()
    } catch (error) {
      console.error("Failed to delete archive:", error)
      message.error("删除失败，请重试")
    } finally {
      setDeleting(null)
    }
  }

  // 查看详情
  const handleViewDetail = async (archiveId: number) => {
    try {
      const archiveRecord = await loadArchive(archiveId)
      setSelectedArchive(archiveRecord)
      setDetailVisible(true)
    } catch (error) {
      console.error("Failed to load archive detail:", error)
      message.error("加载详情失败")
    }
  }

  const columns = [
    {
      title: "迭代 Tag",
      dataIndex: "tag",
      key: "tag",
      render: (tag: string) => <Tag color="blue">{tag}</Tag>,
      width: 120,
    },
    {
      title: "归档时间",
      dataIndex: "archivedAt",
      key: "archivedAt",
      render: (timestamp: number) =>
        new Date(timestamp).toLocaleString("zh-CN"),
      sorter: (a: ArchiveRecord, b: ArchiveRecord) =>
        b.archivedAt - a.archivedAt,
      defaultSortOrder: "descend" as const,
      width: 180,
    },
    {
      title: "文档",
      key: "docs",
      width: 300,
      render: (_: unknown, record: ArchiveRecord) => {
        const iterationInfo = record.archiveData.iterationInfo
        if (!iterationInfo) {
          return <Text type="secondary">-</Text>
        }

        const requirementLinks = parseDocLinks(iterationInfo.requirementDocs)
        const technicalLinks = parseDocLinks(iterationInfo.technicalDocs)
        const prototypeLinks = parseDocLinks(iterationInfo.prototypeDocs)

        if (
          requirementLinks.length === 0 &&
          technicalLinks.length === 0 &&
          prototypeLinks.length === 0
        ) {
          return <Text type="secondary">-</Text>
        }

        return (
          <Space
            orientation="vertical"
            size="small"
            style={{ fontSize: "12px" }}
          >
            {requirementLinks.length > 0 && (
              <div>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  需求：
                </Text>
                <Space wrap size="small">
                  {requirementLinks.map((doc, index) => (
                    <a
                      key={index}
                      href={doc}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                      style={{ fontSize: "12px" }}
                      title={doc}
                    >
                      需求-{index + 1}
                    </a>
                  ))}
                </Space>
              </div>
            )}
            {technicalLinks.length > 0 && (
              <div>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  技术：
                </Text>
                <Space wrap size="small">
                  {technicalLinks.map((doc, index) => (
                    <a
                      key={index}
                      href={doc}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:underline"
                      style={{ fontSize: "12px" }}
                      title={doc}
                    >
                      技术-{index + 1}
                    </a>
                  ))}
                </Space>
              </div>
            )}
            {prototypeLinks.length > 0 && (
              <div>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  原型：
                </Text>
                <Space wrap size="small">
                  {prototypeLinks.map((doc, index) => (
                    <a
                      key={index}
                      href={doc}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:underline"
                      style={{ fontSize: "12px" }}
                      title={doc}
                    >
                      原型-{index + 1}
                    </a>
                  ))}
                </Space>
              </div>
            )}
          </Space>
        )
      },
    },
    {
      title: "模块数",
      dataIndex: "moduleCount",
      key: "moduleCount",
      render: (count: number) => `${count} 个`,
      width: 100,
    },
    {
      title: "接口数",
      dataIndex: "apiCount",
      key: "apiCount",
      render: (count: number) => `${count} 个`,
      width: 100,
    },
    {
      title: "操作",
      key: "action",
      width: 200,
      render: (_: unknown, record: ArchiveRecord) => (
        <Space>
          <Button
            type="link"
            size="small"
            onClick={() => handleViewDetail(record.id!)}
          >
            查看
          </Button>
          <Popconfirm
            title="确认恢复"
            description="恢复后将覆盖当前所有联调配置，是否继续？"
            onConfirm={() => handleRestore(record.id!)}
            okText="确认"
            cancelText="取消"
            okButtonProps={{
              loading: restoring === record.id,
            }}
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<RollbackOutlined />}
              loading={restoring === record.id}
            >
              恢复
            </Button>
          </Popconfirm>
          <Popconfirm
            title="确认删除"
            description="删除后无法恢复，是否确认删除？"
            onConfirm={() => handleDelete(record.id!)}
            okText="确认"
            cancelText="取消"
            okButtonProps={{
              loading: deleting === record.id,
            }}
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
              loading={deleting === record.id}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <>
      <Modal
        title="查看存档"
        open={visible}
        onCancel={onCancel}
        footer={[
          <Button
            key="refresh"
            icon={<ReloadOutlined />}
            onClick={loadArchives}
          >
            刷新
          </Button>,
          <Button key="close" onClick={onCancel}>
            关闭
          </Button>,
        ]}
        width={1200}
      >
        <Table
          columns={columns}
          dataSource={archives}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条归档记录`,
          }}
        />
      </Modal>

      {/* 详情弹窗 */}
      <Modal
        title="归档详情"
        open={detailVisible}
        onCancel={() => {
          setDetailVisible(false)
          setSelectedArchive(null)
        }}
        footer={[
          <Popconfirm
            key="restore"
            title="确认恢复"
            description="恢复后将覆盖当前所有联调配置，是否继续？"
            onConfirm={() => {
              if (selectedArchive?.id) {
                handleRestore(selectedArchive.id)
                setDetailVisible(false)
              }
            }}
            okText="确认"
            cancelText="取消"
            okButtonProps={{
              loading: restoring === selectedArchive?.id,
            }}
          >
            <Button
              type="primary"
              danger
              icon={<RollbackOutlined />}
              loading={restoring === selectedArchive?.id}
            >
              一键恢复
            </Button>
          </Popconfirm>,
          <Button
            key="close"
            onClick={() => {
              setDetailVisible(false)
              setSelectedArchive(null)
            }}
          >
            关闭
          </Button>,
        ]}
        width={800}
      >
        {selectedArchive && (
          <div className="space-y-4">
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="迭代 Tag">
                <Tag color="blue">{selectedArchive.tag}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="归档时间">
                {new Date(selectedArchive.archivedAt).toLocaleString("zh-CN")}
              </Descriptions.Item>
              <Descriptions.Item label="模块数量">
                {selectedArchive.moduleCount} 个模块
              </Descriptions.Item>
              <Descriptions.Item label="接口数量">
                {selectedArchive.apiCount} 个接口
              </Descriptions.Item>
            </Descriptions>

            {/* 迭代信息 */}
            {selectedArchive.archiveData.iterationInfo && (
              <div>
                <Text strong className="block mb-2">
                  迭代文档：
                </Text>
                <div className="pl-4 space-y-2">
                  {parseDocLinks(
                    selectedArchive.archiveData.iterationInfo.requirementDocs
                  ).length > 0 && (
                    <div>
                      <Text type="secondary">需求文档：</Text>
                      <Space wrap className="ml-2">
                        {parseDocLinks(
                          selectedArchive.archiveData.iterationInfo!
                            .requirementDocs
                        ).map((doc, index) => (
                          <a
                            key={index}
                            href={doc}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            需求-{index + 1}
                          </a>
                        ))}
                      </Space>
                    </div>
                  )}
                  {parseDocLinks(
                    selectedArchive.archiveData.iterationInfo!.technicalDocs
                  ).length > 0 && (
                    <div>
                      <Text type="secondary">技术文档：</Text>
                      <Space wrap className="ml-2">
                        {parseDocLinks(
                          selectedArchive.archiveData.iterationInfo!
                            .technicalDocs
                        ).map((doc, index) => (
                          <a
                            key={index}
                            href={doc}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:underline"
                          >
                            技术-{index + 1}
                          </a>
                        ))}
                      </Space>
                    </div>
                  )}
                  {parseDocLinks(
                    selectedArchive.archiveData.iterationInfo!.prototypeDocs
                  ).length > 0 && (
                    <div>
                      <Text type="secondary">原型文档：</Text>
                      <Space wrap className="ml-2">
                        {parseDocLinks(
                          selectedArchive.archiveData.iterationInfo!
                            .prototypeDocs
                        ).map((doc, index) => (
                          <a
                            key={index}
                            href={doc}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-600 hover:underline"
                          >
                            原型-{index + 1}
                          </a>
                        ))}
                      </Space>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 模块列表 */}
            {selectedArchive.archiveData.modules.length > 0 && (
              <div>
                <Text strong className="block mb-2">
                  模块列表：
                </Text>
                <div className="pl-4 space-y-1">
                  {selectedArchive.archiveData.modules.map((module, index) => (
                    <div key={index} className="text-sm">
                      <Text>
                        • {module.label}: {module.apiArr.length} 个接口
                      </Text>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 快速联调配置 */}
            {selectedArchive.archiveData.quickMockConfigs &&
              selectedArchive.archiveData.quickMockConfigs.length > 0 && (
                <div>
                  <Text strong className="block mb-2">
                    快速联调配置：
                  </Text>
                  <Text type="secondary" className="text-sm">
                    {selectedArchive.archiveData.quickMockConfigs.length} 个配置
                  </Text>
                </div>
              )}

            {/* Apifox 配置 */}
            {selectedArchive.archiveData.apifoxConfig && (
              <div>
                <Text strong className="block mb-2">
                  Apifox 配置：
                </Text>
                <Text type="secondary" className="text-sm">
                  Mock 前缀:{" "}
                  {selectedArchive.archiveData.apifoxConfig.mockPrefix}
                </Text>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  )
}

export default ArchiveListModal
