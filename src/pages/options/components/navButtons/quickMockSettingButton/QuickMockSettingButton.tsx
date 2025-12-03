import React, { useState } from "react"
import { Button, Drawer, Table, Space, message } from "antd"
import {
  SettingOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons"
import { QuickMockConfig } from "@src/types"
import { useConfigStore } from "@src/store"
import { saveConfig } from "@src/utils/configUtil"
import { generateId } from "@src/utils/chromeApi"
import QuickMockFormModal from "./QuickMockFormModal"

const QuickMockSettingButton: React.FC = () => {
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [formModalVisible, setFormModalVisible] = useState(false)
  const [editingConfig, setEditingConfig] = useState<QuickMockConfig | null>(
    null
  )
  const { config, setConfig } = useConfigStore()

  const quickMockConfigs = config.quickMockConfigs || []

  const handleAdd = () => {
    setEditingConfig(null)
    setFormModalVisible(true)
  }

  const handleEdit = (record: QuickMockConfig) => {
    setEditingConfig(record)
    setFormModalVisible(true)
  }

  const handleDelete = (record: QuickMockConfig) => {
    const newConfig = {
      ...config,
      quickMockConfigs: quickMockConfigs.filter(
        (item) => item.id !== record.id
      ),
    }
    setConfig(newConfig)
    saveConfig(newConfig)
    message.success("删除成功")
  }

  const handleFormSubmit = (formData: Omit<QuickMockConfig, "id">) => {
    const newConfig = { ...config }

    if (!newConfig.quickMockConfigs) {
      newConfig.quickMockConfigs = []
    }

    if (editingConfig) {
      // 编辑
      const index = newConfig.quickMockConfigs.findIndex(
        (item) => item.id === editingConfig.id
      )
      if (index !== -1) {
        newConfig.quickMockConfigs[index] = {
          ...editingConfig,
          ...formData,
        }
      }
    } else {
      // 新增
      // 检查 key 是否重复
      if (
        newConfig.quickMockConfigs.some((item) => item.key === formData.key)
      ) {
        message.error("该唯一标识已存在，请使用不同的标识")
        return
      }

      newConfig.quickMockConfigs.push({
        id: generateId(),
        ...formData,
      })
    }

    setConfig(newConfig)
    saveConfig(newConfig)
    setFormModalVisible(false)
    setEditingConfig(null)
    message.success(editingConfig ? "更新成功" : "添加成功")
  }

  const columns = [
    {
      title: "名称",
      dataIndex: "name",
      key: "name",
      width: 150,
    },
    {
      title: "唯一标识",
      dataIndex: "key",
      key: "key",
      width: 150,
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
      render: (_: unknown, record: QuickMockConfig) => (
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
        title="联调设置"
      >
        联调设置
      </Button>

      <Drawer
        title="联调设置"
        placement="right"
        width={800}
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
          dataSource={quickMockConfigs}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Drawer>

      <QuickMockFormModal
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

export default QuickMockSettingButton
