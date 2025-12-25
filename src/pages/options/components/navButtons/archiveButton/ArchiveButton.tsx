import React, { useState, useMemo } from "react"
import { Dropdown, MenuProps, message } from "antd"
import { SaveOutlined, FolderOutlined } from "@ant-design/icons"
import { useConfigStore } from "@src/store"
import ArchiveModal from "./ArchiveModal"
import ArchiveListModal from "./ArchiveListModal"

const ArchiveButton: React.FC = () => {
  const { config } = useConfigStore()
  const [archiveModalVisible, setArchiveModalVisible] = useState(false)
  const [archiveListModalVisible, setArchiveListModalVisible] = useState(false)

  // 检查是否有迭代配置
  const hasIterationTags = useMemo(() => {
    const selectedTags = config.apifoxConfig?.selectedTags
    return selectedTags && selectedTags.length > 0
  }, [config.apifoxConfig?.selectedTags])

  const menuItems: MenuProps["items"] = [
    {
      key: "archive",
      label: "存档",
      icon: <SaveOutlined />,
      onClick: () => {
        if (!hasIterationTags) {
          message.warning("请先配置 Apifox 项目并选择迭代 tag")
          return
        }
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
