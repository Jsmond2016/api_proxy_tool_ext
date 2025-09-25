import { DeleteOutlined } from "@ant-design/icons"
import { useConfigStore } from "@src/store"
import { saveConfig } from "@src/utils/configUtil"
import { Button, Modal } from "antd"
import React from "react"

const DeleteButton = ({ apiId }: { apiId: string }) => {
  const { config, setConfig } = useConfigStore()

  // 删除API
  const handleDeleteApi = () => {
    // 二次确认
    Modal.confirm({
      title: "确定删除该接口吗？",
      content: "删除后将无法恢复",
      onOk: () => {
        const newConfig = {
          ...config,
          modules: config.modules.map((module) => ({
            ...module,
            apiArr: module.apiArr.filter((api) => api.id !== apiId),
          })),
        }
        setConfig(newConfig)
        saveConfig(newConfig)
      },
    })
  }

  return (
    <Button
      type="link"
      danger
      className="p-0"
      icon={<DeleteOutlined />}
      onClick={handleDeleteApi}
    >
      删除
    </Button>
  )
}

export default DeleteButton
