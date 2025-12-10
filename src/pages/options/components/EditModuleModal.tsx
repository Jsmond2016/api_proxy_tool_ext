import React, { useState, forwardRef, useImperativeHandle } from "react"
import { Modal, Form, Input, message } from "antd"
import { useBoolean } from "ahooks"
import { saveConfig } from "@src/utils/configUtil"
import { useConfigStore } from "@src/store"

interface EditModuleModalProps {}

type EditModuleModalRefProps = {
  open: ({
    moduleName,
    moduleId,
  }: {
    moduleName: string
    moduleId: string
  }) => void
}

export default forwardRef<EditModuleModalRefProps, EditModuleModalProps>(
  // eslint-disable-next-line no-empty-pattern
  function EditModuleModal({}, ref) {
    const [form] = Form.useForm()
    const [moduleId, setModuleId] = useState<string>("")

    const [visible, visibleOperate] = useBoolean(false)
    const { config, setConfig } = useConfigStore()

    useImperativeHandle(ref, () => ({
      open: ({
        moduleName,
        moduleId,
      }: {
        moduleName: string
        moduleId: string
      }) => {
        visibleOperate.setTrue()
        form.setFieldsValue({
          name: moduleName,
        })
        setModuleId(moduleId)
      },
    }))

    // 编辑模块
    const updateModuleApi = (moduleId: string, newName: string) => {
      const newConfig = {
        ...config,
        modules: config.modules.map((module) =>
          module.id === moduleId
            ? {
                ...module,
                label: newName,
                apiDocKey: newName,
              }
            : module
        ),
      }
      setConfig(newConfig)
      saveConfig(newConfig)
    }

    const handleOk = async () => {
      try {
        const values = await form.validateFields()
        updateModuleApi(moduleId, values.name)
        handleCloseModal()
        message.success("模块信息更新成功")
      } catch (error) {
        console.error("Form validation failed:", error)
        message.error("模块信息更新失败")
      }
    }

    const handleCloseModal = () => {
      form.resetFields()
      visibleOperate.setFalse()
      setModuleId("")
    }

    return (
      <Modal
        title="编辑模块信息"
        open={visible}
        onOk={handleOk}
        onCancel={handleCloseModal}
        okText="确定"
        cancelText="取消"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="模块名称"
            name="name"
            rules={[
              { required: true, message: "请输入模块名称" },
              { min: 1, max: 50, message: "模块名称长度应在1-50个字符之间" },
            ]}
          >
            <Input placeholder="请输入模块名称" />
          </Form.Item>
        </Form>
      </Modal>
    )
  }
)
