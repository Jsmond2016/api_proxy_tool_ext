/**
 * Apifox 缓存管理工具
 */

import { type SwaggerData, fetchApifoxSwaggerData } from "./apifoxUtils"

const STORAGE_KEYS = {
  APIFOX_URL: "apifox-cached-url",
  APIFOX_LOCAL_URL: "apifox-cached-local-url",
  APIFOX_ONLINE_PROJECT_ID: "apifox-cached-online-project-id",
  APIFOX_ONLINE_TOKEN: "apifox-cached-online-token",
  APIFOX_MOCK_TOKEN: "apifox-cached-mock-token",
  TAG_HISTORY: "apifox-tag-history",
  ITERATION_INFO: "apifox-iteration-info",
} as const

const MAX_TAG_HISTORY = 10 // 最多保存10条标签历史

/**
 * 标签历史记录类型
 */
export interface TagHistoryItem {
  tags: string[]
  timestamp: number
}

/**
 * 迭代信息类型
 */
export interface IterationInfo {
  tag: string
  requirementDocs: string // 需求文档
  technicalDocs: string // 技术文档
  prototypeDocs: string // 原型文档
  testCaseDocs: string // 测试用例链接
  scheduleDocs: string // 排期文档
}

/**
 * 迭代信息映射（tag -> IterationInfo）
 */
export interface IterationInfoMap {
  [tag: string]: IterationInfo
}

/**
 * 获取缓存的 Apifox 地址（兼容旧版单一缓存）
 */
export const getCachedApifoxUrl = async (): Promise<string | null> => {
  try {
    const result = await chrome.storage.local.get([STORAGE_KEYS.APIFOX_URL])
    return result[STORAGE_KEYS.APIFOX_URL] || null
  } catch (error) {
    console.error("Failed to get cached Apifox URL:", error)
    return null
  }
}

/**
 * 保存 Apifox 地址到缓存（兼容旧版单一缓存）
 */
export const saveCachedApifoxUrl = async (url: string): Promise<void> => {
  try {
    await chrome.storage.local.set({ [STORAGE_KEYS.APIFOX_URL]: url })
  } catch (error) {
    console.error("Failed to save cached Apifox URL:", error)
  }
}

/**
 * 获取缓存的本地模式 Apifox 地址
 */
export const getCachedApifoxLocalUrl = async (): Promise<string | null> => {
  try {
    const result = await chrome.storage.local.get([STORAGE_KEYS.APIFOX_LOCAL_URL])
    return result[STORAGE_KEYS.APIFOX_LOCAL_URL] || null
  } catch (error) {
    console.error("Failed to get cached Apifox local URL:", error)
    return null
  }
}

/**
 * 保存本地模式 Apifox 地址到缓存
 */
export const saveCachedApifoxLocalUrl = async (url: string): Promise<void> => {
  try {
    await chrome.storage.local.set({ [STORAGE_KEYS.APIFOX_LOCAL_URL]: url })
  } catch (error) {
    console.error("Failed to save cached Apifox local URL:", error)
  }
}

/**
 * 获取缓存的在线模式项目编号
 */
export const getCachedApifoxProjectId = async (): Promise<string | null> => {
  try {
    const result = await chrome.storage.local.get([STORAGE_KEYS.APIFOX_ONLINE_PROJECT_ID])
    return result[STORAGE_KEYS.APIFOX_ONLINE_PROJECT_ID] || null
  } catch (error) {
    console.error("Failed to get cached Apifox project ID:", error)
    return null
  }
}

/**
 * 保存在线模式项目编号到缓存
 */
export const saveCachedApifoxProjectId = async (projectId: string): Promise<void> => {
  try {
    await chrome.storage.local.set({ [STORAGE_KEYS.APIFOX_ONLINE_PROJECT_ID]: projectId })
  } catch (error) {
    console.error("Failed to save cached Apifox project ID:", error)
  }
}

/**
 * 获取缓存的在线模式授权令牌
 */
export const getCachedApifoxToken = async (): Promise<string | null> => {
  try {
    const result = await chrome.storage.local.get([STORAGE_KEYS.APIFOX_ONLINE_TOKEN])
    return result[STORAGE_KEYS.APIFOX_ONLINE_TOKEN] || null
  } catch (error) {
    console.error("Failed to get cached Apifox token:", error)
    return null
  }
}

