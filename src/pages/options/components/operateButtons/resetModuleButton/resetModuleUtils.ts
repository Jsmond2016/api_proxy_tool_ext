import type { GlobalConfig } from "@src/types"

export const resetModuleApis = (
  config: GlobalConfig,
  moduleId: string,
): GlobalConfig => ({
  ...config,
  modules: config.modules.map((module) =>
    module.id === moduleId ? { ...module, apiArr: [] } : module,
  ),
})
