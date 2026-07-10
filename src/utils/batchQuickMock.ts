import {
  ApiConfig,
  BatchQuickMockJob,
  BatchQuickMockJobItem,
  ExternalBatchQuickMockStatus,
  GlobalConfig,
  ModuleConfig,
} from "@src/types"
import { generateId } from "@src/utils/chromeApi"
import {
  ParsedApi,
  parseSwaggerData,
} from "@src/pages/options/components/navButtons/syncApifoxModalButton/apifoxUtils"
import { fetchOrGetCachedSwaggerData } from "@src/pages/options/components/navButtons/syncApifoxModalButton/apifoxCache"
import { appendApifoxMockToken } from "@src/utils/mockUtils"

export const BATCH_QUICK_MOCK_MODULE_KEY = "quick.mock.external"
export const BATCH_QUICK_MOCK_MODULE_LABEL = "quick.mock.external"
export const BATCH_QUICK_MOCK_JOB_STORAGE_PREFIX = "batch-quick-mock-job:"

const VALID_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"] as const

const DEFAULT_METHOD: ApiConfig["method"] = "GET"

export const normalizeBatchQuickMockUrl = (url: string) => {
  const trimmed = url.trim()
  if (!trimmed) return ""

  try {
    const parsedUrl = new URL(trimmed)
    return normalizePath(parsedUrl.pathname)
  } catch {
    const [pathOnly] = trimmed.split(/[?#]/)
    return normalizePath(pathOnly)
  }
}

const normalizePath = (path: string) => {
  const normalized = path.trim().replace(/\/{2,}/g, "/")
  if (!normalized) return ""
  if (normalized === "/") return normalized

  const withLeadingSlash = normalized.startsWith("/")
    ? normalized
    : `/${normalized}`

  return withLeadingSlash.endsWith("/")
    ? withLeadingSlash.slice(0, -1)
    : withLeadingSlash
}

export const dedupeBatchQuickMockUrls = (urls: string[]) => {
  const seen = new Set<string>()

  return urls.reduce<string[]>((result, rawUrl) => {
    const normalizedUrl = normalizeBatchQuickMockUrl(rawUrl)
    if (!normalizedUrl || seen.has(normalizedUrl)) {
      return result
    }

    seen.add(normalizedUrl)
    result.push(normalizedUrl)
    return result
  }, [])
}

export const buildUniqueBatchQuickMockModuleMeta = (
  modules: ModuleConfig[]
) => {
  const existingLabels = new Set(modules.map((module) => module.label))
  const existingKeys = new Set(modules.map((module) => module.apiDocKey))

  let suffix = 0
  let label = BATCH_QUICK_MOCK_MODULE_LABEL
  let apiDocKey = BATCH_QUICK_MOCK_MODULE_KEY

  while (existingLabels.has(label) || existingKeys.has(apiDocKey)) {
    suffix += 1
    label = `${BATCH_QUICK_MOCK_MODULE_LABEL}-${suffix}`
    apiDocKey = `${BATCH_QUICK_MOCK_MODULE_KEY}-${suffix}`
  }

  return { label, apiDocKey }
}

export const findApiByNormalizedUrl = (
  config: GlobalConfig,
  normalizedUrl: string
) => {
  for (const module of config.modules) {
    for (const api of module.apiArr) {
      if (normalizeBatchQuickMockUrl(api.apiUrl) === normalizedUrl) {
        return {
          module,
          api,
        }
      }
    }
  }

  return null
}

/** session 缓存 key 前缀（存放解析后的 API Map，而非原始 Swagger JSON） */
const PARSED_API_MAP_CACHE_PREFIX = "parsed-api-map:"

/** 构建 session 缓存 key */
const buildParsedCacheKey = (url: string, mode: string, token?: string) =>
  `${PARSED_API_MAP_CACHE_PREFIX}${mode}:${url}:${token || ""}`

/** 缓存有效期 10 分钟 */
const PARSED_CACHE_TTL = 10 * 60 * 1000

/**
 * 从 chrome.storage.session 读取解析后的 API Map 缓存
 */
const getParsedApiMapFromCache = async (
  url: string,
  mode: string,
  token?: string
): Promise<Map<string, ParsedApi> | null> => {
  try {
    const key = buildParsedCacheKey(url, mode, token)
    const result = await chrome.storage.session.get(key)
    const entry = result[key]
    if (
      entry &&
      typeof entry.timestamp === "number" &&
      Array.isArray(entry.entries) &&
      Date.now() - entry.timestamp < PARSED_CACHE_TTL
    ) {
      const map = new Map<string, ParsedApi>(entry.entries)
      console.log(`[api-map-cache] HIT size=${map.size}`, key.slice(0, 60))
      return map
    }
    return null
  } catch {
    return null
  }
}

/**
 * 将解析后的 API Map 写入 chrome.storage.session 缓存
 */
const setParsedApiMapToCache = async (
  url: string,
  mode: string,
  token: string | undefined,
  map: Map<string, ParsedApi>
): Promise<void> => {
  try {
    const key = buildParsedCacheKey(url, mode, token)
    const entries = Array.from(map.entries())
    await chrome.storage.session.set({
      [key]: { entries, timestamp: Date.now() },
    })
  } catch (error) {
    console.error(`[api-map-cache] WRITE FAILED:`, error)
  }
}

/** 后台预拉取 Apifox 数据并缓存（不阻塞调用方） */
const inflightPrefetches = new Map<string, Promise<void>>()

const fireAsyncPrefetch = (url: string, mode: string, token?: string) => {
  const key = buildParsedCacheKey(url, mode, token)
  if (inflightPrefetches.has(key)) return inflightPrefetches.get(key)

  const promise = (async () => {
    try {
      const data = await fetchOrGetCachedSwaggerData(url, mode, token)
      if (!data) return

      const parsedApis = parseSwaggerData(data, [])
      const map = parsedApis.reduce((acc, api) => {
        acc.set(normalizeBatchQuickMockUrl(api.path), api)
        return acc
      }, new Map<string, ParsedApi>())

      await setParsedApiMapToCache(url, mode, token, map)
    } catch (error) {
      console.error("[apifox-prefetch] FAILED:", error)
    } finally {
      inflightPrefetches.delete(key)
    }
  })()

  inflightPrefetches.set(key, promise)
  return promise
}

/**
 * 获取解析后的 Apifox API Map：
 * - 有缓存 → 直接返回（不触发网络请求）
 * - 无缓存 → 返回空 Map，同时在后台预拉取为下次准备
 *
 * 缓存由 options 页面的「手动同步 Apifox」或后台预拉取填充。
 * 批量 Quick Mock 流程始终不阻塞等待 Apifox。
 */
export const fetchApifoxApiMap = async (config: GlobalConfig) => {
  const apifoxUrl = config.apifoxConfig?.apifoxUrl
  if (!apifoxUrl) {
    return new Map<string, ParsedApi>()
  }

  const mode = config.apifoxConfig?.mode || "local"
  const token = config.apifoxConfig?.apifoxToken

  // 仅从缓存读取，不阻塞等待网络请求
  const cached = await getParsedApiMapFromCache(apifoxUrl, mode, token)
  if (cached) {
    console.log(`[apifox-cache] HIT: ${cached.size} APIs`)
    return cached
  }

  // 缓存未命中：后台预拉取（不影响当前请求），下次即可命中
  console.log(`[apifox-cache] MISS → fire background prefetch`)
  fireAsyncPrefetch(apifoxUrl, mode, token)

  return new Map<string, ParsedApi>()
}

export const buildBatchQuickMockApi = ({
  normalizedUrl,
  existingApi,
  parsedApi,
  mockPrefix,
  apifoxMockToken,
}: {
  normalizedUrl: string
  existingApi?: ApiConfig
  parsedApi?: ParsedApi
  mockPrefix: string
  apifoxMockToken?: string
}): ApiConfig => {
  const method = normalizeMethod(existingApi?.method || parsedApi?.method)

  return {
    id: existingApi?.id || parsedApi?.apiId || generateId(),
    apiKey: existingApi?.apiKey || normalizedUrl,
    apiName: existingApi?.apiName || parsedApi?.summary || normalizedUrl,
    link: existingApi?.link || parsedApi?.link || "",
    apiUrl: normalizedUrl,
    redirectURL:
      existingApi?.redirectURL ||
      appendApifoxMockToken(buildRedirectUrl(mockPrefix, normalizedUrl), apifoxMockToken),
    method,
    filterType: existingApi?.filterType || "contains",
    delay: existingApi?.delay ?? 0,
    isOpen: existingApi?.isOpen ?? true,
    mockWay: existingApi?.mockWay || "redirect",
    mockResponseData: existingApi?.mockResponseData || "",
    requestBody: existingApi?.requestBody || "",
    requestHeaders: existingApi?.requestHeaders || "",
    statusCode: existingApi?.statusCode ?? 200,
    arrDepth: existingApi?.arrDepth ?? 4,
    arrLength: existingApi?.arrLength ?? 3,
    authPointKey: existingApi?.authPointKey || parsedApi?.authPointKey || "",
    pageRoute: existingApi?.pageRoute || "",
    quickMockType: existingApi?.quickMockType,
    quickMockKey: existingApi?.quickMockKey,
    quickMockEnabled: existingApi?.quickMockEnabled,
    customMockResponses: existingApi?.customMockResponses,
    activeCustomMockKey: existingApi?.activeCustomMockKey,
    tags: existingApi?.tags || parsedApi?.tags || [],
  }
}

export const createBatchQuickMockJob = ({
  jobId,
  requestId,
  sourceExtensionId,
  moduleId,
  moduleLabel,
  items,
}: {
  jobId: string
  requestId: string
  sourceExtensionId: string
  moduleId: string
  moduleLabel: string
  items: BatchQuickMockJobItem[]
}): BatchQuickMockJob => {
  const successCount = items.filter((item) => !item.error).length
  const failCount = items.length - successCount
  const status = getBatchQuickMockStatus(items.length, successCount)

  return {
    jobId,
    requestId,
    sourceExtensionId,
    moduleId,
    moduleLabel,
    createdAt: Date.now(),
    total: items.length,
    successCount,
    failCount,
    status,
    message: getBatchQuickMockMessage(status),
    items,
  }
}

export const getBatchQuickMockStatus = (
  total: number,
  successCount: number
): ExternalBatchQuickMockStatus => {
  if (total === 0 || successCount === 0) {
    return "failed"
  }

  if (successCount === total) {
    return "success"
  }

  return "partial_success"
}

export const getBatchQuickMockMessage = (
  status: ExternalBatchQuickMockStatus
) => {
  switch (status) {
    case "success":
      return "操作成功"
    case "failed":
      return "操作失败"
    case "partial_success":
    default:
      return "部分操作成功，请前往 mock 列表查看"
  }
}

const buildRedirectUrl = (mockPrefix: string, normalizedUrl: string) => {
  const prefix = mockPrefix.trim().replace(/\/$/, "")
  return prefix ? `${prefix}${normalizedUrl}` : normalizedUrl
}

const normalizeMethod = (method?: string): ApiConfig["method"] => {
  const upperMethod = method?.toUpperCase()
  return VALID_METHODS.includes(upperMethod as ApiConfig["method"])
    ? (upperMethod as ApiConfig["method"])
    : DEFAULT_METHOD
}
