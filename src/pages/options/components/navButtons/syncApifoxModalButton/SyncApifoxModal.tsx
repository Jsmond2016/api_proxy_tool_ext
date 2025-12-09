import React, { useState, useEffect } from "react"
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  message,
  Spin,
  Alert,
  Tag,
  Space,
} from "antd"
import { CloseOutlined } from "@ant-design/icons"
import { GlobalConfig, ModuleConfig, ApiConfig } from "../../../../../types"
import {
  convertParsedApisToModules,
  parseSwaggerData as parseSwaggerDataUtil,
  type ParsedApi,
  type SwaggerData,
  type ApifoxStatus,
  APIFOX_STATUS_OPTIONS,
  DEFAULT_APIFOX_STATUS,
} from "./apifoxUtils"
import {
  getCachedApifoxUrl,
  saveCachedApifoxUrl,
  getTagHistory,
  addTagHistory,
  removeTagHistory,
  type TagHistoryItem,
} from "./apifoxCache"

const { TextArea } = Input

interface SyncApifoxModalProps {
  visible: boolean
  onCancel: () => void
  onOk: (modules: ModuleConfig[]) => void
  onSaveConfig?: (apifoxConfig: {
    apifoxUrl: string
    mockPrefix: string
    selectedTags?: string[]
    selectedStatus?: ApifoxStatus
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
  const [selectedStatus, setSelectedStatus] = useState<ApifoxStatus>(
    DEFAULT_APIFOX_STATUS
  )
  const [parsedApis, setParsedApis] = useState<ParsedApi[]>([])
  const [conflicts, setConflicts] = useState<{
    urlConflicts: string[]
    groupConflicts: string[]
  }>({ urlConflicts: [], groupConflicts: [] })
  const [tagHistory, setTagHistory] = useState<TagHistoryItem[]>([])

  // 重置表单
  const resetForm = () => {
    form.resetFields()
    setSwaggerData(null)
    setAvailableTags([])
    setSelectedTags([])
    setSelectedStatus(DEFAULT_APIFOX_STATUS)
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

      const swaggerDataResult = data as SwaggerData
      setSwaggerData(swaggerDataResult)

      // 提取tags
      const tags = data.tags?.map((tag: { name: string }) => tag.name) || []
      setAvailableTags(tags)

      // 验证成功后，解析数据以显示接口列表
      const currentSelectedTags = selectedTags.length > 0 ? selectedTags : []
      const currentSelectedStatus = selectedStatus || DEFAULT_APIFOX_STATUS
      const apis = parseSwaggerDataUtil(
        swaggerDataResult,
        currentSelectedTags,
        currentSelectedStatus
      )
      setParsedApis(apis)
      const conflicts = detectConflicts(apis)
      setConflicts(conflicts)

      // 验证成功后，保存地址到缓存
      saveCachedApifoxUrl(url).catch((error) => {
        console.error("Failed to save cached URL:", error)
      })

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
    selectedTags: string[],
    selectedStatus: ApifoxStatus
  ): ParsedApi[] => {
    return parseSwaggerDataUtil(swaggerData, selectedTags, selectedStatus)
  }

  // 检测冲突（需要在组件内部定义，因为需要访问 config）
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
      const apis = parseSwaggerData(swaggerData, tags, selectedStatus)
      setParsedApis(apis)

      const conflicts = detectConflicts(apis)
      setConflicts(conflicts)
    }
  }

