import React, { useState } from "react"
import { Dropdown, MenuProps } from "antd"
import {
  SaveOutlined,
  FolderOutlined,
} from "@ant-design/icons"
import { useConfigStore } from "@src/store"
import ArchiveModal from "./ArchiveModal"
import ArchiveListModal from "./ArchiveListModal"

const ArchiveButton: React.FC = () => {
  const { config } = useConfigStore()
  const [archiveModalVisible, setArchiveModalVisible] = useState(false)
  const [archiveListModalVisible, setArchiveListModalVisible] = useState(false)

  const menuItems: MenuProps["items"] = [
    {
      key: "archive",
      label: "存档",
      icon: <SaveOutlined />,
      onClick: () => {
        setArchiveModalVisible(true)
      },
    },
    {
      key: "list",
      label: "查看存档",
      icon: <FolderOutlined />,
      onClick: () => {
        setArchiveListModalVisible(true)
      },
    },
  ]

  return (
    <>
      <Dropdown.Button
        menu={{ items: menuItems }}
        onClick={() => {
          setArchiveModalVisible(true)
        }}
        icon={<SaveOutlined />}
      >
        存档
      </Dropdown.Button>
      <ArchiveModal
        visible={archiveModalVisible}
        onCancel={() => setArchiveModalVisible(false)}
        onOk={() => {
          // 归档成功后可以刷新列表
        }}
        config={config}
      />
      <ArchiveListModal
        visible={archiveListModalVisible}
        onCancel={() => setArchiveListModalVisible(false)}
      />
    </>
  )
}

export default ArchiveButton

