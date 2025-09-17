import React, { useState, useEffect } from "react"
import {
  Layout,
  Tabs,
  Button,
  Switch,
  Input,
  Space,
  message,
  Drawer,
  Row,
  Select,
} from "antd"
import {
  ArrowLeftOutlined,
  SearchOutlined,
  PlusOutlined,
  ImportOutlined,
  ExportOutlined,
  SettingOutlined,
  MoreOutlined,
  ReloadOutlined,
  EditOutlined,
} from "@ant-design/icons"
import { GlobalConfig, ModuleConfig, ApiConfig } from "../../types"
import { ChromeApiService, generateId } from "../../utils/chromeApi"
import ModuleTabs from "./components/ModuleTabs"
import ApiTable from "./components/ApiTable"
import AddApiModal from "./components/AddApiModal"
import AddApiForm from "./components/AddApiForm"
import EditApiModal from "./components/EditApiModal"
import ImportModal from "./components/ImportModal"
import "antd/dist/reset.css"
import "../../assets/styles/tailwind.css"
import "./Options.css"

const { Header, Content } = Layout
const { Search } = Input

export default function Options() {
  const [config, setConfig] = useState<GlobalConfig>({
    isGlobalEnabled: false,
    modules: [],
  })
  const [activeModuleId, setActiveModuleId] = useState<string>("")
  const [searchKeyword, setSearchKeyword] = useState("")
  const [searchResults, setSearchResults] = useState<ApiConfig[]>([])
  const [addDrawerVisible, setAddDrawerVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editingApi, setEditingApi] = useState<ApiConfig | null>(null)
  const [importModalVisible, setImportModalVisible] = useState(false)
  const [loading, setLoading] = useState(false)

  // 加载配置
  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      setLoading(true)
      const configData = await ChromeApiService.getConfig()
      setConfig(configData)
      if (configData.modules.length > 0 && !activeModuleId) {
        setActiveModuleId(configData.modules[0].id)
      }
    } catch (error) {
      message.error("加载配置失败")
      console.error("Load config error:", error)
    } finally {
      setLoading(false)
    }
  }

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

  // 切换模块开关
  const handleToggleModule = async (moduleId: string, enabled: boolean) => {
    try {
      await ChromeApiService.toggleModule(moduleId, enabled)
      setConfig((prev) => ({
        ...prev,
        modules: prev.modules.map((module) =>
          module.id === moduleId
            ? {
                ...module,
                apiArr: module.apiArr.map((api) => ({
                  ...api,
                  isOpen: enabled,
                })),
              }
            : module
        ),
      }))
      message.success(enabled ? "已开启模块代理" : "已关闭模块代理")
    } catch (error) {
      message.error("操作失败")
      console.error("Toggle module error:", error)
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
    setAddDrawerVisible(false)
  }

  // 编辑API
  const handleEditApi = (apiId: string) => {
    const api = config.modules
      .flatMap((module) => module.apiArr)
      .find((api) => api.id === apiId)

    if (api) {
      setEditingApi(api)
      setEditModalVisible(true)
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
    setEditModalVisible(false)
    setEditingApi(null)
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
      modules: [
        {
          id: "default-module",
          apiDocKey: "default.module",
          label: "默认模块",
          apiDocUrl: "",
          dataWrapper: "",
          pageDomain: "",
          requestHeaders: "",
          apiArr: [
            {
              id: "example-api-1",
              apiKey: "/api/example",
              apiName: "示例接口",
              apiUrl: "http://localhost:3000/api/example",
              redirectURL: "http://127.0.0.1:4523/mock/api/example",
              method: "GET",
              filterType: "contains",
              delay: 0,
              isOpen: false,
              mockWay: "redirect",
              statusCode: 200,
              arrDepth: 4,
              arrLength: 3,
              mockResponseData: "",
              requestBody: "",
              requestHeaders: "",
            },
          ],
        },
      ],
    }
    setConfig(newConfig)
    saveConfig(newConfig)
    setActiveModuleId("default-module")
  }

  // 导入配置
  const handleImport = (importData: any[]) => {
    const newModules: ModuleConfig[] = importData.map((moduleData) => ({
      id: generateId(),
      apiDocKey: moduleData.apiDocKey,
      apiDocUrl: moduleData.apiDocUrl || "",
      dataWrapper: moduleData.dataWrapper || "",
      label: moduleData.label,
      pageDomain: moduleData.pageDomain || "",
      requestHeaders: moduleData.requestHeaders || "",
      apiArr: moduleData.apiArr.map((apiData: any) => ({
        id: generateId(),
        apiKey: apiData.apiKey,
        apiName: apiData.apiName,
        apiUrl: apiData.apiUrl,
        redirectURL: apiData.redirectURL,
        method: apiData.method.toUpperCase() as any,
        filterType: apiData.filterType,
        delay: apiData.delay,
        isOpen: apiData.isOpen,
        mockWay: apiData.mockWay,
        statusCode: apiData.statusCode,
        arrDepth: apiData.arrDepth || 4,
        arrLength: apiData.arrLength || 3,
        mockResponseData: apiData.mockResponseData || "",
        requestBody: apiData.requestBody || "",
        requestHeaders: apiData.requestHeaders || "",
      })),
    }))

    const newConfig = {
      ...config,
      modules: [...config.modules, ...newModules],
    }

    setConfig(newConfig)
    saveConfig(newConfig)

    if (newModules.length > 0) {
      setActiveModuleId(newModules[0].id)
    }
  }

  // 导出配置
  const handleExport = () => {
    const exportData = config.modules.map((module) => ({
      apiDocKey: module.apiDocKey,
      apiDocUrl: module.apiDocUrl || "",
      dataWrapper: module.dataWrapper || "",
      label: module.label,
      pageDomain: module.pageDomain || "",
      requestHeaders: module.requestHeaders || "",
      apiArr: module.apiArr.map((api) => ({
        apiKey: api.apiKey,
        apiName: api.apiName,
        apiUrl: api.apiUrl,
        arrDepth: api.arrDepth || 4,
        arrLength: api.arrLength || 3,
        delay: api.delay,
        filterType: api.filterType,
        isOpen: api.isOpen,
        method: api.method.toLowerCase(),
        mockResponseData: api.mockResponseData || "",
        mockWay: api.mockWay,
        redirectURL: api.redirectURL,
        requestBody: api.requestBody || "",
        statusCode: api.statusCode,
      })),
    }))

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

  // 处理全局搜索
  const handleSearch = (value: string) => {
    setSearchKeyword(value);
    if (!value.trim()) {
      setSearchResults([]);
      return;
    }

    const keyword = value.toLowerCase();
    const results: ApiConfig[] = [];
    
    config.modules.forEach(module => {
      module.apiArr.forEach(api => {
        if (
          api.apiName.toLowerCase().includes(keyword) ||
          api.apiUrl.toLowerCase().includes(keyword) ||
          api.redirectURL.toLowerCase().includes(keyword)
        ) {
          results.push(api);
        }
      });
    });

    setSearchResults(results);
  };

  // 处理搜索结果选择
  const handleSearchResultClick = (api: ApiConfig) => {
    // 找到API所在的模块
    const module = config.modules.find(m => m.apiArr.some(a => a.id === api.id));
    if (module) {
      setActiveModuleId(module.id);
      setSearchKeyword('');
      setSearchResults([]);
      // 这里可以添加滚动到对应API的逻辑
      setTimeout(() => {
        const element = document.querySelector(`[data-api-id="${api.id}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  };

  return (
    <div className="proxy-tool">
      <Layout className="h-screen">
        {/* 顶部导航栏 */}
        <div
          className="bg-gray-800 px-6 py-4 flex items-center justify-between"
          style={{ height: "64px", minHeight: "64px" }}
        >
          <div className="flex items-center space-x-6">
            <ArrowLeftOutlined className="text-white cursor-pointer text-lg" />
          </div>
          <div className="flex items-center space-x-6">
            <Select
              placeholder="全局搜索:接口名字、接口地址"
              onSearch={handleSearch}
              onChange={(value, option) => {
                if (option && !Array.isArray(option) && option.api) {
                  handleSearchResultClick(option.api);
                }
              }}
              size="middle"
              className="w-[300px]"
              showSearch
              filterOption={false}
              notFoundContent={searchKeyword ? "未找到匹配的接口" : null}
              options={searchResults.map((api) => ({
                value: api.id,
                label: (
                  <div>
                    <div className="font-medium text-sm">{api.apiName}</div>
                    <div className="text-xs text-gray-500">{api.apiUrl}</div>
                  </div>
                ),
                api: api,
              }))}
            />
          </div>
          <Space direction="horizontal">
            <span className="text-white text-sm">Mock 方式</span>
            <Switch
              checked={config.isGlobalEnabled}
              onChange={handleToggleGlobal}
              size="default"
              checkedChildren="开启"
              unCheckedChildren="关闭"
            />
            <Button
              icon={<ImportOutlined />}
              size="small"
              onClick={() => setImportModalVisible(true)}
            >
              导入
            </Button>
            <Button
              icon={<ExportOutlined />}
              size="small"
              onClick={handleExport}
            >
              导出
            </Button>
            <Button danger size="small" onClick={handleResetAll}>
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
            size="small"
            icon={<PlusOutlined />}
            onClick={() => setAddDrawerVisible(true)}
            disabled={!activeModule}
          >
            添加
          </Button>
        </Row>

        {/* 主要内容区域 */}
        <Content className="flex-1 overflow-auto">
          {activeModule ? (
            <ApiTable
              apis={activeModule.apiArr}
              searchKeyword={searchKeyword}
              onToggleApi={handleToggleApi}
              onToggleAllApis={handleToggleAllApis}
              onDeleteApi={handleDeleteApi}
              onEditApi={handleEditApi}
              onCloneApi={handleCloneApi}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              请选择一个模块或创建新模块
            </div>
          )}
        </Content>
      </Layout>

      {/* 添加API抽屉 */}
      <Drawer
        title="添加Mock URL"
        placement="right"
        width={600}
        open={addDrawerVisible}
        onClose={() => setAddDrawerVisible(false)}
        destroyOnClose
      >
        <AddApiForm
          onOk={handleAddApi}
          onCancel={() => setAddDrawerVisible(false)}
        />
      </Drawer>

      {/* 编辑API模态框 */}
      <EditApiModal
        visible={editModalVisible}
        api={editingApi}
        onCancel={() => {
          setEditModalVisible(false)
          setEditingApi(null)
        }}
        onOk={handleUpdateApi}
      />

      {/* 导入模态框 */}
      <ImportModal
        visible={importModalVisible}
        onCancel={() => setImportModalVisible(false)}
        onOk={handleImport}
      />
    </div>
  )
}
