/**
 * 归档工具函数 - 使用 IndexedDB 存储归档数据
 */

import {
  GlobalConfig,
  ArchiveData,
  ArchiveRecord,
  ModuleConfig,
  QuickMockConfig,
} from "@src/types"
import { getIterationInfo } from "@src/pages/options/components/navButtons/syncApifoxModalButton/apifoxCache"

const DB_NAME = "api-proxy-archive-db"
const DB_VERSION = 1
const STORE_NAME = "archives"

// IndexedDB 数据库实例
let dbInstance: IDBDatabase | null = null

/**
 * 初始化 IndexedDB 数据库
 */
export const initArchiveDB = (): Promise<IDBDatabase> => {
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

      // 创建对象存储
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        })

        // 创建索引
        objectStore.createIndex("tag", "tag", { unique: false })
        objectStore.createIndex("archivedAt", "archivedAt", { unique: false })
        objectStore.createIndex("tag-archivedAt", ["tag", "archivedAt"], {
          unique: false,
        })
      }
    }
  })
}

/**
 * 收集指定 tag 的所有相关数据
 */
export const archiveTagData = async (
  tag: string,
  config: GlobalConfig
): Promise<ArchiveData> => {
  // 1. 收集指定 tag 的接口
  const archivedModules: ModuleConfig[] = []
  const usedQuickMockKeys = new Set<string>()

  config.modules.forEach((module) => {
    const relatedApis = module.apiArr.filter(
      (api) => api.tags && api.tags.includes(tag)
    )

    if (relatedApis.length > 0) {
      // 收集使用的快速联调配置 key
      relatedApis.forEach((api) => {
        if (api.quickMockKey) {
          usedQuickMockKeys.add(api.quickMockKey)
        }
        if (api.customMockResponses) {
          // 自定义响应已经包含在 api 中，不需要额外收集
        }
      })

      // 如果模块下所有接口都属于该 tag，保留完整模块
      if (relatedApis.length === module.apiArr.length) {
        archivedModules.push({ ...module })
      } else {
        // 否则创建新模块只包含相关接口
        archivedModules.push({
          ...module,
          apiArr: relatedApis.map((api) => ({ ...api })),
        })
      }
    }
  })

  // 2. 收集迭代信息
  const iterationInfoMap = await getIterationInfo()
  const iterationInfo = iterationInfoMap[tag]

  // 3. 收集快速联调配置
  const quickMockConfigs: QuickMockConfig[] = []
  if (config.quickMockConfigs && usedQuickMockKeys.size > 0) {
    config.quickMockConfigs.forEach((config) => {
      if (usedQuickMockKeys.has(config.key)) {
        quickMockConfigs.push({ ...config })
      }
    })
  }

  // 4. 收集 Apifox 配置快照
  const apifoxConfig = config.apifoxConfig
    ? { ...config.apifoxConfig }
    : undefined

  // 构建归档数据
  const archiveData: ArchiveData = {
    version: "1.0.0",
    tag,
    archivedAt: Date.now(),
    iterationInfo: iterationInfo
      ? {
          tag: iterationInfo.tag,
          requirementDocs: iterationInfo.requirementDocs,
          technicalDocs: iterationInfo.technicalDocs,
          prototypeDocs: iterationInfo.prototypeDocs,
        }
      : undefined,
    modules: archivedModules,
    quickMockConfigs:
      quickMockConfigs.length > 0 ? quickMockConfigs : undefined,
    apifoxConfig,
  }

  return archiveData
}

/**
 * 保存归档数据到 IndexedDB
 */
export const saveArchive = async (
  archiveData: ArchiveData
): Promise<number> => {
  const db = await initArchiveDB()

  // 计算统计信息
  const apiCount = archiveData.modules.reduce(
    (total, module) => total + module.apiArr.length,
    0
  )
  const moduleCount = archiveData.modules.length

  const archiveRecord: Omit<ArchiveRecord, "id"> = {
    tag: archiveData.tag,
    archivedAt: archiveData.archivedAt,
    archiveData,
    apiCount,
    moduleCount,
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite")
    const objectStore = transaction.objectStore(STORE_NAME)
    const request = objectStore.add(archiveRecord)

    request.onsuccess = () => {
      resolve(request.result as number)
    }

    request.onerror = () => {
      reject(new Error("Failed to save archive"))
    }
  })
}

/**
 * 从 IndexedDB 加载归档数据
 */
export const loadArchive = async (archiveId: number): Promise<ArchiveRecord> => {
  const db = await initArchiveDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly")
    const objectStore = transaction.objectStore(STORE_NAME)
    const request = objectStore.get(archiveId)

    request.onsuccess = () => {
      const result = request.result
      if (result) {
        resolve(result as ArchiveRecord)
      } else {
        reject(new Error("Archive not found"))
      }
    }

    request.onerror = () => {
      reject(new Error("Failed to load archive"))
    }
  })
}

/**
 * 获取所有归档记录列表
 */
export const getArchiveList = async (): Promise<ArchiveRecord[]> => {
  const db = await initArchiveDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly")
    const objectStore = transaction.objectStore(STORE_NAME)
    const index = objectStore.index("archivedAt")
    const request = index.openCursor(null, "prev") // 倒序排列

    const archives: ArchiveRecord[] = []

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result
      if (cursor) {
        archives.push(cursor.value as ArchiveRecord)
        cursor.continue()
      } else {
        resolve(archives)
      }
    }

    request.onerror = () => {
      reject(new Error("Failed to get archive list"))
    }
  })
}

/**
 * 删除归档数据
 */
export const deleteArchive = async (archiveId: number): Promise<void> => {
  const db = await initArchiveDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite")
    const objectStore = transaction.objectStore(STORE_NAME)
    const request = objectStore.delete(archiveId)

    request.onsuccess = () => {
      resolve()
    }

    request.onerror = () => {
      reject(new Error("Failed to delete archive"))
    }
  })
}

/**
 * 根据 tag 获取归档列表
 */
export const getArchivesByTag = async (
  tag: string
): Promise<ArchiveRecord[]> => {
  const db = await initArchiveDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly")
    const objectStore = transaction.objectStore(STORE_NAME)
    const index = objectStore.index("tag")
    const request = index.getAll(tag)

    request.onsuccess = () => {
      const archives = request.result as ArchiveRecord[]
      // 按时间倒序排列
      archives.sort((a, b) => b.archivedAt - a.archivedAt)
      resolve(archives)
    }

    request.onerror = () => {
      reject(new Error("Failed to get archives by tag"))
    }
  })
}

