/**
 * 全局 Mock 响应工具函数 - 使用 IndexedDB 存储全局 Mock 响应配置
 */

import { GlobalMockResponse } from "../types/index"

const DB_NAME = "global-mock-db"
const DB_VERSION = 2 // 增加版本号以触发升级
const STORE_NAME = "globalMocks"

// IndexedDB 数据库实例
let dbInstance: IDBDatabase | null = null

/**
 * 初始化 IndexedDB 数据库
 */
export const initGlobalMockDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance)
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      reject(new Error("Failed to open IndexedDB"))
    }

    request.onsuccess = () => {
      dbInstance = request.result
      resolve(dbInstance)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      const transaction = (event.target as IDBOpenDBRequest).transaction

      // 创建对象存储
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, {
          keyPath: "id",
        })

        // 创建索引
        objectStore.createIndex("enabled", "enabled", { unique: false })
        objectStore.createIndex("createdAt", "createdAt", { unique: false })
      } else if (transaction) {
        // 如果对象存储已存在，检查索引是否存在
        const objectStore = transaction.objectStore(STORE_NAME)

        // 如果索引不存在，创建索引
        if (!objectStore.indexNames.contains("enabled")) {
          try {
            objectStore.createIndex("enabled", "enabled", { unique: false })
          } catch (error) {
            console.warn("Failed to create enabled index:", error)
          }
        }

        if (!objectStore.indexNames.contains("createdAt")) {
          try {
            objectStore.createIndex("createdAt", "createdAt", { unique: false })
          } catch (error) {
            console.warn("Failed to create createdAt index:", error)
          }
        }
      }
    }
  })
}

/**
 * 保存全局 Mock 响应配置
 */
export const saveGlobalMock = async (
  mockResponse: GlobalMockResponse
): Promise<void> => {
  const db = await initGlobalMockDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite")
    const objectStore = transaction.objectStore(STORE_NAME)
    const request = objectStore.put(mockResponse)

    request.onsuccess = () => {
      resolve()
    }

    request.onerror = () => {
      reject(new Error("Failed to save global mock response"))
    }
  })
}

/**
 * 获取指定的全局 Mock 响应配置
 */
export const getGlobalMock = async (
  id: string
): Promise<GlobalMockResponse | null> => {
  const db = await initGlobalMockDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly")
    const objectStore = transaction.objectStore(STORE_NAME)
    const request = objectStore.get(id)

    request.onsuccess = () => {
      resolve((request.result as GlobalMockResponse) || null)
    }

    request.onerror = () => {
      reject(new Error("Failed to get global mock response"))
    }
  })
}

/**
 * 获取所有全局 Mock 响应配置
 */
export const getAllGlobalMocks = async (): Promise<GlobalMockResponse[]> => {
  const db = await initGlobalMockDB()

  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction([STORE_NAME], "readonly")
      const objectStore = transaction.objectStore(STORE_NAME)

      // 检查索引是否存在，如果不存在则直接遍历
      let request: IDBRequest<IDBCursorWithValue | null>
      if (objectStore.indexNames.contains("createdAt")) {
        const index = objectStore.index("createdAt")
        request = index.openCursor(null, "prev") // 倒序排列
      } else {
        // 如果没有索引，直接遍历对象存储
        request = objectStore.openCursor(null, "prev")
      }

      const mocks: GlobalMockResponse[] = []

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result
        if (cursor) {
          mocks.push(cursor.value as GlobalMockResponse)
          cursor.continue()
        } else {
          // 如果没有 createdAt 索引，按创建时间手动排序
          if (!objectStore.indexNames.contains("createdAt")) {
            mocks.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
          }
          resolve(mocks)
        }
      }

      request.onerror = () => {
        reject(new Error("Failed to get all global mock responses"))
      }
    } catch (error) {
      console.error("Error getting all global mocks:", error)
      reject(new Error("Failed to get all global mock responses"))
    }
  })
}

/**
 * 删除全局 Mock 响应配置
 */
export const deleteGlobalMock = async (id: string): Promise<void> => {
  const db = await initGlobalMockDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite")
    const objectStore = transaction.objectStore(STORE_NAME)
    const request = objectStore.delete(id)

    request.onsuccess = () => {
      resolve()
    }

    request.onerror = () => {
      reject(new Error("Failed to delete global mock response"))
    }
  })
}

/**
 * 更新全局 Mock 响应配置
 */
export const updateGlobalMock = async (
  mockResponse: GlobalMockResponse
): Promise<void> => {
  return saveGlobalMock(mockResponse)
}

