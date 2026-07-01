import { GlobalConfig, ModuleConfig } from "../types"

export const ALL_APIS_TAB_ID = "__all_apis__"

export const DefaultMockApiModule: ModuleConfig[] = [
  {
    id: "default-module",
    apiDocKey: "default.module",
    label: "demo.default",
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
        method: "GET" as const,
        filterType: "contains" as const,
        delay: 0,
        isOpen: false,
        mockWay: "redirect" as const,
        statusCode: 200,
        arrDepth: 4,
        arrLength: 3,
        mockResponseData: "",
        requestBody: "",
        requestHeaders: "",
      },
    ],
  },
]

/**
 * 获取默认全局配置
 */
export function getDefaultGlobalConfig(): GlobalConfig {
  return {
    isGlobalEnabled: false,
    modules: DefaultMockApiModule,
    quickMockConfigs: [],
  }
}

// ==================== 日志消息常量 ====================

/** 日志消息模板 */
export const LOG_MESSAGES = {
  // 扩展信息
  EXTENSION_TITLE: "🚀 API Proxy Tool",
  EXTENSION_VERSION: "Version",
  EXTENSION_AUTHOR: "Jsmond2016",
  GITHUB_LABEL: "📦 GitHub",
  GITHUB_URL: "https://github.com/Jsmond2016/api_proxy_tool_ext",
  CHROME_STORE_LABEL: "🔗 Chrome Web Store",
  CHROME_STORE_URL:
    "https://chromewebstore.google.com/detail/api-proxy-tool/dnjnkgbfdbciepmfcfpoelocadfdppak",
  EDGE_STORE_LABEL: "🔗 Edge Add-ons",
  EDGE_STORE_URL:
    "https://microsoftedge.microsoft.com/addons/detail/api-proxy-tool/fcnakllkigbofpkphmpfhblhdnfomahj?hl=zh-CN",
  INIT_SUCCESS: "🎯 Background script loaded successfully!",

  // 规则管理
  RULES_REMOVED: (count: number) => `Removed ${count} declarative rules`,
  RULES_UNCHANGED: "Rules unchanged, skipping update",
  RULES_UPDATED: (count: number) => `Updated ${count} declarative rules`,

  // 初始化
  INIT_EXTENSION_SUCCESS: "Extension initialized successfully",

  // 错误消息前缀
  ERROR_PREFIX: "Failed to",
  ERROR_DETAILS: "Error details",
} as const

/** 错误消息模板 */
export const ERROR_MESSAGES = {
  LOAD_CONFIG: "Failed to load config",
  SAVE_CONFIG: "Failed to save config",
  UPDATE_CONFIG: "Failed to update config",
  UPDATE_RULES: "Failed to update declarative rules",
  BUILD_RULE: (apiName: string, apiId: string) =>
    `Failed to build rule for API ${apiName} (${apiId})`,
  UPDATE_ICON: "Failed to update icon",
  SET_DEFAULT_ICON: "Failed to set default icon",
  TOGGLE_GLOBAL: "Failed to toggle global",
  TOGGLE_MODULE: "Failed to toggle module",
  TOGGLE_API: "Failed to toggle API",
  HANDLE_MESSAGE: "Error handling message",
  INIT_EXTENSION: "Failed to initialize extension",
  UNKNOWN_ERROR: "Unknown error",
  // 验证错误消息
  MODULE_NOT_FOUND: "Module not found",
  API_NOT_FOUND: "API not found",
  CONFIG_REQUIRED: "Config is required",
  ENABLED_STATUS_REQUIRED: "Enabled status is required",
  MODULE_ID_AND_ENABLED_REQUIRED: "Module ID and enabled status are required",
  API_ID_AND_ENABLED_REQUIRED: "API ID and enabled status are required",
  UNKNOWN_ACTION: "Unknown action",
} as const

/** 控制台样式常量 */
export const CONSOLE_STYLES = {
  PRIMARY: "color: #1890ff; font-weight: bold; font-size: 14px;",
  SECONDARY: "color: #666;",
  SUCCESS: "color: #52c41a; font-weight: bold;",
  LINK: "color: #1890ff; text-decoration: underline;",
} as const