/**
 * 保存在线模式授权令牌到缓存
 */
export const saveCachedApifoxToken = async (token: string): Promise<void> => {
  try {
    await chrome.storage.local.set({ [STORAGE_KEYS.APIFOX_ONLINE_TOKEN]: token })
  } catch (error) {
    console.error("Failed to save cached Apifox token:", error)
  }
}

/**
 * 获取缓存的在线模式 Mock 令牌
 */
export const getCachedApifoxMockToken = async (): Promise<string | null> => {
  try {
    const result = await chrome.storage.local.get([STORAGE_KEYS.APIFOX_MOCK_TOKEN])
    return result[STORAGE_KEYS.APIFOX_MOCK_TOKEN] || null
  } catch (error) {
    console.error("Failed to get cached Apifox mock token:", error)
    return null
  }
}

/**
 * 保存在线模式 Mock 令牌到缓存
 */
export const saveCachedApifoxMockToken = async (token: string): Promise<void> => {
  try {
    await chrome.storage.local.set({ [STORAGE_KEYS.APIFOX_MOCK_TOKEN]: token })
  } catch (error) {
    console.error("Failed to save cached Apifox mock token:", error)
  }
}

/**
 * 获取标签历史记录
 */
export const getTagHistory = async (): Promise<TagHistoryItem[]> => {
  try {
    const result = await chrome.storage.local.get([STORAGE_KEYS.TAG_HISTORY])
    const history = result[STORAGE_KEYS.TAG_HISTORY] || []

    // 验证数据格式
    const validHistory = history.filter(
      (item: unknown): item is TagHistoryItem =>
        typeof item === "object" &&
        item !== null &&
        "tags" in item &&
        Array.isArray(item.tags) &&
        "timestamp" in item &&
        typeof item.timestamp === "number"
    )

    // 按时间戳倒序排列
    const sortedHistory = validHistory.sort(
      (a: TagHistoryItem, b: TagHistoryItem) => b.timestamp - a.timestamp
    )

    return sortedHistory
  } catch (error) {
    console.error("Failed to get tag history:", error)
    return []
  }
}

/**
 * 添加标签到历史记录
 */
export const addTagHistory = async (tags: string[]): Promise<void> => {
  if (tags.length === 0) {
    return
  }

  try {
    const history = await getTagHistory()

    // 检查是否已存在相同的标签组合
    const tagsKey = JSON.stringify(tags.sort())
    const existingIndex = history.findIndex(
      (item) => JSON.stringify(item.tags.sort()) === tagsKey
    )

    if (existingIndex !== -1) {
      // 如果已存在，更新其时间戳并移到最前面
      const existingItem = history[existingIndex]
      existingItem.timestamp = Date.now()
      history.splice(existingIndex, 1)
      history.unshift(existingItem)
    } else {
      // 如果不存在，添加新记录
      history.unshift({
        tags: [...tags],
        timestamp: Date.now(),
      })
    }

    // 限制历史记录数量
    const limitedHistory = history.slice(0, MAX_TAG_HISTORY)

    await chrome.storage.local.set({
      [STORAGE_KEYS.TAG_HISTORY]: limitedHistory,
    })
  } catch (error) {
    console.error("Failed to add tag history:", error)
  }
}

/**
 * 删除标签历史记录
 */
export const removeTagHistory = async (timestamp: number): Promise<void> => {
  try {
    const history = await getTagHistory()
    const filteredHistory = history.filter(
      (item) => item.timestamp !== timestamp
    )
    await chrome.storage.local.set({
      [STORAGE_KEYS.TAG_HISTORY]: filteredHistory,
    })
  } catch (error) {
    console.error("Failed to remove tag history:", error)
  }
}

/**
 * 获取迭代信息
 */
export const getIterationInfo = async (): Promise<IterationInfoMap> => {
  try {
    const result = await chrome.storage.local.get([STORAGE_KEYS.ITERATION_INFO])
    return result[STORAGE_KEYS.ITERATION_INFO] || {}
  } catch (error) {
    console.error("Failed to get iteration info:", error)
    return {}
  }
}

/**
 * 保存迭代信息
 */
