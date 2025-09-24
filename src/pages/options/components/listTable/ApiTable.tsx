import React from "react"
import { Table, Switch, Space, Tag, Typography, message } from "antd"

import { ApiConfig } from "@src/types"
import { ChromeApiService, formatDelay } from "@src/utils/chromeApi"
import "antd/dist/reset.css"
import "@src/assets/styles/tailwind.css"
import EditFormButton from "../operateButtons/editFormButton/EditFormButton"
import CloneButton from "./cloneButon/CloneButton"
import MigrateButton from "./migrateButton/MigrateButton"
import DeleteButton from "./deleteButton/DeleteButton"
import {
  useActiveModuleIdStore,
  useConfigStore,
  useSearchKeywordStore,
} from "@src/store"
import { saveConfig } from '@src/utils/configUtil'

const { Paragraph } = Typography
 

export default function ApiTable() {
  const { searchKeyword } = useSearchKeywordStore()
  const { config, setConfig } = useConfigStore()
  const { activeModuleId } = useActiveModuleIdStore()
  const activeModule = config.modules.find(
    (module) => module.id === activeModuleId
  )
  const apis = activeModule?.apiArr || []
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

  // 切换API开关
  const handleToggleApi = async (apiId: string, enabled: boolean) => {
    try {
      await ChromeApiService.toggleApi(apiId, enabled)
      setConfig({
        ...config,
        modules: config.modules.map((module) => ({
          ...module,
          apiArr: module.apiArr.map((api) =>
            api.id === apiId ? { ...api, isOpen: enabled } : api
          ),
        })),
      })
    } catch (error) {
      message.error("操作失败")
      console.error("Toggle API error:", error)
    }
  }

  // 切换所有API开关
  const handleToggleAllApis = async (enabled: boolean) => {
    if (!activeModule) return

    try {
      const newConfig = {
        ...config,
        modules: config.modules.map((module) =>
          module.id === activeModule.id
            ? {
                ...module,
                apiArr: module.apiArr.map((api) => ({
                  ...api,
                  isOpen: enabled,
                })),
              }
            : module
        ),
      }

      setConfig(newConfig)
      saveConfig(newConfig)

      // 批量更新background script
      for (const api of activeModule.apiArr) {
        await ChromeApiService.toggleApi(api.id, enabled)
      }
    } catch (error) {
      message.error("操作失败")
      console.error("Toggle all APIs error:", error)
    }
  }

  const columns = [
    {
      title: (
        <Switch
          checked={allApisEnabled}
          value={someApisEnabled && !allApisEnabled}
          onChange={handleToggleAllApis}
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
          onChange={(checked) => handleToggleApi(record.id, checked)}
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
