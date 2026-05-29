import React from "react"
import { Alert, Space, Tag, Typography } from "antd"
import { BatchQuickMockJob } from "@src/types"

const { Text } = Typography

interface BatchQuickMockBannerProps {
  job: BatchQuickMockJob
  onClose: () => void
}

export default function BatchQuickMockBanner({
  job,
  onClose,
}: BatchQuickMockBannerProps) {
  const missingApifoxCount = job.items.filter(
    (item) => !item.foundInApifox && !item.error
  ).length

  return (
    <Alert
      className="mx-6 mt-4"
      type={job.status === "failed" ? "error" : "success"}
      showIcon
      closable
      onClose={onClose}
      message={job.message}
      description={
        <Space size={[8, 8]} wrap>
          <Text>总数：{job.total}</Text>
          <Text>成功：{job.successCount}</Text>
          <Text>失败：{job.failCount}</Text>
          {missingApifoxCount > 0 ? (
            <Tag color="gold">
              {missingApifoxCount} 个接口未匹配到 Apifox，已按基础信息创建
            </Tag>
          ) : null}
          <Tag color="blue">请求ID：{job.requestId}</Tag>
        </Space>
      }
    />
  )
}
