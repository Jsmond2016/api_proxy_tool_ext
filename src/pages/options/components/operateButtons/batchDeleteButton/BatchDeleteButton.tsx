import React, { useMemo } from "react"
import { DeleteOutlined } from "@ant-design/icons"
import { Button, Modal, message } from "antd"
import {
  useActiveModuleIdStore,
  useConfigStore,
  useSelectedApiStore,
} from "@src/store"
import { saveConfig } from "@src/utils/configUtil"

const BatchDeleteButton = () => {
  const { config, setConfig } = useConfigStore()
  const { activeModuleId } = useActiveModuleIdStore()
  const { selectedApiIds, setSelectedApiIds } = useSelectedApiStore()

  const activeModule = config.modules.find(
    (module) => module.id === activeModuleId
  )

  const selectedIdsInActiveModule = useMemo(() => {
    const activeApiIds = new Set((activeModule?.apiArr || []).map((api) => api.id))
    return selectedApiIds.filter((apiId) => activeApiIds.has(apiId))
  }, [activeModule?.apiArr, selectedApiIds])

  const handleBatchDelete = () => {
    if (selectedIdsInActiveModule.length === 0) {
      return
    }

    Modal.confirm({
      title: "确认批量删除",
      content: `此操作将删除当前勾选的 ${selectedIdsInActiveModule.length} 个接口，删除后无法恢复，是否继续？`,
      okText: "确认删除",
      cancelText: "取消",
      okType: "danger",
      onOk: async () => {
        const selectedIdSet = new Set(selectedIdsInActiveModule)
        const newConfig = {
          ...config,
          modules: config.modules.map((module) =>
            module.id === activeModuleId
              ? {
                  ...module,
                  apiArr: module.apiArr.filter((api) => !selectedIdSet.has(api.id)),
                }
              : module
          ),
        }

        setConfig(newConfig)
        setSelectedApiIds(
          selectedApiIds.filter((apiId) => !selectedIdSet.has(apiId))
        )
        await saveConfig(newConfig)
        message.success(`已删除 ${selectedIdsInActiveModule.length} 个接口`)
      },
    })
  }

  return (
    <Button
      danger
      icon={<DeleteOutlined />}
      disabled={selectedIdsInActiveModule.length === 0}
      onClick={handleBatchDelete}
    >
      批量删除
    </Button>
  )
}

export default BatchDeleteButton
