import React, { useEffect } from "react"
import { Modal, Form, Input, InputNumber, message } from "antd"
import { GlobalResponse } from "@src/types"

const { TextArea } = Input

interface GlobalResponseFormModalProps {
  visible: boolean
  onCancel: () => void
  onOk: (data: Omit<GlobalResponse, "id" | "createdAt" | "updatedAt">) => void
  data?: GlobalResponse | null
}

const GlobalResponseFormModal: React.FC<GlobalResponseFormModalProps> = ({
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
          statusCode: data.statusCode,
          delay: data.delay,
          responseJson: data.responseJson,
          enabled: data.enabled,
        })
      } else {
        form.resetFields()
        form.setFieldsValue({
          statusCode: 200,
          delay: 0,
          enabled: false,
        })
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
        statusCode: values.statusCode,
        delay: values.delay || 0,
        responseJson: values.responseJson,
        enabled: values.enabled || false,
      })
    } catch (error) {
      console.error("Form validation failed:", error)
    }
  }

  return (
    <Modal
      title={data ? "编辑全局响应" : "添加全局响应"}
      open={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      okText={data ? "更新" : "添加"}
      cancelText="取消"
      width={700}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          name: "",
          statusCode: 200,
          delay: 0,
          responseJson: "{}",
          enabled: false,
        }}
      >
        <Form.Item
          label="名字"
          name="name"
          rules={[{ required: true, message: "请输入名字" }]}
        >
          <Input placeholder="例如：参数错误" />
        </Form.Item>

        <Form.Item
          label="状态码"
          name="statusCode"
          rules={[
            { required: true, message: "请输入状态码" },
            { type: "number", min: 100, max: 599, message: "状态码必须在 100-599 之间" },
          ]}
        >
          <InputNumber
            placeholder="例如：400"
            min={100}
            max={599}
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Form.Item
          label="延迟时间（毫秒）"
          name="delay"
          rules={[
            { type: "number", min: 0, message: "延迟时间不能小于 0" },
          ]}
          extra="响应延迟时间，用于模拟网络延迟"
        >
          <InputNumber
            placeholder="例如：1000"
            min={0}
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Form.Item
          label="返回 JSON"
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
            placeholder='例如：{"code": 400, "message": "参数错误", "data": null}'
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default GlobalResponseFormModal

