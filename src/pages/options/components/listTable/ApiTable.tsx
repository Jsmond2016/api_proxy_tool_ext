import React, { useState, useMemo, useEffect } from "react"
import {
  Table,
  Switch,
  Space,
  Tag,
  Typography,
  message,
  PaginationProps,
} from "antd"

import { ApiConfig } from "@src/types"
import { formatDelay } from "@src/utils/chromeApi"
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
  useSelectedApiStore,
  useHighlightApiStore,
} from "@src/store"
import { saveConfig } from "@src/utils/configUtil"
import { TableColumnsX } from "../../../../types/util.type"
import { ColumnsType } from "antd/es/table"

const { Paragraph } = Typography

export default function ApiTable() {
  const { searchKeyword } = useSearchKeywordStore()
  const { config, setConfig } = useConfigStore()
  const { activeModuleId } = useActiveModuleIdStore()
  const { selectedApiIds, setSelectedApiIds } = useSelectedApiStore()
  const { highlightApiId, setHighlightApiId } = useHighlightApiStore()

  const [current, setCurrent] = useState(1)
  const [pageSize, setPageSize] = useState(20)

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

  const projectId = useMemo(() => {
    const url = config.apifoxConfig?.apifoxUrl
    if (!url) return null
    const match = url.match(/[?&]projectId=([^&]+)/)
    if (match) return match[1]
    const matchPath = url.match(/\/project\/(\d+)/)
    if (matchPath) return matchPath[1]
    return null
  }, [config.apifoxConfig?.apifoxUrl])

  // 行选择配置
  const rowSelection = {
    selectedRowKeys: selectedApiIds,
    onChange: (selectedRowKeys: React.Key[]) => {
      setSelectedApiIds(selectedRowKeys as string[])
    },
    getCheckboxProps: (record: ApiConfig) => ({
      name: record.apiName,
    }),
  }

  // 监听 highlightApiId 变化，处理滚动和分页跳转
  useEffect(() => {
    if (!highlightApiId) return

    // 1. 检查目标 API 是否在当前列表（filteredApis）中
    const index = filteredApis.findIndex((api) => api.id === highlightApiId)
    if (index === -1) {
      return
    }

    // 2. 计算所在页码
    const targetPage = Math.floor(index / pageSize) + 1

    // 3. 切换页码
    if (current !== targetPage) {
      setCurrent(targetPage)
    }

    // 4. 延迟滚动
    const timer = setTimeout(() => {
      const element = document.querySelector(
        `[data-api-id="${highlightApiId}"]`
      )
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" })
      }
      // 5. 3秒后清除高亮 ID（样式也会随之消失）
      setTimeout(() => {
        setHighlightApiId("")
      }, 3000)
    }, 300)

    return () => clearTimeout(timer)
  }, [highlightApiId, filteredApis, pageSize, current, setHighlightApiId])

  // 切换API开关
  const handleToggleApi = async (apiId: string, enabled: boolean) => {
    try {
      // 使用 getState() 获取最新配置，防止闭包问题导致的旧状态覆盖
      const currentConfig = useConfigStore.getState().config
      // 创建新的配置对象
      const newConfig = {
        ...currentConfig,
        modules: currentConfig.modules.map((module) => ({
          ...module,
          apiArr: module.apiArr.map((api) =>
            api.id === apiId ? { ...api, isOpen: enabled } : api
          ),
        })),
      }

      // 更新本地状态
      setConfig(newConfig)
      // 持久化配置到 background
      await saveConfig(newConfig)
    } catch (error) {
      message.error("操作失败")
      console.error("Toggle API error:", error)
    }
  }

  // 切换所有API开关
  const handleToggleAllApis = async (enabled: boolean) => {
    if (!activeModule) return

    try {
      // 使用 getState() 获取最新配置
      const currentConfig = useConfigStore.getState().config
      const newConfig = {
        ...currentConfig,
        modules: currentConfig.modules.map((module) =>
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

      // 更新本地状态
      setConfig(newConfig)
      // 持久化配置到 background
      await saveConfig(newConfig)
    } catch (error) {
      message.error("操作失败")
      console.error("Toggle all APIs error:", error)
    }
  }

  const isNotEmpty = (v: string | undefined) => v != "" && v != null

  const columns: TableColumnsX<ApiConfig> = [
    {
      title: "序号",
      dataIndex: "id",
      width: 20,
      render: (_: any, __: ApiConfig, index: number) =>
        index + 1 + (current - 1) * pageSize,
    },
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
      dataIndex: "isOpen",
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
      dataIndex: "method",
      width: 80,
      render: (_: any, record: ApiConfig) => (
        <Tag color={getMethodColor(record.method)}>
          {record.method.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "接口名称",
      dataIndex: "apiName",
      width: 120,
      render: (_: any, record: ApiConfig) => {
        const isApifoxId = /^\d+$/.test(record.id)
        const canLink = projectId && isApifoxId

        return (
          <div className="font-medium">
            {canLink ? (
              <a
                href={`https://app.apifox.com/link/project/${projectId}/apis/api-${record.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors"
                title="点击跳转到 Apifox Web 版"
                onClick={(e) => e.stopPropagation()}
              >
                {record.apiName}
              </a>
            ) : (
              record.apiName
            )}
          </div>
        )
      },
    },
    {
      title: "接口地址",
      dataIndex: "apiUrl",
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
      title: "权限点",
      dataIndex: "authPointKey",
      width: 100,
      // 当没有权限点的时候，显示 '-',若有，则可以复制
      render: (v: string | undefined) =>
        isNotEmpty(v) ? (
          <Paragraph copyable={{ text: v }} type="secondary">
            {v}
          </Paragraph>
        ) : (
          "-"
        ),
    },
    {
      title: "代理设置",
      dataIndex: "filterType",
      width: 100,
      render: (_: any, record: ApiConfig) => (
        <Space direction="vertical">
          <div>
            <span>匹配方式：</span>
            <Tag color="blue">{record.filterType}</Tag>
          </div>
          <div>
            <span>延迟时间：</span>
            <span>{formatDelay(record.delay)}</span>
          </div>
        </Space>
      ),
    },
    {
      title: "操作",
      width: 200,
      render: (_: unknown, record: ApiConfig) => (
        <Space>
          <EditFormButton apiId={record.id} />
          <CloneButton apiId={record.id} />
          <MigrateButton apiId={record.id} />
          <DeleteButton apiId={record.id} />
        </Space>
      ),
    },
  ]

  const pagination: PaginationProps = {
    total: filteredApis.length,
    showTotal: (total: number) => `共计 ${total} 个`,
    defaultPageSize: 20,
    defaultCurrent: 1,
    current,
    pageSize,
    onChange: (page, pageSize) => {
      setCurrent(page)
      setPageSize(pageSize)
    },
  }

  return (
    <Table
      dataSource={filteredApis}
      columns={columns as ColumnsType<ApiConfig>}
      rowKey="id"
      pagination={pagination}
      rowSelection={rowSelection}
      scroll={{ y: "calc(100vh - 400px)" }}
      size="small"
      rowClassName={(record) =>
        record.id === highlightApiId
          ? "highlight-row bg-yellow-100 transition-colors duration-500"
          : ""
      }
      onRow={(record) =>
        ({
          "data-api-id": record.id,
        } as React.HTMLAttributes<HTMLTableRowElement>)
      }
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
