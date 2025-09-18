import React, { useState, useEffect } from "react"
import {
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Button,
  Space,
  message,
} from "antd"
const { TextArea } = Input
import { ApiConfig, GlobalConfig } from "../../../types"
import {
  isValidUrl,
  isValidPath,
  generateId,
  isApiUrlDuplicate,
  isApiKeyDuplicate,
} from "../../../utils/chromeApi"

interface EditApiModalProps {
  visible: boolean
  api: ApiConfig | null
  onCancel: () => void
  onOk: (apiData: Omit<ApiConfig, "id">) => void
  config: GlobalConfig
}

export default function EditApiModal({
  visible,
  api,
  onCancel,
  onOk,
  config,
}: EditApiModalProps) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (visible && api) {
      form.setFieldsValue({
        apiName: api.apiName,
        apiUrl: api.apiUrl,
        redirectURL: api.redirectURL,
        method: api.method,
        filterType: api.filterType,
        delay: api.delay,
        statusCode: api.statusCode,
      })
    }
  }, [visible, api, form])

  const handleOk = async () => {
    try {
      setLoading(true)
      const values = await form.validateFields()

      // 验证URL格式
      if (
        values.apiUrl &&
        !isValidUrl(values.apiUrl) &&
        !isValidPath(values.apiUrl)
      ) {
        message.error("请输入有效的URL或路径")
        return
      }

      if (values.redirectURL && !isValidUrl(values.redirectURL)) {
        message.error("请输入有效的重定向URL")
        return
      }

      // 检查API URL是否重复（排除当前编辑的API）
      if (isApiUrlDuplicate(config.modules, values.apiUrl, api?.id)) {
        message.error("该接口地址已存在，请使用不同的地址")
        return
      }

      // 检查API Key是否重复（排除当前编辑的API）
      if (
        values.apiKey &&
        isApiKeyDuplicate(config.modules, values.apiKey, api?.id)
      ) {
        message.error("该接口Key已存在，请使用不同的Key")
        return
      }

      const apiData: Omit<ApiConfig, "id"> = {
        apiKey: values.apiUrl || "",
        apiName: values.apiName || "",
        apiUrl: values.apiUrl || "",
        redirectURL: values.redirectURL || "",
        method: values.method || "GET",
        filterType: values.filterType || "contains",
        delay: values.delay || 0,
        isOpen: api?.isOpen || true,
        mockWay: api?.mockWay || "redirect",
        statusCode: values.statusCode || 200,
        arrDepth: api?.arrDepth || 4,
        arrLength: api?.arrLength || 3,
        mockResponseData: api?.mockResponseData || "",
        requestBody: api?.requestBody || "",
        requestHeaders: api?.requestHeaders || "",
      }

      onOk(apiData)
      form.resetFields()
    } catch (error) {
      console.error("Form validation failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    form.resetFields()
    onCancel()
  }

  return (
    <Modal
      title="编辑-Redirect Request"
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      width={600}
      okText="确定"
      cancelText="取消"
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          method: "GET",
          filterType: "contains",
          delay: 0,
          statusCode: 200,
        }}
      >
        <Form.Item
          label="接口地址"
          name="apiUrl"
          rules={[
            { required: true, message: "请输入接口地址" },
            {
              validator: (_, value) => {
                if (!value) return Promise.resolve()
                if (isValidUrl(value) || isValidPath(value)) {
                  return Promise.resolve()
                }
                return Promise.reject(new Error("请输入有效的URL或路径"))
              },
            },
          ]}
        >
          <TextArea 
            placeholder="请输入接口地址" 
            rows={1}
            autoSize={{ minRows: 1, maxRows: 3 }}
          />
        </Form.Item>

        <Form.Item
          label="重定向URL"
          name="redirectURL"
          rules={[
            { required: true, message: "请输入重定向地址" },
            {
              validator: (_, value) => {
                if (!value) return Promise.resolve()
                if (isValidUrl(value)) {
                  return Promise.resolve()
                }
                return Promise.reject(new Error("请输入有效的URL"))
              },
            },
          ]}
        >
          <TextArea 
            placeholder="请输入重定向URL" 
            rows={1}
            autoSize={{ minRows: 1, maxRows: 3 }}
          />
        </Form.Item>

        <Form.Item
          label="接口名称"
          name="apiName"
          rules={[{ required: true, message: "请输入接口名称" }]}
        >
          <Input placeholder="请输入" />
        </Form.Item>

        <Space.Compact className="w-full">
          {/* 请求方式字段已隐藏，默认使用 GET */}
          
          <Form.Item label="匹配方式" name="filterType" className="w-1/2">
            <Select>
              <Select.Option value="contains">contains</Select.Option>
              <Select.Option value="exact">exact</Select.Option>
              <Select.Option value="regex">regex</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="延迟时间(ms)" name="delay" className="w-1/2">
            <InputNumber min={0} max={30000} step={100} className="w-full" />
          </Form.Item>
        </Space.Compact>

        <Form.Item label="状态码" name="statusCode">
          <InputNumber min={100} max={599} className="w-full" />
        </Form.Item>
      </Form>
    </Modal>
  )
}
