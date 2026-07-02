import React, { useState, useEffect } from "react"
import { Modal, Form, Input, Select, message } from "antd"
import { GlobalConfig, ModuleConfig } from "../../../../../types"
import {
  convertParsedApisToModules,
  getOnlineMockPrefix,
  type ParsedApi,
} from "./apifoxUtils"
import {
  getCachedApifoxMockToken,
  getCachedApifoxProjectId,
  getCachedApifoxToken,
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

const MOCK_PREFIX_ONLINE =
  "https://m1.apifoxmock.com/m1/项目编号-0-default"

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

  // 使用自定义 hooks
  const {
    validating,
    swaggerData,
    availableTags,
    validateApifoxUrl,
    parseSwaggerData,
    resetValidation,
  } = useApifoxValidation()

  const { tagHistory, saveTagHistory, deleteTagHistory } = useTagHistory()

  const { duplicateTags } = useConflictDetection(selectedTags, config)

  // 更新解析的 APIs
  const updateParsedApis = (tags: string[]) => {
    try {
      const apis = parseSwaggerData(tags)
      if (apis) {
        setParsedApis(apis)
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
  }

  // 处理项目ID变化
  const handleProjectIdChange = () => {
    const projectId = form.getFieldValue("projectId")
    if (projectId) {
      // 自动填充 mockPrefix
      form.setFieldValue("mockPrefix", getOnlineMockPrefix(projectId))
      // 触发验证
      const token = form.getFieldValue("apifoxToken")
      validateApifoxUrl(projectId, selectedTags, "online", token).then(
        (result) => {
          if (result.success && result.parsedApis) {
            setParsedApis(result.parsedApis)
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

    const projectId = form.getFieldValue("projectId")
    const mockPrefix = form.getFieldValue("mockPrefix") || getOnlineMockPrefix(projectId)
    const apifoxToken = form.getFieldValue("apifoxToken")
    const apifoxMockToken = form.getFieldValue("apifoxMockToken")

    // 保存配置
    if (onSaveConfig) {
      onSaveConfig({
        mode: "online",
        apifoxUrl: projectId,
        mockPrefix,
        apifoxToken,
        apifoxMockToken,
        selectedTags: selectedTags.length > 0 ? selectedTags : undefined,
      })
    }

    // 保存地址到缓存
    if (projectId) {
      saveCachedApifoxProjectId(projectId).catch((error) => {
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
    }

    // 保存标签选择到历史记录
    if (selectedTags.length > 0) {
      saveTagHistory(selectedTags)
    }

    // 转换为 ModuleConfig 格式
    const newModules = convertParsedApisToModules(parsedApis, {
      apifoxUrl: projectId,
      mockPrefix,
      mode: "online",
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
      const savedTags = config.apifoxConfig?.selectedTags || []

      // 加载缓存的配置（优先从 config 读取，其次从独立缓存读取）
      const projectId = config.apifoxConfig?.mode === "online"
        ? config.apifoxConfig.apifoxUrl : ""
      const savedApifoxToken = config.apifoxConfig?.mode === "online"
        ? config.apifoxConfig.apifoxToken || "" : ""
      const savedMockToken = config.apifoxConfig?.mode === "online"
        ? config.apifoxConfig.apifoxMockToken || "" : ""

      Promise.all([
        projectId ? Promise.resolve(projectId) : getCachedApifoxProjectId(),
        savedApifoxToken ? Promise.resolve(savedApifoxToken) : getCachedApifoxToken(),
        savedMockToken ? Promise.resolve(savedMockToken) : getCachedApifoxMockToken(),
      ]).then(([cachedProjectId, cachedToken, cachedMockToken]) => {
        // 只读取当前为 online 模式时的 config 值，避免本地模式的 URL 被当作项目编号填入
        const finalProjectId = projectId || cachedProjectId || ""
        const finalToken = savedApifoxToken || cachedToken || ""
        const finalMockToken = savedMockToken || cachedMockToken || ""

        if (finalProjectId) {
          form.setFieldsValue({
            projectId: finalProjectId,
            apifoxToken: finalToken,
            apifoxMockToken: finalMockToken,
            mockPrefix: getOnlineMockPrefix(finalProjectId),
          })
          setSelectedTags(savedTags)

          // 自动验证并加载数据
          validateApifoxUrl(finalProjectId, savedTags, "online", finalToken)
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
            apifoxMockToken: "",
            mockPrefix: MOCK_PREFIX_ONLINE,
          })
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
      >
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
              extra={MOCK_PREFIX_ONLINE}
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
