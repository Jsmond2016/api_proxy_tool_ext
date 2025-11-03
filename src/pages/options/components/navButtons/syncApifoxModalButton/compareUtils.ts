import type { ModuleConfig, ApiConfig } from "@src/types"

/**
 * API 变化类型
 */
export interface ApiChange {
  id: string
  oldApi: ApiConfig
  newApi: ApiConfig
  changes: string[] // 变化描述，如: ["名称变化", "分组变化"]
  oldValues: Record<string, string>
  newValues: Record<string, string>
}

/**
 * 模块和 API 变化汇总
 */
export interface ApifoxChanges {
  added: {
    modules: ModuleConfig[]
    apis: Array<ApiConfig & { groupName: string; moduleLabel: string }>
  }
  removed: {
    modules: ModuleConfig[]
    apis: Array<ApiConfig & { groupName: string; moduleLabel: string }>
  }
  modified: ApiChange[]
}

/**
 * 对比新旧 Apifox 模块，找出变化
 */
export const compareApifoxModules = (
  oldModules: ModuleConfig[],
  newModules: ModuleConfig[]
): ApifoxChanges => {
  console.log("🔍 开始对比 Apifox 模块")
  console.log(
    `📊 旧模块数: ${oldModules.length}, 新模块数: ${newModules.length}`
  )

  const changes: ApifoxChanges = {
    added: {
      modules: [],
      apis: [],
    },
    removed: {
      modules: [],
      apis: [],
    },
    modified: [],
  }

  // 创建映射表，方便查找
  const oldModuleMap = new Map(oldModules.map((m) => [m.label, m]))
  const newModuleMap = new Map(newModules.map((m) => [m.label, m]))

  // 1. 找出新增的模块
  newModules.forEach((newModule) => {
    if (!oldModuleMap.has(newModule.label)) {
      changes.added.modules.push(newModule)
    }
  })

  // 2. 找出删除的模块
  oldModules.forEach((oldModule) => {
    if (!newModuleMap.has(oldModule.label)) {
      changes.removed.modules.push(oldModule)
    }
  })

  // 3. 对于共同存在的模块，对比 API 变化
  newModules.forEach((newModule) => {
    const oldModule = oldModuleMap.get(newModule.label)
    if (!oldModule) return // 新增的模块已处理

    // 创建 API 映射表（使用 id 作为唯一标识）
    const oldApiMap = new Map(oldModule.apiArr.map((api) => [api.id, api]))
    const newApiMap = new Map(newModule.apiArr.map((api) => [api.id, api]))

    console.log(
      `🔑 模块 "${newModule.label}" - 旧API IDs:`,
      Array.from(oldApiMap.keys())
    )
    console.log(
      `🔑 模块 "${newModule.label}" - 新API IDs:`,
      Array.from(newApiMap.keys())
    )

    // 找出新增的 API
    newModule.apiArr.forEach((newApi) => {
      if (!oldApiMap.has(newApi.id)) {
        changes.added.apis.push({
          ...newApi,
          groupName: newModule.label,
          moduleLabel: newModule.label,
        })
      }
    })

    // 找出删除的 API
    oldModule.apiArr.forEach((oldApi) => {
      if (!newApiMap.has(oldApi.id)) {
        changes.removed.apis.push({
          ...oldApi,
          groupName: oldModule.label,
          moduleLabel: oldModule.label,
        })
      }
    })

    // 找出修改的 API
    newModule.apiArr.forEach((newApi) => {
      const oldApi = oldApiMap.get(newApi.id)
      if (!oldApi) {
        console.log(
          `⚠️ 新API未在旧列表中找到: ${newApi.apiName} (ID: ${newApi.id})`
        )
        return // 新增的 API 已处理
      }

      const apiChanges: string[] = []
      const oldValues: Record<string, string> = {}
      const newValues: Record<string, string> = {}

      // 检查名称变化
      if (oldApi.apiName !== newApi.apiName) {
        apiChanges.push("名称变化")
        oldValues.apiName = oldApi.apiName
        newValues.apiName = newApi.apiName
      }

      // 检查 URL 变化
      if (oldApi.apiUrl !== newApi.apiUrl) {
        apiChanges.push("URL 变化")
        oldValues.apiUrl = oldApi.apiUrl
        newValues.apiUrl = newApi.apiUrl
      }

      // 检查方法变化
      if (oldApi.method !== newApi.method) {
        apiChanges.push("方法变化")
        oldValues.method = oldApi.method
        newValues.method = newApi.method
      }

      // 注意：不检测 redirectURL 变化，因为它是由 mockPrefix + apiUrl 自动拼接的

      // 如果有变化，记录
      if (apiChanges.length > 0) {
        console.log(
          `✏️ 检测到修改: ${newApi.apiName} (ID: ${
            newApi.id
          }), 变化: ${apiChanges.join(", ")}`
        )
        changes.modified.push({
          id: newApi.id,
          oldApi,
          newApi,
          changes: apiChanges,
          oldValues,
          newValues,
        })
      }
    })
  })

  console.log(
    `📈 对比结果: 新增 ${changes.added.modules.length} 个模块, ${changes.added.apis.length} 个接口`
  )
  console.log(
    `📉 对比结果: 删除 ${changes.removed.modules.length} 个模块, ${changes.removed.apis.length} 个接口`
  )
  console.log(`✏️ 对比结果: 修改 ${changes.modified.length} 个接口`)

  return changes
}

/**
 * 检查是否有变化
 */
export const hasChanges = (changes: ApifoxChanges): boolean => {
  return (
    changes.added.modules.length > 0 ||
    changes.added.apis.length > 0 ||
    changes.removed.modules.length > 0 ||
    changes.removed.apis.length > 0 ||
    changes.modified.length > 0
  )
}
