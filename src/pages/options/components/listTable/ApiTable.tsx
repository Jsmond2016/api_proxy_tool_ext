import React from "react"
import { Table, Switch, Space, Tag, Typography } from "antd"

import { ApiConfig } from "../../../../types"
import { formatDelay } from "../../../../utils/chromeApi"
import "antd/dist/reset.css"
// import "../../../assets/styles/tailwind.css"
import "@src/assets/styles/tailwind.css"
import EditFormButton from "../operateButtons/editFormButton/EditFormButton"
import CloneButton from "./cloneButon/CloneButton"
import MigrateButton from "./migrateButton/MigrateButton"
import DeleteButton from "./deleteButton/DeleteButton"

const { Paragraph } = Typography
interface ApiTableProps {
  apis: ApiConfig[]
  searchKeyword: string
  onToggleApi: (apiId: string, enabled: boolean) => void
  onToggleAllApis: (enabled: boolean) => void
}

export default function ApiTable({
  apis,
  searchKeyword,
  onToggleApi,
  onToggleAllApis,
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

  // 检查是否所有API都已开启
  const allApisEnabled =
    filteredApis.length > 0 && filteredApis.every((api) => api.isOpen)
  const someApisEnabled = filteredApis.some((api) => api.isOpen)

  const columns = [
    {
      title: (
        <Switch
          checked={allApisEnabled}
          value={someApisEnabled && !allApisEnabled}
          onChange={onToggleAllApis}
          checkedChildren="开启"
          unCheckedChildren="关闭"
        />
      ),
      key: "toggleAll",
      width: 80,
      align: "center" as const,
      render: (_: any, record: ApiConfig) => (
        <Switch
          checked={record.isOpen}
          onChange={(checked) => onToggleApi(record.id, checked)}
          checkedChildren="开启"
          unCheckedChildren="关闭"
        />
      ),
    },
    {
      title: "请求方式",
      key: "method",
      width: 80,
      render: (_: any, record: ApiConfig) => (
        <Tag color={getMethodColor(record.method)}>
          {record.method.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "接口名称",
      key: "apiName",
      width: 120,
      render: (_: any, record: ApiConfig) => (
        <div className="font-medium">{record.apiName}</div>
      ),
    },
    {
      title: "接口地址",
      key: "apiUrl",
      width: 200,
      render: (_: any, record: ApiConfig) => (
        <Space direction="vertical">
          <Paragraph copyable={{ text: record.apiUrl }} type="secondary">
            {record.apiUrl}
          </Paragraph>

          <Paragraph copyable={{ text: record.redirectURL }} type="danger">
            {record.redirectURL}
          </Paragraph>
        </Space>
      ),
    },
    {
      title: "匹配方式",
      key: "filterType",
      width: 100,
      render: (_: any, record: ApiConfig) => (
        <Tag color="blue">{record.filterType}</Tag>
      ),
    },
    {
      title: "延迟时间",
      key: "delay",
      width: 100,
      render: (_: any, record: ApiConfig) => (
        <span className="text-sm">{formatDelay(record.delay)}</span>
      ),
    },
    {
      title: "操作",
      key: "actions",
      width: 200,
      render: (_: any, record: ApiConfig) => (
        <Space>
          <EditFormButton apiId={record.id} />
          <CloneButton apiId={record.id} />
          <MigrateButton apiId={record.id} />
          <DeleteButton apiId={record.id} />
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
      scroll={{ y: "calc(100vh - 400px)" }}
      size="small"
      onRow={(record) =>
        ({
          "data-api-id": record.id,
        } as React.HTMLAttributes<HTMLTableRowElement>)
      }
      bordered
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
