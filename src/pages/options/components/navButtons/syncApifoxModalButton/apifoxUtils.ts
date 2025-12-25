import { ModuleConfig } from "@src/types"
import { generateId } from "@src/utils/chromeApi"
import {
  ModelApiActionType,
  ModelNamesMap,
  ModelAction,
} from "../../../../../constant/model"
import {
  APIFOX_FIELD_RUN_IN_APIFOX,
  APIFOX_FIELD_STATUS,
  APIFOX_FIELD_GROUP_NAME,
  APIFOX_FIELD_API_TYPE,
} from "../../../../../constant/apifoxFields"
import { camelCase } from "change-case"

/**
 * Apifox 接口状态类型
 */
export type ApifoxStatus =
  | "developing" // 开发中
  | "obsolete" // 已废弃
  | "deprecated" // 将废弃
  | "testing" // 测试中
  | "released" // 已发布

/**
 * Apifox 状态选项配置
 */
export const APIFOX_STATUS_OPTIONS: Array<{
  label: string
  value: ApifoxStatus
}> = [
  { label: "开发中", value: "developing" },
  { label: "测试中", value: "testing" },
  { label: "已发布", value: "released" },
  { label: "将废弃", value: "deprecated" },
  { label: "已废弃", value: "obsolete" },
]

/**
 * 默认状态：开发中
 */
export const DEFAULT_APIFOX_STATUS: ApifoxStatus = "developing"

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
 * Swagger API Info 类型
 */
interface SwaggerApiInfo {
  tags?: string[]
  summary?: string
  [APIFOX_FIELD_RUN_IN_APIFOX]?: string
  [APIFOX_FIELD_STATUS]?: ApifoxStatus
  [APIFOX_FIELD_GROUP_NAME]?: string
  [APIFOX_FIELD_API_TYPE]?: ModelApiActionType
  [key: string]: unknown
}

/**
 * Swagger 数据类型
 */
export interface SwaggerData {
  openapi?: string
  swagger?: string
  info: {
    title: string
    description: string
    version: string
  }
  tags: Array<{ name: string }>
  paths: Record<string, Record<string, SwaggerApiInfo>>
}

/**
 * 转换解析后的 APIs 为 ModuleConfig 格式
 */
export const convertParsedApisToModules = (
  parsedApis: ParsedApi[],
  apifoxConfig: { apifoxUrl: string; mockPrefix: string }
): ModuleConfig[] => {
  // 按分组名分组 APIs
  const groupedApis = parsedApis.reduce(
    (groups, api) => {
      if (!groups[api.groupName]) {
        groups[api.groupName] = []
      }
      groups[api.groupName].push(api)
      return groups
    },
    {} as Record<string, ParsedApi[]>
  )

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

      // 确保 method 是正确的类型
      const validMethods = ["GET", "POST", "PUT", "DELETE", "PATCH"] as const
      const method = validMethods.includes(
        api.method.toUpperCase() as (typeof validMethods)[number]
      )
        ? (api.method.toUpperCase() as (typeof validMethods)[number])
        : "GET"

      return {
        id: finalId,
        apiKey: api.path,
        apiName: api.summary,
        apiUrl: api.path,
        redirectURL: `${apifoxConfig.mockPrefix}${api.path}`,
        method,
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
        tags: api.tags, // 保存接口的 tags
      }
    }),
  }))
}

/**
 * 解析 Swagger 数据
 */
export const parseSwaggerData = (
  swaggerData: SwaggerData,
  selectedTags: string[],
  selectedStatus: ApifoxStatus = DEFAULT_APIFOX_STATUS
): ParsedApi[] => {
  const apis: ParsedApi[] = []
  console.log("swaggerData", swaggerData)

  Object.entries(swaggerData.paths).forEach(([path, methods]) => {
    Object.entries(methods).forEach(([method, apiInfo]) => {
      if (typeof apiInfo === "object" && apiInfo !== null) {
        const swaggerInfo = apiInfo as SwaggerApiInfo
        const tags = swaggerInfo.tags || []
        const summary = swaggerInfo.summary || `${method.toUpperCase()} ${path}`
        const xApifoxRunUrl = swaggerInfo[APIFOX_FIELD_RUN_IN_APIFOX]
        // eg: x-run-in-apifox: "https://apifox.com/web/project/123456789/apis/api-102913012-run"
        // 提取中间的数字部分作为 apiId（如 102913012）
        const apiId = xApifoxRunUrl?.split("/").pop()?.split("-")?.[1] || ""

        // 检查接口状态，根据用户选择的状态进行过滤
        const apifoxStatus = swaggerInfo[APIFOX_FIELD_STATUS]

        // 只保留状态匹配的接口，如果接口没有状态字段且用户选择的状态不是默认值，则跳过
        if (apifoxStatus !== selectedStatus) {
          return
        }

        // 检查是否匹配选中的tags
        const hasMatchingTag =
          selectedTags.length === 0 ||
          tags.some((tag: string) => selectedTags.includes(tag))

        if (hasMatchingTag) {
          // 获取分组名，优先使用x-apifox-fe-general-model-base-action-type
          const groupName =
            swaggerInfo[APIFOX_FIELD_GROUP_NAME] ||
            (tags.length > 0 ? tags[0] : "默认分组")

          // 如果 groupName 不符合格式，给出警告
          if (!isValidGroupName(groupName)) {
            console.warn(
              `⚠️ groupName 不符合格式要求（应为英文 a.b.c 形式）：${groupName}`,
              `接口：${method.toUpperCase()} ${path}`
            )
          }

          const modelApiType =
            swaggerInfo[APIFOX_FIELD_API_TYPE] || ModelAction.CUSTOM

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

export const isValidGroupName = (groupName: string) => {
  return /^[a-zA-Z.]+$/.test(groupName)
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
  if (!isValidGroupName(groupName)) {
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
  // eslint-disable-next-line no-useless-catch
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
