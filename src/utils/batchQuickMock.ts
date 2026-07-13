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
import {
  createParsedApiMap,
  getCachedParsedApiMap,
  normalizeApiLookupPath,
  setCachedParsedApis,
} from "@src/utils/parsedApiCache"

export const BATCH_QUICK_MOCK_MODULE_KEY = "quick.mock.external"
export const BATCH_QUICK_MOCK_MODULE_LABEL = "quick.mock.external"
export const BATCH_QUICK_MOCK_JOB_STORAGE_PREFIX = "batch-quick-mock-job:"

const VALID_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"] as const

const DEFAULT_METHOD: ApiConfig["method"] = "GET"

export const normalizeBatchQuickMockUrl = normalizeApiLookupPath

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
  modules: ModuleConfig[],
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
  normalizedUrl: string,
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

const inflightApiMapRequests = new Map<
  string,
  Promise<Map<string, ParsedApi>>
>()

/**
 * 获取解析后的 Apifox API Map：
 * - 有持久缓存 → 直接返回（不触发网络请求）
 * - 无持久缓存 → 等待 Apifox 拉取并写入 IndexedDB 后返回
 */
export const fetchApifoxApiMap = async (config: GlobalConfig) => {
  const apifoxUrl = config.apifoxConfig?.apifoxUrl
  if (!apifoxUrl) {
    return new Map<string, ParsedApi>()
  }

  const mode = config.apifoxConfig?.mode || "local"
  const token = config.apifoxConfig?.apifoxToken
  const identity = { url: apifoxUrl, mode }

  try {
    const cached = await getCachedParsedApiMap(identity)
    if (cached) {
      console.log(`[apifox-cache] HIT: ${cached.size} APIs`)
      return cached
    }
  } catch (error) {
    console.error("[apifox-cache] READ FAILED:", error)
  }

  const requestKey = `${mode}:${apifoxUrl}`
  const inflightRequest = inflightApiMapRequests.get(requestKey)
  if (inflightRequest) return inflightRequest

  console.log("[apifox-cache] MISS: fetching Apifox data")
  const request = (async () => {
    const data = await fetchOrGetCachedSwaggerData(apifoxUrl, mode, token)
    if (!data) return new Map<string, ParsedApi>()

    const parsedApis = parseSwaggerData(data, [])
    try {
      return await setCachedParsedApis(identity, parsedApis)
    } catch (error) {
      console.error("[apifox-cache] WRITE FAILED:", error)
      return createParsedApiMap(parsedApis)
    }
  })().finally(() => {
    inflightApiMapRequests.delete(requestKey)
  })

  inflightApiMapRequests.set(requestKey, request)
  return request
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
