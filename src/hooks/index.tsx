import { useActiveModuleIdStore, useConfigStore } from "@src/store"
import { hasOnlyDefaultModule } from "@src/utils/configUtil"

/**
 * 判断是否只有默认模块
 * @returns
 */
export const useOnlyHaveDefaultMockConfig = () => {
  const { config } = useConfigStore()
  return hasOnlyDefaultModule(config.modules)
}

export const useActiveModule = () => {
  const { config } = useConfigStore(config => config)
  const activeModuleId = useActiveModuleIdStore((conf) => conf.activeModuleId)

  return config.modules.find((module) => module.id === activeModuleId)
}
