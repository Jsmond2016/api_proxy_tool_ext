import { Row, Space } from "antd"

import AddFormButton from "./editFormButton/AddFormButton"
import BatchDeleteButton from "./batchDeleteButton/BatchDeleteButton"
import CopyPermissionDropdownButton from "./copyPermissionButton/CopyPermissionDropdownButton"
import ResetModuleButton from "./resetModuleButton/ResetModuleButton"
import { useActiveModuleIdStore } from "@src/store"
import { ALL_APIS_TAB_ID } from "@src/constant/constant"

const OperateButtons = () => {
  const { activeModuleId } = useActiveModuleIdStore()

  if (activeModuleId === ALL_APIS_TAB_ID) {
    return (
      <Row justify='end'>
        <Space>
          <AddFormButton />
          <BatchDeleteButton />
        </Space>
      </Row>
    )
  }

  return (
    <Row justify='end'>
      <Space>
        <AddFormButton />
        <CopyPermissionDropdownButton />
        <BatchDeleteButton />
        <ResetModuleButton />
      </Space>
    </Row>
  )
}

export default OperateButtons
