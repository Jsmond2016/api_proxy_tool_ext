import React, { useMemo } from "react"
import { DeleteOutlined } from "@ant-design/icons"
import { Button, Modal, message } from "antd"
import {
  useActiveModuleIdStore,
  useConfigStore,
  useSelectedApiStore,
} from "@src/store"
import { saveConfig } from "@src/utils/configUtil"
import { ALL_APIS_TAB_ID } from "@src/constant/constant"

const BatchDeleteButton = () => {
  const { config, setConfig } = useConfigStore()
  const { activeModuleId } = useActiveModuleIdStore()
  const { selectedApiIds, setSelectedApiIds } = useSelectedApiStore()

  const isAllApisTab = activeModuleId === ALL_APIS_TAB_ID

  const activeModule = config.modules.find(
    (module) => module.id === activeModuleId
  )

  const validSelectedIds = useMemo(() => {
    if (isAllApisTab) {
      const allApiIds = new Set(
        config.modules.flatMap((m) => m.apiArr.map((a) => a.id))
      )
      return selectedApiIds.filter((id) => allApiIds.has(id))
    }
    const activeApiIds = new Set((activeModule?.apiArr || []).map((api) => api.id))
    return selectedApiIds.filter((apiId) => activeApiIds.has(apiId))
  }, [isAllApisTab, config.modules, activeModule?.apiArr, selectedApiIds])

  const handleBatchDelete = () => {
    if (validSelectedIds.length === 0) return

    Modal.confirm({
      title: "确认批量删除",
      content: `此操作将删除当前勾选的 ${validSelectedIds.length} 个接口，删除后无法恢复，是否继续？`,
      okText: "确认删除",
      cancelText: "取消",
      okType: "danger",
      onOk: async () => {
        const selectedIdSet = new Set(validSelectedIds)
        const newConfig = isAllApisTab
          ? {
              ...config,
              modules: config.modules.map((module) => ({
                ...module,
                apiArr: module.apiArr.filter((api) => !selectedIdSet.has(api.id)),
              })),
            }
          : {
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
        setSelectedApiIds(selectedApiIds.filter((id) => !selectedIdSet.has(id)))
        await saveConfig(newConfig)
        message.success(`已删除 ${validSelectedIds.length} 个接口`)
      },
    })
  }

  return (
    <Button
      danger
      icon={<DeleteOutlined />}
      disabled={validSelectedIds.length === 0}
      onClick={handleBatchDelete}
    >
      批量删除
    </Button>
  )
}

export default BatchDeleteButton
