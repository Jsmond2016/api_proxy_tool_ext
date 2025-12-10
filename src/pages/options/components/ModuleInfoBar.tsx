import React, { useMemo, useEffect, useState, useCallback } from "react"
import { Alert, Space, Tag } from "antd"
import { ModuleConfig, GlobalConfig } from "@src/types"
import {
  getIterationInfo,
  type IterationInfo,
  type IterationInfoMap,
} from "./navButtons/syncApifoxModalButton/apifoxCache"

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
  const [iterationInfoMap, setIterationInfoMap] = useState<
    Record<string, IterationInfo>
  >({})

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
      areaName: string
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

  // 解析文档链接的辅助函数
  const parseDocLinks = (docs: string): string[] => {
    if (!docs || !docs.trim()) {
      return []
    }
    return docs
      .split(/[\n\r,;]+/)
      .map((doc) => doc.trim())
      .filter((doc) => doc.length > 0)
  }

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

    // 关联需求（从模块配置中获取）
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

    // 迭代信息（从缓存中获取，按 tag 分组展示）
    interfaceTags.forEach((tag) => {
      const iterationInfo = iterationInfoMap[tag]
      if (!iterationInfo) {
        return
      }

      const requirementLinks = parseDocLinks(iterationInfo.requirementDocs)
      const technicalLinks = parseDocLinks(iterationInfo.technicalDocs)
      const prototypeLinks = parseDocLinks(iterationInfo.prototypeDocs)

      if (
        requirementLinks.length === 0 &&
        technicalLinks.length === 0 &&
        prototypeLinks.length === 0
      ) {
        return
      }

      const tagParts: React.ReactNode[] = []

      // 需求文档
      if (requirementLinks.length > 0) {
        tagParts.push(
          <span key={`req-${tag}`} className="mr-3">
            <span className="font-medium">需求文档：</span>
            <Space split="|" size="small" wrap className="ml-1">
              {requirementLinks.map((doc, index) => (
                <a
                  key={index}
                  href={doc}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                  title={doc}
                >
                  需求-{index + 1}
                </a>
              ))}
            </Space>
          </span>
        )
      }

      // 技术文档
      if (technicalLinks.length > 0) {
        tagParts.push(
          <span key={`tech-${tag}`} className="mr-3">
            <span className="font-medium">技术文档：</span>
            <Space split="|" size="small" wrap className="ml-1">
              {technicalLinks.map((doc, index) => (
                <a
                  key={index}
                  href={doc}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-800 hover:underline"
                  title={doc}
                >
                  技术-{index + 1}
                </a>
              ))}
            </Space>
          </span>
        )
      }

      // 原型文档
      if (prototypeLinks.length > 0) {
        tagParts.push(
          <span key={`proto-${tag}`} className="mr-3">
            <span className="font-medium">原型文档：</span>
            <Space split="|" size="small" wrap className="ml-1">
              {prototypeLinks.map((doc, index) => (
                <a
                  key={index}
                  href={doc}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:text-purple-800 hover:underline"
                  title={doc}
                >
                  原型-{index + 1}
                </a>
              ))}
            </Space>
          </span>
        )
      }

      if (tagParts.length > 0) {
        parts.push(
          <span key={`iteration-${tag}`} className="mr-4">
            <span className="font-medium text-gray-600">[{tag}]</span>
            <Space size="small" wrap className="ml-1">
              {tagParts}
            </Space>
          </span>
        )
      }
    })

    return parts
  }, [interfaceTags, requirementDocs, iterationInfoMap])

  // 判断是否有迭代信息
  const hasIterationInfo = useMemo(() => {
    return interfaceTags.some((tag) => {
      const iterationInfo = iterationInfoMap[tag]
      if (!iterationInfo) {
        return false
      }
      const requirementLinks = parseDocLinks(iterationInfo.requirementDocs)
      const technicalLinks = parseDocLinks(iterationInfo.technicalDocs)
      const prototypeLinks = parseDocLinks(iterationInfo.prototypeDocs)
      return (
        requirementLinks.length > 0 ||
        technicalLinks.length > 0 ||
        prototypeLinks.length > 0
      )
    })
  }, [interfaceTags, iterationInfoMap])

  // 判断是否需要显示信息栏
  const hasInfo =
    interfaceTags.length > 0 || requirementDocs.length > 0 || hasIterationInfo

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
