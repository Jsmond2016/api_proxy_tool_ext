import { ModuleConfig, ApifoxConfig } from "@src/types"
import { generateId } from "@src/utils/chromeApi"
import { appendApifoxMockToken } from "@src/utils/mockUtils"
import {
  ModelApiActionType,
  ModelNamesMap,
  ModelAction,
} from "../../../../../constant/model"
import {
  APIFOX_FIELD_RUN_IN_APIFOX,
  APIFOX_FIELD_FOLDER,
  APIFOX_FIELD_GROUP_NAME,
  APIFOX_FIELD_API_TYPE,
} from "../../../../../constant/apifoxFields"
import { camelCase } from "change-case"

// ==================== 在线 API 常量 ====================

/** Apifox 在线 API 地址 */
export const APIFOX_ONLINE_API_URL = "https://api.apifox.com/v1/projects"

/** Apifox API 版本号 */
const APIFOX_API_VERSION = "2024-03-28"

// ==================== 在线 API 工具函数 ====================

/**
 * 构建 Apifox 在线 API POST 请求体
 */
const buildApifoxOnlineExportBody = (): string =>
  JSON.stringify({
    scope: { type: "ALL" },
    options: { includeApifoxExtensionProperties: true },
    oasVersion: "3.1",
    exportFormat: "JSON",
  })

/**
 * 统一入口：获取 Apifox Swagger 数据
 * - 本地模式：GET 请求全量 URL
 * - 在线模式：POST 请求 Apifox 云端 API（Bearer Token 鉴权）
 */
export const fetchApifoxSwaggerData = async (params: {
  mode?: "local" | "online"
  urlOrProjectId: string
  apifoxToken?: string
}): Promise<SwaggerData> => {
  const { mode = "local", urlOrProjectId, apifoxToken } = params

  if (!urlOrProjectId) {
    throw new Error("项目信息为空，请填写必要信息")
  }

  let response: Response

  if (mode === "online") {
    // 在线模式：校验 token
    if (!apifoxToken) {
      throw new Error("未配置 Apifox 授权令牌，请在设置中填写。")
    }

    const apiUrl = `${APIFOX_ONLINE_API_URL}/${urlOrProjectId}/export-openapi?locale=zh-CN`

    try {
      response = await fetch(apiUrl, {
        method: "POST",
        cache: "no-store",
        headers: {
          "X-Apifox-Api-Version": APIFOX_API_VERSION,
          Authorization: `Bearer ${apifoxToken}`,
          "Content-Type": "application/json",
        },
        body: buildApifoxOnlineExportBody(),
      })
    } catch {
      throw new Error(
        "无法连接 Apifox 在线服务，请检查网络或授权令牌是否正确。"
      )
    }
  } else {
    // 本地模式：直接用 URL 发 GET 请求
    try {
      response = await fetch(urlOrProjectId)
    } catch {
      throw new Error(
        "无法连接本地 Apifox 导出地址，请确认 Apifox 已打开并开启本地导出"
      )
    }
  }

  if (!response.ok) {
    throw new Error(
      mode === "online"
        ? `Apifox 在线导出请求失败：HTTP ${response.status}`
        : `HTTP ${response.status}`
    )
  }

  const data = await response.json()

  // 验证是否为有效的 Swagger/OpenAPI 数据
  if (!data.openapi && !data.swagger) {
    throw new Error("不是有效的OpenAPI/Swagger数据")
  }

  return data as SwaggerData
}

/**
 * 从 ApifoxConfig 中提取项目 ID
 * - 在线模式：apifoxUrl 即为 projectId
 * - 本地模式：从 URL 中正则提取
 */
export const getApifoxProjectId = (
  apifoxConfig?: ApifoxConfig
): string | null => {
  if (!apifoxConfig) return null

  const { mode, apifoxUrl } = apifoxConfig

  // 在线模式：apifoxUrl 直接就是 projectId
  if (mode === "online") {
    return apifoxUrl?.trim() || null
  }

  // 本地模式：从 URL 中提取
  if (!apifoxUrl) return null

  // 尝试从 query params 提取 ?projectId=xxx
  const match = apifoxUrl.match(/[?&]projectId=([^&]+)/)
  if (match) return match[1]

  // 尝试从路径提取 /project/xxx
  const matchPath = apifoxUrl.match(/\/project\/(\d+)/)
  if (matchPath) return matchPath[1]

  return null
}

/**
 * 在线模式下，根据 projectId 生成默认云端 mock 前缀
 */
export const getOnlineMockPrefix = (projectId: string): string =>
  `https://m1.apifoxmock.com/m1/${projectId}-0-default`

/**
 * 解析后的 API 类型
 */
