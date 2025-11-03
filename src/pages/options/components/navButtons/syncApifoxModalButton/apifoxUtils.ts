import { ModuleConfig, ApifoxConfig } from "@src/types"
import { generateId } from "@src/utils/chromeApi"

/**
 * 解析后的 API 类型
 */
export interface ParsedApi {
  path: string
  method: string
  summary: string
  tags: string[]
  groupName: string
}

/**
 * Swagger 数据类型
 */
export interface SwaggerData {
  openapi: string
  info: {
    title: string
    description: string
    version: string
  }
  tags: Array<{ name: string }>
  paths: Record<string, Record<string, any>>
}

/**
 * 转换解析后的 APIs 为 ModuleConfig 格式
 */
export const convertParsedApisToModules = (
  parsedApis: ParsedApi[],
  apifoxConfig: { apifoxUrl: string; mockPrefix: string }
): ModuleConfig[] => {
  // 按分组名分组 APIs
  const groupedApis = parsedApis.reduce((groups, api) => {
    if (!groups[api.groupName]) {
      groups[api.groupName] = []
    }
    groups[api.groupName].push(api)
    return groups
  }, {} as Record<string, ParsedApi[]>)

  // 转换为 ModuleConfig 格式
  return Object.entries(groupedApis).map(([groupName, apis]) => ({
    id: generateId(),
    apiDocKey: groupName.toLowerCase().replace(/\s+/g, "."),
    label: groupName,
    apiDocUrl: apifoxConfig.apifoxUrl,
    dataWrapper: "",
    pageDomain: "",
    requestHeaders: "",
    apiArr: apis.map((api) => ({
      id: generateId(),
      apiKey: api.path,
      apiName: api.summary,
      apiUrl: api.path,
      redirectURL: `${apifoxConfig.mockPrefix}${api.path}`,
      method: api.method as any,
      filterType: "contains" as const,
      delay: 0,
      isOpen: true,
      mockWay: "redirect" as const,
      statusCode: 200,
      arrDepth: 4,
      arrLength: 3,
      mockResponseData: "",
      requestBody: "",
      requestHeaders: "",
    })),
  }))
}

/**
 * 解析 Swagger 数据
 */
export const parseSwaggerData = (
  swaggerData: SwaggerData,
  selectedTags: string[]
): ParsedApi[] => {
  const apis: ParsedApi[] = []

  Object.entries(swaggerData.paths).forEach(([path, methods]) => {
    Object.entries(methods).forEach(([method, apiInfo]) => {
      if (typeof apiInfo === "object" && apiInfo !== null) {
        const tags = apiInfo.tags || []
        const summary = apiInfo.summary || `${method.toUpperCase()} ${path}`

        // 检查是否匹配选中的tags
        const hasMatchingTag =
          selectedTags.length === 0 ||
          tags.some((tag: string) => selectedTags.includes(tag))

        if (hasMatchingTag) {
          // 获取分组名，优先使用x-apifox-fe-general-model-base-action-type
          const groupName =
            apiInfo["x-apifox-fe-general-model-base-action-type"] ||
            (tags.length > 0 ? tags[0] : "默认分组")

          apis.push({
            path,
            method: method.toUpperCase(),
            summary,
            tags,
            groupName,
          })
        }
      }
    })
  })

  return apis
}

/**
 * 验证 Apifox 地址
 */
export const validateApifoxUrl = async (
  url: string
): Promise<SwaggerData | null> => {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    const data = await response.json()

    // 验证是否为有效的Swagger/OpenAPI数据
    if (!data.openapi && !data.swagger) {
      throw new Error("不是有效的OpenAPI/Swagger数据")
    }

    return data as SwaggerData
  } catch (error) {
    throw error
  }
}
