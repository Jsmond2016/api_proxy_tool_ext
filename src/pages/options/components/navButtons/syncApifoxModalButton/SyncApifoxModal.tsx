import React, { useState, useEffect } from "react"
import { Modal, Form, Input, Select, message } from "antd"
import { GlobalConfig, ModuleConfig } from "../../../../../types"
import {
  convertParsedApisToModules,
  type ParsedApi,
} from "./apifoxUtils"
import { getCachedApifoxUrl, saveCachedApifoxUrl } from "./apifoxCache"
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
      if (result.success && result.parsedApis) {
        setParsedApis(result.parsedApis)
      }
    }
  }

  // 处理确定按钮
  const handleOk = () => {
    if (parsedApis.length === 0) {
      message.warning("请先选择要同步的接口")
      return
    }

    // 如果有冲突的 tags，必须选择合并策略
    if (duplicateTags.length > 0 && !mergeStrategy) {
      message.warning("请选择合并策略")
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

    // 保存地址到缓存
    if (apifoxUrl) {
      saveCachedApifoxUrl(apifoxUrl).catch((error) => {
        console.error("Failed to save cached URL:", error)
      })
    }

    // 保存标签选择到历史记录
    if (selectedTags.length > 0) {
      saveTagHistory(selectedTags)
    }

    // 转换为 ModuleConfig 格式
    const newModules = convertParsedApisToModules(parsedApis, {
      apifoxUrl,
      mockPrefix,
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
      // 加载缓存的地址
      getCachedApifoxUrl().then((cachedUrl) => {
        // 如果有已保存的配置，优先使用配置中的地址
        const urlToUse = config.apifoxConfig?.apifoxUrl || cachedUrl

        if (urlToUse) {
          const savedTags = config.apifoxConfig?.selectedTags || []

          form.setFieldsValue({
            apifoxUrl: urlToUse,
            mockPrefix: config.apifoxConfig?.mockPrefix || MOCK_PREFIX,
          })
          setSelectedTags(savedTags)

          // 自动验证并加载数据
          validateApifoxUrl(urlToUse, savedTags)
            .then((result) => {
              if (result.success && result.parsedApis) {
                setParsedApis(result.parsedApis)
              }
            })
            .catch((error) => {
              console.error("Failed to validate Apifox URL:", error)
            })
        } else {
          // 使用默认值
          form.setFieldsValue({
            mockPrefix: MOCK_PREFIX,
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
          (duplicateTags.length > 0 && !mergeStrategy),
      }}
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
              extra={MOCK_PREFIX}
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