export const saveIterationInfo = async (
  iterationInfo: IterationInfoMap
): Promise<void> => {
  try {
    await chrome.storage.local.set({
      [STORAGE_KEYS.ITERATION_INFO]: iterationInfo,
    })
  } catch (error) {
    console.error("Failed to save iteration info:", error)
  }
}

/**
 * 获取指定 tag 的迭代信息
 */
export const getIterationInfoByTag = async (
  tag: string
): Promise<IterationInfo | null> => {
  try {
    const allInfo = await getIterationInfo()
    return allInfo[tag] || null
  } catch (error) {
    console.error("Failed to get iteration info by tag:", error)
    return null
  }
}

// ==================== Swagger 数据内存缓存 ====================

interface SwaggerCacheEntry {
  key: string
  data: SwaggerData | null
  timestamp: number
}

interface InflightRequest {
  promise: Promise<SwaggerData>
  key: string
}

/** Swagger 数据内存缓存（避免每次打开添加弹窗都重新请求网络） */
let swaggerDataMemoryCache: SwaggerCacheEntry | null = null

/** 缓存有效期 10 分钟 */
const SWAGGER_CACHE_TTL = 10 * 60 * 1000

/** 正在请求中的 Swagger 数据请求（用于请求去重，相同参数复用同一请求） */
let inflightRequest: InflightRequest | null = null

/** 构建缓存 / 去重的 key */
const buildCacheKey = (url: string, mode: string, token?: string): string =>
  `${mode}:${url}:${token || ""}`

/**
 * 获取缓存的 Swagger 数据（内存缓存）
 * @returns 匹配当前参数的缓存数据，不存在或已过期返回 null
 */
export const getCachedSwaggerData = (
  url: string,
  mode: string,
  token?: string
): SwaggerData | null => {
  const key = buildCacheKey(url, mode, token)
  if (
    swaggerDataMemoryCache &&
    swaggerDataMemoryCache.key === key &&
    Date.now() - swaggerDataMemoryCache.timestamp < SWAGGER_CACHE_TTL
  ) {
    return swaggerDataMemoryCache.data
  }
  return null
}

/**
 * 设置 Swagger 数据到内存缓存
 */
export const setCachedSwaggerData = (
  url: string,
  mode: string,
  token: string | undefined,
  data: SwaggerData | null
): void => {
  swaggerDataMemoryCache = {
    key: buildCacheKey(url, mode, token),
    data,
    timestamp: Date.now(),
  }
}

/**
 * 清除 Swagger 数据内存缓存
 */
export const clearCachedSwaggerData = (): void => {
  swaggerDataMemoryCache = null
}

/**
 * 获取 Swagger 数据：优先读内存缓存，其次复用 in-flight 请求，最后发起新请求
 *
 * 无论从何调用（预加载 / 弹窗），相同参数的请求共享同一个 Promise，
 * 避免重复请求浪费，也避免弹窗打开后「预加载还没完成」又发起一个新请求。
 *
 * 原始 Swagger JSON 仅保留在内存缓存中（SW 存活期内有效），
 * 不写入 chrome.storage.session（数据量过大）。解析后的 API Map
 * 缓存见 batchQuickMock.ts 中的 parsed-api-map 缓存。
 */
export const fetchOrGetCachedSwaggerData = async (
  url: string,
  mode: "local" | "online",
  token?: string
): Promise<SwaggerData | null> => {
  const key = buildCacheKey(url, mode, token)

  // 1. 内存缓存（最快，SW 存活期间有效）
  const memCached = getCachedSwaggerData(url, mode, token)
  if (memCached) return memCached

  // 2. 有相同参数的 in-flight 请求，复用
  if (inflightRequest && inflightRequest.key === key) {
    return inflightRequest.promise
  }

  // 3. 发起新请求（结果仅缓存到内存）
  const promise = fetchApifoxSwaggerData({
    mode,
    urlOrProjectId: url,
    apifoxToken: token,
  })
    .then((data) => {
      setCachedSwaggerData(url, mode, token, data)
      return data
    })
    .finally(() => {
      if (inflightRequest?.promise === promise) {
        inflightRequest = null
      }
    })

  inflightRequest = { promise, key }
  return promise
}
