import React, { useState } from "react"
import { Button, message } from "antd"
import { CopyOutlined } from "@ant-design/icons"
import { generatePermissionPointsFromApiConfigs } from "@src/utils/permissionUtils"
import { isValidGroupName } from "../syncApifoxModalButton/apifoxUtils"
import CopyPermissionModal from "../../CopyPermissionModal"
import { useConfigStore } from "@src/store"

const CopyAllPermissionButton: React.FC = () => {
  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const { config } = useConfigStore()

  const handleCopyAllPermissions = () => {
    // 获取所有模块的所有API
    const allApis = config.modules.flatMap((module) => module.apiArr)

    if (allApis.length === 0) {
      message.warning("没有可复制的权限点")
      return
    }

    // 验证所有模块的 groupName 格式
    const invalidModules = config.modules.filter(
      (module) => !isValidGroupName(module.label)
    )

    if (invalidModules.length > 0) {
      const invalidNames = invalidModules.map((m) => m.label).join("、")
      message.error(
        `以下分组名格式不正确：${invalidNames}，请修改为英文格式，例如：a.b.c`
      )
      return
    }

    setModalVisible(true)
  }

  const handleModalCancel = () => {
    setModalVisible(false)
  }

  // 获取所有模块的所有API，并按模块分组生成权限点
  const allPermissionPoints = config.modules.flatMap((module) =>
    generatePermissionPointsFromApiConfigs(module.apiArr, "", module.label)
  )

  return (
    <>
      <Button
        icon={<CopyOutlined />}
        onClick={handleCopyAllPermissions}
        title="复制全局权限点"
      >
        复制全局权限点
      </Button>

      <CopyPermissionModal
        visible={modalVisible}
        onCancel={handleModalCancel}
        permissionPoints={allPermissionPoints}
        title="复制全局所有权限点"
      />
    </>
  )
}

export default CopyAllPermissionButton
