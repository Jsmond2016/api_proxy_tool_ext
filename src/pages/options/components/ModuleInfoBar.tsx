import React, { useMemo, useEffect, useState, useCallback } from "react"
import {
  Alert,
  Button,
  Space,
  Tag,
  message,
  Dropdown,
  Modal,
  Form,
  DatePicker,
} from "antd"
import { CopyOutlined, DownOutlined } from "@ant-design/icons"
import { ModuleConfig, GlobalConfig } from "@src/types"
import {
  getIterationInfo,
  type IterationInfo,
  type IterationInfoMap,
} from "./navButtons/syncApifoxModalButton/apifoxCache"
import { copyToClipboard } from "@src/utils/permissionUtils"
import {
  buildIterationCopyText,
  getIterationFieldLinks,
  hasIterationFieldValue,
  iterationInfoFieldConfigs,
} from "./navButtons/syncApifoxModalButton/iterationInfoConfig"

interface ModuleInfoBarProps {
  activeModule?: ModuleConfig
  config?: GlobalConfig
}

const tagPresets = [
  "magenta",
  "red",
  "volcano",
  "orange",
  "gold",
  "lime",
  "green",
  "cyan",
  "blue",
  "geekblue",
  "purple",
]

const ModuleInfoBar: React.FC<ModuleInfoBarProps> = ({
  activeModule,
  config,
}) => {
  const [iterationInfoMap, setIterationInfoMap] = useState<
    Record<string, IterationInfo>
  >({})
  const [isCRModalOpen, setIsCRModalOpen] = useState(false)
  const [crForm] = Form.useForm()

  // 加载迭代信息
  const loadIterationInfo = useCallback(() => {
    getIterationInfo()
      .then((info: IterationInfoMap) => {
        setIterationInfoMap(info)
      })
      .catch((error: unknown) => {
        console.error("Failed to load iteration info:", error)
      })
  }, [])

  // 初始加载和监听 Chrome storage 变化
  useEffect(() => {
    // 初始加载
    loadIterationInfo()

    // 监听 Chrome storage 变化
    const handleStorageChange = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string,
    ) => {
      // 监听迭代信息的变化
      if (
        areaName === "local" &&
        changes["apifox-iteration-info"] !== undefined
      ) {
        // 迭代信息发生变化，重新加载
        loadIterationInfo()
      }
    }

    chrome.storage.onChanged.addListener(handleStorageChange)

    // 清理监听器
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange)
    }
  }, [loadIterationInfo])

  // 当 activeModule 或 config 变化时，也重新加载迭代信息（确保数据同步）
  useEffect(() => {
    loadIterationInfo()
  }, [activeModule?.id, config?.apifoxConfig?.selectedTags, loadIterationInfo])

  // 获取当前模块的接口 tags
  // 从当前模块（tab）内所有接口的 tags 字段中汇总去重
  // 仅展示此次配置有关的 tag（从 config.apifoxConfig?.selectedTags 中过滤）
  const interfaceTags = useMemo(() => {
    if (!activeModule?.apiArr || activeModule.apiArr.length === 0) {
      return []
    }

    // 收集所有接口的 tags，去重
    const allTags = new Set<string>()
    activeModule.apiArr.forEach((api) => {
      if (api.tags && Array.isArray(api.tags)) {
        api.tags.forEach((tag) => {
          if (tag && tag.trim()) {
            allTags.add(tag.trim())
          }
        })
      }
    })

    // 如果配置中有 selectedTags，则只显示配置相关的 tags
    const selectedTags = config?.apifoxConfig?.selectedTags
    if (selectedTags && selectedTags.length > 0) {
      return Array.from(allTags)
        .filter((tag) => selectedTags.includes(tag))
        .sort()
    }

    // 如果没有 selectedTags 配置，显示所有 tags
    return Array.from(allTags).sort()
  }, [activeModule?.apiArr, config?.apifoxConfig?.selectedTags])

  // 构建描述内容
  const descriptionParts = useMemo(() => {
    const parts: React.ReactNode[] = []

    if (interfaceTags.length > 0) {
      parts.push(
        <span
          key="tags"
          className="inline-flex items-center gap-2 whitespace-nowrap"
        >
          <span className="font-medium shrink-0">接口 tag：</span>
          <Space size="small">
            {interfaceTags.map((text, index) => (
              <Tag key={text} color={tagPresets[index % tagPresets.length]}>
                {text}
              </Tag>
            ))}
          </Space>
        </span>,
      )
    }

    // 迭代信息（从缓存中获取，按 tag 分组展示）
    interfaceTags.forEach((tag) => {
      const iterationInfo = iterationInfoMap[tag]
      if (!iterationInfo) {
        return
      }

      if (!hasIterationFieldValue(iterationInfo)) {
        return
      }

      const tagParts: React.ReactNode[] = []

      iterationInfoFieldConfigs.forEach(
        ({ key, label, shortLabel, linkColorClassName }) => {
          const links = getIterationFieldLinks(iterationInfo, key)
          if (links.length === 0) {
            return
          }

          tagParts.push(
            <span key={`${key}-${tag}`} className="mr-3">
              <span className="font-medium">{label}：</span>
              <Space split="|" size="small" wrap className="ml-1">
                {links.map((doc, index) => (
                  <a
                    key={index}
                    href={doc}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkColorClassName}
                    title={doc}
                  >
                    {shortLabel}-{index + 1}
                  </a>
                ))}
              </Space>
            </span>,
          )
        },
      )

      if (tagParts.length > 0) {
        parts.push(
          <span
            key={`iteration-${tag}`}
            className="inline-flex items-center whitespace-nowrap"
          >
            <span className="font-medium text-gray-600">[{tag}]</span>
            <Space size="small" className="ml-1">
              {tagParts}
            </Space>
          </span>,
        )
      }
    })

    return parts
  }, [interfaceTags, iterationInfoMap])

  // 判断是否有迭代信息
  const hasIterationInfo = useMemo(() => {
    return interfaceTags.some((tag) =>
      hasIterationFieldValue(iterationInfoMap[tag]),
    )
  }, [interfaceTags, iterationInfoMap])

  // 判断是否需要显示信息栏
  const hasInfo = interfaceTags.length > 0 || hasIterationInfo

  if (!hasInfo || descriptionParts.length === 0) {
    return null
  }

  const copyText = interfaceTags
    .map((tag) => buildIterationCopyText(tag, iterationInfoMap[tag]))
    .join("\n\n")

  const handleCopyIteration = async () => {
    const success = await copyToClipboard(copyText)
    if (success) {
      message.success("迭代信息已复制")
    } else {
      message.error("复制失败，请重试")
    }
  }

  const handleCopyMenuClick = ({ key }: { key: string }) => {
    if (key === "iteration") {
      handleCopyIteration()
    } else if (key === "cr") {
      setIsCRModalOpen(true)
    }
  }

  const handleCRCopy = async () => {
    try {
      const values = await crForm.validateFields()
      const releaseDate = values.releaseDate.format("YYYY-MM-DD")
      const text = `上线日期：${releaseDate}\n\n${copyText}`
      const success = await copyToClipboard(text)
      if (success) {
        message.success("CR信息已复制")
        setIsCRModalOpen(false)
        crForm.resetFields()
      } else {
        message.error("复制失败，请重试")
      }
    } catch {
      // 表单校验失败，无需处理
    }
  }

  const copyMenuItems = [
    { key: "iteration", label: "复制迭代信息" },
    { key: "cr", label: "复制CR信息" },
  ]

  return (
    <div className="my-[12px] mx-[4px]">
      <Alert
        title={
          <div className="text-gray-700 flex items-center justify-between gap-3 overflow-x-auto">
            <div className="flex items-center gap-4 whitespace-nowrap">
              {descriptionParts}
            </div>
            <Dropdown
              menu={{ items: copyMenuItems, onClick: handleCopyMenuClick }}
              placement="bottomRight"
              trigger={["click"]}
            >
              <Button
                type="link"
                size="small"
                icon={<CopyOutlined />}
                className="px-0 shrink-0"
              >
                复制 <DownOutlined />
              </Button>
            </Dropdown>
          </div>
        }
        type="info"
        showIcon
      />
      <Modal
        title="复制CR信息"
        open={isCRModalOpen}
        onOk={handleCRCopy}
        onCancel={() => {
          setIsCRModalOpen(false)
          crForm.resetFields()
        }}
        okText="确认"
        cancelText="取消"
      >
        <Form form={crForm} layout="vertical">
          <Form.Item
            label="上线时间"
            name="releaseDate"
            rules={[{ required: true, message: "请选择上线时间" }]}
          >
            <DatePicker
              format="YYYY-MM-DD"
              placeholder="请选择上线时间"
              style={{ width: "100%" }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ModuleInfoBar
