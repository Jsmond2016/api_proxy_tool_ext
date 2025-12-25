import React from "react"
import { message, Space, Switch, Tooltip } from "antd"

import { ChromeApiService } from "@src/utils/chromeApi"
import { useConfigStore } from "@src/store"
import { saveConfig } from "@src/utils/configUtil"
import SyncApifoxModalButton from "./syncApifoxModalButton/SyncApifoxModalButton"
import ResetButton from "./resetButton/ResetButton"
import CopyAllPermissionButton from "./copyAllPermissionButton/CopyAllPermissionButton"
import ArchiveButton from "./archiveButton/ArchiveButton"
import ImportExportDropdown from "./importExportButton/ImportExportDropdown"
import GlobalResponseButton from "./globalResponseButton/GlobalResponseButton"

const NavButtons: React.FC = () => {
  const { config, setConfig } = useConfigStore()

  // 切换全局开关
  const handleToggleGlobal = async (enabled: boolean) => {
    try {
      // 1. 获取最新配置，防止闭包陷阱
      const currentConfig = useConfigStore.getState().config
      const newConfig = { ...currentConfig, isGlobalEnabled: enabled }

      // 2. 更新本地状态
      setConfig(newConfig)

      // 3. 持久化配置到 background (这也会更新规则)
      await saveConfig(newConfig)

      // 4. 更新图标
      await ChromeApiService.updateIcon(enabled)

      message.success(enabled ? "已开启全局代理" : "已关闭全局代理")
    } catch (error) {
      message.error("操作失败")
      console.error("Toggle global error:", error)
    }
  }

  return (
    <Space orientation="horizontal">
      <Tooltip title="全局Mock开关, 开启后所有接口都会被代理">
        <Switch
          checked={config.isGlobalEnabled}
          onChange={handleToggleGlobal}
          size="default"
          checkedChildren="开启"
          unCheckedChildren="关闭"
        />
      </Tooltip>
      <SyncApifoxModalButton />
      <GlobalResponseButton />
      <ArchiveButton />
      <ImportExportDropdown />
      <CopyAllPermissionButton />
      <ResetButton />
    </Space>
  )
}

export default NavButtons
