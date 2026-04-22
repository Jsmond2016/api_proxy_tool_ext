import React, { useEffect, useState } from "react"
import { Button, ConfigProvider, Switch, Typography, message } from "antd"
import { ApiOutlined, SettingOutlined } from "@ant-design/icons"
import zhCN from "antd/locale/zh_CN"
import { ChromeApiService } from "@src/utils/chromeApi"
import { GlobalConfig } from "@src/types"
import "antd/dist/reset.css"
import "@src/assets/styles/tailwind.css"

const { Text, Title } = Typography

export default function Popup() {
  const [config, setConfig] = useState<GlobalConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const configData = await ChromeApiService.getConfig()
        setConfig(configData)
      } catch (error) {
        message.error("加载配置失败")
        console.error("Load popup config error:", error)
      } finally {
        setLoading(false)
      }
    }

    loadConfig()
  }, [])

  const handleToggleGlobal = async (enabled: boolean) => {
    if (!config) return

    setToggling(true)
    const nextConfig = { ...config, isGlobalEnabled: enabled }

    try {
      setConfig(nextConfig)
      const saved = await ChromeApiService.updateConfig(nextConfig)
      if (!saved) {
        throw new Error("Failed to save config")
      }

      const iconUpdated = await ChromeApiService.updateIcon(enabled)
      if (!iconUpdated) {
        throw new Error("Failed to update icon")
      }

      message.success(enabled ? "已开启全局 Mock" : "已关闭全局 Mock")
    } catch (error) {
      setConfig(config)
      message.error("切换失败")
      console.error("Toggle popup mock error:", error)
    } finally {
      setToggling(false)
    }
  }

  const handleOpenOptions = async () => {
    try {
      const [activeTab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      })
      const optionsUrl = new URL(
        chrome.runtime.getURL("src/pages/options/index.html")
      )

      if (activeTab?.id !== undefined) {
        optionsUrl.searchParams.set("sourceTabId", String(activeTab.id))
      }

      await chrome.tabs.create({
        url: optionsUrl.toString(),
      })
      window.close()
    } catch (error) {
      message.error("打开配置页失败")
      console.error("Open options page error:", error)
    }
  }

  const enabledApiCount =
    config?.modules.reduce(
      (count, module) =>
        count + module.apiArr.filter((api) => api.isOpen).length,
      0
    ) ?? 0

  return (
    <ConfigProvider locale={zhCN}>
      <div className="w-[280px] bg-white p-3 text-slate-900">
        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center gap-3 px-3 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-[0_8px_20px_rgba(16,185,129,0.24)]">
              <ApiOutlined className="text-base" />
            </div>
            <div className="min-w-0">
              <Title level={5} className="!mb-0 !text-sm">
                API Proxy Tool
              </Title>
              <Text type="secondary" className="text-xs">
                快速切换全局 Mock 状态
              </Text>
            </div>
          </div>

          <div className="border-t border-slate-200" />

          <div className="flex items-center justify-between px-3 py-3">
            <div className="text-sm font-semibold text-slate-900">
              全局 Mock 开关
            </div>
            <Switch
              checked={config?.isGlobalEnabled ?? false}
              loading={loading || toggling}
              disabled={loading || toggling || !config}
              onChange={handleToggleGlobal}
              checkedChildren="开启"
              unCheckedChildren="关闭"
            />
          </div>

          <div className="border-t border-slate-200 px-3 py-2">
            <Text type="secondary" className="text-xs">
              <span className="font-semibold text-slate-900">
                {config?.modules.length ?? 0}
              </span>{" "}
              个模块，
              <span className="font-semibold text-slate-900">
                {enabledApiCount}
              </span>{" "}
              个接口已启用
            </Text>
          </div>

          <div className="border-t border-slate-200 p-2">
            <Button
              type="text"
              block
              className="!h-9 !justify-start !px-2 !text-blue-600 hover:!text-blue-700"
              icon={<SettingOutlined className="!text-blue-600" />}
              onClick={handleOpenOptions}
            >
              打开配置页
            </Button>
          </div>
        </div>
      </div>
    </ConfigProvider>
  )
}
