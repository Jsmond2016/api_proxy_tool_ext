import { PlusOutlined } from "@ant-design/icons"
import { Button } from "antd"
import React from "react"
import ApiFormDrawer from "./ApiFormDrawer"
import { useBoolean } from "ahooks"
import { ApiConfig } from "@src/types"
import { generateId } from "@src/utils/chromeApi"
import { useActiveModuleIdStore, useConfigStore } from "@src/store"
import { saveConfig } from "@src/utils/configUtil"

const AddFormButton = () => {
  const [apiFormVisible, apiFormVisibleOperate] = useBoolean(false)
  const { config, setConfig } = useConfigStore()
  const activeModuleId = useActiveModuleIdStore((conf) => conf.activeModuleId)

  // 添加API
  const handleAddApi = (apiData: Omit<ApiConfig, "id">) => {
    const newApi: ApiConfig = {
      ...apiData,
      id: generateId(),
    }

    const newConfig = {
      ...config,
      modules: config.modules.map((module) =>
        module.id === activeModuleId
          ? { ...module, apiArr: [...module.apiArr, newApi] }
          : module
      ),
    }

    setConfig(newConfig)
    saveConfig(newConfig)
    apiFormVisibleOperate.setFalse()
  }

  return (
    <>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={apiFormVisibleOperate.setTrue}
      >
        添加
      </Button>
      <ApiFormDrawer
        visible={apiFormVisible}
        onClose={() => {
          apiFormVisibleOperate.setFalse()
        }}
        onOk={handleAddApi}
        config={config}
        data={null}
        title="添加接口"
      />
    </>
  )
}

export default AddFormButton
