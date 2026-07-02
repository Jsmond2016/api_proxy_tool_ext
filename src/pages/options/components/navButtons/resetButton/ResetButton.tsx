import React from "react"
import { Button, Modal } from "antd"

import { useActiveModuleIdStore, useConfigStore } from "@src/store"
import { GlobalConfig } from "@src/types"
import { saveConfig } from "@src/utils/configUtil"
import { DefaultMockApiModule } from "@src/constant/constant"

type ResetButtonProps = Record<string, never>

const ResetButton: React.FC<ResetButtonProps> = () => {
  const { setActiveModuleId } = useActiveModuleIdStore()

  const { config, setConfig } = useConfigStore()

  // 全局重置 - 只重置 mock 接口数据，保留 Apifox 配置等非接口配置
  const handleResetAll = () => {
    Modal.confirm({
      title: "确认重置所有",
      content: "重置所有将清空所有 mock 接口配置，还原为默认值（Apifox 配置等不会被重置）",
      onCancel: () => {
        return
      },
      onOk: () => {
        const newConfig = {
          ...config,
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
