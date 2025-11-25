import { GlobalConfig } from "@src/types"
import { create } from "zustand"
import { persist } from "zustand/middleware"

// 配置更新类型：支持直接传值或函数式更新
type SetConfigAction =
  | GlobalConfig
  | ((prevConfig: GlobalConfig) => GlobalConfig)

// 配置 Store - 使用 Chrome Storage 持久化
export const useConfigStore = create<{
  config: GlobalConfig
  setConfig: (configOrUpdater: SetConfigAction) => void
}>()(
  persist(
    (set, get) => ({
      config: {
        isGlobalEnabled: false,
        modules: [],
        apifoxConfig: undefined,
      },
      setConfig: (configOrUpdater: SetConfigAction) => {
        // 利用 Zustand 原生的函数式更新能力
        set((state) => ({
          config:
            typeof configOrUpdater === "function"
              ? configOrUpdater(state.config)
              : configOrUpdater,
        }))
      },
    }),
    {
      name: "config-storage",
      // 自定义存储实现，使用 Chrome Storage
      storage: {
        getItem: async (name: string) => {
          try {
            const result = await chrome.storage.local.get([name])
            return result[name] || null
          } catch (error) {
            console.error("Failed to get item from Chrome Storage:", error)
            return null
          }
        },
        setItem: async (name: string, value: any) => {
          try {
            await chrome.storage.local.set({ [name]: value })
          } catch (error) {
            console.error("Failed to set item in Chrome Storage:", error)
          }
        },
        removeItem: async (name: string) => {
          try {
            await chrome.storage.local.remove([name])
          } catch (error) {
            console.error("Failed to remove item from Chrome Storage:", error)
          }
        },
      },
      // 只持久化 config 数据
      partialize: (state) => ({ config: state.config }),
      // 禁用跨标签页同步，避免冲突
      skipHydration: false,
    }
  )
)

// 激活模块 ID Store - 使用 localStorage 持久化
export const useActiveModuleIdStore = create<{
  activeModuleId: string
  setActiveModuleId: (activeModuleId: string) => void
}>()(
  persist(
    (set) => ({
      activeModuleId: "",
      setActiveModuleId: (activeModuleId: string) => set({ activeModuleId }),
    }),
    {
      name: "active-module-id-storage",
    }
  )
)

// 搜索关键词 Store - 使用 localStorage 持久化
export const useSearchKeywordStore = create<{
  searchKeyword: string
  setSearchKeyword: (searchKeyword: string) => void
}>()(
  persist(
    (set) => ({
      searchKeyword: "",
      setSearchKeyword: (searchKeyword: string) => set({ searchKeyword }),
    }),
    {
      name: "search-keyword-storage",
    }
  )
)

// 选中的 API Store - 使用 localStorage 持久化
export const useSelectedApiStore = create<{
  selectedApiIds: string[]
  setSelectedApiIds: (selectedApiIds: string[]) => void
}>()(
  persist(
    (set) => ({
      selectedApiIds: [],
      setSelectedApiIds: (selectedApiIds: string[]) => set({ selectedApiIds }),
    }),
    {
      name: "selected-api-ids-storage",
    }
  )
)

// 需要高亮的 API Store - 不需要持久化
export const useHighlightApiStore = create<{
  highlightApiId: string
  setHighlightApiId: (id: string) => void
}>()((set) => ({
  highlightApiId: "",
  setHighlightApiId: (id: string) => set({ highlightApiId: id }),
}))
