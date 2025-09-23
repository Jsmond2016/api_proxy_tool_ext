import { GlobalConfig } from "@src/types"
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
