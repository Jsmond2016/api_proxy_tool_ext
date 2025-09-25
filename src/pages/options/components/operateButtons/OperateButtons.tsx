import { Row, Space } from "antd"

import AddFormButton from "./editFormButton/AddFormButton"
import CopyPermissionDropdownButton from "./copyPermissionButton/CopyPermissionDropdownButton"

const OperateButtons = () => {
  return (
    <Row justify='end'>
      <Space>
        <AddFormButton />
        <CopyPermissionDropdownButton />
      </Space>
    </Row>
  )
}

export default OperateButtons
