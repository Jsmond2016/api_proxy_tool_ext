import { EditOutlined, PlusOutlined } from "@ant-design/icons"
import { useActiveModuleIdStore, useConfigStore } from "@src/store"
import { ApiConfig } from "@src/types"
import { saveConfig } from "@src/utils/configUtil"
import { useBoolean } from "ahooks"
import { Button } from "antd"
import React, { useState } from "react"
import ApiFormDrawer from "./ApiFormDrawer"

const EditFormButton = ({ apiId }: { apiId: string }) => {
  const [apiFormVisible, apiFormVisibleOperate] = useBoolean(false)
  const { config, setConfig } = useConfigStore()
  // const activeModuleId = useActiveModuleIdStore((conf) => conf.activeModuleId)
  const [editingApi, setEditingApi] = useState<ApiConfig | null>(null)

  // 编辑API
  const handleEditApi = (apiId: string) => {
    const api = config.modules
      .flatMap((module) => module.apiArr)
      .find((api) => api.id === apiId)

    if (api) {
      setEditingApi(api)
      apiFormVisibleOperate.setTrue()
    }
  }

  // 更新API
  const handleUpdateApi = (apiData: Omit<ApiConfig, "id">) => {
    if (!editingApi) return

    const newConfig = {
      ...config,
      modules: config.modules.map((module) => ({
        ...module,
        apiArr: module.apiArr.map((api) =>
          api.id === editingApi.id ? { ...api, ...apiData } : api
        ),
      })),
    }

    setConfig(newConfig)
    saveConfig(newConfig)
    apiFormVisibleOperate.setFalse()
    setEditingApi(null)
  }

  return (
    <>
      <Button
        type="link"
        icon={<EditOutlined />}
        onClick={() => {
          handleEditApi(apiId)
        }}
      >
        编辑
      </Button>
      <ApiFormDrawer
        visible={apiFormVisible}
        onClose={() => {
          apiFormVisibleOperate.setFalse()
          setEditingApi(null)
        }}
        onOk={handleUpdateApi}
        config={config}
        data={editingApi}
        title="编辑接口"
      />
    </>
  )
}

export default EditFormButton
