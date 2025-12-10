import { useMemo } from "react"
import { GlobalConfig } from "../../../../../../types"
import { ParsedApi } from "../apifoxUtils"

interface ConflictResult {
  duplicateTags: string[]
}

/**
 * 检测 tag 重复冲突
 * 通过比较当前选择的 tags 和已保存配置中的 tags 来判断是否有重复
 */
export const useConflictDetection = (
  selectedTags: string[],
  config: GlobalConfig
): ConflictResult => {
  return useMemo(() => {
    const duplicateTags: string[] = []

    // 如果当前没有选择 tags，不检测冲突
    if (selectedTags.length === 0) {
      return { duplicateTags: [] }
    }

    // 获取已保存的 tags（从 apifoxConfig 中）
    const savedTags = config.apifoxConfig?.selectedTags || []

    // 检查当前选择的 tags 是否与已保存的 tags 有重复
    selectedTags.forEach((tag) => {
      if (savedTags.includes(tag)) {
        duplicateTags.push(tag)
      }
    })

    return { duplicateTags }
  }, [selectedTags, config])
}
