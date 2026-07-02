import React, { useState } from "react"
import { message, Space, Switch, Tooltip, Button } from "antd"
import { FileTextOutlined } from "@ant-design/icons"

import { ChromeApiService } from "@src/utils/chromeApi"
import { useConfigStore } from "@src/store"
import { saveConfig } from "@src/utils/configUtil"
import SyncApifoxModalButton from "./syncApifoxModalButton/SyncApifoxModalButton"
import SetIterationInfoModal from "./syncApifoxModalButton/SetIterationInfoModal"
import ResetButton from "./resetButton/ResetButton"
import CopyAllPermissionButton from "./copyAllPermissionButton/CopyAllPermissionButton"
import ArchiveButton from "./archiveButton/ArchiveButton"

const NavButtons: React.FC = () => {
  const { config, setConfig } = useConfigStore()
  const [setIterationInfoModalVisible, setSetIterationInfoModalVisible] =
    useState(false)

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

  // 处理打开设置迭代信息弹窗
  const handleOpenSetIterationInfo = () => {
    const selectedTags = config.apifoxConfig?.selectedTags || []
    if (selectedTags.length === 0) {
      message.warning("请先配置接口 tag")
      return
    }
    setSetIterationInfoModalVisible(true)
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
      <ArchiveButton />
      <Tooltip title="设置迭代信息">
        <Button
          icon={<FileTextOutlined />}
          disabled={
            !config.apifoxConfig?.selectedTags ||
            config.apifoxConfig.selectedTags.length === 0
          }
          onClick={handleOpenSetIterationInfo}
        >
          设置迭代信息
        </Button>
      </Tooltip>
      <CopyAllPermissionButton />
      <ResetButton />
      <SetIterationInfoModal
        visible={setIterationInfoModalVisible}
        onCancel={() => setSetIterationInfoModalVisible(false)}
        config={config}
      />
    </Space>
  )
}

export default NavButtons
