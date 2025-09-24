import { PlusOutlined } from "@ant-design/icons"
import { Button, Row } from "antd"
import React, { useState } from "react"

import AddFormButton from "./editFormButton/AddFormButton"
import { ApiConfig } from "@src/types"

const OperateButtons = () => {
  const [apiFormVisible, setApiFormVisible] = useState(false)
  const [editingApi, setEditingApi] = useState<ApiConfig | null>(null)

  return (
    <Row justify="end">
      <AddFormButton />
    </Row>
  )
}

export default OperateButtons
