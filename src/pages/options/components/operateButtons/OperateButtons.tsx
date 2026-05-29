import { Row, Space } from "antd"

import AddFormButton from "./editFormButton/AddFormButton"
import BatchDeleteButton from "./batchDeleteButton/BatchDeleteButton"
import CopyPermissionDropdownButton from "./copyPermissionButton/CopyPermissionDropdownButton"
import ResetModuleButton from "./resetModuleButton/ResetModuleButton"

const OperateButtons = () => {
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
