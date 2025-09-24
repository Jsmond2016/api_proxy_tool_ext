import { GlobalConfig } from "@src/types"
import { create } from "zustand"

export const useConfigStore = create<{
  config: GlobalConfig
  setConfig: (config: GlobalConfig) => void
}>((set) => ({
  config: {
    isGlobalEnabled: false,
    modules: [],
  },
  setConfig: (config: GlobalConfig) => set({ config }),
}))

export const useActiveModuleIdStore = create<{
  activeModuleId: string
  setActiveModuleId: (activeModuleId: string) => void
}>((set) => ({
  activeModuleId: "",
  setActiveModuleId: (activeModuleId: string) => set({ activeModuleId }),
}))

export const useSearchKeywordStore = create<{
  searchKeyword: string
  setSearchKeyword: (searchKeyword: string) => void
}>((set) => ({
  searchKeyword: "",
  setSearchKeyword: (searchKeyword: string) => set({ searchKeyword }),
}))
