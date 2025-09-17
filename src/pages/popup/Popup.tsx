import React, { useState, useEffect } from 'react';
import { Layout, Tabs, Button, Switch, Input, Space, message } from 'antd';
import { 
  ArrowLeftOutlined, 
  SearchOutlined, 
  PlusOutlined, 
  ImportOutlined, 
  ExportOutlined, 
  SettingOutlined,
  MoreOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { GlobalConfig, ModuleConfig, ApiConfig } from '../../types';
import { ChromeApiService, generateId } from '../../utils/chromeApi';
import ModuleTabs from './components/ModuleTabs';
import ApiTable from './components/ApiTable';
import AddApiModal from './components/AddApiModal';
import EditApiModal from './components/EditApiModal';
import ImportModal from './components/ImportModal';
import './Popup.css';

const { Header, Content } = Layout;
const { Search } = Input;

export default function Popup() {
  const [config, setConfig] = useState<GlobalConfig>({
    isGlobalEnabled: false,
    modules: []
  });
  const [activeModuleId, setActiveModuleId] = useState<string>('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingApi, setEditingApi] = useState<ApiConfig | null>(null);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // 加载配置
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const configData = await ChromeApiService.getConfig();
      setConfig(configData);
      if (configData.modules.length > 0 && !activeModuleId) {
        setActiveModuleId(configData.modules[0].id);
      }
    } catch (error) {
      message.error('加载配置失败');
      console.error('Load config error:', error);
    } finally {
      setLoading(false);
    }
  };

  // 保存配置到background script
  const saveConfig = async (newConfig: GlobalConfig) => {
    try {
      await ChromeApiService.updateConfig(newConfig);
    } catch (error) {
      message.error('保存配置失败');
      console.error('Save config error:', error);
    }
  };

  // 切换全局开关
  const handleToggleGlobal = async (enabled: boolean) => {
    try {
      await ChromeApiService.toggleGlobal(enabled);
      setConfig(prev => ({ ...prev, isGlobalEnabled: enabled }));
      message.success(enabled ? '已开启全局代理' : '已关闭全局代理');
    } catch (error) {
      message.error('操作失败');
      console.error('Toggle global error:', error);
    }
  };

  // 切换模块开关
  const handleToggleModule = async (moduleId: string, enabled: boolean) => {
    try {
      await ChromeApiService.toggleModule(moduleId, enabled);
      setConfig(prev => ({
        ...prev,
        modules: prev.modules.map(module =>
          module.id === moduleId
            ? { ...module, apiArr: module.apiArr.map(api => ({ ...api, isOpen: enabled })) }
            : module
        )
      }));
      message.success(enabled ? '已开启模块代理' : '已关闭模块代理');
    } catch (error) {
      message.error('操作失败');
      console.error('Toggle module error:', error);
    }
  };

  // 切换API开关
  const handleToggleApi = async (apiId: string, enabled: boolean) => {
    try {
      await ChromeApiService.toggleApi(apiId, enabled);
      setConfig(prev => ({
        ...prev,
        modules: prev.modules.map(module => ({
          ...module,
          apiArr: module.apiArr.map(api =>
            api.id === apiId ? { ...api, isOpen: enabled } : api
          )
        }))
      }));
    } catch (error) {
      message.error('操作失败');
      console.error('Toggle API error:', error);
    }
  };

  // 添加模块
  const handleAddModule = () => {
    const newModule: ModuleConfig = {
      id: generateId(),
      apiDocKey: `module_${Date.now()}`,
      label: `新模块_${Date.now()}`,
      apiArr: []
    };
    
    const newConfig = {
      ...config,
      modules: [...config.modules, newModule]
    };
    
    setConfig(newConfig);
    saveConfig(newConfig);
    setActiveModuleId(newModule.id);
  };

  // 编辑模块
  const handleEditModule = (moduleId: string, newName: string) => {
    const newConfig = {
      ...config,
      modules: config.modules.map(module =>
        module.id === moduleId
          ? { ...module, label: newName, apiDocKey: newName }
          : module
      )
    };
    setConfig(newConfig);
    saveConfig(newConfig);
  };

  // 删除模块
  const handleDeleteModule = (moduleId: string) => {
    const newConfig = {
      ...config,
      modules: config.modules.filter(module => module.id !== moduleId)
    };
    setConfig(newConfig);
    saveConfig(newConfig);
    
    if (activeModuleId === moduleId) {
      const remainingModules = newConfig.modules;
      setActiveModuleId(remainingModules.length > 0 ? remainingModules[0].id : '');
    }
  };

  // 添加API
  const handleAddApi = (apiData: Omit<ApiConfig, 'id'>) => {
    const newApi: ApiConfig = {
      ...apiData,
      id: generateId()
    };

    const newConfig = {
      ...config,
      modules: config.modules.map(module =>
        module.id === activeModuleId
          ? { ...module, apiArr: [...module.apiArr, newApi] }
          : module
      )
    };

    setConfig(newConfig);
    saveConfig(newConfig);
    setAddModalVisible(false);
  };

  // 编辑API
  const handleEditApi = (apiId: string) => {
    const api = config.modules
      .flatMap(module => module.apiArr)
      .find(api => api.id === apiId);
    
    if (api) {
      setEditingApi(api);
      setEditModalVisible(true);
    }
  };

  // 更新API
  const handleUpdateApi = (apiData: Omit<ApiConfig, 'id'>) => {
    if (!editingApi) return;

    const newConfig = {
      ...config,
      modules: config.modules.map(module => ({
        ...module,
        apiArr: module.apiArr.map(api =>
          api.id === editingApi.id
            ? { ...api, ...apiData }
            : api
        )
      }))
    };

    setConfig(newConfig);
    saveConfig(newConfig);
    setEditModalVisible(false);
    setEditingApi(null);
  };

  // 克隆API
  const handleCloneApi = (apiId: string) => {
    const api = config.modules
      .flatMap(module => module.apiArr)
      .find(api => api.id === apiId);
    
    if (api) {
      const clonedApi: ApiConfig = {
        ...api,
        id: generateId(),
        apiName: `${api.apiName}_副本`
      };

      const newConfig = {
        ...config,
        modules: config.modules.map(module =>
          module.id === activeModuleId
            ? { ...module, apiArr: [...module.apiArr, clonedApi] }
            : module
        )
      };

      setConfig(newConfig);
      saveConfig(newConfig);
    }
  };

  // 删除API
  const handleDeleteApi = (apiId: string) => {
    const newConfig = {
      ...config,
      modules: config.modules.map(module => ({
        ...module,
        apiArr: module.apiArr.filter(api => api.id !== apiId)
      }))
    };
    setConfig(newConfig);
    saveConfig(newConfig);
  };

  // 重置模块
  const handleResetModule = (moduleId: string) => {
    const newConfig = {
      ...config,
      modules: config.modules.map(module =>
        module.id === moduleId
          ? { ...module, apiArr: [] }
          : module
      )
    };
    setConfig(newConfig);
    saveConfig(newConfig);
  };

  // 全局重置
  const handleResetAll = () => {
    const newConfig = {
      isGlobalEnabled: false,
      modules: []
    };
    setConfig(newConfig);
    saveConfig(newConfig);
    setActiveModuleId('');
  };

  // 导入配置
  const handleImport = (importData: any[]) => {
    const newModules: ModuleConfig[] = importData.map(moduleData => ({
      id: generateId(),
      apiDocKey: moduleData.apiDocKey,
      apiDocUrl: moduleData.apiDocUrl || '',
      dataWrapper: moduleData.dataWrapper || '',
      label: moduleData.label,
      pageDomain: moduleData.pageDomain || '',
      requestHeaders: moduleData.requestHeaders || '',
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
        mockResponseData: apiData.mockResponseData || '',
        requestBody: apiData.requestBody || '',
        requestHeaders: apiData.requestHeaders || ''
      }))
    }));

    const newConfig = {
      ...config,
      modules: [...config.modules, ...newModules]
    };

    setConfig(newConfig);
    saveConfig(newConfig);

    if (newModules.length > 0) {
      setActiveModuleId(newModules[0].id);
    }
  };

  // 导出配置
  const handleExport = () => {
    const exportData = config.modules.map(module => ({
      apiDocKey: module.apiDocKey,
      apiDocUrl: module.apiDocUrl || '',
      dataWrapper: module.dataWrapper || '',
      label: module.label,
      pageDomain: module.pageDomain || '',
      requestHeaders: module.requestHeaders || '',
      apiArr: module.apiArr.map(api => ({
        apiKey: api.apiKey,
        apiName: api.apiName,
        apiUrl: api.apiUrl,
        arrDepth: api.arrDepth || 4,
        arrLength: api.arrLength || 3,
        delay: api.delay,
        filterType: api.filterType,
        isOpen: api.isOpen,
        method: api.method.toLowerCase(),
        mockResponseData: api.mockResponseData || '',
        mockWay: api.mockWay,
        redirectURL: api.redirectURL,
        requestBody: api.requestBody || '',
        statusCode: api.statusCode
      }))
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `proxy-config-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeModule = config.modules.find(module => module.id === activeModuleId);

  return (
    <div className="proxy-tool">
      <Layout className="h-screen">
        {/* 头部 */}
        <Header className="bg-blue-600 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ArrowLeftOutlined className="text-white cursor-pointer" />
            <span className="text-white font-medium">API Proxy Tool</span>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={config.isGlobalEnabled}
              onChange={handleToggleGlobal}
              size="small"
            />
            <span className="text-white text-sm">开启</span>
          </div>
        </Header>

        {/* 模块标签页 */}
        <div className="bg-gray-100 px-4 py-2 border-b">
          <ModuleTabs
            modules={config.modules}
            activeModuleId={activeModuleId}
            onModuleChange={setActiveModuleId}
            onAddModule={handleAddModule}
            onDeleteModule={handleDeleteModule}
            onEditModule={handleEditModule}
          />
        </div>

        {/* 搜索和操作栏 */}
        <div className="bg-white px-4 py-3 border-b">
          <div className="flex items-center justify-between mb-2">
            <a href="#" className="text-blue-600 text-sm">编辑分组</a>
            <Space>
              <Button 
                danger 
                size="small" 
                onClick={() => activeModule && handleResetModule(activeModule.id)}
                disabled={!activeModule}
              >
                重置
              </Button>
              <Button 
                danger 
                size="small" 
                onClick={handleResetAll}
              >
                一键重置
              </Button>
              <Button 
                type="primary" 
                size="small" 
                icon={<PlusOutlined />}
                onClick={() => setAddModalVisible(true)}
                disabled={!activeModule}
              >
                添加
              </Button>
            </Space>
          </div>
          <Search
            placeholder="全局搜索:接口名字、接口地址"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            prefix={<SearchOutlined />}
            size="small"
          />
        </div>

        {/* 操作按钮栏 */}
        <div className="bg-white px-4 py-2 border-b">
          <Space>
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
            <Button 
              icon={<SettingOutlined />} 
              size="small"
            />
            <Button 
              icon={<MoreOutlined />} 
              size="small"
            />
          </Space>
        </div>

        {/* 主要内容区域 */}
        <Content className="flex-1 overflow-auto">
          {activeModule ? (
            <ApiTable
              apis={activeModule.apiArr}
              searchKeyword={searchKeyword}
              onToggleApi={handleToggleApi}
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

      {/* 添加API模态框 */}
      <AddApiModal
        visible={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        onOk={handleAddApi}
      />

      {/* 编辑API模态框 */}
      <EditApiModal
        visible={editModalVisible}
        api={editingApi}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingApi(null);
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
  );
}
