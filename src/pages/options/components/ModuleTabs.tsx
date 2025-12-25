import React, { useRef } from "react"
import { Tabs, GetRef, Modal } from "antd"
import { EditOutlined } from "@ant-design/icons"
import { ModuleConfig } from "../../../types"
import EditModuleModal from "./EditModuleModal"
import "antd/dist/reset.css"
import "../../../assets/styles/tailwind.css"
import { generateId } from "@src/utils/chromeApi"
import { useActiveModuleIdStore, useConfigStore } from "@src/store"
import { saveConfig } from "@src/utils/configUtil"

interface ModuleTabsProps {
  modules: ModuleConfig[]
  onModuleChange: (moduleId: string) => void
}

export default function ModuleTabs({
  modules,
  onModuleChange,
}: ModuleTabsProps) {
  const editModuleModalRef = useRef<GetRef<typeof EditModuleModal>>(null)

  const { config, setConfig } = useConfigStore()
  const { activeModuleId, setActiveModuleId } = useActiveModuleIdStore()

  // 添加模块
  const handleAddModule = () => {
    const newModule: ModuleConfig = {
      id: generateId(),
      apiDocKey: `module_${Date.now()}`,
      label: `新模块_${Date.now()}`,
      apiArr: [],
    }

    const newConfig = {
      ...config,
      modules: [...config.modules, newModule],
    }

    setConfig(newConfig)
    saveConfig(newConfig)
    setActiveModuleId(newModule.id)
  }

  // 删除模块
  const handleDeleteModule = (moduleId: string) => {
    // 二次确认
    Modal.confirm({
      title: "确定删除该模块吗？",
      content: "删除后将无法恢复",
      onOk: () => {
        const newConfig = {
          ...config,
          modules: config.modules.filter((module) => module.id !== moduleId),
        }
        setConfig(newConfig)
        saveConfig(newConfig)

        if (activeModuleId === moduleId) {
          const remainingModules = newConfig.modules
          setActiveModuleId(
            remainingModules.length > 0 ? remainingModules[0].id : ""
          )
        }
      },
    })
  }

  const items = modules.map((module) => ({
    key: module.id,
    label: (
      <div className="flex items-center space-x-1">
        <span>{module.label}</span>
        <EditOutlined
          className="text-gray-400 hover:text-blue-500 cursor-pointer text-xs ml-1"
          onClick={() =>
            editModuleModalRef.current?.open({
              moduleName: module.label,
              moduleId: module.id,
            })
          }
        />
      </div>
    ),
    children: null,
  }))

  return (
    <>
      <Tabs
        activeKey={activeModuleId}
        onChange={onModuleChange}
        items={items}
        type="editable-card"
        onEdit={(targetKey, action) => {
          if (action === "add") {
            handleAddModule()
          } else if (action === "remove") {
            // 当只有1个tab时，不允许删除
            if (modules.length <= 1) {
              return
            }
            handleDeleteModule(targetKey as string)
          }
        }}
        tabBarStyle={{ margin: 0 }}
      />

      <EditModuleModal ref={editModuleModalRef} />
    </>
  )
}
