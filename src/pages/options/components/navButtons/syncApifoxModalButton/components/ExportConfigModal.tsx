import { Button, Input, Modal, message } from "antd"
import { copyToClipboard } from "@src/utils/permissionUtils"

interface ExportConfigModalProps {
  open: boolean
  text: string
  onCancel: () => void
}

const ExportConfigModal = ({
  open,
  text,
  onCancel,
}: ExportConfigModalProps) => {
  const handleCopy = async () => {
    const success = await copyToClipboard(text)
    if (success) {
      message.success("配置 JSON 已复制")
      onCancel()
    } else {
      message.error("复制失败，请重试")
    }
  }

  return (
    <Modal
      title="导出配置"
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button key="copy" type="primary" onClick={handleCopy}>
          复制
        </Button>,
      ]}
      destroyOnHidden
    >
      <Input.TextArea
        value={text}
        readOnly
        autoSize={{ minRows: 12, maxRows: 24 }}
      />
    </Modal>
  )
}

export default ExportConfigModal
