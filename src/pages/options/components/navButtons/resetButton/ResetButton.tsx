import { Button, Modal } from "antd"

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
    Modal.confirm({
      title: "确认重置所有",
      content: "重置所有将还原所有配置为默认值",
      onCancel: () => {
        return
      },
      onOk: () => {
        const newConfig = {
          isGlobalEnabled: false,
          modules: DefaultMockApiModule,
        }
        setConfig(newConfig as GlobalConfig)
        saveConfig(newConfig as GlobalConfig)
        setActiveModuleId("default-module")
      },
    })
  }

  return (
    <Button danger onClick={handleResetAll}>
      重置所有
    </Button>
  )
}

export default ResetButton
