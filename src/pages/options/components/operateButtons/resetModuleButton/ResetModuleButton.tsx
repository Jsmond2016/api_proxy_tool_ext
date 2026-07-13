import { ReloadOutlined } from "@ant-design/icons"
import { Button, Modal, message } from "antd"
import React from "react"
import {
  useActiveModuleIdStore,
  useConfigStore,
  useSelectedApiStore,
} from "@src/store"
import { saveConfig } from "@src/utils/configUtil"
import { resetModuleApis } from "./resetModuleUtils"

const ResetModuleButton = () => {
  const setConfig = useConfigStore((state) => state.setConfig)
  const setSelectedApiIds = useSelectedApiStore(
    (state) => state.setSelectedApiIds
  )

  // 重置当前模块 - 清空所有 mock api
  const handleResetModule = () => {
    Modal.confirm({
      title: "确认重置模块",
      content: "此操作将清空当前模块的所有 mock api，是否继续？",
      okText: "确认",
      cancelText: "取消",
      okType: "danger",
      onOk: async () => {
        const config = useConfigStore.getState().config
        const activeModuleId = useActiveModuleIdStore.getState().activeModuleId
        const removedApiIds = new Set(
          config.modules
            .find((module) => module.id === activeModuleId)
            ?.apiArr.map((api) => api.id) || []
        )
        const newConfig = resetModuleApis(config, activeModuleId)
        setConfig(newConfig)
        setSelectedApiIds(
          useSelectedApiStore
            .getState()
            .selectedApiIds.filter((id) => !removedApiIds.has(id))
        )
        await saveConfig(newConfig)
        message.success("模块重置成功")
      },
    })
  }

  return (
    <Button
      danger
      icon={<ReloadOutlined />}
      onClick={handleResetModule}
    >
      重置模块
    </Button>
  )
}

export default ResetModuleButton