  // 处理状态变化
  const handleStatusChange = (status: ApifoxStatus) => {
    setSelectedStatus(status)

    if (swaggerData) {
      const apis = parseSwaggerData(swaggerData, selectedTags, status)
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
        selectedStatus:
          selectedStatus !== DEFAULT_APIFOX_STATUS ? selectedStatus : undefined,
      })
    }

    // 保存地址到缓存
    if (apifoxUrl) {
      saveCachedApifoxUrl(apifoxUrl).catch((error) => {
        console.error("Failed to save cached URL:", error)
      })
    }

    // 保存标签选择到历史记录
    if (selectedTags.length > 0) {
      addTagHistory(selectedTags)
        .then(() => {
          // 保存成功后重新加载历史记录
          loadTagHistory()
        })
        .catch((error) => {
          console.error("Failed to save tag history:", error)
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

  // 加载标签历史
  const loadTagHistory = async () => {
    try {
      const history = await getTagHistory()
      setTagHistory(history)
    } catch (error) {
      console.error("Failed to load tag history:", error)
      setTagHistory([])
    }
  }

  // 处理快速选择标签历史
  const handleQuickSelectTags = (historyItem: TagHistoryItem) => {
    setSelectedTags([...historyItem.tags])
    if (swaggerData) {
      const apis = parseSwaggerData(
        swaggerData,
        historyItem.tags,
        selectedStatus
      )
      setParsedApis(apis)
      const conflicts = detectConflicts(apis)
      setConflicts(conflicts)
    }
  }

  // 处理删除标签历史
  const handleRemoveTagHistory = async (timestamp: number) => {
    try {
      await removeTagHistory(timestamp)
      await loadTagHistory()
    } catch (error) {
      console.error("Failed to remove tag history:", error)
    }
  }

  // 监听弹框显示状态，加载已保存的配置
  useEffect(() => {
    if (visible) {
      // 加载标签历史
      loadTagHistory()

      // 加载缓存的地址
      getCachedApifoxUrl().then((cachedUrl) => {
        // 如果有已保存的配置，优先使用配置中的地址
        const urlToUse = config.apifoxConfig?.apifoxUrl || cachedUrl

        if (urlToUse) {
          form.setFieldsValue({
            apifoxUrl: urlToUse,
            mockPrefix: config.apifoxConfig?.mockPrefix || MOCK_PREFIX,
          })
          setSelectedTags(config.apifoxConfig?.selectedTags || [])
          setSelectedStatus(
            config.apifoxConfig?.selectedStatus || DEFAULT_APIFOX_STATUS
          )

          // 自动验证并加载数据
          if (urlToUse) {
            validateApifoxUrl(urlToUse).catch((error) => {
              console.error("Failed to validate Apifox URL:", error)
            })
          }
        } else {
          // 使用默认值
          form.setFieldsValue({
            mockPrefix: MOCK_PREFIX,
          })
          setSelectedStatus(DEFAULT_APIFOX_STATUS)
        }
      })
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
              label="接口状态"
              name="status"
              tooltip="选择要同步的接口状态"
              initialValue={DEFAULT_APIFOX_STATUS}
              rules={[{ required: true, message: "请选择接口状态" }]}
            >
              <Select
                placeholder="请选择接口状态"
                value={selectedStatus}
                onChange={handleStatusChange}
                options={APIFOX_STATUS_OPTIONS}
              />
            </Form.Item>

            <Form.Item
              label="选择标签"
              name="tags"
              tooltip="请选择单个或多个需要同步的标签"
              rules={[{ required: true, message: "请选择标签" }]}
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
              {tagHistory.length > 0 && (
                <div className="mt-2">
                  <div className="text-xs text-gray-500 mb-1">
                    最近选择的标签（点击快速应用）：
                  </div>
                  <Space wrap size={[8, 8]}>
                    {tagHistory
                      .filter(
                        (item) => item && item.tags && Array.isArray(item.tags)
                      )
                      .map((item) => {
                        const tagsText =
                          item.tags.length > 3
                            ? `${item.tags.slice(0, 3).join(", ")}...`
                            : item.tags.join(", ")
                        return (
                          <Tag
                            key={item.timestamp}
                            closable
                            onClose={(e) => {
                              e.preventDefault()
                              e.stopPropagation() // 阻止事件冒泡，避免触发 onClick
                              handleRemoveTagHistory(item.timestamp)
                            }}
                            className="cursor-pointer"
                            onClick={() => handleQuickSelectTags(item)}
                            color="blue"
                            title={item.tags.join(", ")}
                          >
                            {tagsText}
                          </Tag>
                        )
                      })}
                  </Space>
                </div>
              )}
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
