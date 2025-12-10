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
  // 如果模块是通过 Apifox 同步创建的，从 ApifoxConfig 中获取
  const interfaceTags = useMemo(() => {
    if (!activeModule?.apiDocUrl || !config?.apifoxConfig?.apifoxUrl) {
      return []
    }
    // 如果模块的 apiDocUrl 与 ApifoxConfig 的 apifoxUrl 匹配，说明是通过 Apifox 同步的
    if (activeModule.apiDocUrl === config.apifoxConfig.apifoxUrl) {
      return config.apifoxConfig.selectedTags || []
    }
    return []
  }, [activeModule?.apiDocUrl, config?.apifoxConfig])

  // 迭代 tag（从 ApifoxConfig 中获取）
  const iterationTag = useMemo(() => {
    if (!activeModule?.apiDocUrl || !config?.apifoxConfig?.apifoxUrl) {
      return undefined
    }
    // 如果模块的 apiDocUrl 与 ApifoxConfig 的 apifoxUrl 匹配，说明是通过 Apifox 同步的
    if (activeModule.apiDocUrl === config.apifoxConfig.apifoxUrl) {
      return config.apifoxConfig.iterationTag
    }
    return undefined
  }, [activeModule?.apiDocUrl, config?.apifoxConfig])

  // 构建描述内容
  const descriptionParts = useMemo(() => {
    const parts: React.ReactNode[] = []

    // 接口 tags
    if (interfaceTags.length > 0) {
      parts.push(
        <span key="tags" className="mr-4">
          <span className="font-medium">接口 tag：</span>
          {interfaceTags.map((text, index) => (
            <Tag key={text} color={tagPresets[index % tagPresets.length]}>
              {text}
            </Tag>
          ))}
        </span>
      )
    }

    // 迭代 tag
    if (iterationTag) {
      parts.push(
        <span key="iteration" className="mr-4">
          <span className="font-medium">迭代 tag：</span>
          {iterationTag}；
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
  }, [interfaceTags, iterationTag, requirementDocs])

  // 判断是否需要显示信息栏
  const hasInfo =
    interfaceTags.length > 0 || iterationTag || requirementDocs.length > 0

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
