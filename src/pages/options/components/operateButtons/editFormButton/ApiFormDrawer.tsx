import React, { useState, useEffect } from "react"
import {
  Drawer,
  Form,
  Input,
  Select,
  InputNumber,
  Button,
  message,
  Space,
} from "antd"
const { TextArea } = Input
import { ApiConfig, GlobalConfig } from "../../../../../types"
import {
  isValidUrl,
  isValidPath,
  isApiUrlDuplicate,
  isApiKeyDuplicate,
} from "../../../../../utils/chromeApi"

interface ApiFormDrawerProps {
  visible: boolean
  onClose: () => void
  onOk: (apiData: Omit<ApiConfig, "id">) => void
  config: GlobalConfig
  data?: ApiConfig | null
  title?: string
}

export default function ApiFormDrawer({
  visible,
  onClose,
  onOk,
  config,
  data,
  title = "添加接口",
}: ApiFormDrawerProps) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  // 当编辑时，设置表单初始值
  useEffect(() => {
    if (visible && data) {
      form.setFieldsValue({
        apiName: data.apiName,
        apiUrl: data.apiUrl,
        redirectURL: data.redirectURL,
        method: data.method,
        filterType: data.filterType,
        delay: data.delay,
        statusCode: data.statusCode,
        authPointKey: data.authPointKey,
      })
    } else if (visible) {
      // 添加时重置表单
      form.resetFields()
    }
  }, [visible, data, form])

  const handleSubmit = async () => {
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

      // 检查API URL是否重复（编辑时排除当前API）
      if (isApiUrlDuplicate(config.modules, values.apiUrl, data?.id)) {
        message.error("该接口地址已存在，请使用不同的地址")
        return
      }

      // 检查API Key是否重复（编辑时排除当前API）
      if (
        values.apiKey &&
        isApiKeyDuplicate(config.modules, values.apiKey, data?.id)
      ) {
        message.error("该接口Key已存在，请使用不同的Key")
        return
      }

      const apiData: Omit<ApiConfig, "id"> = {
        apiKey: values.apiKey || "",
        apiName: values.apiName || "",
        apiUrl: values.apiUrl || "",
        redirectURL: values.redirectURL || "",
        method: values.method || "GET",
        filterType: values.filterType || "contains",
        delay: values.delay || 0,
        isOpen: data?.isOpen || false,
        mockWay: data?.mockWay || "redirect",
        statusCode: values.statusCode || 200,
        arrDepth: data?.arrDepth || 4,
        arrLength: data?.arrLength || 3,
        mockResponseData: data?.mockResponseData || "",
        requestBody: data?.requestBody || "",
        requestHeaders: data?.requestHeaders || "",
        authPointKey: values.authPointKey || "",
      }

      onOk(apiData)
      form.resetFields()
      onClose()
      message.success("操作成功")
    } catch (error) {
      console.error("Form validation failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    form.resetFields()
    onClose()
  }

  return (
    <Drawer
      title={data ? "编辑接口" : title}
      placement="right"
      width={600}
      open={visible}
      onClose={handleCancel}
      destroyOnHidden
      extra={
        <Space>
          <Button onClick={handleCancel}>取消</Button>
          <Button onClick={handleSubmit} type="primary">
            {data ? "更新" : "添加"}
          </Button>
        </Space>
      }
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          method: "GET",
          filterType: "contains",
          delay: 0,
          isOpen: false,
          mockWay: "redirect",
          statusCode: 200,
        }}
      >
        <Form.Item
          label="接口名称"
          name="apiName"
          rules={[{ required: true, message: "请输入接口名称" }]}
        >
          <Input placeholder="请输入接口名称" />
        </Form.Item>

        <Form.Item
          label="接口地址"
          name="apiUrl"
          rules={[{ required: true, message: "请输入接口地址" }]}
          extra="示例：/api/users 或 http://localhost:3000/api/users"
        >
          <TextArea
            placeholder="请输入接口地址"
            rows={1}
            autoSize={{ minRows: 1, maxRows: 5 }}
          />
        </Form.Item>

        <Form.Item
          label="重定向URL"
          name="redirectURL"
          rules={[{ required: true, message: "请输入重定向URL" }]}
          extra="示例：http://127.0.0.1:4523/mock/api/users"
        >
          <TextArea
            placeholder="请输入Mock URL"
            rows={1}
            autoSize={{ minRows: 1, maxRows: 5 }}
          />
        </Form.Item>

        <Form.Item
          label="权限点"
          name="authPointKey"
          extra="示例：demo-user-list，用于权限控制"
        >
          <Input placeholder="请输入权限点Key（选填）" />
        </Form.Item>

        {/* 请求方式字段已隐藏，默认使用 GET */}
        <Form.Item label="请求方式" name="method">
          <Select>
            <Select.Option value="GET">GET</Select.Option>
            <Select.Option value="POST">POST</Select.Option>
            <Select.Option value="PUT">PUT</Select.Option>
            <Select.Option value="DELETE">DELETE</Select.Option>
            <Select.Option value="PATCH">PATCH</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="匹配方式"
          name="filterType"
          rules={[{ required: true, message: "请选择匹配方式" }]}
        >
          <Select>
            <Select.Option value="contains">包含</Select.Option>
            <Select.Option value="exact">精确匹配</Select.Option>
            <Select.Option value="regex">正则表达式</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="延迟时间(毫秒)" name="delay">
          <InputNumber min={0} max={10000} className="w-full" />
        </Form.Item>

        <Form.Item label="状态码" name="statusCode">
          <InputNumber min={100} max={599} className="w-full" />
        </Form.Item>
      </Form>
    </Drawer>
  )
}
