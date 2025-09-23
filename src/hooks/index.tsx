import { useConfigStore } from "@src/store"

/**
 * 判断是否只有默认模块
 * @returns 
 */
export const useOnlyHaveDefaultMockConfig = () => {
  const { config } = useConfigStore()

  const isOnlyHaveDefaultMock =
    config.modules.length === 1 &&
    config.modules[0].label === "默认模块" &&
    config.modules[0].apiArr.length === 1

  return isOnlyHaveDefaultMock
}
