/**
 * Apifox 缓存管理工具
 */

const STORAGE_KEYS = {
  APIFOX_URL: "apifox-cached-url",
  TAG_HISTORY: "apifox-tag-history",
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
 * 获取缓存的 Apifox 地址
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
 * 保存 Apifox 地址到缓存
 */
export const saveCachedApifoxUrl = async (url: string): Promise<void> => {
  try {
    await chrome.storage.local.set({ [STORAGE_KEYS.APIFOX_URL]: url })
  } catch (error) {
    console.error("Failed to save cached Apifox URL:", error)
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
      (item: any) =>
        item &&
        item.tags &&
        Array.isArray(item.tags) &&
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
