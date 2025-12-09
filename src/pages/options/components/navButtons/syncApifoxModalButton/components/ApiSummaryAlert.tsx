import React from "react"
import { Alert } from "antd"
import { ParsedApi } from "../apifoxUtils"

interface ApiSummaryAlertProps {
  parsedApis: ParsedApi[]
}

const ApiSummaryAlert: React.FC<ApiSummaryAlertProps> = ({ parsedApis }) => {
  if (parsedApis.length === 0) {
    return null
  }

  const groupCount = Object.keys(
    parsedApis.reduce((groups, api) => {
      groups[api.groupName] = true
      return groups
    }, {} as Record<string, boolean>)
  ).length

  return (
    <div className="mb-4">
      <Alert
        message={`找到 ${parsedApis.length} 个接口，将创建 ${groupCount} 个分组`}
        type="info"
        showIcon
      />
    </div>
  )
}

export default ApiSummaryAlert
