import React from "react"
import { Spin } from "antd"

interface UrlValidationStatusProps {
  validating: boolean
}

const UrlValidationStatus: React.FC<UrlValidationStatusProps> = ({
  validating,
}) => {
  if (!validating) {
    return null
  }

  return (
    <div className="text-center py-4">
      <Spin size="small" />
      <span className="ml-2">正在验证地址...</span>
    </div>
  )
}

export default UrlValidationStatus
