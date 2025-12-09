import React from "react"
import { Tag, Space } from "antd"
import { TagHistoryItem } from "../apifoxCache"

interface TagHistorySelectorProps {
  tagHistory: TagHistoryItem[]
  onQuickSelect: (historyItem: TagHistoryItem) => void
  onRemove: (timestamp: number) => void
}

const TagHistorySelector: React.FC<TagHistorySelectorProps> = ({
  tagHistory,
  onQuickSelect,
  onRemove,
}) => {
  if (tagHistory.length === 0) {
    return null
  }

  return (
    <div className="mt-2">
      <div className="text-xs text-gray-500 mb-1">
        最近选择的标签（点击快速应用）：
      </div>
      <Space wrap size={[8, 8]}>
        {tagHistory
          .filter((item) => item && item.tags && Array.isArray(item.tags))
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
                  e.stopPropagation()
                  onRemove(item.timestamp)
                }}
                className="cursor-pointer"
                onClick={() => onQuickSelect(item)}
                color="blue"
                title={item.tags.join(", ")}
              >
                {tagsText}
              </Tag>
            )
          })}
      </Space>
    </div>
  )
}

export default TagHistorySelector
