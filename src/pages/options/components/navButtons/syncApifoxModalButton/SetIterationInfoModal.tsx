import React, { useEffect, useState, useMemo } from "react"
import { Modal, Form, Input, Card, Space, message } from "antd"
import { GlobalConfig } from "@src/types"
import {
  getIterationInfo,
  saveIterationInfo,
  type IterationInfoMap,
} from "./apifoxCache"

const { TextArea } = Input

interface SetIterationInfoModalProps {
  visible: boolean
  onCancel: () => void
  onOk?: () => void
  config: GlobalConfig
}

const SetIterationInfoModal: React.FC<SetIterationInfoModalProps> = ({
  visible,
  onCancel,
  onOk,
  config,
}) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // 获取当前配置的 tags
  const selectedTags = useMemo(
    () => config.apifoxConfig?.selectedTags || [],
    [config.apifoxConfig?.selectedTags]
  )

  // 加载已保存的迭代信息
  useEffect(() => {
    if (visible && selectedTags.length > 0) {
      setLoading(true)
      getIterationInfo()
        .then((savedInfo: IterationInfoMap) => {
          const formValues: Record<string, string> = {}
          selectedTags.forEach((tag) => {
            const info = savedInfo[tag]
            if (info) {
              formValues[`requirementDocs_${tag}`] = info.requirementDocs
              formValues[`technicalDocs_${tag}`] = info.technicalDocs
              formValues[`prototypeDocs_${tag}`] = info.prototypeDocs
            }
          })
          form.setFieldsValue(formValues)
        })
        .catch((error) => {
          console.error("Failed to load iteration info:", error)
        })
        .finally(() => {
          setLoading(false)
        })
    } else if (visible) {
      form.resetFields()
    }
  }, [visible, selectedTags, form])

  // 处理保存
  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      setSaving(true)

      // 构建迭代信息映射
      const iterationInfoMap: IterationInfoMap = {}
      selectedTags.forEach((tag) => {
        iterationInfoMap[tag] = {
          tag,
          requirementDocs: values[`requirementDocs_${tag}`] || "",
          technicalDocs: values[`technicalDocs_${tag}`] || "",
          prototypeDocs: values[`prototypeDocs_${tag}`] || "",
        }
      })

      // 保存到缓存
      await saveIterationInfo(iterationInfoMap)
      message.success("迭代信息保存成功")
      onOk?.()
      onCancel()
    } catch (error) {
      console.error("Failed to save iteration info:", error)
      if (error && typeof error === "object" && "errorFields" in error) {
        // 表单验证错误
        return
      }
      message.error("保存失败，请重试")
    } finally {
      setSaving(false)
    }
  }

  // 处理取消
  const handleCancel = () => {
    form.resetFields()
    onCancel()
  }

  return (
    <Modal
      title="设置迭代信息"
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={saving}
      width={800}
      okText="保存"
      cancelText="取消"
    >
      {selectedTags.length === 0 ? (
        <div className="py-8 text-center text-gray-500">请先配置接口 tag</div>
      ) : (
        <Form form={form} layout="vertical" loading={loading}>
          <Space orientation="vertical" size="large" className="w-full">
            {selectedTags.map((tag) => (
              <Card
                key={tag}
                title={`迭代 Tag: ${tag}`}
                size="small"
                className="mb-4"
              >
                <Form.Item
                  label="需求文档"
                  name={`requirementDocs_${tag}`}
                  tooltip="支持多个文档链接，用换行、空格、逗号或分号分隔"
                >
                  <TextArea
                    rows={2}
                    placeholder="请输入需求文档链接，多个链接用换行、空格、逗号或分号分隔"
                  />
                </Form.Item>
                <Form.Item
                  label="技术文档"
                  name={`technicalDocs_${tag}`}
                  tooltip="支持多个文档链接，用换行、空格、逗号或分号分隔"
                >
                  <TextArea
                    rows={2}
                    placeholder="请输入技术文档链接，多个链接用换行、空格、逗号或分号分隔"
                  />
                </Form.Item>
                <Form.Item
                  label="原型文档"
                  name={`prototypeDocs_${tag}`}
                  tooltip="支持多个文档链接，用换行、空格、逗号或分号分隔"
                >
                  <TextArea
                    rows={2}
                    placeholder="请输入原型文档链接，多个链接用换行、空格、逗号或分号分隔"
                  />
                </Form.Item>
              </Card>
            ))}
          </Space>
        </Form>
      )}
    </Modal>
  )
}

export default SetIterationInfoModal
