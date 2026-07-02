// API接口配置类型
export interface ApiConfig {
  id: string
  apiKey: string
  apiName: string
  link?: string
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
  /** 同步模式：local=本地Apifox客户端导出, online=Apifox云端API, 缺省为local */
  mode?: "local" | "online"
  /** 本地模式：完整导出URL；在线模式：项目编号（纯数字） */
  apifoxUrl: string
  mockPrefix: string
  /** 在线模式的授权令牌（个人访问令牌 Access Token），仅用于导出接口数据 */
  apifoxToken?: string
  /** 在线模式的 Mock 令牌，用于访问云端 Mock 接口 */
  apifoxMockToken?: string
  selectedTags?: string[]
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

export interface BackgroundMessageResponse {
  success: boolean
  config?: GlobalConfig
  error?: string
}

// ==================== 跨插件批量 Quick Mock ====================

export const EXTERNAL_BATCH_QUICK_MOCK_REQUEST_TYPE =
  "BATCH_QUICK_MOCK" as const

export type ExternalBatchQuickMockRequest = {
  type: typeof EXTERNAL_BATCH_QUICK_MOCK_REQUEST_TYPE
  requestId: string
  urls: string[]
}

export type ExternalBatchQuickMockStatus =
  | "success"
  | "partial_success"
  | "failed"

export interface ExternalBatchQuickMockResponse {
  success: boolean
  jobId?: string
  status: ExternalBatchQuickMockStatus
  total: number
  successCount: number
  failCount: number
  message: string
}

export interface BatchQuickMockJobItem {
  url: string
  normalizedUrl: string
  apiId: string
  apiName: string
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  moduleId: string
  moduleLabel: string
  foundInLocalConfig: boolean
  foundInApifox: boolean
  apifoxLink?: string
  tags?: string[]
  error?: string
}

export interface BatchQuickMockJob {
  jobId: string
  requestId: string
  sourceExtensionId: string
  moduleId: string
  moduleLabel: string
  createdAt: number
  total: number
  successCount: number
  failCount: number
  status: ExternalBatchQuickMockStatus
  message: string
  items: BatchQuickMockJobItem[]
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
    testCaseDocs: string
    scheduleDocs: string
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
