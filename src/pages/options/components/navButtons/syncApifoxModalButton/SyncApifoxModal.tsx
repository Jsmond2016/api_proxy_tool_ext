import React, { useState, useEffect } from "react"
import { Modal, Form, Input, Select, Button, message, Spin, Alert } from "antd"
import { GlobalConfig, ModuleConfig, ApiConfig } from "../../../../../types"
import {
  convertParsedApisToModules,
  parseSwaggerData as parseSwaggerDataUtil,
  type ParsedApi,
  type SwaggerData,
} from "./apifoxUtils"

const { TextArea } = Input

interface SyncApifoxModalProps {
  visible: boolean
  onCancel: () => void
  onOk: (modules: ModuleConfig[]) => void
  onSaveConfig?: (apifoxConfig: {
    apifoxUrl: string
    mockPrefix: string
    selectedTags?: string[]
  }) => void
  config: GlobalConfig
}

const MOCK_PREFIX = "http://127.0.0.1:4523/m1/3155205-1504204-default"

const APIFOX_URL =
  "http://127.0.0.1:4523/export/openapi?projectId=项目编号&specialPurpose=openapi-generator"

export default function SyncApifoxModal({
  visible,
  onCancel,
  onOk,
  onSaveConfig,
  config,
}: SyncApifoxModalProps) {
  const [form] = Form.useForm()
  const [validating, setValidating] = useState(false)
  const [swaggerData, setSwaggerData] = useState<SwaggerData | null>(null)
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [parsedApis, setParsedApis] = useState<ParsedApi[]>([])
  const [conflicts, setConflicts] = useState<{
    urlConflicts: string[]
    groupConflicts: string[]
  }>({ urlConflicts: [], groupConflicts: [] })

  // 重置表单
  const resetForm = () => {
    form.resetFields()
    setSwaggerData(null)
    setAvailableTags([])
    setSelectedTags([])
    setParsedApis([])
    setConflicts({ urlConflicts: [], groupConflicts: [] })
  }

  // 验证Apifox地址
  const validateApifoxUrl = async (url: string) => {
    if (!url) return false

    try {
      setValidating(true)
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      const data = await response.json()

      // 验证是否为有效的Swagger/OpenAPI数据
      if (!data.openapi && !data.swagger) {
        throw new Error("不是有效的OpenAPI/Swagger数据")
      }

      setSwaggerData(data as SwaggerData)

      // 提取tags
      const tags = data.tags?.map((tag: { name: string }) => tag.name) || []
      setAvailableTags(tags)

      message.success("Apifox地址验证成功")
      return true
    } catch (error) {
      message.error(
        `验证失败: ${error instanceof Error ? error.message : "未知错误"}`
      )
      return false
    } finally {
      setValidating(false)
    }
  }

  // 解析Swagger数据
  const parseSwaggerData = (
    swaggerData: SwaggerData,
    selectedTags: string[]
  ): ParsedApi[] => {
    return parseSwaggerDataUtil(swaggerData, selectedTags)
  }

  // 检测冲突
  const detectConflicts = (parsedApis: ParsedApi[]) => {
    const urlConflicts: string[] = []
    const groupConflicts: string[] = []

    // 检查URL冲突
    parsedApis.forEach((api) => {
      const existingApi = config.modules
        .flatMap((module) => module.apiArr)
        .find((existingApi) => existingApi.apiUrl.includes(api.path))

      if (existingApi) {
        urlConflicts.push(`${api.method} ${api.path} -> ${existingApi.apiName}`)
      }
    })

    // 检查分组名冲突
    const newGroupNames = [...new Set(parsedApis.map((api) => api.groupName))]
    newGroupNames.forEach((groupName) => {
      const existingModule = config.modules.find(
        (module) => module.label === groupName
      )
      if (existingModule) {
        groupConflicts.push(groupName)
      }
    })

    return { urlConflicts, groupConflicts }
  }

  // 处理标签变化
  const handleTagsChange = (tags: string[]) => {
    setSelectedTags(tags)

    if (swaggerData) {
      const apis = parseSwaggerData(swaggerData, tags)
      setParsedApis(apis)

      const conflicts = detectConflicts(apis)
      setConflicts(conflicts)
    }
  }

  // 处理Apifox地址变化
  const handleApifoxUrlChange = async () => {
    const url = form.getFieldValue("apifoxUrl")
    if (url) {
      await validateApifoxUrl(url)
    }
  }

  // 处理确定按钮
  const handleOk = () => {
    if (parsedApis.length === 0) {
      message.warning("请先选择要同步的接口")
      return
    }

    if (
      conflicts.urlConflicts.length > 0 ||
      conflicts.groupConflicts.length > 0
    ) {
      message.warning("存在冲突，请先解决冲突后再同步")
      return
    }

    const apifoxUrl = form.getFieldValue("apifoxUrl")
    const mockPrefix = form.getFieldValue("mockPrefix") || MOCK_PREFIX

    // 保存配置
    if (onSaveConfig) {
      onSaveConfig({
        apifoxUrl,
        mockPrefix,
        selectedTags: selectedTags.length > 0 ? selectedTags : undefined,
      })
    }

    // 转换为 ModuleConfig 格式
    const newModules = convertParsedApisToModules(parsedApis, {
      apifoxUrl,
      mockPrefix,
    })

    onOk(newModules)
    resetForm()
  }

  // 处理取消按钮
  const handleCancel = () => {
    resetForm()
    onCancel()
  }

  // 监听弹框显示状态，加载已保存的配置
  useEffect(() => {
    if (visible) {
      // 如果有已保存的配置，加载到表单
      if (config.apifoxConfig) {
        form.setFieldsValue({
          apifoxUrl: config.apifoxConfig.apifoxUrl,
          mockPrefix: config.apifoxConfig.mockPrefix,
        })
        setSelectedTags(config.apifoxConfig.selectedTags || [])
        // 自动验证并加载数据
        if (config.apifoxConfig.apifoxUrl) {
          validateApifoxUrl(config.apifoxConfig.apifoxUrl).catch((error) => {
            console.error("Failed to validate Apifox URL:", error)
          })
        }
      } else {
        // 使用默认值
        form.setFieldsValue({
          mockPrefix: MOCK_PREFIX,
        })
      }
    } else {
      resetForm()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, config.apifoxConfig?.apifoxUrl])

  return (
    <Modal
      title="同步 Apifox 接口"
      open={visible}
      onCancel={handleCancel}
      onOk={handleOk}
      width={800}
      okText="确定同步"
      cancelText="取消"
      okButtonProps={{ disabled: parsedApis.length === 0 }}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          mockPrefix: MOCK_PREFIX,
        }}
      >
        <Form.Item
          label="Apifox 本地地址"
          name="apifoxUrl"
          rules={[
            { required: true, message: "请输入Apifox地址" },
            { type: "url", message: "请输入有效的URL" },
          ]}
          extra={APIFOX_URL}
        >
          <TextArea rows={2} onBlur={handleApifoxUrlChange} />
        </Form.Item>

        {validating && (
          <div className="text-center py-4">
            <Spin size="small" />
            <span className="ml-2">正在验证地址...</span>
          </div>
        )}

        {swaggerData && (
          <>
            <Form.Item
              label="选择标签"
              name="tags"
              tooltip="请选择单个或多个需要同步的标签"
            >
              <Select
                mode="multiple"
                placeholder="请选择标签"
                value={selectedTags}
                onChange={handleTagsChange}
                showSearch
                optionFilterProp="label"
                autoClearSearchValue={false}
                options={availableTags.map((tag) => ({
                  label: tag,
                  value: tag,
                }))}
              />
            </Form.Item>

            <Form.Item
              label="Mock地址前缀"
              name="mockPrefix"
              rules={[{ required: true, message: "请输入Mock地址前缀" }]}
              extra={MOCK_PREFIX}
            >
              <Input />
            </Form.Item>

            {parsedApis.length > 0 && (
              <div className="mb-4">
                <Alert
                  message={`找到 ${parsedApis.length} 个接口，将创建 ${
                    Object.keys(
                      parsedApis.reduce((groups, api) => {
                        groups[api.groupName] = true
                        return groups
                      }, {} as Record<string, boolean>)
                    ).length
                  } 个分组`}
                  type="info"
                  showIcon
                />
              </div>
            )}

            {conflicts.urlConflicts.length > 0 && (
              <Alert
                message="URL冲突"
                description={
                  <div>
                    <p>以下接口URL已存在：</p>
                    <ul className="list-disc list-inside">
                      {conflicts.urlConflicts.map((conflict, index) => (
                        <li key={index} className="text-red-600">
                          {conflict}
                        </li>
                      ))}
                    </ul>
                  </div>
                }
                type="warning"
                showIcon
                className="mb-4"
              />
            )}

            {conflicts.groupConflicts.length > 0 && (
              <Alert
                message="分组名冲突"
                description={
                  <div>
                    <p>以下分组名已存在：</p>
                    <ul className="list-disc list-inside">
                      {conflicts.groupConflicts.map((conflict, index) => (
                        <li key={index} className="text-red-600">
                          {conflict}
                        </li>
                      ))}
                    </ul>
                  </div>
                }
                type="warning"
                showIcon
                className="mb-4"
              />
            )}
          </>
        )}
      </Form>
    </Modal>
  )
}
