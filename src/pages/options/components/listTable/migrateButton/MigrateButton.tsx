import { SwapOutlined } from "@ant-design/icons"
import { useActiveModuleIdStore, useConfigStore } from "@src/store"
import { Button, message } from "antd"
import React, { useState } from "react"
import MigrateApiModal from "./MigrateApiModal"
import { useBoolean } from "ahooks"
import { ApiConfig } from "@src/types"
import { saveConfig } from "@src/utils/configUtil"

const MigrateButton = ({ apiId }: { apiId: string }) => {
  const [migrateModalVisible, migrateVisibleOperate] = useBoolean(false)

  const [migratingApi, setMigratingApi] = useState<ApiConfig | null>(null)
  const { config, setConfig } = useConfigStore()
  const activeModuleId = useActiveModuleIdStore((conf) => conf.activeModuleId)

  const handleOpenMigrateModal = () => {
    const api = config.modules
      .flatMap((module) => module.apiArr)
      .find((api) => api.id === apiId)

    if (api) {
      setMigratingApi(api)
      migrateVisibleOperate.setTrue()
    }
  }

  // 确认迁移API
  const handleConfirmMigrateApi = (targetModuleId: string) => {
    if (!migratingApi) return

    const newConfig = {
      ...config,
      modules: config.modules.map((module) => {
        if (module.id === activeModuleId) {
          // 从当前模块移除API
          return {
            ...module,
            apiArr: module.apiArr.filter((api) => api.id !== migratingApi.id),
          }
        } else if (module.id === targetModuleId) {
          // 添加到目标模块
          return {
            ...module,
            apiArr: [...module.apiArr, migratingApi],
          }
        }
        return module
      }),
    }

    setConfig(newConfig)
    saveConfig(newConfig)
    migrateVisibleOperate.setFalse()
    setMigratingApi(null)
    message.success("接口迁移成功")
  }

  return (
    <>
      <Button
        type="link"
        className="p-0"
        icon={<SwapOutlined />}
        onClick={handleOpenMigrateModal}
      >
        迁移
      </Button>
      <MigrateApiModal
        visible={migrateModalVisible}
        onCancel={() => {
          migrateVisibleOperate.setFalse()
          setMigratingApi(null)
        }}
        onOk={handleConfirmMigrateApi}
        api={migratingApi}
        modules={config.modules}
        currentModuleId={activeModuleId}
      />
    </>
  )
}

export default MigrateButton
