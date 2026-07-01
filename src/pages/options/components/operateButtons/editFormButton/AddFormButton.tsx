import { PlusOutlined } from "@ant-design/icons"
import { Button, Modal, Select } from "antd"
import React, { useState } from "react"
import ApiFormDrawer from "./ApiFormDrawer"
import { useBoolean } from "ahooks"
import { ApiConfig } from "@src/types"
import { generateId } from "@src/utils/chromeApi"
import { useActiveModuleIdStore, useConfigStore } from "@src/store"
import { saveConfig } from "@src/utils/configUtil"
import { ALL_APIS_TAB_ID } from "@src/constant/constant"

const AddFormButton = () => {
  const [apiFormVisible, apiFormVisibleOperate] = useBoolean(false)
  const [moduleSelectOpen, setModuleSelectOpen] = useState(false)
  const [targetModuleId, setTargetModuleId] = useState<string>("")
  const { config, setConfig } = useConfigStore()
  const activeModuleId = useActiveModuleIdStore((conf) => conf.activeModuleId)

  const isAllApisTab = activeModuleId === ALL_APIS_TAB_ID

  const handleClickAdd = () => {
    if (isAllApisTab) {
      setTargetModuleId(config.modules[0]?.id || "")
      setModuleSelectOpen(true)
    } else {
      apiFormVisibleOperate.setTrue()
    }
  }

  const handleModuleConfirm = () => {
    if (!targetModuleId) return
    setModuleSelectOpen(false)
    apiFormVisibleOperate.setTrue()
  }

  // 添加API
  const handleAddApi = (apiData: Omit<ApiConfig, "id">) => {
    const newApi: ApiConfig = {
      ...apiData,
      id: generateId(),
    }

    const moduleIdToUse = isAllApisTab ? targetModuleId : activeModuleId
    const newConfig = {
      ...config,
      modules: config.modules.map((module) =>
        module.id === moduleIdToUse
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
        onClick={handleClickAdd}
      >
        添加
      </Button>

      {/* 全部接口 tab 下先选择目标模块 */}
      <Modal
        title="选择目标模块"
        open={moduleSelectOpen}
        onOk={handleModuleConfirm}
        onCancel={() => setModuleSelectOpen(false)}
        okText="确定"
        cancelText="取消"
        okButtonProps={{ disabled: !targetModuleId }}
      >
        <Select
          value={targetModuleId || undefined}
          onChange={setTargetModuleId}
          placeholder="请选择要添加到的模块"
          style={{ width: "100%", marginTop: 8 }}
          options={config.modules.map((m) => ({ value: m.id, label: m.label }))}
        />
      </Modal>

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
