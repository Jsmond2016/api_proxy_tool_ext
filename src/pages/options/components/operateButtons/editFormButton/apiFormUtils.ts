import { ModelAction, ModelNamesMap } from "@src/constant/model"
import {
  APIFOX_FIELD_API_TYPE,
  APIFOX_FIELD_GROUP_NAME,
  APIFOX_FIELD_RUN_IN_APIFOX,
} from "@src/constant/apifoxFields"
import type { ApiConfig } from "@src/types"
import { normalizeApiLookupPath } from "@src/utils/parsedApiCache"
import { camelCase } from "change-case"
import {
  normalizeApifoxLink,
  type ParsedApi,
  type SwaggerData,
} from "../../navButtons/syncApifoxModalButton/apifoxUtils"

export interface ApiMatchResult {
  apiInfo: ParsedApi | null
  matchCount: number
}

const HTTP_METHODS = new Set<ApiConfig["method"]>([
  "GET",
  "POST",
  "PUT",
  "DELETE",
  "PATCH",
])

const normalizePath = (path: string) =>
  normalizeApiLookupPath(path).toLowerCase()

const parseMatchedApi = (
  path: string,
  method: string,
  apiInfo: Record<string, unknown>,
): ParsedApi => {
  const tags = (apiInfo.tags as string[] | undefined) || []
  const summary =
    (apiInfo.summary as string | undefined) || `${method.toUpperCase()} ${path}`
  const runInApifox = apiInfo[APIFOX_FIELD_RUN_IN_APIFOX] as string | undefined
  const groupName =
    (apiInfo[APIFOX_FIELD_GROUP_NAME] as string | undefined) ||
    (tags.length > 0 ? tags[0] : "demo.default")
  const modelApiType =
    (apiInfo[APIFOX_FIELD_API_TYPE] as ParsedApi["modelApiType"] | undefined) ||
    ModelAction.CUSTOM

  let authPointKey = ""
  if (/^[a-zA-Z.]+$/.test(groupName)) {
    const authPrefix = groupName.split(".").join("-")
    let apiName = ModelNamesMap[modelApiType] as string
    if (apiName === "custom") {
      apiName = camelCase(path.split("/").pop() ?? "")
    }
    authPointKey = `${authPrefix}-${apiName}`
  }

  return {
    apiId: runInApifox?.split("/").pop()?.split("-")?.[1] || "",
    path,
    method: method.toUpperCase(),
    summary,
    link: normalizeApifoxLink(runInApifox),
    tags,
    groupName,
    authPointKey,
    modelApiType,
  }
}

/**
 * 精确路径优先，避免同名前缀接口阻止已重置接口的重新添加。
 */
export const findApiInfoFromSwagger = (
  swaggerData: SwaggerData,
  apiUrl: string,
  preferredMethod: ApiConfig["method"] = "GET",
): ApiMatchResult => {
  if (!swaggerData.paths) {
    return { apiInfo: null, matchCount: 0 }
  }

  const normalizedApiUrl = normalizePath(apiUrl)
  const matches: ParsedApi[] = []
  const exactMatches: ParsedApi[] = []

  for (const [path, methods] of Object.entries(swaggerData.paths)) {
    const normalizedPath = normalizePath(path)
    const isExactMatch = normalizedPath === normalizedApiUrl
    const isFuzzyMatch =
      normalizedPath.includes(normalizedApiUrl) ||
      normalizedApiUrl.includes(normalizedPath)

    if (!isFuzzyMatch) continue

    for (const [method, apiInfo] of Object.entries(methods)) {
      const normalizedMethod = method.toUpperCase() as ApiConfig["method"]
      if (
        !HTTP_METHODS.has(normalizedMethod) ||
        typeof apiInfo !== "object" ||
        apiInfo === null
      ) {
        continue
      }

      const match = parseMatchedApi(
        path,
        method,
        apiInfo as Record<string, unknown>,
      )
      matches.push(match)
      if (isExactMatch) exactMatches.push(match)
    }
  }

  if (exactMatches.length > 0) {
    const preferredMatches = exactMatches.filter(
      (api) => api.method === preferredMethod,
    )
    if (preferredMatches.length === 1) {
      return { apiInfo: preferredMatches[0], matchCount: 1 }
    }
    return { apiInfo: exactMatches[0], matchCount: 1 }
  }

  return matches.length === 1
    ? { apiInfo: matches[0], matchCount: 1 }
    : { apiInfo: null, matchCount: matches.length }
}
