import React, { useState } from "react"
import { useMount, useAsyncEffect, useRequest, useUpdateEffect } from "ahooks"
import {
  Layout,
  Button,
  Switch,
  Space,
  message,
  Row,
  Modal,
  AutoComplete,
} from "antd"
import {
  ArrowLeftOutlined,
  PlusOutlined,
  ImportOutlined,
  ExportOutlined,
  SyncOutlined,
} from "@ant-design/icons"
import {
  GlobalConfig,
  ModuleConfig,
  ApiConfig,
} from "../../types"
import {
  ChromeApiService,
  generateId,
  isModuleLabelDuplicate,
  isApiUrlDuplicate,
} from "../../utils/chromeApi"
import {
  transformImportDataToModuleConfig,
  transformModuleConfigToExportData,
  ImportModuleData,
} from "../../utils/dataProcessor"
import ModuleTabs from "./components/ModuleTabs"
import ApiTable from "./components/ApiTable"
import ApiFormDrawer from "./components/ApiFormDrawer"
import ImportModal from "./components/ImportModal"
import MigrateApiModal from "./components/MigrateApiModal"
import SyncApifoxModal from "./components/SyncApifoxModal"
import "antd/dist/reset.css"
import "../../assets/styles/tailwind.css"
import "./Options.css"
import { DefaultMockApiModule } from "@src/constant/constant"

const { Content } = Layout

