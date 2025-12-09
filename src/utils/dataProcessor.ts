import { ModuleConfig, ApiConfig } from "../types"
import { generateId } from "./chromeApi"

type IMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH"

/**
 * 导入数据格式接口
 */
export interface ImportModuleData {
  apiDocKey: string
  apiDocUrl?: string
  dataWrapper?: string
  label: string
  pageDomain?: string
  requestHeaders?: string
  apiArr: ImportApiData[]
}

export interface ImportApiData {
  apiKey: string
  apiName: string
  apiUrl: string
  redirectURL: string
  method: IMethod
  filterType: "contains" | "exact" | "regex"
  delay: number
  isOpen: boolean
  mockWay: "redirect" | "mockResponse"
  statusCode: number
  arrDepth?: number
  arrLength?: number
  mockResponseData?: string
  requestBody?: string
  requestHeaders?: string
  authPointKey?: string
  pageRoute?: string
}

/**
 * 导出数据格式接口
 */
export interface ExportModuleData {
  apiDocKey: string
  apiDocUrl: string
  dataWrapper: string
  label: string
  pageDomain: string
  requestHeaders: string
  apiArr: ExportApiData[]
}

export interface ExportApiData {
  apiKey: string
  apiName: string
  apiUrl: string
  arrDepth: number
  arrLength: number
  delay: number
  filterType: string
  isOpen: boolean
  method: IMethod
  mockResponseData: string
  mockWay: string
  redirectURL: string
  requestBody: string
  statusCode: number
  authPointKey: string
  pageRoute?: string
}

/**
 * 将导入数据转换为 ModuleConfig 格式
 * @param importData 导入的数据数组
 * @returns 转换后的 ModuleConfig 数组
 */
export const transformImportDataToModuleConfig = (
  importData: ImportModuleData[]
): ModuleConfig[] => {
  return importData.map((moduleData) => ({
    id: generateId(),
    apiDocKey: moduleData.apiDocKey,
    apiDocUrl: moduleData.apiDocUrl || "",
    dataWrapper: moduleData.dataWrapper || "",
    label: moduleData.label,
    pageDomain: moduleData.pageDomain || "",
    requestHeaders: moduleData.requestHeaders || "",
    apiArr: moduleData.apiArr.map((apiData) => ({
      id: generateId(),
      apiKey: apiData.apiKey,
      apiName: apiData.apiName,
      apiUrl: apiData.apiUrl,
      redirectURL: apiData.redirectURL,
      method: apiData.method.toUpperCase() as IMethod,
      filterType: apiData.filterType,
      delay: apiData.delay,
      isOpen: apiData.isOpen,
      mockWay: apiData.mockWay === "mockResponse" ? "mock" : "redirect",
      statusCode: apiData.statusCode,
      arrDepth: apiData.arrDepth || 4,
      arrLength: apiData.arrLength || 3,
      mockResponseData: apiData.mockResponseData || "",
      requestBody: apiData.requestBody || "",
      requestHeaders: apiData.requestHeaders || "",
      authPointKey: apiData.authPointKey || "",
      pageRoute: apiData.pageRoute || "",
    })),
  }))
}

/**
 * 将 ModuleConfig 格式转换为导出数据格式
 * @param modules ModuleConfig 数组
 * @returns 转换后的导出数据数组
 */
export const transformModuleConfigToExportData = (
  modules: ModuleConfig[]
): ExportModuleData[] => {
  return modules.map((module) => ({
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
      method: api.method.toLowerCase() as IMethod,
      mockResponseData: api.mockResponseData || "",
      mockWay: api.mockWay === "mock" ? "mockResponse" : "redirect",
      redirectURL: api.redirectURL,
      requestBody: api.requestBody || "",
      statusCode: api.statusCode,
      authPointKey: api.authPointKey || "",
      pageRoute: api.pageRoute || "",
    })),
  }))
}
