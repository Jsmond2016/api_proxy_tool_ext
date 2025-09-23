import { Button, message, Space, Switch } from "antd"

import { ChromeApiService } from "@src/utils/chromeApi"
import { useConfigStore } from "@src/store"
import { saveConfig } from "@src/utils/configUtil"
import SyncApifoxModalButton from "./syncApifoxModalButton/SyncApifoxModalButton"
import ImportButton from "./importButton/ImportButton"
import ResetButton from "./resetButton/ResetButton"
import ExportButton from "./exportButton/ExportButton"

type OperateButtonsProps = {}

const NavButtons: React.FC<OperateButtonsProps> = () => {
  const { config, setConfig } = useConfigStore()

  // 切换全局开关
  const handleToggleGlobal = async (enabled: boolean) => {
    try {
      await ChromeApiService.toggleGlobal(enabled)
      setConfig({ ...config, isGlobalEnabled: enabled })
      message.success(enabled ? "已开启全局代理" : "已关闭全局代理")
    } catch (error) {
      message.error("操作失败")
      console.error("Toggle global error:", error)
    }
  }

  // 重置模块
  const handleResetModule = (moduleId: string) => {
    const newConfig = {
      ...config,
      modules: config.modules.map((module) =>
        module.id === moduleId ? { ...module, apiArr: [] } : module
      ),
    }
    setConfig(newConfig)
    saveConfig(newConfig)
  }

  return (
    <Space direction="horizontal">
      <span className="text-white text-sm">全局Mock开关</span>
      <Switch
        checked={config.isGlobalEnabled}
        onChange={handleToggleGlobal}
        size="default"
        checkedChildren="开启"
        unCheckedChildren="关闭"
      />
      <SyncApifoxModalButton />
      <ImportButton />
      <ExportButton />
      <ResetButton />
    </Space>
  )
}

export default NavButtons
