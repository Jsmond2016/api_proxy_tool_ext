// API接口配置类型
export interface ApiConfig {
  id: string
  apiKey: string
  apiName: string
  apiUrl: string
  redirectURL: string
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  filterType: "contains" | "exact" | "regex"
  delay: number
  isOpen: boolean
  mockWay: "redirect" | "mock"
  mockResponseData?: string
  requestBody?: string
  requestHeaders?: string
  statusCode: number
  arrDepth?: number
  arrLength?: number
  authPointKey?: string
  pageRoute?: string // 页面路由，用于标识该接口属于哪个页面
  quickMockType?: "none" | "preset" | "custom" // 快速联调类型：无、预设响应、自定义响应
  quickMockKey?: string // 快速联调配置的 key（预设响应时使用）
  quickMockEnabled?: boolean // 快速联调是否启用
  customMockResponses?: QuickMockConfig[] // 自定义响应列表（自定义响应时使用）
  activeCustomMockKey?: string // 当前激活的自定义响应 key
  tags?: string[] // 接口的 tags（从 Apifox 同步时保存）
  activeGlobalResponseId?: string // 当前接口使用的全局响应 ID
}

// 快速联调配置类型
export interface QuickMockConfig {
  id: string
  name: string
  key: string // 唯一标识
  responseJson: string // JSON 格式的响应数据
}

// 模块配置类型
export interface ModuleConfig {
  id: string
  apiDocKey: string
  label: string
  apiDocUrl?: string
  dataWrapper?: string
  pageDomain?: string
  requestHeaders?: string
  apiArr: ApiConfig[]
}

// Apifox 配置类型
export interface ApifoxConfig {
  apifoxUrl: string
  mockPrefix: string
  selectedTags?: string[]
  selectedStatus?:
    | "developing"
    | "obsolete"
    | "deprecated"
    | "testing"
    | "released"
}

// 全局配置类型
export interface GlobalConfig {
  isGlobalEnabled: boolean
  modules: ModuleConfig[]
  apifoxConfig?: ApifoxConfig
  quickMockConfigs?: QuickMockConfig[] // 快速联调配置列表
}

// 搜索和筛选类型
export interface SearchFilter {
  keyword: string
  status: "all" | "enabled" | "disabled"
  moduleId?: string
}

// 导入导出格式类型（基于format.json）
export interface ImportExportFormat {
  apiDocKey: string
  apiDocUrl: string
  dataWrapper: string
  label: string
  pageDomain: string
  requestHeaders: string
  apiArr: {
    apiKey: string
    apiName: string
    apiUrl: string
    arrDepth: number
    arrLength: number
    delay: number
    filterType: "contains" | "exact" | "regex"
    isOpen: boolean
    method: "get" | "post" | "put" | "delete" | "patch"
    mockResponseData: string
    mockWay: "redirect" | "mockResponse"
    redirectURL: string
    requestBody: string
    statusCode: number
    authPointKey?: string
    pageRoute?: string
  }[]
}

// 导出权限点相关类型
export * from "./permission"

// Background Script 消息类型
export enum BackgroundMessageAction {
  GET_CONFIG = "getConfig",
  UPDATE_CONFIG = "updateConfig",
  TOGGLE_GLOBAL = "toggleGlobal",
  TOGGLE_MODULE = "toggleModule",
  TOGGLE_API = "toggleApi",
  UPDATE_ICON = "updateIcon",
}

export interface BackgroundMessage {
  action: BackgroundMessageAction
  config?: GlobalConfig
  enabled?: boolean
  moduleId?: string
  apiId?: string
}

// Content Script 发送的消息类型
export interface ContentScriptMessage {
  action: "checkApiMatch"
  url: string
}

// 所有可能的消息类型联合
export type AllBackgroundMessage = BackgroundMessage | ContentScriptMessage

export interface BackgroundMessageResponse {
  success: boolean
  config?: GlobalConfig
  error?: string
  shouldIntercept?: boolean
  apiId?: string
  globalResponseId?: string
}

// 全局 Mock 响应配置类型
export interface GlobalResponse {
  id: string // 唯一 ID
  name: string // 名字
  statusCode: number // 状态码
  delay: number // 延迟时间（毫秒）
  responseJson: string // 返回的 JSON 字符串
  enabled: boolean // 开启/关闭状态
  createdAt: number // 创建时间戳
  updatedAt: number // 更新时间戳
}

// 归档相关类型
export interface ArchiveData {
  version: string // 归档格式版本
  tag: string // 归档的 tag
  archivedAt: number // 归档时间戳
  iterationInfo?: {
    tag: string
    requirementDocs: string
    technicalDocs: string
    prototypeDocs: string
  } // 迭代信息
  modules: ModuleConfig[] // 相关模块配置（只包含该 tag 的接口）
  quickMockConfigs?: QuickMockConfig[] // 相关的快速联调配置
  apifoxConfig?: ApifoxConfig // Apifox 配置快照
}

export interface ArchiveRecord {
  id?: number // IndexedDB 自增主键
  tag: string // 归档的 tag
  archivedAt: number // 归档时间戳
  archiveData: ArchiveData // 完整的归档数据
  apiCount: number // 归档的接口数量（用于列表显示）
  moduleCount: number // 归档的模块数量（用于列表显示）
}
