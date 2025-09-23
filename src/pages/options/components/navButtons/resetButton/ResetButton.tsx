import { Button } from "antd"

import { useActiveModuleIdStore, useConfigStore } from "@src/store"
import { GlobalConfig } from "@src/types"
import { saveConfig } from "@src/utils/configUtil"
import { DefaultMockApiModule } from "@src/constant/constant"

type ResetButtonProps = {}

const ResetButton: React.FC<ResetButtonProps> = () => {
  const { setActiveModuleId } = useActiveModuleIdStore()

  const { config, setConfig } = useConfigStore()

  // 全局重置 - 还原示例数据
  const handleResetAll = () => {
    const newConfig = {
      isGlobalEnabled: false,
      modules: DefaultMockApiModule,
    }
    setConfig(newConfig as GlobalConfig)
    saveConfig(newConfig as GlobalConfig)
    setActiveModuleId("default-module")
  }

  return (
    <Button danger onClick={handleResetAll}>
      重置所有
    </Button>
  )
}

export default ResetButton
