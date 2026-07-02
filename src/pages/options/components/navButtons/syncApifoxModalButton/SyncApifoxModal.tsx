import React, { useState, useEffect, useRef } from "react"
import { Modal, Form, Input, Select, Segmented, message } from "antd"
import { GlobalConfig, ModuleConfig } from "../../../../../types"
import {
  convertParsedApisToModules,
  getOnlineMockPrefix,
  type ParsedApi,
  type SwaggerData,
} from "./apifoxUtils"
import {
  getCachedApifoxLocalUrl,
  getCachedApifoxMockToken,
  getCachedApifoxProjectId,
  getCachedApifoxToken,
  saveCachedApifoxLocalUrl,
  saveCachedApifoxMockToken,
  saveCachedApifoxProjectId,
  saveCachedApifoxToken,
} from "./apifoxCache"
import { useApifoxValidation } from "./hooks/useApifoxValidation"
import { useTagHistory } from "./hooks/useTagHistory"
import { useConflictDetection } from "./hooks/useConflictDetection"
import TagHistorySelector from "./components/TagHistorySelector"
import ConflictAlerts, { type MergeStrategy } from "./components/ConflictAlerts"
import ApiSummaryAlert from "./components/ApiSummaryAlert"
import UrlValidationStatus from "./components/UrlValidationStatus"

const { TextArea } = Input

interface SyncApifoxModalProps {
  visible: boolean
  onCancel: () => void
  onOk: (
    modules: ModuleConfig[],
    mergeStrategy?: MergeStrategy,
    duplicateTags?: string[]
  ) => void
  onSaveConfig?: (apifoxConfig: {
    apifoxUrl: string
    mockPrefix: string
    selectedTags?: string[]
  }) => void
  config: GlobalConfig
}

const MOCK_PREFIX_LOCAL =
  "http://127.0.0.1:4523/m1/3155205-1504204-default"

