import React from "react"
import { Modal, Form, Input, Select, message } from "antd"
import { QuickMockConfig, GlobalConfig } from "../../../../../types"
import { generateId } from "../../../../../utils/chromeApi"
import { FormInstance } from "antd/es/form"

const { TextArea } = Input

interface CustomMockFormModalProps {
  visible: boolean
  editingCustomMock: QuickMockConfig | null
  config: GlobalConfig
  form: FormInstance
  customMockForm: FormInstance
  onCancel: () => void
  onSuccess: () => void
}

const CustomMockFormModal: React.FC<CustomMockFormModalProps> = ({
  visible,
  editingCustomMock,
  config,
  form,
  customMockForm,
  onCancel,
  onSuccess,
}) => {
  const handleSubmit = () => {
    customMockForm
      .validateFields()
      .then((values) => {
        // 验证 responseJson 是否为有效的 JSON
        try {
          JSON.parse(values.responseJson)
        } catch (error) {
          message.error("响应数据必须是有效的 JSON 格式")
          return
        }

        // 排除 presetResponseKey 字段，它只用于选择预设响应体
        const { presetResponseKey, ...mockData } = values

        const currentCustomMockResponses =
          form.getFieldValue("customMockResponses") || []

        if (editingCustomMock) {
          // 编辑
          const newList = currentCustomMockResponses.map(
            (item: QuickMockConfig) =>
              item.id === editingCustomMock.id
                ? {
                    ...editingCustomMock,
                    ...mockData,
                  }
                : item
          )
          form.setFieldsValue({
            customMockResponses: newList,
          })
        } else {
          // 新增
          // 检查 key 是否重复
          if (
            currentCustomMockResponses.some(
              (item: QuickMockConfig) => item.key === mockData.key
            )
          ) {
            message.error("该唯一标识已存在，请使用不同的标识")
            return
          }

          const newItem: QuickMockConfig = {
            id: generateId(),
            ...mockData,
          }
          form.setFieldsValue({
            customMockResponses: [
              ...currentCustomMockResponses,
              newItem,
            ],
          })
        }

        onSuccess()
        message.success(editingCustomMock ? "更新成功" : "添加成功")
      })
      .catch(() => {})
  }

  return (
    <Modal
      title={editingCustomMock ? "编辑自定义响应" : "添加自定义响应"}
      open={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      okText={editingCustomMock ? "更新" : "添加"}
      cancelText="取消"
      width={600}
    >
      <Form
        form={customMockForm}
        layout="vertical"
        initialValues={{
          presetResponseKey: undefined,
          name: "",
          key: "",
          responseJson: "{}",
        }}
      >
        {!editingCustomMock && (
          <Form.Item
            label="预设响应体"
            name="presetResponseKey"
            extra="选择预设响应体后，将自动填充名称、唯一标识和响应数据"
          >
            <Select
              placeholder="请选择预设响应体（可选）"
              allowClear
              options={(config.quickMockConfigs || []).map((item) => ({
                label: item.name,
                value: item.key,
              }))}
              onChange={(value) => {
                if (value) {
                  const presetConfig = config.quickMockConfigs?.find(
                    (item) => item.key === value
                  )
                  if (presetConfig) {
                    customMockForm.setFieldsValue({
                      name: presetConfig.name,
                      key: presetConfig.key,
                      responseJson: presetConfig.responseJson,
                    })
                  }
                }
              }}
            />
          </Form.Item>
        )}

        <Form.Item
          label="名称"
          name="name"
          rules={[{ required: true, message: "请输入名称" }]}
        >
          <Input placeholder="请输入名称" />
        </Form.Item>

        <Form.Item
          label="唯一标识"
          name="key"
          rules={[
            { required: true, message: "请输入唯一标识" },
            {
              pattern: /^[a-zA-Z0-9_-]+$/,
              message: "唯一标识只能包含字母、数字、下划线和横线",
            },
          ]}
          extra="用于标识该自定义响应，只能包含字母、数字、下划线和横线"
        >
          <Input placeholder="例如：error_response" />
        </Form.Item>

        <Form.Item
          label="响应数据 (JSON)"
          name="responseJson"
          rules={[
            { required: true, message: "请输入响应数据" },
            {
              validator: (_, value) => {
                if (!value) return Promise.resolve()
                try {
                  JSON.parse(value)
                  return Promise.resolve()
                } catch {
                  return Promise.reject(new Error("必须是有效的 JSON 格式"))
                }
              },
            },
          ]}
          extra="请输入 JSON 格式的响应数据"
        >
          <TextArea
            rows={10}
            placeholder='例如：{"code": 500, "message": "服务器错误", "data": null}'
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default CustomMockFormModal

