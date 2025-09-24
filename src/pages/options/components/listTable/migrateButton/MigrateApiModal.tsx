import React, { useState, useEffect } from "react"
import { Modal, Select, Form, message } from "antd"
  import { ApiConfig, ModuleConfig } from "@src/types"

interface MigrateApiModalProps {
  visible: boolean
  onCancel: () => void
  onOk: (targetModuleId: string) => void
  api: ApiConfig | null
  modules: ModuleConfig[]
  currentModuleId: string
}

export default function MigrateApiModal({
  visible,
  onCancel,
  onOk,
  api,
  modules,
  currentModuleId,
}: MigrateApiModalProps) {
  const [form] = Form.useForm()
  const [targetModuleId, setTargetModuleId] = useState<string>("")

  useEffect(() => {
    if (visible && api) {
      form.setFieldsValue({
        targetModuleId: "",
      })
      setTargetModuleId("")
    }
  }, [visible, api, form])

  const handleOk = () => {
    if (!targetModuleId) {
      message.warning("请选择目标模块")
      return
    }

    if (targetModuleId === currentModuleId) {
      message.warning("目标模块不能是当前模块")
      return
    }

    onOk(targetModuleId)
  }

  const handleCancel = () => {
    form.resetFields()
    setTargetModuleId("")
    onCancel()
  }

  // 过滤掉当前模块
  const availableModules = modules.filter((module) => module.id !== currentModuleId)

  // 生成Select的options配置
  const moduleOptions = availableModules.map((module) => ({
    label: module.label,
    value: module.id,
  }))

  return (
    <Modal
      title="迁移接口"
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      okText="确认迁移"
      cancelText="取消"
      width={500}
    >
      {api && (
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <div className="text-sm text-gray-600 mb-2">当前接口信息：</div>
          <div className="font-medium">{api.apiName}</div>
          <div className="text-sm text-gray-500">{api.apiUrl}</div>
        </div>
      )}

      <Form form={form} layout="vertical">
        <Form.Item
          label="选择目标模块"
          name="targetModuleId"
          rules={[{ required: true, message: "请选择目标模块" }]}
        >
          <Select
            placeholder="请选择要迁移到的模块"
            value={targetModuleId}
            onChange={setTargetModuleId}
            size="large"
            options={moduleOptions}
          />
        </Form.Item>
      </Form>

      {availableModules.length === 0 && (
        <div className="text-center text-gray-500 py-4">
          没有可用的目标模块
        </div>
      )}
    </Modal>
  )
}
