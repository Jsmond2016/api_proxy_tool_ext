import React, { useEffect } from "react"
import { Modal, Form, Input, message } from "antd"
import { QuickMockConfig } from "@src/types"

const { TextArea } = Input

interface QuickMockFormModalProps {
  visible: boolean
  onCancel: () => void
  onOk: (data: Omit<QuickMockConfig, "id">) => void
  data?: QuickMockConfig | null
}

const QuickMockFormModal: React.FC<QuickMockFormModalProps> = ({
  visible,
  onCancel,
  onOk,
  data,
}) => {
  const [form] = Form.useForm()

  useEffect(() => {
    if (visible) {
      if (data) {
        form.setFieldsValue({
          name: data.name,
          key: data.key,
          responseJson: data.responseJson,
        })
      } else {
        form.resetFields()
      }
    }
  }, [visible, data, form])

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()

      // 验证 responseJson 是否为有效的 JSON
      try {
        JSON.parse(values.responseJson)
      } catch (error) {
        message.error("响应数据必须是有效的 JSON 格式")
        return
      }

      onOk({
        name: values.name,
        key: values.key,
        responseJson: values.responseJson,
      })
    } catch (error) {
      console.error("Form validation failed:", error)
    }
  }

  return (
    <Modal
      title={data ? "编辑联调配置" : "添加联调配置"}
      open={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      okText={data ? "更新" : "添加"}
      cancelText="取消"
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          name: "",
          key: "",
          responseJson: "{}",
        }}
      >
        <Form.Item
          label="名称"
          name="name"
          rules={[{ required: true, message: "请输入名称" }]}
        >
          <Input placeholder="请输入名称" />
        </Form.Item>

        <Form.Item
          label="唯一标识"
          name="key"
          rules={[
            { required: true, message: "请输入唯一标识" },
            {
              pattern: /^[a-zA-Z0-9_-]+$/,
              message: "唯一标识只能包含字母、数字、下划线和横线",
            },
          ]}
          extra="用于标识该联调配置，只能包含字母、数字、下划线和横线"
        >
          <Input placeholder="例如：error_response" />
        </Form.Item>

        <Form.Item
          label="响应数据 (JSON)"
          name="responseJson"
          rules={[
            { required: true, message: "请输入响应数据" },
            {
              validator: (_, value) => {
                if (!value) return Promise.resolve()
                try {
                  JSON.parse(value)
                  return Promise.resolve()
                } catch {
                  return Promise.reject(new Error("必须是有效的 JSON 格式"))
                }
              },
            },
          ]}
          extra="请输入 JSON 格式的响应数据"
        >
          <TextArea
            rows={10}
            placeholder='例如：{"code": 500, "message": "服务器错误", "data": null}'
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default QuickMockFormModal
