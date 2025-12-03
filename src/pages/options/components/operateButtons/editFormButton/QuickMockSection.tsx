import React from "react"
import { Form, Switch, Button, Table, Space, Tooltip, Popconfirm } from "antd"
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons"
import { QuickMockConfig, GlobalConfig } from "../../../../../types"
import { FormInstance } from "antd/es/form"

interface QuickMockSectionProps {
  form: FormInstance
  config: GlobalConfig
  activeCustomMockKey?: string
  customMockResponses: QuickMockConfig[]
  onAddCustomMock: () => void
  onEditCustomMock: (record: QuickMockConfig) => void
}

const QuickMockSection: React.FC<QuickMockSectionProps> = ({
  form,
  config,
  activeCustomMockKey,
  customMockResponses,
  onAddCustomMock,
  onEditCustomMock,
}) => {
  return (
    <Form.Item label="快速联调">
      <Form.Item
        label="自定义响应"
        name="useCustomMock"
        valuePropName="checked"
      >
        <Switch checkedChildren="是" unCheckedChildren="否" />
      </Form.Item>

      <Form.Item
        noStyle
        shouldUpdate={(prevValues, currentValues) =>
          prevValues.useCustomMock !== currentValues.useCustomMock
        }
      >
        {({ getFieldValue }) => {
          const useCustomMock = getFieldValue("useCustomMock")

          if (useCustomMock) {
            return (
              <div className="mt-2">
                <div className="mb-2 flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    自定义响应列表
                  </span>
                  <Button
                    type="link"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={onAddCustomMock}
                  >
                    添加自定义响应
                  </Button>
                </div>
                <Table
                  size="small"
                  dataSource={customMockResponses}
                  rowKey="id"
                  pagination={false}
                  columns={[
                    {
                      title: "名称",
                      dataIndex: "name",
                      key: "name",
                      width: 120,
                    },
                    {
                      title: "唯一标识",
                      dataIndex: "key",
                      key: "key",
                      width: 120,
                    },
                    {
                      title: "激活",
                      key: "active",
                      width: 80,
                      align: "center" as const,
                      render: (_: unknown, record: QuickMockConfig) => {
                        const isActive = activeCustomMockKey === record.key

                        return (
                          <Switch
                            checked={isActive}
                            size="small"
                            onChange={(checked) => {
                              // 如果开启，设置当前为激活；如果关闭，清除激活
                              // 当有激活的自定义响应时，自动启用快速联调
                              form.setFieldsValue({
                                activeCustomMockKey: checked
                                  ? record.key
                                  : undefined,
                                quickMockEnabled: checked,
                              })
                            }}
                            checkedChildren="开启"
                            unCheckedChildren="关闭"
                          />
                        )
                      },
                    },
                    {
                      title: (
                        <Space>
                          <span>操作</span>
                          <Tooltip title="可以设置多个自定义响应，但每次只能开启一个">
                            <QuestionCircleOutlined className="text-gray-400 cursor-help" />
                          </Tooltip>
                        </Space>
                      ),
                      key: "action",
                      width: 150,
                      render: (_: unknown, record: QuickMockConfig) => (
                        <Space>
                          <Button
                            type="link"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => onEditCustomMock(record)}
                          >
                            编辑
                          </Button>
                          <Popconfirm
                            title="确定删除吗？"
                            onConfirm={() => {
                              const currentList =
                                form.getFieldValue("customMockResponses") || []
                              const newList = currentList.filter(
                                (item: QuickMockConfig) =>
                                  item.id !== record.id
                              )
                              const activeKey = form.getFieldValue(
                                "activeCustomMockKey"
                              )
                              form.setFieldsValue({
                                customMockResponses: newList,
                                activeCustomMockKey:
                                  activeKey === record.key
                                    ? undefined
                                    : activeKey,
                                quickMockEnabled:
                                  activeKey === record.key
                                    ? false
                                    : form.getFieldValue("quickMockEnabled"),
                              })
                            }}
                          >
                            <Button
                              type="link"
                              danger
                              size="small"
                              icon={<DeleteOutlined />}
                            >
                              删除
                            </Button>
                          </Popconfirm>
                        </Space>
                      ),
                    },
                  ]}
                />
              </div>
            )
          }

          return null
        }}
      </Form.Item>
    </Form.Item>
  )
}

export default QuickMockSection

