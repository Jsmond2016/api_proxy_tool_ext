import React, { useState } from "react"
import { Dropdown, message } from "antd"
import { generatePermissionPointsFromApiConfigs } from "@src/utils/permissionUtils"
import { isValidGroupName } from "../../navButtons/syncApifoxModalButton/apifoxUtils"
import CopyPermissionModal from "../../CopyPermissionModal"
import {
  useConfigStore,
  useActiveModuleIdStore,
  useSelectedApiStore,
} from "@src/store"

interface CopyPermissionDropdownButtonProps {}

const CopyPermissionDropdownButton: React.FC<
  CopyPermissionDropdownButtonProps
> = () => {
  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const [modalTitle, setModalTitle] = useState<string>("")
  const [permissionPoints, setPermissionPoints] = useState<any[]>([])

  const { config } = useConfigStore()
  const { activeModuleId } = useActiveModuleIdStore()
  const { selectedApiIds } = useSelectedApiStore()

  const activeModule = config.modules.find(
    (module) => module.id === activeModuleId
  )
  const apis = activeModule?.apiArr || []

  const handleCopyAllPermissions = () => {
    const groupName = activeModule?.label || "default"

    // 验证 groupName 格式
    if (!isValidGroupName(groupName)) {
      message.error("分组名格式不正确，请修改为英文格式，例如：a.b.c")
      return
    }

    const allPermissionPoints = generatePermissionPointsFromApiConfigs(
      apis,
      "",
      groupName
    )
    setPermissionPoints(allPermissionPoints)
    setModalTitle("复制所有权限点")
    setModalVisible(true)
  }

  const handleCopySelectedPermissions = () => {
    if (selectedApiIds.length === 0) {
      message.warning("请先选择要复制的权限点")
      return
    }

    const groupName = activeModule?.label || "default"

    // 验证 groupName 格式
    if (!isValidGroupName(groupName)) {
      message.error("分组名格式不正确，请修改为英文格式，例如：a.b.c")
      return
    }

    const selectedApis = apis.filter((api) => selectedApiIds.includes(api.id))
    const selectedPermissionPoints = generatePermissionPointsFromApiConfigs(
      selectedApis,
      "",
      groupName
    )
    setPermissionPoints(selectedPermissionPoints)
    setModalTitle(`复制勾选权限点 (${selectedApiIds.length}个)`)
    setModalVisible(true)
  }

  const handleModalCancel = () => {
    setModalVisible(false)
    setPermissionPoints([])
  }

  const menuItems = [
    {
      key: "all",
      label: "复制所有权限点",
      onClick: handleCopyAllPermissions,
    },
    {
      key: "selected",
      label: "复制勾选权限点",
      onClick: handleCopySelectedPermissions,
      disabled: selectedApiIds.length === 0,
    },
  ]

  return (
    <>
      <Dropdown.Button type="primary" menu={{ items: menuItems }}>
        复制权限点
      </Dropdown.Button>

      <CopyPermissionModal
        visible={modalVisible}
        onCancel={handleModalCancel}
        permissionPoints={permissionPoints}
        title={modalTitle}
      />
    </>
  )
}

export default CopyPermissionDropdownButton
