import { Button, Input, Modal, message } from "antd"
import { useState } from "react"
import { parseApifoxImportConfig, type ApifoxImportConfig } from "./configTransfer"

interface ImportConfigModalProps {
  open: boolean
  loading?: boolean
  onCancel: () => void
  onConfirm: (config: ApifoxImportConfig) => Promise<boolean>
}

const ImportConfigModal = ({
  open,
  loading = false,
  onCancel,
  onConfirm,
}: ImportConfigModalProps) => {
  const [text, setText] = useState("")

  const handleCancel = () => {
    setText("")
    onCancel()
  }

  const handleConfirm = async () => {
    const result = parseApifoxImportConfig(text)
    if (!result.config) {
      message.error(result.error)
      return
    }

    if (await onConfirm(result.config)) {
      setText("")
      onCancel()
    }
  }

  return (
    <Modal
      title="导入配置"
      open={open}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel} disabled={loading}>
          取消
        </Button>,
        <Button
          key="confirm"
          type="primary"
          onClick={handleConfirm}
          loading={loading}
        >
          确认
        </Button>,
      ]}
      destroyOnHidden
    >
      <Input.TextArea
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="请粘贴配置 JSON"
        autoSize={{ minRows: 12, maxRows: 24 }}
      />
    </Modal>
  )
}

export default ImportConfigModal