const MOCK_PREFIX_ONLINE =
  "https://m1.apifoxmock.com/m1/项目编号-0-default"

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
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [parsedApis, setParsedApis] = useState<ParsedApi[]>([])
  const [mergeStrategy, setMergeStrategy] = useState<MergeStrategy>("merge")
  const [syncMode, setSyncMode] = useState<"local" | "online">("local")

  // 按模式缓存已加载的数据和表单值，切换模式时避免重复请求和清空表单
  const modeCacheRef = useRef<{
    [key in "local" | "online"]?: {
      selectedTags: string[]
      parsedApis: ParsedApi[]
      swaggerData: SwaggerData | null
      availableTags: string[]
      formValues: {
        apifoxUrl?: string
        projectId?: string
        apifoxToken?: string
        apifoxMockToken?: string
        mockPrefix?: string
      }
    }
  }>({})

  // 使用自定义 hooks
  const {
    validating,
    swaggerData,
    availableTags,
    validateApifoxUrl,
    parseSwaggerData,
    resetValidation,
    restoreValidationData,
  } = useApifoxValidation()

  const { tagHistory, saveTagHistory, deleteTagHistory } = useTagHistory()

  const { duplicateTags } = useConflictDetection(selectedTags, config)

  // 更新解析的 APIs，同时更新当前模式的缓存
  const updateParsedApis = (tags: string[]) => {
    try {
      const apis = parseSwaggerData(tags)
      if (apis) {
        setParsedApis(apis)
        // 更新当前模式的缓存
        if (swaggerData) {
          const formValues = form.getFieldsValue([
            "apifoxUrl",
            "projectId",
            "apifoxToken",
            "apifoxMockToken",
            "mockPrefix",
          ])
          modeCacheRef.current[syncMode] = {
            selectedTags: tags,
            parsedApis: apis,
            swaggerData,
            availableTags,
            formValues: formValues as {
              apifoxUrl?: string
              projectId?: string
              apifoxToken?: string
              apifoxMockToken?: string
              mockPrefix?: string
            },
          }
        }
      }
    } catch (error) {
      setParsedApis([])
      message.error(
        error instanceof Error ? error.message : "标签校验失败，请检查接口配置"
      )
    }
  }

  // 重置表单
  const resetForm = () => {
    form.resetFields()
    resetValidation()
    setSelectedTags([])
    setParsedApis([])
    setMergeStrategy("merge")
    setSyncMode("local")
  }

  // 处理模式切换
  const handleModeChange = (value: "local" | "online") => {
    // 如果切换到当前模式，不做任何操作
    if (value === syncMode) return

    // 将当前模式的状态和表单值保存到缓存
    const currentFormValues = form.getFieldsValue([
      "apifoxUrl",
      "projectId",
      "apifoxToken",
      "apifoxMockToken",
      "mockPrefix",
    ])
    modeCacheRef.current[syncMode] = {
      selectedTags,
      parsedApis,
      swaggerData,
      availableTags,
      formValues: currentFormValues as {
        apifoxUrl?: string
        projectId?: string
        apifoxToken?: string
        apifoxMockToken?: string
        mockPrefix?: string
      },
    }

    setSyncMode(value)

    // 检查目标模式是否有缓存数据，有则直接恢复，无需重新请求
    const cached = modeCacheRef.current[value]
    if (cached && cached.swaggerData) {
      setSelectedTags(cached.selectedTags)
      setParsedApis(cached.parsedApis)
      restoreValidationData({
        swaggerData: cached.swaggerData,
        availableTags: cached.availableTags,
      })
    } else {
      resetValidation()
      setSelectedTags([])
      setParsedApis([])
    }

    // 恢复目标模式的表单值（优先用缓存中的用户填写值，回退到当前模式对应的默认值）
    if (cached?.formValues) {
      // 有缓存的表单值，直接恢复（用户之前填写的）
      form.setFieldsValue(cached.formValues)
      // 强制校正 mockPrefix，避免缓存中混入另一模式的值
      form.setFieldValue(
        "mockPrefix",
        value === "online"
          ? cached.formValues.mockPrefix || getOnlineMockPrefix(form.getFieldValue("projectId") || "")
          : MOCK_PREFIX_LOCAL
      )
    } else if (value === "local") {
      // 无缓存：本地模式 mockPrefix 固定为本地地址，不读 config.mockPrefix（可能混入云端值）
      const localUrl =
        config.apifoxConfig?.mode === "local"
          ? config.apifoxConfig.apifoxUrl
          : ""
      form.setFieldsValue({
        projectId: undefined,
        apifoxToken: undefined,
        apifoxMockToken: undefined,
        apifoxUrl: localUrl,
        mockPrefix: MOCK_PREFIX_LOCAL,
      })
    } else {
      // 无缓存：云端模式 mockPrefix 由 projectId 推导，不读 config.mockPrefix
      const isOnlineConfig = config.apifoxConfig?.mode === "online"
      const projectId = isOnlineConfig ? config.apifoxConfig.apifoxUrl : ""
      form.setFieldsValue({
        apifoxUrl: undefined,
        projectId,
        apifoxToken: isOnlineConfig ? config.apifoxConfig.apifoxToken || "" : "",
        apifoxMockToken: isOnlineConfig ? config.apifoxConfig.apifoxMockToken || "" : "",
        mockPrefix: projectId
          ? getOnlineMockPrefix(projectId)
          : MOCK_PREFIX_LOCAL,
      })
    }
  }

  // 处理在线模式项目ID变化
  const handleProjectIdChange = () => {
    const projectId = form.getFieldValue("projectId")
    if (projectId) {
      // 自动填充 mockPrefix
      form.setFieldValue("mockPrefix", getOnlineMockPrefix(projectId))
      // 触发验证
      const token = form.getFieldValue("apifoxToken")
      validateApifoxUrl(projectId, selectedTags, "online", token).then(
        (result) => {
          if (result.success && result.parsedApis && result.swaggerData) {
            setParsedApis(result.parsedApis)
            // 更新在线模式缓存（含表单值）
            const formValues = form.getFieldsValue([
              "apifoxUrl",
              "projectId",
              "apifoxToken",
              "apifoxMockToken",
              "mockPrefix",
            ])
            modeCacheRef.current["online"] = {
              selectedTags,
              parsedApis: result.parsedApis,
              swaggerData: result.swaggerData,
              availableTags: result.availableTags || [],
              formValues: formValues as {
                apifoxUrl?: string
                projectId?: string
                apifoxToken?: string
                apifoxMockToken?: string
                mockPrefix?: string
              },
            }
          }
        }
      )
    }
  }

  // 处理标签变化
  const handleTagsChange = (tags: string[]) => {
    setSelectedTags(tags)
    updateParsedApis(tags)
  }

  // 处理Apifox地址变化
  const handleApifoxUrlChange = async () => {
    const url = form.getFieldValue("apifoxUrl")
    if (url) {
      const result = await validateApifoxUrl(url, selectedTags)
      if (result.success && result.parsedApis && result.swaggerData) {
        setParsedApis(result.parsedApis)
        // 更新本地模式缓存（含表单值）
        const formValues = form.getFieldsValue([
          "apifoxUrl",
          "projectId",
          "apifoxToken",
          "apifoxMockToken",
          "mockPrefix",
        ])
        modeCacheRef.current["local"] = {
          selectedTags,
          parsedApis: result.parsedApis,
          swaggerData: result.swaggerData,
          availableTags: result.availableTags || [],
          formValues: formValues as {
            apifoxUrl?: string
            projectId?: string
            apifoxToken?: string
            apifoxMockToken?: string
            mockPrefix?: string
          },
        }
      }
    }
  }

  // 处理确定按钮
  const handleOk = () => {
    if (parsedApis.length === 0) {
      message.warning("请先选择要同步的接口")
      return
    }

    if (selectedTags.length === 0) {
      message.warning("请先选择标签")
      return
    }

    // 如果有冲突的 tags，必须选择合并策略
    if (duplicateTags.length > 0 && !mergeStrategy) {
      message.warning("请选择合并策略")
      return
    }

    const apifoxUrl =
      syncMode === "online"
        ? form.getFieldValue("projectId")
        : form.getFieldValue("apifoxUrl")
    // 根据当前模式确定 mockPrefix，本地模式固定为本地地址，云端模式由 projectId 推导
    const formMockPrefix = form.getFieldValue("mockPrefix")
    const mockPrefix =
      syncMode === "online"
        ? formMockPrefix || getOnlineMockPrefix(apifoxUrl)
        : MOCK_PREFIX_LOCAL
    const apifoxToken = form.getFieldValue("apifoxToken")
    const apifoxMockToken = form.getFieldValue("apifoxMockToken")

    // 保存配置
    if (onSaveConfig) {
      onSaveConfig({
        mode: syncMode,
        apifoxUrl,
        mockPrefix,
        apifoxToken: syncMode === "online" ? apifoxToken : undefined,
        apifoxMockToken: syncMode === "online" ? apifoxMockToken : undefined,
        selectedTags: selectedTags.length > 0 ? selectedTags : undefined,
      })
    }

    // 保存地址到缓存（按模式分开存储，避免跨模式覆盖）
    if (apifoxUrl) {
      if (syncMode === "online") {
        saveCachedApifoxProjectId(apifoxUrl).catch((error) => {
          console.error("Failed to save cached project ID:", error)
        })
        if (apifoxToken) {
          saveCachedApifoxToken(apifoxToken).catch((error) => {
            console.error("Failed to save cached token:", error)
          })
        }
        if (apifoxMockToken) {
          saveCachedApifoxMockToken(apifoxMockToken).catch((error) => {
            console.error("Failed to save cached mock token:", error)
          })
        }
      } else {
        saveCachedApifoxLocalUrl(apifoxUrl).catch((error) => {
          console.error("Failed to save cached local URL:", error)
        })
      }
    }

    // 保存标签选择到历史记录
    if (selectedTags.length > 0) {
      saveTagHistory(selectedTags)
    }

    // 转换为 ModuleConfig 格式
    const newModules = convertParsedApisToModules(parsedApis, {
      apifoxUrl,
      mockPrefix,
      mode: syncMode,
      apifoxToken,
      apifoxMockToken,
    })

    // 传递合并策略信息给父组件
    onOk(
      newModules,
      duplicateTags.length > 0 ? mergeStrategy : undefined,
      duplicateTags.length > 0 ? duplicateTags : undefined
    )
    resetForm()
  }

  // 处理取消按钮
  const handleCancel = () => {
    resetForm()
    onCancel()
  }

  // 处理快速选择标签历史
  const handleQuickSelectTags = (historyItem: { tags: string[] }) => {
    const tags = [...historyItem.tags]
    setSelectedTags(tags)
    updateParsedApis(tags)
  }

  // 监听弹框显示状态，加载已保存的配置
  useEffect(() => {
    if (visible) {
      const savedMode = config.apifoxConfig?.mode || "local"
      setSyncMode(savedMode)

      const savedTags = config.apifoxConfig?.selectedTags || []
      const savedMockPrefix =
        config.apifoxConfig?.mockPrefix || MOCK_PREFIX_LOCAL

      if (savedMode === "online") {
        // 加载缓存的在线模式配置（优先从 config 读取，其次从独立缓存读取）
        const projectId =
          config.apifoxConfig?.mode === "online"
            ? config.apifoxConfig.apifoxUrl
            : ""
        const apifoxToken =
          config.apifoxConfig?.mode === "online"
            ? config.apifoxConfig.apifoxToken || ""
            : ""

        const mockToken =
          config.apifoxConfig?.mode === "online"
            ? config.apifoxConfig.apifoxMockToken || ""
            : ""

        Promise.all([
          projectId ? Promise.resolve(projectId) : getCachedApifoxProjectId(),
          apifoxToken
            ? Promise.resolve(apifoxToken)
            : getCachedApifoxToken(),
          mockToken
            ? Promise.resolve(mockToken)
            : getCachedApifoxMockToken(),
        ]).then(([cachedProjectId, cachedToken, cachedMockToken]) => {
          const finalProjectId =
            config.apifoxConfig?.apifoxUrl || cachedProjectId || ""
          const finalToken = apifoxToken || cachedToken || ""
          const finalMockToken = mockToken || cachedMockToken || ""

          if (finalProjectId) {
            form.setFieldsValue({
              projectId: finalProjectId,
              apifoxToken: finalToken,
              apifoxMockToken: finalMockToken,
              mockPrefix:
                config.apifoxConfig?.mockPrefix ||
                getOnlineMockPrefix(finalProjectId),
            })
            setSelectedTags(savedTags)

            // 自动验证并加载数据
            validateApifoxUrl(
              finalProjectId,
              savedTags,
              "online",
              finalToken
            )
              .then((result) => {
                if (result.success && result.parsedApis) {
                  setParsedApis(result.parsedApis)
                }
              })
              .catch((error) => {
                console.error("Failed to validate Apifox URL:", error)
              })
          } else {
            form.setFieldsValue({
              projectId: "",
              apifoxToken: "",
              mockPrefix: MOCK_PREFIX_LOCAL,
            })
          }
        })
      } else {
        // 加载缓存的本地模式配置（优先从 config 读取，其次从独立缓存读取）
        const localUrl =
          config.apifoxConfig?.mode === "local"
            ? config.apifoxConfig.apifoxUrl
            : ""

        ;(localUrl
          ? Promise.resolve(localUrl)
          : getCachedApifoxLocalUrl()
        ).then((cachedLocalUrl) => {
          const finalUrl = localUrl || cachedLocalUrl || ""

          if (finalUrl) {
            form.setFieldsValue({
              apifoxUrl: finalUrl,
              mockPrefix: savedMockPrefix,
            })
            setSelectedTags(savedTags)

            // 自动验证并加载数据
            validateApifoxUrl(finalUrl, savedTags, "local")
              .then((result) => {
                if (result.success && result.parsedApis) {
                  setParsedApis(result.parsedApis)
                }
              })
              .catch((error) => {
                console.error("Failed to validate Apifox URL:", error)
              })
          } else {
            form.setFieldsValue({
              mockPrefix: MOCK_PREFIX_LOCAL,
            })
          }
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
      okButtonProps={{
        disabled:
          parsedApis.length === 0 ||
          selectedTags.length === 0 ||
          (duplicateTags.length > 0 && !mergeStrategy),
      }}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          mockPrefix: MOCK_PREFIX_LOCAL,
        }}
      >
        <Form.Item label="同步模式">
          <Segmented
            options={[
              { label: "本地模式", value: "local" },
              { label: "云端模式", value: "online" },
            ]}
            value={syncMode}
            onChange={(value) =>
              handleModeChange(value as "local" | "online")
            }
            block
          />
        </Form.Item>

        {syncMode === "local" ? (
          <>
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
          </>
        ) : (
          <>
            <Form.Item
              label="项目编号"
              name="projectId"
              rules={[{ required: true, message: "请输入Apifox项目编号" }]}
              extra="填写 Apifox 项目的数字 ID"
            >
              <Input onBlur={handleProjectIdChange} />
            </Form.Item>

            <Form.Item
              label="Apifox 授权令牌"
              name="apifoxToken"
              rules={[{ required: true, message: "请输入Apifox授权令牌" }]}
              extra="Apifox 个人访问令牌（Access Token），可在 Apifox 个人设置中创建"
            >
              <Input.Password
                placeholder="请输入授权令牌"
                onBlur={handleProjectIdChange}
              />
            </Form.Item>

            <Form.Item
              label="Apifox Mock 令牌"
              name="apifoxMockToken"
              rules={[{ required: true, message: "请输入Apifox Mock令牌" }]}
              tooltip="点击任意一个云端接口，获取其后缀的 apifox token 填入即可"
            >
              <Input.Password
                placeholder="请输入 Mock 令牌"
                onBlur={handleProjectIdChange}
              />
            </Form.Item>
          </>
        )}

        <UrlValidationStatus validating={validating} />

        {swaggerData && (
          <>
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
              <TagHistorySelector
                tagHistory={tagHistory}
                onQuickSelect={handleQuickSelectTags}
                onRemove={deleteTagHistory}
              />
            </Form.Item>

            <Form.Item
              label="Mock地址前缀"
              name="mockPrefix"
              rules={[{ required: true, message: "请输入Mock地址前缀" }]}
              extra={
                syncMode === "online"
                  ? MOCK_PREFIX_ONLINE
                  : MOCK_PREFIX_LOCAL
              }
            >
              <Input />
            </Form.Item>

            <ApiSummaryAlert parsedApis={parsedApis} />

            <ConflictAlerts
              duplicateTags={duplicateTags}
              mergeStrategy={mergeStrategy}
              onMergeStrategyChange={setMergeStrategy}
            />
          </>
        )}
      </Form>
    </Modal>
  )
}
