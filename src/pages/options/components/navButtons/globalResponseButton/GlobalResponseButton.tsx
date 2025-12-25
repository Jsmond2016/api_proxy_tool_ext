import React, { useState, useEffect } from "react"
import { Button, Drawer, Table, Space, message, Switch } from "antd"
import {
  SettingOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons"
import { GlobalResponse } from "@src/types"
import {
  getAllGlobalResponses,
  saveGlobalResponse,
  deleteGlobalResponse,
  getActiveGlobalResponse,
  updateGlobalResponseEnabled,
} from "@src/utils/globalResponseUtil"
import { generateId } from "@src/utils/chromeApi"
import GlobalResponseFormModal from "./GlobalResponseFormModal"
import { useGlobalResponseStore } from "@src/store"

const GlobalResponseButton: React.FC = () => {
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [formModalVisible, setFormModalVisible] = useState(false)
  const [editingConfig, setEditingConfig] = useState<GlobalResponse | null>(
    null
  )
  const [responseList, setResponseList] = useState<GlobalResponse[]>([])
  const [loading, setLoading] = useState(false)
  const { setActiveGlobalResponseId } = useGlobalResponseStore()

  // 加载全局 Mock 列表
  const loadMockList = async () => {
    setLoading(true)
    try {
      const list = await getAllGlobalResponses()
      setResponseList(list)

      // 同步当前启用的 ID
      const activeMock = await getActiveGlobalResponse()
      setActiveGlobalResponseId(activeMock?.id || null)
    } catch (error) {
      message.error("加载全局响应列表失败")
      console.error("Load global mock list error:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (drawerVisible) {
      loadMockList()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawerVisible])

  const handleAdd = () => {
    setEditingConfig(null)
    setFormModalVisible(true)
  }

  const handleEdit = (record: GlobalResponse) => {
    setEditingConfig(record)
    setFormModalVisible(true)
  }

  const handleDelete = async (record: GlobalResponse) => {
    try {
      await deleteGlobalResponse(record.id)
      await loadMockList()
      message.success("删除成功")
    } catch (error) {
      message.error("删除失败")
      console.error("Delete global mock error:", error)
    }
  }

  // 切换全局 Mock 响应状态（全局响应设置中，允许多个同时开启）
  const handleToggleEnabled = async (
    record: GlobalResponse,
    enabled: boolean
  ) => {
    try {
      // 使用 updateGlobalResponseEnabled，不限制只能开启一个
      await updateGlobalResponseEnabled(record.id, enabled)
      await loadMockList()

      // 触发自定义事件，通知 ApiTable 刷新
      window.dispatchEvent(new CustomEvent("globalResponseUpdated"))

      message.success(enabled ? "已启用全局响应" : "已关闭全局响应")
    } catch (error) {
      message.error("操作失败")
      console.error("Toggle global mock error:", error)
    }
  }

  const handleFormSubmit = async (
    formData: Omit<GlobalResponse, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      const now = Date.now()
      if (editingConfig) {
        // 编辑
        const updated: GlobalResponse = {
          ...editingConfig,
          ...formData,
          updatedAt: now,
        }
        await saveGlobalResponse(updated)
        message.success("更新成功")
      } else {
        // 新增
        const newMock: GlobalResponse = {
          id: generateId(),
          ...formData,
          createdAt: now,
          updatedAt: now,
        }
        await saveGlobalResponse(newMock)
        message.success("添加成功")
      }
      await loadMockList()
      setFormModalVisible(false)
      setEditingConfig(null)
    } catch (error) {
      message.error(editingConfig ? "更新失败" : "添加失败")
      console.error("Save global mock error:", error)
    }
  }

  const columns = [
    {
      title: "名字",
      dataIndex: "name",
      key: "name",
      width: 150,
    },
    {
      title: "状态码",
      dataIndex: "statusCode",
      key: "statusCode",
      width: 100,
    },
    {
      title: "延迟时间",
      dataIndex: "delay",
      key: "delay",
      width: 120,
      render: (delay: number) => {
        if (delay === 0) return "无延迟"
        if (delay < 1000) return `${delay}ms`
        return `${(delay / 1000).toFixed(1)}s`
      },
    },
    {
      title: "状态",
      dataIndex: "enabled",
      key: "enabled",
      width: 100,
      align: "center" as const,
      render: (enabled: boolean, record: GlobalResponse) => (
        <Switch
          checked={enabled}
          onChange={(checked) => handleToggleEnabled(record, checked)}
          checkedChildren="开启"
          unCheckedChildren="关闭"
          size="small"
        />
      ),
    },
    {
      title: "响应数据",
      dataIndex: "responseJson",
      key: "responseJson",
      ellipsis: true,
      render: (text: string) => (
        <div className="max-w-xs truncate" title={text}>
          {text}
        </div>
      ),
    },
    {
      title: "操作",
      key: "action",
      width: 150,
      render: (_: unknown, record: GlobalResponse) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <>
      <Button
        icon={<SettingOutlined />}
        onClick={() => setDrawerVisible(true)}
        title="设置全局响应"
      >
        设置全局响应
      </Button>

      <Drawer
        title="全局响应设置"
        placement="right"
        width={900}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={responseList}
          rowKey="id"
          pagination={false}
          size="small"
          loading={loading}
        />
      </Drawer>

      <GlobalResponseFormModal
        visible={formModalVisible}
        onCancel={() => {
          setFormModalVisible(false)
          setEditingConfig(null)
        }}
        onOk={handleFormSubmit}
        data={editingConfig}
      />
    </>
  )
}

export default GlobalResponseButton
