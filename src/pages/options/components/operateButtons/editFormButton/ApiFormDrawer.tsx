import React, { useEffect, useState } from "react"
import { Drawer, Form, Input, Select, Button, message, Space } from "antd"

const { TextArea } = Input
import { ApiConfig, GlobalConfig } from "../../../../../types"
// import { QuickMockConfig } from "../../../../../types"
import {
  isValidUrl,
  isValidPath,
  isApiUrlDuplicate,
  isApiKeyDuplicate,
} from "../../../../../utils/chromeApi"
import {
  validateApifoxUrl,
  SwaggerData,
  ParsedApi,
} from "../../navButtons/syncApifoxModalButton/apifoxUtils"
import {
  APIFOX_FIELD_RUN_IN_APIFOX,
  APIFOX_FIELD_GROUP_NAME,
  APIFOX_FIELD_API_TYPE,
} from "../../../../../constant/apifoxFields"
import { ModelAction, ModelNamesMap } from "../../../../../constant/model"
import { camelCase } from "change-case"
// import QuickMockSection from "./QuickMockSection"
// import CustomMockFormModal from "./CustomMockFormModal"

interface ApiFormDrawerProps {
  visible: boolean
  onClose: () => void
  onOk: (apiData: Omit<ApiConfig, "id">) => void
  config: GlobalConfig
  data?: ApiConfig | null
  title?: string
}

