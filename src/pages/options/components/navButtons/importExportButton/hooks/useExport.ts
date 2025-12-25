import { useMemoizedFn } from "ahooks"
import { useConfigStore } from "@src/store"
import { transformModuleConfigToExportData } from "@src/utils/dataProcessor"

export const useExport = () => {
  // 导出配置
  const handleExport = useMemoizedFn(() => {
    // 获取最新配置，避免闭包问题
    const currentConfig = useConfigStore.getState().config

    // 使用工具函数转换数据
    const exportData = transformModuleConfigToExportData(currentConfig.modules)

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `proxy-config-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  })

  return {
    handleExport,
  }
}
