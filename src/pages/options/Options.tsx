import React, { useMemo } from "react"
import { useMount, useRequest } from "ahooks"
import { Layout, message, ConfigProvider, Typography, Button, Tooltip } from "antd"
import { ArrowLeftOutlined } from "@ant-design/icons"
import { ChromeApiService } from "../../utils/chromeApi"
import ModuleTabs from "./components/ModuleTabs"
import ApiTable from "./components/listTable/ApiTable"
import ModuleInfoBar from "./components/ModuleInfoBar"
import "antd/dist/reset.css"
import "../../assets/styles/tailwind.css"
import "./Options.css"
import NavButtons from "./components/navButtons/NavButtons"
import { useActiveModuleIdStore, useConfigStore } from "@src/store"
import OperateButtons from "./components/operateButtons/OperateButtons"
import SearchSelect from "./components/SearchSelect"
import zhCN from "antd/locale/zh_CN"
import packageJson from "../../../package.json"

const { Content, Footer } = Layout
const { Text } = Typography

export default function Options() {
  const { activeModuleId, setActiveModuleId } = useActiveModuleIdStore()

  const { config, setConfig } = useConfigStore()
  const sourceTabId = useMemo(() => {
    const params = new URLSearchParams(window.location.search)
    const tabId = params.get("sourceTabId")
    if (!tabId) return null

    const parsedTabId = Number(tabId)
    return Number.isInteger(parsedTabId) ? parsedTabId : null
  }, [])

  // 加载配置
  const { run: loadConfig } = useRequest(
    async () => {
      const configData = await ChromeApiService.getConfig()
      setConfig(configData)
      if (configData.modules.length > 0 && !activeModuleId) {
        setActiveModuleId(configData.modules[0].id)
      }
      return configData
    },
    {
      manual: true,
      onError: (error) => {
        message.error("加载配置失败")
        console.error("Load config error:", error)
      },
    }
  )

  useMount(() => {
    loadConfig()
  })

  // 获取当前激活的模块
  const activeModule = config.modules.find(
    (module) => module.id === activeModuleId
  )

  const handleBackToSourceTab = async () => {
    if (sourceTabId === null) {
      return
    }

    try {
      await chrome.tabs.update(sourceTabId, { active: true })
      const currentTab = await chrome.tabs.getCurrent()
      if (currentTab?.id !== undefined) {
        await chrome.tabs.remove(currentTab.id)
      }
    } catch (error) {
      message.error("无法返回原页面，原标签页可能已关闭")
      console.error("Back to source tab error:", error)
    }
  }

  return (
    <ConfigProvider locale={zhCN}>
      <div className="proxy-tool">
        <Layout className="h-screen">
          {/* 顶部导航栏 */}
          <div className="bg-gray-800 px-6 py-4 flex items-center justify-between h-[64px] min-h-[64px]">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              {sourceTabId !== null ? (
                <Tooltip title="返回来源页面">
                  <Button
                    type="text"
                    icon={<ArrowLeftOutlined />}
                    className="!flex !h-10 !w-10 !items-center !justify-center !border-0 !text-white hover:!text-white hover:!bg-white/10"
                    onClick={handleBackToSourceTab}
                  />
                </Tooltip>
              ) : null}
              <div className="min-w-0 max-w-[650px] flex-1">
                <SearchSelect />
              </div>
            </div>
            <NavButtons />
          </div>

          {/* 模块标签页区域 */}
          <ModuleTabs
            modules={config.modules}
            onModuleChange={setActiveModuleId}
          />
          {/* 模块信息栏 */}
          <ModuleInfoBar activeModule={activeModule} config={config} />
          {/* 分组操作栏 */}
          <OperateButtons />
          {/* 主要内容区域 */}
          <Content className="flex-1 overflow-hidden">
            <ApiTable />
          </Content>

          {/* 页脚 */}
          <Footer className="bg-gray-50 border-t border-gray-200 px-6 py-3 text-center">
            <Text type="secondary" className="text-sm">
              <a
                href="https://github.com/Jsmond2016/api_proxy_tool_ext"
                target="_blank"
                rel="noreferrer"
              >
                Api Proxy Tool
              </a>{" "}
              | current version:{" "}
              <a href="https://github.com/Jsmond2016/api_proxy_tool_ext/releases">
                v{packageJson.version}
              </a>{" "}
              | Author: Jsmond2016
            </Text>
          </Footer>
        </Layout>
      </div>
    </ConfigProvider>
  )
}
