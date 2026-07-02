import React, { useState, useMemo, useEffect } from "react"
import {
  Table,
  Switch,
  Space,
  Tag,
  Typography,
  message,
  PaginationProps,
  Dropdown,
  MenuProps,
  Input,
} from "antd"
import { DownOutlined, CopyOutlined } from "@ant-design/icons"

import { ApiConfig } from "@src/types"
import { getApifoxProjectId } from "../navButtons/syncApifoxModalButton/apifoxUtils"
import "antd/dist/reset.css"
import "@src/assets/styles/tailwind.css"
import EditFormButton from "../operateButtons/editFormButton/EditFormButton"
import CloneButton from "./cloneButon/CloneButton"
import MigrateButton from "./migrateButton/MigrateButton"
import DeleteButton from "./deleteButton/DeleteButton"
import TestButton from "./testButton/TestButton"
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
import { ALL_APIS_TAB_ID } from "@src/constant/constant"

const { Paragraph } = Typography

const copyText = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    message.success("复制成功")
  })
}

export default function ApiTable() {
  const { searchKeyword } = useSearchKeywordStore()
  const { config, setConfig } = useConfigStore()
  const { activeModuleId } = useActiveModuleIdStore()
  const { selectedApiIds, setSelectedApiIds } = useSelectedApiStore()
  const { highlightApiId, setHighlightApiId } = useHighlightApiStore()

  const [current, setCurrent] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [localSearchKeyword, setLocalSearchKeyword] = useState("")

  const isAllApisTab = activeModuleId === ALL_APIS_TAB_ID

  // 切换离开全部接口 tab 时清空本地搜索
  useEffect(() => {
    if (!isAllApisTab) setLocalSearchKeyword("")
  }, [isAllApisTab])

  const activeModule = config.modules.find(
    (module) => module.id === activeModuleId,
  )

  // 全部接口 tab 下：所有模块已开启的接口 + 接口所属模块名 map
  const apiModuleMap = useMemo<Map<string, string>>(() => {
    if (!isAllApisTab) return new Map()
    const map = new Map<string, string>()
    config.modules.forEach((module) => {
      module.apiArr.forEach((api) => {
        map.set(api.id, module.label)
      })
    })
    return map
  }, [isAllApisTab, config.modules])

  const baseApis = useMemo(() => {
    if (isAllApisTab) {
      const all = config.modules.flatMap((module) => module.apiArr)
      // 开启的接口排前面，关闭的排后面
      return [...all].sort((a, b) => Number(b.isOpen) - Number(a.isOpen))
    }
    return activeModule?.apiArr || []
  }, [isAllApisTab, config.modules, activeModule])

  // 全部接口 tab 用本地搜索关键词，其他 tab 用全局关键词
  const activeKeyword = isAllApisTab ? localSearchKeyword : searchKeyword

  // 过滤API数据
  const filteredApis = baseApis.filter((api) => {
    if (!activeKeyword) return true
    const keyword = activeKeyword.toLowerCase()
    return (
      api.apiName.toLowerCase().includes(keyword) ||
      api.apiUrl.toLowerCase().includes(keyword) ||
      api.redirectURL.toLowerCase().includes(keyword) ||
      (api.pageRoute && api.pageRoute.toLowerCase().includes(keyword))
    )
  })

  // 检查是否所有API都已开启
  const allApisEnabled =
    filteredApis.length > 0 && filteredApis.every((api) => api.isOpen)
  const someApisEnabled = filteredApis.some((api) => api.isOpen)

  const projectId = useMemo(() => {
    return getApifoxProjectId(config.apifoxConfig)
  }, [config.apifoxConfig])

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
        `[data-api-id="${highlightApiId}"]`,
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
            api.id === apiId ? { ...api, isOpen: enabled } : api,
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
    try {
      const currentConfig = useConfigStore.getState().config

      let newConfig
      if (isAllApisTab) {
        // 全部接口 tab：对当前展示的所有接口跨模块批量切换
        const shownApiIds = new Set(filteredApis.map((api) => api.id))
        newConfig = {
          ...currentConfig,
          modules: currentConfig.modules.map((module) => ({
            ...module,
            apiArr: module.apiArr.map((api) =>
              shownApiIds.has(api.id) ? { ...api, isOpen: enabled } : api,
            ),
          })),
        }
      } else {
        if (!activeModule) return
        newConfig = {
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
              : module,
          ),
        }
      }

      setConfig(newConfig)
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
      width: 60,
      render: (_, __: ApiConfig, index: number) =>
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
      render: (_, record: ApiConfig) => (
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
      width: 120,
      render: (_, record: ApiConfig) => (
        <Space>
          <Tag color={getMethodColor(record.method)}>
            {record.method.toUpperCase()}
          </Tag>
          <TestButton apiConfig={record} getMethodColor={getMethodColor} />
        </Space>
      ),
    },
    {
      title: "接口信息",
      dataIndex: "apiName",
      width: 280,
      render: (_, record: ApiConfig) => {
        const directLink = record.link?.trim()
        const isApifoxId = /^\d+$/.test(record.id)
        const fallbackLink =
          projectId && isApifoxId
            ? `https://app.apifox.com/project/${projectId}/apis/api-${record.id}`
            : ""
        const apiLink = directLink || fallbackLink

        return (
          <Space orientation="vertical" size="small" className="w-full">
            {/* 接口名称 */}
            <div className="text-base font-semibold text-gray-900">
              {apiLink ? (
                <a
                  href={apiLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors"
                  title="点击跳转到 Apifox Web 版"
                  onClick={(e) => e.stopPropagation()}
                >
                  {record.apiName}
                </a>
              ) : (
                <span>{record.apiName}</span>
              )}
            </div>
            {/* 接口 URL */}
            <div className="text-sm flex items-start gap-1">
              <CopyOutlined
                className="cursor-pointer !text-blue-600 hover:!text-blue-800 text-xs mt-1"
                onClick={(e) => {
                  e.stopPropagation()
                  copyText(record.apiUrl.replace(/^\/api\/saas\/v1/, ""))
                }}
              />
              <Paragraph type="secondary" className="mb-0 text-sm">
                <span className="text-gray-500">接口地址：</span>
                {record.apiUrl}
              </Paragraph>
            </div>
            {/* Mock 接口 URL */}
            <div className="text-sm flex items-start gap-1">
              <CopyOutlined
                className="cursor-pointer !text-blue-600 hover:!text-blue-800 text-xs mt-1"
                onClick={(e) => {
                  e.stopPropagation()
                  copyText(record.redirectURL)
                }}
              />
              <Paragraph type="danger" className="mb-0 text-sm">
                <span className="text-gray-500">Mock URL：</span>
                {record.redirectURL}
              </Paragraph>
            </div>
          </Space>
        )
      },
    },
    ...(isAllApisTab
      ? [
          {
            title: "所属模块",
            dataIndex: "id" as keyof ApiConfig,
            width: 120,
            render: (_: unknown, record: ApiConfig) =>
              apiModuleMap.get(record.id) || "-",
          },
        ]
      : []),
    {
      title: "权限点",
      dataIndex: "authPointKey",
      width: 100,
      // 当没有权限点的时候，显示 '-',若有，则可以复制
      render: (v: string | undefined) =>
        isNotEmpty(v) ? (
          <div className="flex items-start gap-1">
            <CopyOutlined
              className="cursor-pointer !text-blue-600 hover:!text-blue-800 text-xs mt-1"
              onClick={(e) => {
                e.stopPropagation()
                copyText(v as string)
              }}
            />
            <Paragraph type="secondary" className="mb-0">
              {v}
            </Paragraph>
          </div>
        ) : (
          "-"
        ),
    },
    {
      title: "页面路由",
      dataIndex: "pageRoute",
      width: 150,
      render: (v: string | undefined) => {
        if (!isNotEmpty(v)) {
          return "-"
        }
        // 判断是否为完整 URL，如果是则直接跳转，否则作为相对路径处理
        const urlValue = v as string // 已经通过 isNotEmpty 检查，可以安全断言
        const isFullUrl = /^https?:\/\//.test(urlValue)
        const href = isFullUrl
          ? urlValue
          : urlValue.startsWith("/")
            ? urlValue
            : `/${urlValue}`

        return (
          <a
            href={href}
            target={isFullUrl ? "_blank" : undefined}
            rel={isFullUrl ? "noopener noreferrer" : undefined}
            className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors"
            title="点击跳转到页面"
            onClick={(e) => {
              // 如果是相对路径，阻止默认行为，使用浏览器导航
              if (!isFullUrl) {
                e.preventDefault()
                // 获取当前页面的域名，构建完整 URL
                const currentOrigin = window.location.origin
                window.open(`${currentOrigin}${href}`, "_blank")
              }
            }}
          >
            {v}
          </a>
        )
      },
    },
    {
      title: "代理设置",
      dataIndex: "filterType",
      width: 100,
      render: (_, record: ApiConfig) => (
        <Space orientation="vertical">
          <div>
            <span>匹配方式：</span>
            <Tag color="blue">{record.filterType}</Tag>
          </div>
        </Space>
      ),
    },

    {
      title: "操作",
      width: 200,
      render: (_: unknown, record: ApiConfig) => {
        const items: MenuProps["items"] = [
          {
            key: "clone",
            label: <CloneButton apiId={record.id} isMenuItem />,
          },
          {
            key: "migrate",
            label: <MigrateButton apiId={record.id} isMenuItem />,
          },
          {
            key: "delete",
            label: <DeleteButton apiId={record.id} isMenuItem />,
          },
        ]

        return (
          <Space>
            <EditFormButton apiId={record.id} />
            <Dropdown menu={{ items }} trigger={["hover"]}>
              <a onClick={(e) => e.preventDefault()}>
                <Space size={4}>
                  其他操作
                  <DownOutlined />
                </Space>
              </a>
            </Dropdown>
          </Space>
        )
      },
    },
  ]

  const pagination: PaginationProps = {
    total: filteredApis.length,
    showTotal: (total: number) => `共计 ${total} 个`,
    current,
    pageSize,
    pageSizeOptions: [10, 20, 30, 50, 100],
    showSizeChanger: true,
    onChange: (page, size) => {
      setCurrent(page)
      setPageSize(size)
    },
  }

  return (
    <div className="px-4">
      {isAllApisTab && (
        <div className="mb-3">
          <Input.Search
            allowClear
            placeholder="搜索接口名称、URL、Mock 地址"
            value={localSearchKeyword}
            onChange={(e) => {
              setLocalSearchKeyword(e.target.value)
              setCurrent(1)
            }}
            onSearch={(val) => {
              setLocalSearchKeyword(val)
              setCurrent(1)
            }}
            style={{ maxWidth: 400 }}
          />
        </div>
      )}
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
          }) as React.HTMLAttributes<HTMLTableRowElement>
        }
      />
    </div>
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
