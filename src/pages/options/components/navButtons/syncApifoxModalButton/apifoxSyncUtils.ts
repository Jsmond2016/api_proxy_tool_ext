import type { ApiConfig, ModuleConfig } from "@src/types"

const EXTERNAL_MODULE_KEY_PREFIX = "quick.mock.external"

const getApiKey = (api: ApiConfig): string => `${api.apiUrl}:${api.method}`

const isExternalModule = (module: ModuleConfig): boolean =>
  module.source === "external" || module.apiDocKey.startsWith(EXTERNAL_MODULE_KEY_PREFIX)

export const isApifoxApi = (api: ApiConfig, module: ModuleConfig, apifoxUrl?: string): boolean => {
  if (!apifoxUrl || module.apiDocUrl !== apifoxUrl || isExternalModule(module)) {
    return false
  }

  if (module.apifoxApiIds) {
    return module.apifoxApiIds.includes(api.id)
  }

  // 历史同步数据没有 ID 清单；手工添加和旧版外部导入均不会写入 tags。
  return Boolean(api.tags?.length)
}

export const getApifoxModules = (modules: ModuleConfig[], apifoxUrl?: string): ModuleConfig[] =>
  modules.flatMap((module) => {
    const apiArr = module.apiArr.filter((api) => isApifoxApi(api, module, apifoxUrl))

    return apiArr.length > 0 ? [{ ...module, apiArr }] : []
  })

export const replaceApifoxModules = (
  modules: ModuleConfig[],
  newModules: ModuleConfig[],
  apifoxUrl?: string
): ModuleConfig[] => {
  const newModulesByLabel = new Map(newModules.map((module) => [module.label, module]))
  const consumedLabels = new Set<string>()

  const retainedModules = modules.flatMap((module) => {
    const syncedApis = module.apiArr.filter((api) => isApifoxApi(api, module, apifoxUrl))
    if (syncedApis.length === 0) {
      return [module]
    }

    const customApis = module.apiArr.filter((api) => !isApifoxApi(api, module, apifoxUrl))
    const replacement = newModulesByLabel.get(module.label)
    if (replacement) {
      consumedLabels.add(module.label)
      return [
        {
          ...replacement,
          id: module.id,
          dataWrapper: module.dataWrapper,
          pageDomain: module.pageDomain,
          requestHeaders: module.requestHeaders,
          apifoxApiIds: replacement.apiArr.map((api) => api.id),
          apiArr: [...replacement.apiArr, ...customApis]
        }
      ]
    }

    if (customApis.length === 0) {
      return []
    }

    return [
      {
        ...module,
        apiDocUrl: undefined,
        source: undefined,
        apifoxApiIds: undefined,
        apiArr: customApis
      }
    ]
  })

  return [...retainedModules, ...newModules.filter((module) => !consumedLabels.has(module.label))]
}

export interface MergeApifoxModulesResult {
  modules: ModuleConfig[]
  addedCount: number
  retainedCount: number
  firstApifoxModuleId?: string
}

export const mergeApifoxModules = (
  modules: ModuleConfig[],
  newModules: ModuleConfig[],
  apifoxUrl?: string
): MergeApifoxModulesResult => {
  const oldApifoxModules = getApifoxModules(modules, apifoxUrl)
  const oldModuleIds = new Set(oldApifoxModules.map((module) => module.id))
  const existingApiKeys = new Set(oldApifoxModules.flatMap((module) => module.apiArr.map(getApiKey)))
  let addedCount = 0

  const mergedModules = newModules.map((newModule) => {
    const oldModule = modules.find((module) => oldModuleIds.has(module.id) && module.label === newModule.label)
    const oldSyncedModule = oldApifoxModules.find((module) => module.id === oldModule?.id)
    const newApis = newModule.apiArr.filter((api) => {
      const isNew = !existingApiKeys.has(getApiKey(api))
      if (isNew) addedCount += 1
      return isNew
    })

    return oldModule
      ? {
          ...oldModule,
          source: "apifox" as const,
          apifoxApiIds: [
            ...(oldSyncedModule?.apiArr.map((api) => api.id) ?? []),
            ...newApis.map((api) => api.id)
          ],
          apiArr: [...oldModule.apiArr, ...newApis]
        }
      : { ...newModule, apiArr: newApis }
  })

  const mergedLabels = new Set(mergedModules.map((module) => module.label))
  const untouchedModules = modules.filter((module) => !oldModuleIds.has(module.id) || !mergedLabels.has(module.label))

  return {
    modules: [...untouchedModules, ...mergedModules],
    addedCount,
    retainedCount: oldApifoxModules.reduce((total, module) => total + module.apiArr.length, 0),
    firstApifoxModuleId: mergedModules[0]?.id
  }
}
