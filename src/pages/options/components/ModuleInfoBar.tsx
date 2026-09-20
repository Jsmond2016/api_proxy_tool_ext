import React, { useMemo } from "react"
import { Alert, Space, Tag } from "antd"
import { GlobalConfig, ModuleConfig } from "@src/types"

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
  const interfaceTags = useMemo(() => {
    if (!activeModule?.apiArr || activeModule.apiArr.length === 0) {
      return []
    }

    const allTags = new Set<string>()
    activeModule.apiArr.forEach((api) => {
      api.tags?.forEach((tag) => {
        const normalizedTag = tag.trim()
        if (normalizedTag) {
          allTags.add(normalizedTag)
        }
      })
    })

    const selectedTags = config?.apifoxConfig?.selectedTags
    if (selectedTags && selectedTags.length > 0) {
      return Array.from(allTags)
        .filter((tag) => selectedTags.includes(tag))
        .sort()
    }

    return Array.from(allTags).sort()
  }, [activeModule?.apiArr, config?.apifoxConfig?.selectedTags])

  if (interfaceTags.length === 0) {
    return null
  }

  return (
    <div className="my-[12px] mx-[4px]">
      <Alert
        title={
          <div className="text-gray-700 flex items-center gap-2 overflow-x-auto whitespace-nowrap">
            <span className="font-medium shrink-0">接口 tag：</span>
            <Space size="small">
              {interfaceTags.map((tag, index) => (
                <Tag key={tag} color={tagPresets[index % tagPresets.length]}>
                  {tag}
                </Tag>
              ))}
            </Space>
          </div>
        }
        type="info"
        showIcon
      />
    </div>
  )
}

export default ModuleInfoBar
