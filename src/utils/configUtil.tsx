import { GlobalConfig, ModuleConfig } from "@src/types"
import { ChromeApiService } from "./chromeApi"
import { message } from "antd"

// 保存配置到background script
export const saveConfig = async (newConfig: GlobalConfig) => {
  try {
    await ChromeApiService.updateConfig(newConfig)
  } catch (error) {
    message.error("保存配置失败")
    console.error("Save config error:", error)
  }
}

/**
 * 判断是否为默认模块
 */
export const isDefaultModule = (module: ModuleConfig): boolean => {
  return module.id === "default-module"
}

/**
 * 判断是否只有默认模块
 */
export const hasOnlyDefaultModule = (modules: ModuleConfig[]): boolean => {
  return modules.length === 1 && isDefaultModule(modules[0])
}

/**
 * 移除默认模块
 */
export const removeDefaultModule = (
  modules: ModuleConfig[]
): ModuleConfig[] => {
  return modules.filter((m) => !isDefaultModule(m))
}
