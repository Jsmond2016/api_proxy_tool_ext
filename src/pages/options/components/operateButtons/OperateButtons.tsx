import { Row, Space } from "antd"

import AddFormButton from "./editFormButton/AddFormButton"
import CopyPermissionDropdownButton from "./copyPermissionButton/CopyPermissionDropdownButton"
import ResetModuleButton from "./resetModuleButton/ResetModuleButton"

const OperateButtons = () => {
  return (
    <Row justify='end'>
      <Space>
        <AddFormButton />
        <CopyPermissionDropdownButton />
        <ResetModuleButton />
      </Space>
    </Row>
  )
}

export default OperateButtons
