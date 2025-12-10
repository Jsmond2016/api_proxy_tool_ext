import React, { useMemo } from "react"
import { Alert, Space, Tag } from "antd"
import { ModuleConfig, GlobalConfig } from "@src/types"

interface ModuleInfoBarProps {
  activeModule?: ModuleConfig
  config?: GlobalConfig
}

// /**
//  * 缩略链接显示
//  */
// const truncateUrl = (url: string, maxLength: number = 50): string => {
//   if (url.length <= maxLength) {
//     return url
//   }
//   return url.substring(0, maxLength) + "..."
// }

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
  // 解析需求文档链接
  const requirementDocs = useMemo(() => {
    if (!activeModule?.requirementDocs) {
      return []
    }
    // 支持的分隔符：换行、空格、逗号、分号
    return activeModule.requirementDocs
      .split(/[\n\r,;]+/)
      .map((doc) => doc.trim())
      .filter((doc) => doc.length > 0)
  }, [activeModule?.requirementDocs])

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

    // 接口 tags（仅展示此次配置有关的 tag）
    if (interfaceTags.length > 0) {
      parts.push(
        <span key="tags" className="mr-4">
          <span className="font-medium">接口 tag：</span>
          <Space size="small" wrap>
            {interfaceTags.map((text, index) => (
              <Tag key={text} color={tagPresets[index % tagPresets.length]}>
                {text}
              </Tag>
            ))}
          </Space>
        </span>
      )
    }

    // 关联需求
    if (requirementDocs.length > 0) {
      parts.push(
        <span key="requirements">
          <span className="font-medium">关联需求：</span>
          <Space split="|" size="small" wrap className="ml-1">
            {requirementDocs.map((doc, index) => (
              <a
                key={index}
                href={doc}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline"
                title={doc}
              >
                文档-{index + 1}
              </a>
            ))}
          </Space>
        </span>
      )
    }

    return parts
  }, [interfaceTags, requirementDocs])

  // 判断是否需要显示信息栏
  const hasInfo = interfaceTags.length > 0 || requirementDocs.length > 0

  if (!hasInfo || descriptionParts.length === 0) {
    return null
  }

  return (
    <div className="px-6 mb-3">
      <Alert
        title={
          <div className="text-gray-700 flex flex-wrap items-center gap-2">
            {descriptionParts}
          </div>
        }
        type="info"
        showIcon
      />
    </div>
  )
}

export default ModuleInfoBar
