import { useState, useCallback } from "react"
import { message } from "antd"
import {
  parseSwaggerData as parseSwaggerDataUtil,
  extractApifoxFolderNames,
  type SwaggerData,
  type ParsedApi,
} from "../apifoxUtils"
import { saveCachedApifoxUrl } from "../apifoxCache"

export const useApifoxValidation = () => {
  const [validating, setValidating] = useState(false)
  const [swaggerData, setSwaggerData] = useState<SwaggerData | null>(null)
  const [availableTags, setAvailableTags] = useState<string[]>([])

  const validateApifoxUrl = useCallback(
    async (
      url: string,
      selectedTags: string[]
    ): Promise<{
      success: boolean
      parsedApis?: ParsedApi[]
    }> => {
      if (!url) {
        return { success: false }
      }

      try {
        setValidating(true)
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        const data = await response.json()

        // 验证是否为有效的Swagger/OpenAPI数据
        if (!data.openapi && !data.swagger) {
          throw new Error("不是有效的OpenAPI/Swagger数据")
        }

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

        // 验证成功后，保存地址到缓存
        saveCachedApifoxUrl(url).catch((error) => {
          console.error("Failed to save cached URL:", error)
        })

        message.success("Apifox地址验证成功")
        return { success: true, parsedApis: apis }
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

  return {
    validating,
    swaggerData,
    availableTags,
    validateApifoxUrl,
    parseSwaggerData,
    resetValidation,
  }
}
