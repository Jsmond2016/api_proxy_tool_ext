import { useState, useCallback } from "react"
import { message } from "antd"
import {
  parseSwaggerData as parseSwaggerDataUtil,
  type SwaggerData,
  type ApifoxStatus,
  DEFAULT_APIFOX_STATUS,
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
      selectedTags: string[],
      selectedStatus: ApifoxStatus
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

        // 提取tags
        const tags = data.tags?.map((tag: { name: string }) => tag.name) || []
        setAvailableTags(tags)

        // 解析数据
        const currentSelectedTags = selectedTags.length > 0 ? selectedTags : []
        const currentSelectedStatus = selectedStatus || DEFAULT_APIFOX_STATUS
        const apis = parseSwaggerDataUtil(
          swaggerDataResult,
          currentSelectedTags,
          currentSelectedStatus
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
    (
      selectedTags: string[],
      selectedStatus: ApifoxStatus
    ): ParsedApi[] | null => {
      if (!swaggerData) {
        return null
      }
      return parseSwaggerDataUtil(swaggerData, selectedTags, selectedStatus)
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
