import { ModuleConfig, ApifoxConfig } from "@src/types"
import { generateId } from "@src/utils/chromeApi"
import {
  ModelApiActionType,
  ModelNamesMap,
} from "../../../../../constant/model"
import { camelCase } from "change-case"

/**
 * 解析后的 API 类型
 */
export interface ParsedApi {
  apiId: string
  path: string
  method: string
  summary: string
  tags: string[]
  groupName: string
  authPointKey: string
  modelApiType: ModelApiActionType
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
    apiArr: apis.map((api) => {
      // 使用 Apifox 的 apiId 作为唯一标识，如果不存在则生成新ID
      const finalId = api.apiId || generateId()
      console.log(
        `🔑 转换接口: ${api.summary}, 使用ID: ${finalId}, 来源: ${
          api.apiId ? "Apifox" : "生成"
        }`
      )

      return {
        id: finalId,
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
        authPointKey: api.authPointKey,
      }
    }),
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
  console.log("swaggerData", swaggerData)

  Object.entries(swaggerData.paths).forEach(([path, methods]) => {
    Object.entries(methods).forEach(([method, apiInfo]) => {
      if (typeof apiInfo === "object" && apiInfo !== null) {
        const tags = apiInfo.tags || []
        const summary = apiInfo.summary || `${method.toUpperCase()} ${path}`
        const xApifoxRunUrl = apiInfo["x-run-in-apifox"]
        // eg: x-run-in-apifox: "https://apifox.com/web/project/3155205/apis/api-102913012-run"
        // 提取中间的数字部分作为 apiId（如 102913012）
        const apiId = xApifoxRunUrl?.split("/").pop()?.split("-")?.[1] || ""

        // 检查是否匹配选中的tags
        const hasMatchingTag =
          selectedTags.length === 0 ||
          tags.some((tag: string) => selectedTags.includes(tag))

        if (hasMatchingTag) {
          // 获取分组名，优先使用x-apifox-fe-general-model-base-action-type
          const groupName =
            apiInfo["x-apifox-fe-general-model-base-action-type"] ||
            (tags.length > 0 ? tags[0] : "默认分组")

          const modelApiType = apiInfo["x-apifox-fe-general-model-api-type"]

          apis.push({
            path,
            method: method.toUpperCase(),
            summary,
            tags,
            groupName,
            apiId,
            modelApiType,
            authPointKey: generateAuthPointKey({
              path,
              groupName,
              modelApiType,
            }),
          })
        }
      }
    })
  })

  return apis
}

type GenerateAuthKeyParams = {
  path: string
  groupName: string
  modelApiType: ModelApiActionType
}

export function generateAuthPointKey({
  path,
  groupName,
  modelApiType,
}: GenerateAuthKeyParams) {
  // 校验 groupName 必须为英文 a.b.c 形式，不能有数字中文和其他字符
  if (!/^[a-zA-Z.]+$/.test(groupName)) {
    console.error(
      "groupName 必须为英文 a.b.c 形式，不能有数字中文和其他字符，如：demo.user.management",
      groupName
    )
    return ""
  }
  const authPrefix = groupName.split(".").join("-")
  let apiName = ModelNamesMap[modelApiType] as string
  if (apiName === "custom") {
    apiName = camelCase(path.split("/").pop() ?? "")
  }
  return `${authPrefix}-${apiName}`
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
