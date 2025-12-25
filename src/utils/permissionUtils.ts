import {
  PermissionPoint,
  SwaggerData,
  PermissionGroup,
} from "@src/types/permission"
import { APIFOX_FIELD_GROUP_NAME } from "@src/constant/apifoxFields"
import { ApiConfig } from "../types"

/**
 * 从接口URL中提取API路径
 * 例如：/api/saas/v1/demo/user/queryList -> /demo/user/queryList
 */
export const extractApiUrl = (url: string): string => {
  let extractedUrl = url

  // 查找 v1 后的内容
  const v1Index = url.indexOf("/v1/")
  if (v1Index !== -1) {
    extractedUrl = url.substring(v1Index + 4) // 跳过 '/v1'
  } else {
    // 如果没有找到 v1，则查找 /api/ 后的内容
    const apiIndex = url.indexOf("/api/")
    if (apiIndex !== -1) {
      extractedUrl = url.substring(apiIndex + 5) // 跳过 '/api'
    }
  }

  // 确保以 / 开头
  if (!extractedUrl.startsWith("/")) {
    extractedUrl = "/" + extractedUrl
  }

  return extractedUrl
}

/**
 * 从swagger数据中解析权限分组
 */
export const parseSwaggerToPermissionGroups = (
  swaggerData: SwaggerData
): PermissionGroup[] => {
  const groups: { [key: string]: PermissionGroup } = {}

  Object.entries(swaggerData.paths).forEach(([url, pathMethods]) => {
    Object.entries(pathMethods).forEach(([method, methodInfo]) => {
      if (typeof methodInfo === "object" && methodInfo.summary) {
        const groupName = methodInfo[APIFOX_FIELD_GROUP_NAME] || "demo.default"

        if (!groups[groupName]) {
          groups[groupName] = {
            groupName,
            apis: [],
          }
        }

        groups[groupName].apis.push({
          url,
          method: method.toUpperCase(),
          name: methodInfo.summary,
          summary: methodInfo.summary,
        })
      }
    })
  })

  return Object.values(groups)
}

/**
 * 生成单个权限点
 */
export const generatePermissionPoint = (
  authPointKey: string,
  apiUrl: string,
  apiName: string,
  parentAuthPointKey: string
): PermissionPoint => {
  const authPointApiUrl = extractApiUrl(apiUrl)

  return {
    parentAuthPointKey,
    authPointApiUrl,
    authPointKey,
    authPointName: apiName,
    type: "权限点",
    priority: null,
    children: null,
    desc: "",
    menuPath: "",
    prefixPath: "",
    systemDomain: "",
  }
}

/**
 * 从API配置生成权限点
 * 直接从数据源中读取已生成的 authPointKey
 */
export const generatePermissionPointsFromApiConfigs = (
  apiConfigs: ApiConfig[],
  parentAuthPointKey: string
): PermissionPoint[] => {
  return apiConfigs.map((api) => ({
    parentAuthPointKey,
    authPointApiUrl: extractApiUrl(api.apiUrl),
    authPointKey: api.authPointKey || "", // 直接从数据源读取权限点key
    authPointName: api.apiName,
    type: "权限点",
    priority: null,
    children: null,
    desc: "",
    menuPath: "",
    prefixPath: "",
    systemDomain: "",
  }))
}

/**
 * 复制文本到剪贴板
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error("复制失败:", error)
    return false
  }
}
