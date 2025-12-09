import { useMemo } from "react"
import { GlobalConfig } from "../../../../../../types"
import { ParsedApi } from "../apifoxUtils"

interface ConflictResult {
  urlConflicts: string[]
  groupConflicts: string[]
}

export const useConflictDetection = (
  parsedApis: ParsedApi[],
  config: GlobalConfig
): ConflictResult => {
  return useMemo(() => {
    const urlConflicts: string[] = []
    const groupConflicts: string[] = []

    // 检查URL冲突
    parsedApis.forEach((api) => {
      const existingApi = config.modules
        .flatMap((module) => module.apiArr)
        .find((existingApi) => existingApi.apiUrl.includes(api.path))

      if (existingApi) {
        urlConflicts.push(`${api.method} ${api.path} -> ${existingApi.apiName}`)
      }
    })

    // 检查分组名冲突
    const newGroupNames = [...new Set(parsedApis.map((api) => api.groupName))]
    newGroupNames.forEach((groupName) => {
      const existingModule = config.modules.find(
        (module) => module.label === groupName
      )
      if (existingModule) {
        groupConflicts.push(groupName)
      }
    })

    return { urlConflicts, groupConflicts }
  }, [parsedApis, config])
}