export default function Options() {
  const [config, setConfig] = useState<GlobalConfig>({
    isGlobalEnabled: false,
    modules: [],
  })
  const [activeModuleId, setActiveModuleId] = useState<string>("")
  const [searchKeyword, setSearchKeyword] = useState("")
  const [apiFormVisible, setApiFormVisible] = useState(false)
  const [editingApi, setEditingApi] = useState<ApiConfig | null>(null)
  const [importModalVisible, setImportModalVisible] = useState(false)
  const [migrateModalVisible, setMigrateModalVisible] = useState(false)
  const [migratingApi, setMigratingApi] = useState<ApiConfig | null>(null)
  const [syncApifoxModalVisible, setSyncApifoxModalVisible] = useState(false)

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

  // 保存配置到background script
  const saveConfig = async (newConfig: GlobalConfig) => {
    try {
      await ChromeApiService.updateConfig(newConfig)
    } catch (error) {
      message.error("保存配置失败")
      console.error("Save config error:", error)
    }
  }

  // 切换全局开关
  const handleToggleGlobal = async (enabled: boolean) => {
    try {
      await ChromeApiService.toggleGlobal(enabled)
      setConfig((prev) => ({ ...prev, isGlobalEnabled: enabled }))
      message.success(enabled ? "已开启全局代理" : "已关闭全局代理")
    } catch (error) {
      message.error("操作失败")
      console.error("Toggle global error:", error)
    }
  }

  // 切换API开关
  const handleToggleApi = async (apiId: string, enabled: boolean) => {
    try {
      await ChromeApiService.toggleApi(apiId, enabled)
      setConfig((prev) => ({
        ...prev,
        modules: prev.modules.map((module) => ({
          ...module,
          apiArr: module.apiArr.map((api) =>
            api.id === apiId ? { ...api, isOpen: enabled } : api
          ),
        })),
      }))
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

  // 添加API
  const handleAddApi = (apiData: Omit<ApiConfig, "id">) => {
    const newApi: ApiConfig = {
      ...apiData,
      id: generateId(),
    }

    const newConfig = {
      ...config,
      modules: config.modules.map((module) =>
        module.id === activeModuleId
          ? { ...module, apiArr: [...module.apiArr, newApi] }
          : module
      ),
    }

    setConfig(newConfig)
    saveConfig(newConfig)
    setApiFormVisible(false)
  }

  // 编辑API
  const handleEditApi = (apiId: string) => {
    const api = config.modules
      .flatMap((module) => module.apiArr)
      .find((api) => api.id === apiId)

    if (api) {
      setEditingApi(api)
      setApiFormVisible(true)
    }
  }

  // 更新API
  const handleUpdateApi = (apiData: Omit<ApiConfig, "id">) => {
    if (!editingApi) return

    const newConfig = {
      ...config,
      modules: config.modules.map((module) => ({
        ...module,
        apiArr: module.apiArr.map((api) =>
          api.id === editingApi.id ? { ...api, ...apiData } : api
        ),
      })),
    }

    setConfig(newConfig)
    saveConfig(newConfig)
    setApiFormVisible(false)
    setEditingApi(null)
  }

  // 统一的API表单处理
  const handleApiFormOk = (apiData: Omit<ApiConfig, "id">) => {
    if (editingApi) {
      handleUpdateApi(apiData)
    } else {
      handleAddApi(apiData)
    }
  }

  // 克隆API
  const handleCloneApi = (apiId: string) => {
    const api = config.modules
      .flatMap((module) => module.apiArr)
      .find((api) => api.id === apiId)

    if (api) {
      const clonedApi: ApiConfig = {
        ...api,
        id: generateId(),
        apiName: `${api.apiName}_副本`,
      }

      const newConfig = {
        ...config,
        modules: config.modules.map((module) =>
          module.id === activeModuleId
            ? { ...module, apiArr: [...module.apiArr, clonedApi] }
            : module
        ),
      }

      setConfig(newConfig)
      saveConfig(newConfig)
    }
  }

  // 删除API
  const handleDeleteApi = (apiId: string) => {
    const newConfig = {
      ...config,
      modules: config.modules.map((module) => ({
        ...module,
        apiArr: module.apiArr.filter((api) => api.id !== apiId),
      })),
    }
    setConfig(newConfig)
    saveConfig(newConfig)
  }

  // 迁移API
  const handleMigrateApi = (apiId: string) => {
    const api = config.modules
      .flatMap((module) => module.apiArr)
      .find((api) => api.id === apiId)

    if (api) {
      setMigratingApi(api)
      setMigrateModalVisible(true)
    }
  }

  // 确认迁移API
  const handleConfirmMigrateApi = (targetModuleId: string) => {
    if (!migratingApi) return

    const newConfig = {
      ...config,
      modules: config.modules.map((module) => {
        if (module.id === activeModuleId) {
          // 从当前模块移除API
          return {
            ...module,
            apiArr: module.apiArr.filter((api) => api.id !== migratingApi.id),
          }
        } else if (module.id === targetModuleId) {
          // 添加到目标模块
          return {
            ...module,
            apiArr: [...module.apiArr, migratingApi],
          }
        }
        return module
      }),
    }

    setConfig(newConfig)
    saveConfig(newConfig)
    setMigrateModalVisible(false)
    setMigratingApi(null)
    message.success("接口迁移成功")
  }

  // 重置模块
  const handleResetModule = (moduleId: string) => {
    const newConfig = {
      ...config,
      modules: config.modules.map((module) =>
        module.id === moduleId ? { ...module, apiArr: [] } : module
      ),
    }
    setConfig(newConfig)
    saveConfig(newConfig)
  }

  // 全局重置 - 还原示例数据
  const handleResetAll = () => {
    const newConfig = {
      isGlobalEnabled: false,
      modules: DefaultMockApiModule,
    }
    setConfig(newConfig as GlobalConfig)
    saveConfig(newConfig as GlobalConfig)
    setActiveModuleId("default-module")
  }

  // 导入配置
  const handleImport = (importData: ImportModuleData[]) => {
    try {
      console.log("开始导入数据:", importData)

      const duplicateModules: string[] = []
      const duplicateApis: string[] = []

      // 使用工具函数转换数据
      const newModules: ModuleConfig[] =
        transformImportDataToModuleConfig(importData)

      // 检查重复项
      newModules.forEach((module) => {
        // 检查模块标签是否重复
        if (isModuleLabelDuplicate(config.modules, module.label)) {
          duplicateModules.push(module.label)
        }

        // 检查API URL是否重复
        module.apiArr.forEach((api) => {
          if (isApiUrlDuplicate(config.modules, api.apiUrl)) {
            duplicateApis.push(`${api.apiName} (${api.apiUrl})`)
          }
        })
      })

      // 显示重复项警告
      if (duplicateModules.length > 0 || duplicateApis.length > 0) {
        let warningMessage = "发现重复项：\n"
        if (duplicateModules.length > 0) {
          warningMessage += `重复的模块: ${duplicateModules.join(", ")}\n`
        }
        if (duplicateApis.length > 0) {
          warningMessage += `重复的接口: ${duplicateApis.join(", ")}\n`
        }
        warningMessage += "这些重复项将被跳过，是否继续导入？"

        Modal.confirm({
          title: "发现重复项",
          content: warningMessage,
          onOk() {
            // 继续导入
            performImport(newModules)
          },
          onCancel() {
            // 取消导入
          },
        })
        return
      }

      // 没有重复项，直接导入
      performImport(newModules)
    } catch (error) {
      console.error("导入失败:", error)
      message.error(
        `导入失败: ${error instanceof Error ? error.message : "未知错误"}`
      )
    }
  }

  // 执行导入操作
  const performImport = (newModules: ModuleConfig[]) => {
    console.log("转换后的模块:", newModules)

    const newConfig = {
      ...config,
      modules: [...config.modules, ...newModules],
    }

    setConfig(newConfig)
    saveConfig(newConfig)

    if (newModules.length > 0) {
      setActiveModuleId(newModules[0].id)
    }

    message.success(`成功导入 ${newModules.length} 个模块`)
  }

  // 导出配置
  const handleExport = () => {
    // 使用工具函数转换数据
    const exportData = transformModuleConfigToExportData(config.modules)

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `proxy-config-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
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

  // 处理同步Apifox接口
  const handleSyncApifox = (newModules: ModuleConfig[]) => {
    try {
      const duplicateModules: string[] = []
      const duplicateApis: string[] = []

      // 检查模块标签是否重复
      newModules.forEach((module) => {
        if (isModuleLabelDuplicate(config.modules, module.label)) {
          duplicateModules.push(module.label)
        }

        // 检查API URL是否重复
        module.apiArr.forEach((api) => {
          if (isApiUrlDuplicate(config.modules, api.apiUrl)) {
            duplicateApis.push(`${api.apiName} (${api.apiUrl})`)
          }
        })
      })

      // 显示重复项警告
      if (duplicateModules.length > 0 || duplicateApis.length > 0) {
        let warningMessage = "发现重复项：\n"
        if (duplicateModules.length > 0) {
          warningMessage += `重复的模块: ${duplicateModules.join(", ")}\n`
        }
        if (duplicateApis.length > 0) {
          warningMessage += `重复的接口: ${duplicateApis.join(", ")}\n`
        }
        warningMessage += "这些重复项将被跳过，是否继续同步？"

        Modal.confirm({
          title: "发现重复项",
          content: warningMessage,
          onOk() {
            // 继续同步
            performSync(newModules)
          },
          onCancel() {
            // 取消同步
          },
        })
        return
      }

      // 没有重复项，直接同步
      performSync(newModules)
    } catch (error) {
      console.error("同步失败:", error)
      message.error(
        `同步失败: ${error instanceof Error ? error.message : "未知错误"}`
      )
    }
  }

  // 执行同步操作
  const performSync = (newModules: ModuleConfig[]) => {
    const newConfig = {
      ...config,
      modules: [...config.modules, ...newModules],
    }

    setConfig(newConfig)
    saveConfig(newConfig)

    if (newModules.length > 0) {
      setActiveModuleId(newModules[0].id)
    }

    message.success(`成功同步 ${newModules.length} 个模块`)
    setSyncApifoxModalVisible(false)
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

  const isOnlyHaveDefaultMock =
    config.modules.length === 1 &&
    config.modules[0].label === "默认模块" &&
    config.modules[0].apiArr.length === 1

  const handlePreSyncApifox = () => {
    // 检查是否有模块-有 mock 数据，若有，提示：是否先导出所有 mock 接口进行备份？
    if (!isOnlyHaveDefaultMock) {
      Modal.confirm({
        title: "发现有模块有 mock 数据",
        content: (
          <Space direction="vertical">
            <div>
              发现有模块有 mock 数据, 无法直接同步 Apifox 接口，建议操作:{" "}
            </div>
            <Space direction="vertical">
              <div>1. 先导出所有 mock 接口进行备份</div>
              <div>2. 一键重置所有 mock 接口</div>
              <div>3. 同步 Apifox 接口</div>
            </Space>
          </Space>
        ),
      })
    } else {
      setSyncApifoxModalVisible(true)
    }
  }

  return (
    <div className="proxy-tool">
      <Layout className="h-screen">
        {/* 顶部导航栏 */}
        <div className="bg-gray-800 px-6 py-4 flex items-center justify-between h-[64px] min-h-[64px]">
          <div className="flex items-center space-x-6">
            <ArrowLeftOutlined className="text-white cursor-pointer text-lg" />
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
          <Space direction="horizontal">
            <span className="text-white text-sm">全局Mock开关</span>
            <Switch
              checked={config.isGlobalEnabled}
              onChange={handleToggleGlobal}
              size="default"
              checkedChildren="开启"
              unCheckedChildren="关闭"
            />
            <Button
              icon={<SyncOutlined />}
              type="primary"
              onClick={() => handlePreSyncApifox()}
            >
              同步 Apifox 接口
            </Button>
            <Button
              icon={<ImportOutlined />}
              type="primary"
              onClick={() => setImportModalVisible(true)}
            >
              导入
            </Button>
            <Button icon={<ExportOutlined />} onClick={handleExport}>
              导出
            </Button>
            <Button danger onClick={handleResetAll}>
              一键重置
            </Button>
          </Space>
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
        <Row justify="end">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingApi(null)
              setApiFormVisible(true)
            }}
            disabled={!activeModule}
          >
            添加
          </Button>
        </Row>

        {/* 主要内容区域 */}
        <Content className="flex-1 overflow-hidden">
          <ApiTable
            apis={activeModule?.apiArr || []}
            searchKeyword={searchKeyword}
            onToggleApi={handleToggleApi}
            onToggleAllApis={handleToggleAllApis}
            onDeleteApi={handleDeleteApi}
            onEditApi={handleEditApi}
            onCloneApi={handleCloneApi}
            onMigrateApi={handleMigrateApi}
          />
        </Content>
      </Layout>

      {/* 统一的API表单抽屉 */}
      <ApiFormDrawer
        visible={apiFormVisible}
        onClose={() => {
          setApiFormVisible(false)
          setEditingApi(null)
        }}
        onOk={handleApiFormOk}
        config={config}
        editingApi={editingApi}
        title={editingApi ? "编辑接口" : "添加接口"}
      />

      {/* 导入模态框 */}
      <ImportModal
        visible={importModalVisible}
        onCancel={() => setImportModalVisible(false)}
        onOk={(data) => handleImport(data as ImportModuleData[])}
      />

      {/* 迁移接口模态框 */}
      <MigrateApiModal
        visible={migrateModalVisible}
        onCancel={() => {
          setMigrateModalVisible(false)
          setMigratingApi(null)
        }}
        onOk={handleConfirmMigrateApi}
        api={migratingApi}
        modules={config.modules}
        currentModuleId={activeModuleId}
      />

      {/* 同步Apifox接口模态框 */}
      <SyncApifoxModal
        visible={syncApifoxModalVisible}
        onCancel={() => setSyncApifoxModalVisible(false)}
        onOk={handleSyncApifox}
        config={config}
      />
    </div>
  )
}
