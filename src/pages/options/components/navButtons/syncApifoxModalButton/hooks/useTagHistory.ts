import { useState, useEffect, useCallback } from "react"
import {
  getTagHistory,
  addTagHistory,
  removeTagHistory,
  type TagHistoryItem,
} from "../apifoxCache"

export const useTagHistory = () => {
  const [tagHistory, setTagHistory] = useState<TagHistoryItem[]>([])

  const loadTagHistory = useCallback(async () => {
    try {
      const history = await getTagHistory()
      setTagHistory(history)
    } catch (error) {
      console.error("Failed to load tag history:", error)
      setTagHistory([])
    }
  }, [])

  const saveTagHistory = useCallback(
    async (tags: string[]) => {
      if (tags.length === 0) {
        return
      }

      try {
        await addTagHistory(tags)
        await loadTagHistory()
      } catch (error) {
        console.error("Failed to save tag history:", error)
      }
    },
    [loadTagHistory]
  )

  const deleteTagHistory = useCallback(
    async (timestamp: number) => {
      try {
        await removeTagHistory(timestamp)
        await loadTagHistory()
      } catch (error) {
        console.error("Failed to remove tag history:", error)
      }
    },
    [loadTagHistory]
  )

  useEffect(() => {
    loadTagHistory()
  }, [loadTagHistory])

  return {
    tagHistory,
    loadTagHistory,
    saveTagHistory,
    deleteTagHistory,
  }
}
