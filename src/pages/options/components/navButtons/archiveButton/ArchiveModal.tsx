import React, { useState, useEffect, useMemo } from "react"
import {
  Modal,
  Select,
  message,
  Descriptions,
  Tag,
  Space,
  Alert,
  Typography,
} from "antd"
import { GlobalConfig } from "@src/types"
import {
  archiveTagData,
  saveArchive,
  initArchiveDB,
} from "@src/utils/archiveUtil"

const { Text } = Typography

interface ArchiveModalProps {
  visible: boolean
  onCancel: () => void
  onOk?: () => void
  config: GlobalConfig
}

const ArchiveModal: React.FC<ArchiveModalProps> = ({
  visible,
  onCancel,
  onOk,
  config,
}) => {
  const [selectedTag, setSelectedTag] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [archivePreview, setArchivePreview] =
    useState<Awaited<ReturnType<typeof archiveTagData>>>()

  // 获取所有可归档的 tags
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>()
    config.modules.forEach((module) => {
      module.apiArr.forEach((api) => {
        if (api.tags && Array.isArray(api.tags)) {
          api.tags.forEach((tag) => {
            if (tag && tag.trim()) {
              tagSet.add(tag.trim())
            }
          })
        }
      })
    })
    return Array.from(tagSet).sort()
  }, [config.modules])

  // 初始化数据库
  useEffect(() => {
    if (visible) {
      initArchiveDB().catch((error) => {
        console.error("Failed to init archive DB:", error)
        message.error("初始化归档数据库失败")
      })
    }
  }, [visible])

  // 当选择 tag 变化时，生成预览
  useEffect(() => {
    if (selectedTag && visible) {
      setLoading(true)
      archiveTagData(selectedTag, config)
        .then((preview) => {
          setArchivePreview(preview)
        })
        .catch((error) => {
          console.error("Failed to generate archive preview:", error)
          message.error("生成归档预览失败")
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setArchivePreview(undefined)
    }
  }, [selectedTag, config, visible])

  // 处理确认归档
  const handleOk = async () => {
    if (!selectedTag) {
      message.warning("请选择要归档的迭代 tag")
      return
    }

    if (!archivePreview) {
      message.warning("请等待归档预览生成")
      return
    }

    setSaving(true)
    try {
      await saveArchive(archivePreview)
      message.success("归档成功")
      onOk?.()
      handleCancel()
    } catch (error) {
      console.error("Failed to save archive:", error)
      message.error("归档失败，请重试")
    } finally {
      setSaving(false)
    }
  }

  // 处理取消
  const handleCancel = () => {
    setSelectedTag("")
    setArchivePreview(undefined)
    onCancel()
  }

  // 解析文档链接
  const parseDocLinks = (docs: string): string[] => {
    if (!docs || !docs.trim()) {
      return []
    }
    return docs
      .split(/[\n\r,;]+/)
      .map((doc) => doc.trim())
      .filter((doc) => doc.length > 0)
  }

  return (
    <Modal
      title="归档迭代配置"
      open={visible}
      onCancel={handleCancel}
      onOk={handleOk}
      confirmLoading={saving}
      okText="确认归档"
      cancelText="取消"
      width={800}
      okButtonProps={{
        disabled: !selectedTag || loading || !archivePreview,
      }}
    >
      <div className="space-y-4">
        <Alert
          message="归档说明"
          description="选择要归档的迭代 tag，系统将保存该 tag 相关的所有接口、文档、自定义配置等信息。归档后可以随时恢复。"
          type="info"
          showIcon
          className="mb-4"
        />

        <div>
          <label className="block mb-2 font-medium">选择迭代 tag：</label>
          <Select
            placeholder="请选择要归档的迭代 tag"
            value={selectedTag}
            onChange={setSelectedTag}
            style={{ width: "100%" }}
            showSearch
            optionFilterProp="label"
            options={availableTags.map((tag) => ({
              label: tag,
              value: tag,
            }))}
          />
        </div>

        {loading && (
          <div className="text-center py-4">
            <Text type="secondary">正在生成归档预览...</Text>
          </div>
        )}

        {archivePreview && !loading && (
          <div className="border rounded p-4 bg-gray-50">
            <Descriptions
              title="归档预览"
              bordered
              column={1}
              size="small"
              className="mb-4"
            >
              <Descriptions.Item label="迭代 Tag">
                <Tag color="blue">{archivePreview.tag}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="归档时间">
                {new Date(archivePreview.archivedAt).toLocaleString("zh-CN")}
              </Descriptions.Item>
              <Descriptions.Item label="模块数量">
                {archivePreview.modules.length} 个模块
              </Descriptions.Item>
              <Descriptions.Item label="接口数量">
                {archivePreview.modules.reduce(
                  (total, module) => total + module.apiArr.length,
                  0
                )}{" "}
                个接口
              </Descriptions.Item>
            </Descriptions>

            {/* 迭代信息 */}
            {archivePreview.iterationInfo && (
              <div className="mb-4">
                <Text strong className="block mb-2">
                  迭代文档：
                </Text>
                <div className="pl-4 space-y-2">
                  {parseDocLinks(
                    archivePreview.iterationInfo.requirementDocs
                  ).length > 0 && (
                    <div>
                      <Text type="secondary">需求文档：</Text>
                      <Space wrap className="ml-2">
                        {parseDocLinks(
                          archivePreview.iterationInfo!.requirementDocs
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
                    archivePreview.iterationInfo!.technicalDocs
                  ).length > 0 && (
                    <div>
                      <Text type="secondary">技术文档：</Text>
                      <Space wrap className="ml-2">
                        {parseDocLinks(
                          archivePreview.iterationInfo!.technicalDocs
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
                    archivePreview.iterationInfo!.prototypeDocs
                  ).length > 0 && (
                    <div>
                      <Text type="secondary">原型文档：</Text>
                      <Space wrap className="ml-2">
                        {parseDocLinks(
                          archivePreview.iterationInfo!.prototypeDocs
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
            {archivePreview.modules.length > 0 && (
              <div>
                <Text strong className="block mb-2">
                  模块列表：
                </Text>
                <div className="pl-4 space-y-1">
                  {archivePreview.modules.map((module, index) => (
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
            {archivePreview.quickMockConfigs &&
              archivePreview.quickMockConfigs.length > 0 && (
                <div className="mt-4">
                  <Text strong className="block mb-2">
                    快速联调配置：
                  </Text>
                  <Text type="secondary" className="text-sm">
                    {archivePreview.quickMockConfigs.length} 个配置
                  </Text>
                </div>
              )}

            {/* Apifox 配置 */}
            {archivePreview.apifoxConfig && (
              <div className="mt-4">
                <Text strong className="block mb-2">
                  Apifox 配置：
                </Text>
                <Text type="secondary" className="text-sm">
                  Mock 前缀: {archivePreview.apifoxConfig.mockPrefix}
                </Text>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}

export default ArchiveModal

