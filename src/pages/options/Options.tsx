import React, { useState } from "react"
import { useMount, useRequest } from "ahooks"
import { Layout, Button, message, Row, AutoComplete } from "antd"
import { ArrowLeftOutlined, PlusOutlined } from "@ant-design/icons"
import { ModuleConfig, ApiConfig } from "../../types"
import { ChromeApiService, generateId } from "../../utils/chromeApi"
import ModuleTabs from "./components/ModuleTabs"
import ApiTable from "./components/listTable/ApiTable"
import "antd/dist/reset.css"
import "../../assets/styles/tailwind.css"
import "./Options.css"
import NavButtons from "./components/navButtons/NavButtons"
import { useActiveModuleIdStore, useConfigStore } from "@src/store"
import { saveConfig } from "@src/utils/configUtil"
import OperateButtons from "./components/operateButtons/OperateButtons"

const { Content } = Layout

export default function Options() {
  const { activeModuleId, setActiveModuleId } = useActiveModuleIdStore()
  const [searchKeyword, setSearchKeyword] = useState("")

  const [migrateModalVisible, setMigrateModalVisible] = useState(false)
  const [migratingApi, setMigratingApi] = useState<ApiConfig | null>(null)

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

  // 添加模块
  const handleAddModule = () => {
    const newModule: ModuleConfig = {
      id: generateId(),
      apiDocKey: `module_${Date.now()}`,
      label: `新模块_${Date.now()}`,
      apiArr: [],
    }

    const newConfig = {
      ...config,
      modules: [...config.modules, newModule],
    }

    setConfig(newConfig)
    saveConfig(newConfig)
    setActiveModuleId(newModule.id)
  }

  // 编辑模块
  const handleEditModule = (moduleId: string, newName: string) => {
    const newConfig = {
      ...config,
      modules: config.modules.map((module) =>
        module.id === moduleId
          ? { ...module, label: newName, apiDocKey: newName }
          : module
      ),
    }
    setConfig(newConfig)
    saveConfig(newConfig)
  }

  // 删除模块
  const handleDeleteModule = (moduleId: string) => {
    const newConfig = {
      ...config,
      modules: config.modules.filter((module) => module.id !== moduleId),
    }
    setConfig(newConfig)
    saveConfig(newConfig)

    if (activeModuleId === moduleId) {
      const remainingModules = newConfig.modules
      setActiveModuleId(
        remainingModules.length > 0 ? remainingModules[0].id : ""
      )
    }
  }

  const activeModule = config.modules.find(
    (module) => module.id === activeModuleId
  )

  // 获取所有API数据用于搜索
  const getAllApis = () => {
    const allApis: (ApiConfig & { moduleId: string; moduleName: string })[] = []
    config.modules.forEach((module) => {
      module.apiArr.forEach((api) => {
        allApis.push({
          ...api,
          moduleId: module.id,
          moduleName: module.label,
        })
      })
    })
    return allApis
  }

  // 处理搜索结果选择
  const handleSearchResultClick = (
    api: ApiConfig & { moduleId: string; moduleName: string }
  ) => {
    setActiveModuleId(api.moduleId)
    setSearchKeyword("")
    // 滚动到对应API
    setTimeout(() => {
      const element = document.querySelector(`[data-api-id="${api.id}"]`)
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }, 100)
  }

  // 自定义筛选函数
  const filterOption = (inputValue: string, option: any) => {
    const searchText = inputValue.toLowerCase()
    const api = option.api as ApiConfig & {
      moduleId: string
      moduleName: string
    }

    return (
      api.apiName.toLowerCase().includes(searchText) ||
      api.apiUrl.toLowerCase().includes(searchText) ||
      api.redirectURL.toLowerCase().includes(searchText) ||
      api.moduleName.toLowerCase().includes(searchText)
    )
  }

  return (
    <div className="proxy-tool">
      <Layout className="h-screen">
        {/* 顶部导航栏 */}
        <div className="bg-gray-800 px-6 py-4 flex items-center justify-between h-[64px] min-h-[64px]">
          <div className="flex items-center space-x-6">
            <ArrowLeftOutlined
              className="cursor-pointer text-lg"
              style={{ color: "white" }}
            />
          </div>
          <div className="flex items-center space-x-6">
            <AutoComplete
              allowClear
              placeholder="全局搜索:接口名字、接口地址、模块名称"
              onSelect={(value, option) => {
                if (option && option.api) {
                  handleSearchResultClick(option.api)
                }
              }}
              size="large"
              className="w-[650px]"
              filterOption={filterOption}
              notFoundContent="未找到匹配的接口"
              options={getAllApis().map((api) => ({
                value: api.apiUrl,
                label: (
                  <div className="py-2">
                    <div className="font-medium text-sm">{api.apiName}</div>
                    <div className="text-xs text-gray-500 truncate">
                      {api.apiUrl}
                    </div>
                    <div className="text-xs text-blue-500">
                      模块: {api.moduleName}
                    </div>
                  </div>
                ),
                api: api,
              }))}
            />
          </div>
          <NavButtons />
        </div>

        {/* 模块标签页区域 */}
        <div className="bg-gray-100 px-6 py-3 border-b border-gray-200">
          <ModuleTabs
            modules={config.modules}
            activeModuleId={activeModuleId}
            onModuleChange={setActiveModuleId}
            onAddModule={handleAddModule}
            onDeleteModule={handleDeleteModule}
            onEditModule={handleEditModule}
          />
        </div>

        {/* 分组操作栏 */}
        <OperateButtons />

        {/* 主要内容区域 */}
        <Content className="flex-1 overflow-hidden">
          <ApiTable
            apis={activeModule?.apiArr || []}
            searchKeyword={searchKeyword}
            onToggleApi={handleToggleApi}
            onToggleAllApis={handleToggleAllApis}
          />
        </Content>
      </Layout>
    </div>
  )
}
