import React from "react"
import { Alert, Radio, Space } from "antd"

export type MergeStrategy = "replace" | "merge"

interface ConflictAlertsProps {
  duplicateTags: string[]
  mergeStrategy: MergeStrategy
  onMergeStrategyChange: (strategy: MergeStrategy) => void
}

const ConflictAlerts: React.FC<ConflictAlertsProps> = ({
  duplicateTags,
  mergeStrategy,
  onMergeStrategyChange,
}) => {
  if (duplicateTags.length === 0) {
    return null
  }

  return (
    <Alert
      message="发现已有 tag 相关接口"
      description={
        <div>
          <p className="mb-2">
            已存在以下 tag 相关接口：<strong>{duplicateTags.join(", ")}</strong>
          </p>
          <p className="mb-2">请选择合并策略：</p>
          <Radio.Group
            value={mergeStrategy}
            onChange={(e) => onMergeStrategyChange(e.target.value)}
          >
            <Space direction="vertical">
              <Radio value="replace">
                <Space size={2}>
                  <strong className="text-sm">全量替换</strong>
                  <div className="text-gray-500 text-sm ml-6">
                    删除已存在的 tag 相关接口，用新接口完全替换
                  </div>
                </Space>
              </Radio>
              <Radio value="merge">
                <Space size={2}>
                  <strong className="text-sm">差异合并</strong>
                  <div className="text-gray-500 text-sm ml-6">
                    保留已存在的接口，只添加新接口（不重复添加）
                  </div>
                </Space>
              </Radio>
            </Space>
          </Radio.Group>
        </div>
      }
      type="warning"
      showIcon
      className="mb-4"
    />
  )
}

export default ConflictAlerts
