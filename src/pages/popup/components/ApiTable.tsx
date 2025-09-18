import React from "react"
import { Table, Switch, Button, Space, Tag, Tooltip } from "antd"
import {
  EditOutlined,
  CopyOutlined,
  DeleteOutlined,
  DragOutlined,
  CopyOutlined as CopyIcon,
} from "@ant-design/icons"
import { ApiConfig } from "../../../types"
import { formatDelay } from "../../../utils/chromeApi"

interface ApiTableProps {
  apis: ApiConfig[]
  searchKeyword: string
  onToggleApi: (apiId: string, enabled: boolean) => void
  onDeleteApi: (apiId: string) => void
  onEditApi: (apiId: string) => void
  onCloneApi: (apiId: string) => void
}

export default function ApiTable({
  apis,
  searchKeyword,
  onToggleApi,
  onDeleteApi,
  onEditApi,
  onCloneApi,
}: ApiTableProps) {
  // 过滤API数据
  const filteredApis = apis.filter((api) => {
    if (!searchKeyword) return true
    const keyword = searchKeyword.toLowerCase()
    return (
      api.apiName.toLowerCase().includes(keyword) ||
      api.apiUrl.toLowerCase().includes(keyword) ||
      api.redirectURL.toLowerCase().includes(keyword)
    )
  })

  // 复制到剪贴板
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const columns = [
    {
      title: "",
      key: "drag",
      width: 30,
      render: () => <DragOutlined className="text-gray-400 cursor-move" />,
    },
    {
      title: "Mock 方式",
      key: "mock",
      width: 120,
      render: (_, record: ApiConfig) => (
        <div className="flex flex-col space-y-1">
          <Switch
            checked={record.isOpen}
            onChange={(checked) => onToggleApi(record.id, checked)}
          />
          <Button
            type="primary"
            className="text-xs px-2"
            style={{
              backgroundColor:
                record.mockWay === "redirect" ? "#722ed1" : "#1890ff",
              borderColor:
                record.mockWay === "redirect" ? "#722ed1" : "#1890ff",
            }}
          >
            Redirect Request
          </Button>
        </div>
      ),
    },
    {
      title: "请求方式",
      key: "method",
      width: 80,
      render: (_, record: ApiConfig) => (
        <Tag color={getMethodColor(record.method)}>
          {record.method.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "接口名称",
      key: "apiName",
      render: (_, record: ApiConfig) => (
        <div className="font-medium">{record.apiName}</div>
      ),
    },
    {
      title: "接口地址",
      key: "apiUrl",
      render: (_, record: ApiConfig) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-1">
            <span className="text-blue-600 text-sm">{record.apiUrl}</span>
            <CopyIcon
              className="text-gray-400 cursor-pointer hover:text-blue-500"
              onClick={() => copyToClipboard(record.apiUrl)}
            />
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-red-600 text-sm">{record.redirectURL}</span>
            <CopyIcon
              className="text-gray-400 cursor-pointer hover:text-red-500"
              onClick={() => copyToClipboard(record.redirectURL)}
            />
          </div>
        </div>
      ),
    },
    {
      title: "匹配方式",
      key: "filterType",
      width: 100,
      render: (_, record: ApiConfig) => (
        <Tag color="blue">{record.filterType}</Tag>
      ),
    },
    {
      title: "延迟时间",
      key: "delay",
      width: 100,
      render: (_, record: ApiConfig) => (
        <span className="text-sm">{formatDelay(record.delay)}</span>
      ),
    },
    {
      title: "操作",
      key: "actions",
      width: 120,
      render: (_, record: ApiConfig) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => onEditApi(record.id)}
          >
            编辑
          </Button>
          <Button
            type="link"
            icon={<CopyOutlined />}
            onClick={() => onCloneApi(record.id)}
          >
            克隆
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => onDeleteApi(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <Table
      dataSource={filteredApis}
      columns={columns}
      rowKey="id"
      pagination={false}
      scroll={{ y: 400 }}
      className="api-table"
    />
  )
}

// 获取请求方法对应的颜色
function getMethodColor(method: string): string {
  const colors: { [key: string]: string } = {
    GET: "green",
    POST: "blue",
    PUT: "orange",
    DELETE: "red",
    PATCH: "purple",
  }
  return colors[method.toUpperCase()] || "default"
}
