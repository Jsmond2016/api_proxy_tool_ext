import { ExportOutlined } from "@ant-design/icons"
import { useConfigStore } from "@src/store"
import { transformModuleConfigToExportData } from "@src/utils/dataProcessor"
import ColorButton from "@src/components/ColorButton"
import React from "react"

const ExportButton = () => {
  const config = useConfigStore((conf) => conf.config)

  // 导出配置
  const handleExport = () => {
    // 使用工具函数转换数据
    const exportData = transformModuleConfigToExportData(config.modules)

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `proxy-config-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }
  return (
    <ColorButton
      color="#ff8c00"
      icon={<ExportOutlined />}
      onClick={handleExport}
    >
      导出
    </ColorButton>
  )
}

export default ExportButton
