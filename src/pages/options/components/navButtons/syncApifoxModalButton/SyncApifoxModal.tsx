import React, { useState, useEffect } from "react"
import { Modal, Form, Input, Select, message } from "antd"
import { GlobalConfig, ModuleConfig } from "../../../../../types"
import {
  convertParsedApisToModules,
  type ApifoxStatus,
  type ParsedApi,
  APIFOX_STATUS_OPTIONS,
  DEFAULT_APIFOX_STATUS,
} from "./apifoxUtils"
import { getCachedApifoxUrl, saveCachedApifoxUrl } from "./apifoxCache"
import { useApifoxValidation } from "./hooks/useApifoxValidation"
import { useTagHistory } from "./hooks/useTagHistory"
import { useConflictDetection } from "./hooks/useConflictDetection"
import TagHistorySelector from "./components/TagHistorySelector"
import ConflictAlerts from "./components/ConflictAlerts"
import ApiSummaryAlert from "./components/ApiSummaryAlert"
import UrlValidationStatus from "./components/UrlValidationStatus"

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
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedStatus, setSelectedStatus] = useState<ApifoxStatus>(
    DEFAULT_APIFOX_STATUS
  )
  const [parsedApis, setParsedApis] = useState<ParsedApi[]>([])

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

  const { urlConflicts, groupConflicts } = useConflictDetection(
    parsedApis,
    config
  )

  // 更新解析的 APIs
  const updateParsedApis = (tags: string[], status: ApifoxStatus) => {
    const apis = parseSwaggerData(tags, status)
    if (apis) {
      setParsedApis(apis)
    }
  }

  // 重置表单
  const resetForm = () => {
    form.resetFields()
    resetValidation()
    setSelectedTags([])
    setSelectedStatus(DEFAULT_APIFOX_STATUS)
    setParsedApis([])
  }

  // 处理标签变化
  const handleTagsChange = (tags: string[]) => {
    setSelectedTags(tags)
    updateParsedApis(tags, selectedStatus)
  }

  // 处理状态变化
  const handleStatusChange = (status: ApifoxStatus) => {
    setSelectedStatus(status)
    updateParsedApis(selectedTags, status)
  }

  // 处理Apifox地址变化
  const handleApifoxUrlChange = async () => {
    const url = form.getFieldValue("apifoxUrl")
    if (url) {
      const result = await validateApifoxUrl(url, selectedTags, selectedStatus)
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

    if (urlConflicts.length > 0 || groupConflicts.length > 0) {
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
      saveTagHistory(selectedTags)
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

  // 处理快速选择标签历史
  const handleQuickSelectTags = (historyItem: { tags: string[] }) => {
    const tags = [...historyItem.tags]
    setSelectedTags(tags)
    updateParsedApis(tags, selectedStatus)
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
          const savedStatus =
            config.apifoxConfig?.selectedStatus || DEFAULT_APIFOX_STATUS

          form.setFieldsValue({
            apifoxUrl: urlToUse,
            mockPrefix: config.apifoxConfig?.mockPrefix || MOCK_PREFIX,
          })
          setSelectedTags(savedTags)
          setSelectedStatus(savedStatus)

          // 自动验证并加载数据
          validateApifoxUrl(urlToUse, savedTags, savedStatus)
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

        <UrlValidationStatus validating={validating} />

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
              urlConflicts={urlConflicts}
              groupConflicts={groupConflicts}
            />
          </>
        )}
      </Form>
    </Modal>
  )
}
