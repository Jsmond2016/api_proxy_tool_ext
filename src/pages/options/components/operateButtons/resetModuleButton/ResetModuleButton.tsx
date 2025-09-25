import { ReloadOutlined } from "@ant-design/icons"
import { Button, Modal, message } from "antd"
import React from "react"
import { useActiveModuleIdStore, useConfigStore } from "@src/store"
import { saveConfig } from "@src/utils/configUtil"

const ResetModuleButton = () => {
  const { config, setConfig } = useConfigStore()
  const { activeModuleId } = useActiveModuleIdStore()

  // 重置当前模块 - 清空所有 mock api
  const handleResetModule = () => {
    Modal.confirm({
      title: "确认重置模块",
      content: "此操作将清空当前模块的所有 mock api，是否继续？",
      okText: "确认",
      cancelText: "取消",
      okType: "danger",
      onOk: () => {
        const newConfig = {
          ...config,
          modules: config.modules.map((module) =>
            module.id === activeModuleId
              ? { ...module, apiArr: [] }
              : module
          ),
        }
        setConfig(newConfig)
        saveConfig(newConfig)
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
