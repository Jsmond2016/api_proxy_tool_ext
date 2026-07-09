import { useState, useCallback } from "react"
import { message } from "antd"
import {
  parseSwaggerData as parseSwaggerDataUtil,
  extractApifoxFolderNames,
  type SwaggerData,
  type ParsedApi,
} from "../apifoxUtils"
import {
  saveCachedApifoxLocalUrl,
  saveCachedApifoxProjectId,
  saveCachedApifoxToken,
  fetchOrGetCachedSwaggerData,
} from "../apifoxCache"

export const useApifoxValidation = () => {
  const [validating, setValidating] = useState(false)
  const [swaggerData, setSwaggerData] = useState<SwaggerData | null>(null)
  const [availableTags, setAvailableTags] = useState<string[]>([])

  const validateApifoxUrl = useCallback(
    async (
      url: string,
      selectedTags: string[],
      mode: "local" | "online" = "local",
      apifoxToken?: string
    ): Promise<{
      success: boolean
      parsedApis?: ParsedApi[]
      swaggerData?: SwaggerData
      availableTags?: string[]
    }> => {
      if (!url) {
        return { success: false }
      }

      try {
        setValidating(true)

        // 使用统一入口获取 Swagger 数据（共享缓存+请求去重）
        const data = await fetchOrGetCachedSwaggerData(
          url,
          mode,
          apifoxToken
        )

        const swaggerDataResult = data as SwaggerData
        setSwaggerData(swaggerDataResult)

        // 提取 tags，过滤掉目录名（x-apifox-folder 及其前缀路径）
        const folderNames = extractApifoxFolderNames(swaggerDataResult)
        const tags = (
          data.tags?.map((tag: { name: string }) => tag.name) || []
        ).filter((tagName: string) => !folderNames.has(tagName))
        setAvailableTags(tags)

        // 解析数据
        const currentSelectedTags = selectedTags.length > 0 ? selectedTags : []
        const apis = parseSwaggerDataUtil(
          swaggerDataResult,
          currentSelectedTags
        )

        // 验证成功后，保存地址到缓存（按模式分开存储）
        if (mode === "online") {
          saveCachedApifoxProjectId(url).catch((error) => {
            console.error("Failed to save cached project ID:", error)
          })
          if (apifoxToken) {
            saveCachedApifoxToken(apifoxToken).catch((error) => {
              console.error("Failed to save cached token:", error)
            })
          }
        } else {
          saveCachedApifoxLocalUrl(url).catch((error) => {
            console.error("Failed to save cached local URL:", error)
          })
        }

        message.success("Apifox地址验证成功")
        return {
          success: true,
          parsedApis: apis,
          swaggerData: swaggerDataResult,
          availableTags: tags,
        }
      } catch (error) {
        message.error(
          `验证失败: ${error instanceof Error ? error.message : "未知错误"}`
        )
        return { success: false }
      } finally {
        setValidating(false)
      }
    },
    []
  )

  const parseSwaggerData = useCallback(
    (selectedTags: string[]): ParsedApi[] | null => {
      if (!swaggerData) {
        return null
      }
      return parseSwaggerDataUtil(swaggerData, selectedTags)
    },
    [swaggerData]
  )

  const resetValidation = useCallback(() => {
    setSwaggerData(null)
    setAvailableTags([])
    setValidating(false)
  }, [])

  /** 恢复已缓存的验证数据（切换模式时使用，避免重复请求） */
  const restoreValidationData = useCallback(
    (data: { swaggerData: SwaggerData | null; availableTags: string[] }) => {
      setSwaggerData(data.swaggerData)
      setAvailableTags(data.availableTags)
    },
    []
  )

  return {
    validating,
    swaggerData,
    availableTags,
    validateApifoxUrl,
    parseSwaggerData,
    resetValidation,
    restoreValidationData,
  }
}
