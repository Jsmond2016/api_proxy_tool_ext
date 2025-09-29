import React from "react"
import { useMount, useRequest } from "ahooks"
import { Layout, message, ConfigProvider } from "antd"
import { ChromeApiService } from "../../utils/chromeApi"
import ModuleTabs from "./components/ModuleTabs"
import ApiTable from "./components/listTable/ApiTable"
import "antd/dist/reset.css"
import "../../assets/styles/tailwind.css"
import "./Options.css"
import NavButtons from "./components/navButtons/NavButtons"
import { useActiveModuleIdStore, useConfigStore } from "@src/store"
import OperateButtons from "./components/operateButtons/OperateButtons"
import SearchSelect from "./components/SearchSelect"
import zhCN from "antd/locale/zh_CN"

const { Content } = Layout

export default function Options() {
  const { activeModuleId, setActiveModuleId } = useActiveModuleIdStore()

  const { config, setConfig } = useConfigStore()

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

  return (
    <ConfigProvider locale={zhCN}>
      <div className="proxy-tool">
        <Layout className="h-screen">
          {/* 顶部导航栏 */}
          <div className="bg-gray-800 px-6 py-4 flex items-center justify-between h-[64px] min-h-[64px]">
            <SearchSelect />
            <NavButtons />
          </div>

          {/* 模块标签页区域 */}
          <ModuleTabs
            modules={config.modules}
            onModuleChange={setActiveModuleId}
          />
          {/* 分组操作栏 */}
          <OperateButtons />
          {/* 主要内容区域 */}
          <Content className="flex-1 overflow-hidden">
            <ApiTable />
          </Content>
        </Layout>
      </div>
    </ConfigProvider>
  )
}