export interface ParsedApi {
  apiId: string
  path: string
  method: string
  summary: string
  link?: string
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

export const normalizeApifoxLink = (link?: string) => {
  if (!link) return ""

  return link
    .replace(/-(?:run|link)(?=\/?$|[?#])/i, "")
    .replace(/\/web\/(?=project\/)/i, "/")
}

/**
 * 从 Swagger 数据中提取所有需过滤的目录名（用于 tag 列表过滤）
 * 1. x-apifox-folder 的完整值
 * 2. x-apifox-folder 按 '/' 分割后的所有前缀路径（如 "A/B/C" → "A", "A/B", "A/B/C"）
 */
export const extractApifoxFolderNames = (swaggerData: SwaggerData): Set<string> => {
  const folderNames = new Set<string>()
  if (!swaggerData.paths) return folderNames

  Object.values(swaggerData.paths).forEach((methods) => {
    Object.values(methods).forEach((apiInfo) => {
      if (typeof apiInfo === "object" && apiInfo !== null) {
        const folder = (apiInfo as SwaggerApiInfo)[APIFOX_FIELD_FOLDER]
        if (typeof folder === "string" && folder) {
          folderNames.add(folder)
          // 添加所有前缀路径（Apifox 可能将各级目录都作为 tag）
          folder.split("/").reduce((prefix, part) => {
            const path = prefix ? `${prefix}/${part}` : part
            folderNames.add(path)
            return path
          }, "")
        }
      }
    })
  })
  return folderNames
}

/**
 * 转换解析后的 APIs 为 ModuleConfig 格式
 */
export const convertParsedApisToModules = (
  parsedApis: ParsedApi[],
  apifoxConfig: {
    apifoxUrl: string
    mockPrefix: string
    mode?: "local" | "online"
    apifoxToken?: string
    apifoxMockToken?: string
  }
): ModuleConfig[] => {
  const { apifoxMockToken } = apifoxConfig
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
  return Object.entries(groupedApis).map(([groupName, apis]) => {
    const apiArr = apis.map((api) => {
      // 使用 Apifox 的 apiId 作为唯一标识，如果不存在则生成新ID
      const finalId = api.apiId || generateId()

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
        link: api.link,
        apiUrl: api.path,
        redirectURL: appendApifoxMockToken(
            `${apifoxConfig.mockPrefix}${api.path}`,
            apifoxMockToken
          ),
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
    })

    return {
      id: generateId(),
      apiDocKey: groupName.toLowerCase().replace(/\s+/g, "."),
      label: groupName,
      apiDocUrl: apifoxConfig.apifoxUrl,
      dataWrapper: "",
      pageDomain: "",
      requestHeaders: "",
      source: "apifox" as const,
      apifoxApiIds: apiArr.map((api) => api.id),
      apiArr,
    }
  })
}

/** 未配置或无效 groupName 的接口统一归入的分组 */
const DEFAULT_GROUP_NAME = "demo.default"

/** 单次 tag 筛选接口数量上限 */
const MAX_FILTERED_APIS = 60

/**
 * 解析 Swagger 数据
 * 未配置或格式无效的 groupName 会归入 demo.default 分组，并在 console 输出警告
 */
export const parseSwaggerData = (
  swaggerData: SwaggerData,
  selectedTags: string[]
): ParsedApi[] => {
  const apis: ParsedApi[] = []
  const warnedGroupNames = new Set<string>()

  Object.entries(swaggerData.paths).forEach(([path, methods]) => {
    Object.entries(methods).forEach(([method, apiInfo]) => {
      if (typeof apiInfo === "object" && apiInfo !== null) {
        const swaggerInfo = apiInfo as SwaggerApiInfo
        const tags = swaggerInfo.tags || []
        const summary = swaggerInfo.summary || `${method.toUpperCase()} ${path}`
        const xApifoxRunUrl = swaggerInfo[APIFOX_FIELD_RUN_IN_APIFOX]
        const normalizedApifoxLink = normalizeApifoxLink(xApifoxRunUrl)
        // eg: x-run-in-apifox: "https://apifox.com/web/project/123456789/apis/api-102913012-run"
        // 提取中间的数字部分作为 apiId（如 102913012）
        const apiId = xApifoxRunUrl?.split("/").pop()?.split("-")?.[1] || ""

        // 检查是否匹配选中的tags
        const hasMatchingTag =
          selectedTags.length === 0 ||
          tags.some((tag: string) => selectedTags.includes(tag))

        if (hasMatchingTag) {
          // 获取分组名，优先使用x-apifox-fe-general-model-base-action-type
          let groupName =
            swaggerInfo[APIFOX_FIELD_GROUP_NAME] ||
            (tags.length > 0 ? tags[0] : DEFAULT_GROUP_NAME)

          // 未配置或格式无效的 groupName 归入 default 分组，仅 console 警告
          if (!isValidGroupName(groupName)) {
            if (!warnedGroupNames.has(groupName)) {
              warnedGroupNames.add(groupName)
              console.warn(
                `⚠️ groupName 不符合格式要求（应为英文 a.b.c 形式）：${groupName}，已归入 ${DEFAULT_GROUP_NAME}，示例接口：${method.toUpperCase()} ${path}`
              )
            }
            groupName = DEFAULT_GROUP_NAME
          }

          const modelApiType =
            swaggerInfo[APIFOX_FIELD_API_TYPE] || ModelAction.CUSTOM

          apis.push({
            path,
            method: method.toUpperCase(),
            summary,
            link: normalizedApifoxLink,
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

  // 仅在选择 tag 后校验数量，未选择 tag 时不校验（如弹框刚打开时的初始状态）
  if (selectedTags.length > 0 && apis.length > MAX_FILTERED_APIS) {
    throw new Error(
      `筛选接口过多（${apis.length} 个），请检查 tag 配置是否正确。单次筛选上限为 ${MAX_FILTERED_APIS} 个接口。`
    )
  }

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
  // 注：无效 groupName 的警告已在 parseSwaggerData 中统一输出，此处不再重复 log
  if (!isValidGroupName(groupName)) {
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
 * 验证 Apifox 地址（兼容本地和在线模式）
 * @param url - 本地模式为完整导出URL，在线模式为项目编号
 * @param mode - 同步模式，缺省为 local
 * @param apifoxToken - 在线模式的授权令牌
 */
export const validateApifoxUrl = async (
  url: string,
  mode: "local" | "online" = "local",
  apifoxToken?: string
): Promise<SwaggerData | null> => {
  return fetchApifoxSwaggerData({
    mode,
    urlOrProjectId: url,
    apifoxToken,
  })
}
