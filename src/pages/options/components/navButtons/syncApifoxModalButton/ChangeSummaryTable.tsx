import React from "react"
import { Table, Space, Tag, Typography, Statistic, Card } from "antd"
import type { ColumnsType } from "antd/es/table"
import { ApifoxChanges } from "./compareUtils"

const { Text } = Typography

interface TableRow {
  key: string
  type: string
  name: string
  detail: string
  group?: string
  changeType: "add" | "remove" | "modify"
  oldValue?: string
  newValue?: string
}

interface ChangeSummaryTableProps {
  changes: ApifoxChanges
}

export const ChangeSummaryTable: React.FC<ChangeSummaryTableProps> = ({
  changes,
}) => {
  // 构建表格数据
  const tableData: TableRow[] = []

  // 新增的模块
  changes.added.modules.forEach((module) => {
    tableData.push({
      key: `add-module-${module.id}`,
      type: "新增模块",
      name: module.label,
      detail: `${module.apiArr.length} 个接口`,
      changeType: "add",
    })
  })

  // 新增的 API
  changes.added.apis.forEach((api) => {
    tableData.push({
      key: `add-api-${api.id}`,
      type: "新增接口",
      name: api.apiName,
      detail: `${api.method} ${api.apiUrl}`,
      group: api.moduleLabel,
      changeType: "add",
    })
  })

  // 删除的模块
  changes.removed.modules.forEach((module) => {
    tableData.push({
      key: `remove-module-${module.id}`,
      type: "删除模块",
      name: module.label,
      detail: `${module.apiArr.length} 个接口`,
      changeType: "remove",
    })
  })

  // 删除的 API
  changes.removed.apis.forEach((api) => {
    tableData.push({
      key: `remove-api-${api.id}`,
      type: "删除接口",
      name: api.apiName,
      detail: `${api.method} ${api.apiUrl}`,
      group: api.moduleLabel,
      changeType: "remove",
    })
  })

  // 修改的 API
  changes.modified.forEach((change) => {
    const changeDetails = change.changes.map((c) => {
      const field = c.replace("变化", "")
      const oldVal = change.oldValues[getFieldKey(c)]
      const newVal = change.newValues[getFieldKey(c)]
      return `${field}: ${oldVal} → ${newVal}`
    })

    tableData.push({
      key: `modify-api-${change.id}`,
      type: "修改接口",
      name: change.newApi.apiName,
      detail: change.newApi.apiUrl,
      group: change.changes.join(", "),
      changeType: "modify",
      oldValue: changeDetails.join("; "),
      newValue: changeDetails.join("; "),
    })
  })

  // 表格列定义
  const columns: ColumnsType<TableRow> = [
    {
      title: "变化类型",
      dataIndex: "type",
      key: "type",
      width: 120,
      fixed: "left",
      render: (text: string, record: TableRow) => {
        const colorMap = {
          add: "success",
          remove: "error",
          modify: "processing",
        } as const
        return (
          <Tag color={colorMap[record.changeType]} className="font-bold">
            {text}
          </Tag>
        )
      },
    },
    {
      title: "名称",
      dataIndex: "name",
      key: "name",
      width: 250,
      render: (text: string, record: TableRow) => (
        <Text
          type={record.changeType === "remove" ? "danger" : undefined}
          delete={record.changeType === "remove"}
          ellipsis={{ tooltip: text }}
        >
          {text}
        </Text>
      ),
    },
    {
      title: "详情",
      dataIndex: "detail",
      key: "detail",
      width: 600,
      render: (text: string, record: TableRow) => {
        if (record.changeType === "modify" && record.oldValue) {
          // 对于修改类型，显示变化详情
          return (
            <div className="space-y-1">
              {record.oldValue.split("; ").map((change, index) => {
                const [field, values] = change.split(": ")
                const [oldVal, newVal] = values.split(" → ")
                return (
                  <div key={index}>
                    <Text strong>{field}: </Text>
                    <Text delete className="text-gray-400">
                      {oldVal}
                    </Text>
                    <Text className="mx-1">→</Text>
                    <Text type="danger" strong>
                      {newVal}
                    </Text>
                  </div>
                )
              })}
            </div>
          )
        }
        return <Text ellipsis={{ tooltip: text }}>{text}</Text>
      },
    },
    {
      title: "分组/变化",
      dataIndex: "group",
      key: "group",
      width: 200,
      render: (text?: string) => (
        <Text ellipsis={{ tooltip: text }}>{text || "-"}</Text>
      ),
    },
  ]

  // 统计信息
  const totalAdded = changes.added.modules.length + changes.added.apis.length
  const totalRemoved =
    changes.removed.modules.length + changes.removed.apis.length
  const totalModified = changes.modified.length
  const total = tableData.length

  return (
    <div>
      {/* 统计摘要 */}
      <Card size="small" className="mb-4 bg-gray-50">
        <Space size="large" wrap>
          <Statistic
            title="新增"
            value={totalAdded}
            valueStyle={{ color: "#52c41a", fontSize: 20 }}
          />
          <Statistic
            title="删除"
            value={totalRemoved}
            valueStyle={{ color: "#ff4d4f", fontSize: 20 }}
          />
          <Statistic
            title="修改"
            value={totalModified}
            valueStyle={{ color: "#1890ff", fontSize: 20 }}
          />
          <Statistic
            title="总计"
            value={total}
            suffix="项变化"
            valueStyle={{ fontSize: 20 }}
          />
        </Space>
      </Card>

      {/* 变化详情表格 */}
      <Table
        columns={columns}
        dataSource={tableData}
        pagination={false}
        size="small"
        scroll={{ x: "max-content", y: 400 }}
        bordered
      />
    </div>
  )
}

// 辅助函数：将变化描述转换为字段 key
function getFieldKey(changeDesc: string): string {
  const map: Record<string, string> = {
    名称变化: "apiName",
    "URL 变化": "apiUrl",
    方法变化: "method",
  }
  return map[changeDesc] || changeDesc
}
