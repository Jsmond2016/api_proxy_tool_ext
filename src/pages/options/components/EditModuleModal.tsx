import React, { useState, forwardRef, useImperativeHandle } from "react"
import { Modal, Form, Input, message } from "antd"
import { useBoolean } from "ahooks"
import { saveConfig } from "@src/utils/configUtil"
import { useConfigStore } from "@src/store"

const { TextArea } = Input

/**
 * 解析需求文档链接，支持多种分隔符
 * @param text 输入的文本
 * @returns 解析后的文档链接数组
 */
const parseRequirementDocs = (text: string): string[] => {
  if (!text || text.trim() === "") {
    return []
  }
  // 支持的分隔符：换行、空格、逗号、分号
  return text
    .split(/[\n\r,;]+/)
    .map((doc) => doc.trim())
    .filter((doc) => doc.length > 0)
}

/**
 * 验证是否为有效的 URL
 * @param url 待验证的 URL
 * @returns 是否为有效 URL
 */
const isValidUrl = (url: string): boolean => {
  if (!url || url.trim() === "") {
    return false
  }
  try {
    // 简单验证：必须以 http:// 或 https:// 开头
    return /^https?:\/\/.+/.test(url.trim())
  } catch {
    return false
  }
}

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
        const module = config.modules.find((m) => m.id === moduleId)
        form.setFieldsValue({
          name: moduleName,
          requirementDocs: module?.requirementDocs || "",
        })
        setModuleId(moduleId)
      },
    }))

    // 编辑模块
    const updateModuleApi = (
      moduleId: string,
      newName: string,
      requirementDocs?: string
    ) => {
      const newConfig = {
        ...config,
        modules: config.modules.map((module) =>
          module.id === moduleId
            ? {
                ...module,
                label: newName,
                apiDocKey: newName,
                requirementDocs: requirementDocs?.trim() || undefined,
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
        updateModuleApi(moduleId, values.name, values.requirementDocs)
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
          <Form.Item
            label="关联需求文档"
            name="requirementDocs"
            tooltip="可填写多个文档链接，使用换行、空格、逗号或分号分隔"
            rules={[
              {
                validator: (_: unknown, value: string) => {
                  if (!value || value.trim() === "") {
                    return Promise.resolve()
                  }
                  // 验证是否为有效的 URL 格式（简单验证）
                  const docs = parseRequirementDocs(value)
                  const invalidDocs = docs.filter(
                    (doc) => !isValidUrl(doc.trim())
                  )
                  if (invalidDocs.length > 0) {
                    return Promise.reject(new Error("请输入有效的文档链接地址"))
                  }
                  return Promise.resolve()
                },
              },
            ]}
          >
            <TextArea
              rows={4}
              placeholder={`请输入需求文档链接，多个链接可用换行、空格、逗号或分号分隔
例如：
https://example.com/doc1
https://example.com/doc2, https://example.com/doc3`}
            />
          </Form.Item>
        </Form>
      </Modal>
    )
  }
)