// 解析 Swagger 数据获取接口信息
const parseApiInfoFromSwagger = (
  swaggerData: SwaggerData,
  apiUrl: string
): ParsedApi | null => {
  if (!swaggerData.paths) return null

  for (const [path, methods] of Object.entries(swaggerData.paths)) {
    // 支持模糊匹配：如果 apiUrl 包含在 path 中，或者 path 包含在 apiUrl 中
    if (path.includes(apiUrl) || apiUrl.includes(path)) {
      for (const [method, apiInfo] of Object.entries(methods)) {
        if (typeof apiInfo === "object" && apiInfo !== null) {
          const swaggerInfo = apiInfo as {
            tags?: string[]
            summary?: string
            [key: string]: unknown
          }
          const tags = swaggerInfo.tags || []
          const summary =
            swaggerInfo.summary || `${method.toUpperCase()} ${path}`
          const xApifoxRunUrl = swaggerInfo[APIFOX_FIELD_RUN_IN_APIFOX] as
            | string
            | undefined
          const apiId = xApifoxRunUrl?.split("/").pop()?.split("-")?.[1] || ""
          const groupName =
            (swaggerInfo[APIFOX_FIELD_GROUP_NAME] as string) ||
            (tags.length > 0 ? tags[0] : "demo.default")
          const modelApiType =
            (swaggerInfo[APIFOX_FIELD_API_TYPE] as string) || ModelAction.CUSTOM

          // 生成权限点
          let authPointKey = ""
          if (/^[a-zA-Z.]+$/.test(groupName)) {
            const authPrefix = groupName.split(".").join("-")
            let apiName = ModelNamesMap[modelApiType] as string
            if (apiName === "custom") {
              apiName = camelCase(path.split("/").pop() ?? "")
            }
            authPointKey = `${authPrefix}-${apiName}`
          }

          return {
            apiId,
            path,
            method: method.toUpperCase(),
            summary,
            tags,
            groupName,
            authPointKey,
            modelApiType,
          }
        }
      }
    }
  }
  return null
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
  const [swaggerCache, setSwaggerCache] = useState<SwaggerData | null>(null)
  const [isLoadingSwagger, setIsLoadingSwagger] = useState(false)
  // const [loading, setLoading] = useState(false)
  // const [customMockModalVisible, setCustomMockModalVisible] = useState(false)
  // const [editingCustomMock, setEditingCustomMock] =
  //   useState<QuickMockConfig | null>(null)
  // const [customMockForm] = Form.useForm()

  // // 使用 Form.useWatch 监听字段变化，确保表格能正确更新
  // const activeCustomMockKey = Form.useWatch("activeCustomMockKey", form) as
  //   | string
  //   | undefined
  // const customMockResponses = (Form.useWatch("customMockResponses", form) ||
  //   []) as QuickMockConfig[]

  // 加载 Swagger 数据缓存
  useEffect(() => {
    const loadSwaggerCache = async () => {
      const apifoxConfig = config.apifoxConfig
      if (apifoxConfig?.apifoxUrl && visible && !data) {
        // 只在添加模式且配置了 Apifox 地址时加载
        setIsLoadingSwagger(true)
        try {
          const swaggerData = await validateApifoxUrl(apifoxConfig.apifoxUrl)
          setSwaggerCache(swaggerData)
        } catch (error) {
          console.warn("Failed to load Apifox swagger data:", error)
          setSwaggerCache(null)
        } finally {
          setIsLoadingSwagger(false)
        }
      }
    }
    loadSwaggerCache()
  }, [config.apifoxConfig, visible, data])

  // 当编辑时，设置表单初始值
  useEffect(() => {
    if (visible && data) {
      // // 根据 quickMockType 判断是否使用自定义响应
      // const useCustomMock = data.quickMockType === "custom"
      // const activeCustomMockKey = data.activeCustomMockKey
      // // 如果有激活的自定义响应，自动启用快速联调
      // const quickMockEnabled = useCustomMock && !!activeCustomMockKey

      form.setFieldsValue({
        apiName: data.apiName,
        apiUrl: data.apiUrl,
        redirectURL: data.redirectURL,
        method: data.method,
        filterType: data.filterType,
        delay: data.delay,
        statusCode: data.statusCode,
        authPointKey: data.authPointKey,
        pageRoute: data.pageRoute,
        // useCustomMock: useCustomMock,
        // quickMockEnabled: quickMockEnabled,
        // customMockResponses: data.customMockResponses || [],
        // activeCustomMockKey: activeCustomMockKey || undefined,
      })
    } else if (visible) {
      // 添加时重置表单
      form.resetFields()
      // form.setFieldsValue({
      //   useCustomMock: false,
      //   customMockResponses: [],
      // })
    }
  }, [visible, data, form])

  const handleSubmit = async () => {
    try {
      // setLoading(true)
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

      // // 获取自定义响应列表
      // const customMockResponses =
      //   form.getFieldValue("customMockResponses") || []
      // const useCustomMock = values.useCustomMock || false
      // const activeCustomMockKey = values.activeCustomMockKey

      // // 如果有激活的自定义响应，自动启用快速联调
      // const quickMockEnabled = useCustomMock && !!activeCustomMockKey

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
        pageRoute: values.pageRoute || "",
        // quickMockType: useCustomMock ? "custom" : "none",
        // quickMockEnabled: quickMockEnabled,
        // customMockResponses: useCustomMock ? customMockResponses : undefined,
        // activeCustomMockKey: useCustomMock
        //   ? activeCustomMockKey || undefined
        //   : undefined,
      }

      onOk(apiData)
      form.resetFields()
      onClose()
      message.success("操作成功")
    } catch (error) {
      console.error("Form validation failed:", error)
    } finally {
      // setLoading(false)
    }
  }

  const handleCancel = () => {
    form.resetFields()
    onClose()
  }

  // 处理接口地址变化，自动填充其他字段
  const handleApiUrlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const apiUrl = e.target.value.trim()
    if (!apiUrl) return

    const apifoxConfig = config.apifoxConfig
    if (!apifoxConfig?.mockPrefix) return

    // 自动填充重定向 URL
    const redirectURL = `${apifoxConfig.mockPrefix}${apiUrl}`
    form.setFieldsValue({ redirectURL })

    // 如果有 Swagger 缓存，尝试从缓存中获取更多信息
    if (swaggerCache) {
      const apiInfo = parseApiInfoFromSwagger(swaggerCache, apiUrl)
      if (apiInfo) {
        form.setFieldsValue({
          apiName: apiInfo.summary,
          method: apiInfo.method as ApiConfig["method"],
          authPointKey: apiInfo.authPointKey,
        })
      }
    }
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
          // useCustomMock: false,
          // customMockResponses: [],
        }}
      >
        <Form.Item
          label="接口地址"
          name="apiUrl"
          rules={[{ required: true, message: "请输入接口地址" }]}
          extra={
            isLoadingSwagger
              ? "正在加载 Apifox 数据..."
              : config.apifoxConfig?.mockPrefix
                ? `已配置 Apifox Mock 地址，输入后将自动填充其他字段`
                : "示例：/api/users 或 http://localhost:3000/api/users"
          }
        >
          <TextArea
            placeholder="请输入接口地址"
            rows={1}
            autoSize={{ minRows: 1, maxRows: 5 }}
            onBlur={handleApiUrlChange}
          />
        </Form.Item>

        <Form.Item
          label="接口名称"
          name="apiName"
          rules={[{ required: true, message: "请输入接口名称" }]}
        >
          <Input placeholder="请输入接口名称" />
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

        <Form.Item
          label="页面路由"
          name="pageRoute"
          extra="示例：/user/list 或 /dashboard，用于标识该接口属于哪个页面"
        >
          <Input.TextArea
            placeholder="请输入页面路由（选填）"
            autoSize={{ minRows: 1, maxRows: 6 }}
          />
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

        {/* <Form.Item label="延迟时间(毫秒)" name="delay">
          <InputNumber min={0} max={10000} className="w-full" />
        </Form.Item>

        <Form.Item label="状态码" name="statusCode">
          <InputNumber min={100} max={599} className="w-full" />
        </Form.Item> */}

        {/* <QuickMockSection
          form={form}
          config={config}
          activeCustomMockKey={activeCustomMockKey}
          customMockResponses={customMockResponses}
          onAddCustomMock={() => {
            setEditingCustomMock(null)
            customMockForm.resetFields()
            setCustomMockModalVisible(true)
          }}
          onEditCustomMock={(record) => {
            setEditingCustomMock(record)
            customMockForm.setFieldsValue({
              name: record.name,
              key: record.key,
              responseJson: record.responseJson,
            })
            setCustomMockModalVisible(true)
          }}
        />

        <CustomMockFormModal
          visible={customMockModalVisible}
          editingCustomMock={editingCustomMock}
          config={config}
          form={form}
          customMockForm={customMockForm}
          onCancel={() => {
            setCustomMockModalVisible(false)
            setEditingCustomMock(null)
            customMockForm.resetFields()
          }}
          onSuccess={() => {
            setCustomMockModalVisible(false)
            setEditingCustomMock(null)
            customMockForm.resetFields()
          }}
        /> */}
      </Form>
    </Drawer>
  )
}
