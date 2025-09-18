import React, { useState } from "react"
import { Tabs, Button, Popconfirm } from "antd"
import { PlusOutlined, CloseOutlined, EditOutlined } from "@ant-design/icons"
import { ModuleConfig } from "../../../types"
import EditModuleModal from "./EditModuleModal"
import "antd/dist/reset.css"
import "../../../assets/styles/tailwind.css"

interface ModuleTabsProps {
  modules: ModuleConfig[]
  activeModuleId: string
  onModuleChange: (moduleId: string) => void
  onAddModule: () => void
  onDeleteModule: (moduleId: string) => void
  onEditModule: (moduleId: string, newName: string) => void
}

export default function ModuleTabs({
  modules,
  activeModuleId,
  onModuleChange,
  onAddModule,
  onDeleteModule,
  onEditModule,
}: ModuleTabsProps) {
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editingModule, setEditingModule] = useState<ModuleConfig | null>(null)

  const handleEditClick = (e: React.MouseEvent, module: ModuleConfig) => {
    e.stopPropagation()
    setEditingModule(module)
    setEditModalVisible(true)
  }

  const handleEditOk = (newName: string) => {
    if (editingModule) {
      onEditModule(editingModule.id, newName)
    }
    setEditModalVisible(false)
    setEditingModule(null)
  }

  const handleEditCancel = () => {
    setEditModalVisible(false)
    setEditingModule(null)
  }

  const items = modules.map((module) => ({
    key: module.id,
    label: (
      <div className="flex items-center space-x-1">
        <span>{module.label}</span>
        <EditOutlined
          className="text-gray-400 hover:text-blue-500 cursor-pointer text-xs ml-1"
          onClick={(e) => handleEditClick(e, module)}
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
            onAddModule()
          } else if (action === "remove") {
            // 当只有1个tab时，不允许删除
            if (modules.length <= 1) {
              return
            }
            onDeleteModule(targetKey as string)
          }
        }}
        tabBarStyle={{ margin: 0 }}
      />

      <EditModuleModal
        visible={editModalVisible}
        moduleName={editingModule?.label || ""}
        onCancel={handleEditCancel}
        onOk={handleEditOk}
      />
    </>
  )
}