/**
 * 获取当前启用的全局 Mock 响应（单次只能开启一个）
 */
export const getActiveGlobalMock =
  async (): Promise<GlobalMockResponse | null> => {
    const db = await initGlobalMockDB()

    return new Promise((resolve) => {
      try {
        const transaction = db.transaction([STORE_NAME], "readonly")
        const objectStore = transaction.objectStore(STORE_NAME)

        // 直接遍历所有记录，查找 enabled=true 的记录
        // 因为 IndexedDB 的索引键不支持 boolean 类型，不能使用 IDBKeyRange.only(true)
        const request = objectStore.openCursor()

        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result
          if (cursor) {
            const mock = cursor.value as GlobalMockResponse
            if (mock.enabled) {
              // 找到第一个启用的记录
              resolve(mock)
              return
            }
            cursor.continue()
          } else {
            // 没有找到启用的记录
            resolve(null)
          }
        }

        request.onerror = () => {
          // 如果查询失败，返回 null
          resolve(null)
        }
      } catch (error) {
        // 如果出现任何错误，返回 null 而不是 reject
        console.error("Error getting active global mock:", error)
        resolve(null)
      }
    })
  }

/**
 * 直接更新全局 Mock 响应的启用状态（不限制数量）
 */
export const updateGlobalMockEnabled = async (
  id: string,
  enabled: boolean
): Promise<void> => {
  const db = await initGlobalMockDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite")
    const objectStore = transaction.objectStore(STORE_NAME)

    const getRequest = objectStore.get(id)
    getRequest.onsuccess = () => {
      const mock = getRequest.result as GlobalMockResponse
      if (!mock) {
        reject(new Error("Global mock response not found"))
        return
      }

      mock.enabled = enabled
      mock.updatedAt = Date.now()
      const putRequest = objectStore.put(mock)

      putRequest.onsuccess = () => {
        resolve()
      }

      putRequest.onerror = () => {
        reject(new Error("Failed to update global mock response"))
      }
    }

    getRequest.onerror = () => {
      reject(new Error("Failed to get global mock response"))
    }
  })
}

/**
 * 切换全局 Mock 响应的启用状态
 * 确保单次只能开启一个（用于外部表格）
 */
export const toggleGlobalMock = async (
  id: string,
  enabled: boolean
): Promise<void> => {
  const db = await initGlobalMockDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite")
    const objectStore = transaction.objectStore(STORE_NAME)

    // 如果启用，先关闭所有其他的
    if (enabled) {
      // 先获取当前要启用的记录
      const getRequest = objectStore.get(id)

      getRequest.onsuccess = () => {
        const mockToEnable = getRequest.result as GlobalMockResponse
        if (!mockToEnable) {
          reject(new Error("Global mock response not found"))
          return
        }

        // 查找所有已启用的记录并关闭它们
        const findEnabledRequest = objectStore.openCursor()
        const enabledMocks: GlobalMockResponse[] = []

        findEnabledRequest.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result
          if (cursor) {
            const mock = cursor.value as GlobalMockResponse
            if (mock.enabled && mock.id !== id) {
              enabledMocks.push(mock)
            }
            cursor.continue()
          } else {
            // 关闭所有已启用的（除了当前要启用的）
            enabledMocks.forEach((mock) => {
              mock.enabled = false
              mock.updatedAt = Date.now()
              objectStore.put(mock)
            })

            // 启用指定的
            mockToEnable.enabled = enabled
            mockToEnable.updatedAt = Date.now()
            const putRequest = objectStore.put(mockToEnable)

            putRequest.onsuccess = () => {
              resolve()
            }

            putRequest.onerror = () => {
              reject(new Error("Failed to toggle global mock response"))
            }
          }
        }

        findEnabledRequest.onerror = () => {
          reject(new Error("Failed to get enabled global mock responses"))
        }
      }

      getRequest.onerror = () => {
        reject(new Error("Failed to get global mock response"))
      }
    } else {
      // 如果禁用，直接更新
      const getRequest = objectStore.get(id)
      getRequest.onsuccess = () => {
        const mock = getRequest.result as GlobalMockResponse
        if (mock) {
          mock.enabled = false
          mock.updatedAt = Date.now()
          const putRequest = objectStore.put(mock)

          putRequest.onsuccess = () => {
            resolve()
          }

          putRequest.onerror = () => {
            reject(new Error("Failed to toggle global mock response"))
          }
        } else {
          reject(new Error("Global mock response not found"))
        }
      }

      getRequest.onerror = () => {
        reject(new Error("Failed to get global mock response"))
      }
    }
  })
}
