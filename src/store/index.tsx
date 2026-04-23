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
}>()((set) => ({
  config: {
    isGlobalEnabled: false,
    modules: [],
    apifoxConfig: undefined,
  },
  setConfig: (configOrUpdater: SetConfigAction) => {
    set((state) => ({
      config:
        typeof configOrUpdater === "function"
          ? configOrUpdater(state.config)
          : configOrUpdater,
    }))
  },
}))

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
