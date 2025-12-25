import { useState, useEffect } from "react"
import { useMemoizedFn } from "ahooks"
import { message } from "antd"
import { GlobalMockResponse } from "@src/types"
import { getAllGlobalMocks } from "@src/utils/globalMockUtil"
import { saveConfig } from "@src/utils/configUtil"
import { useConfigStore, useActiveModuleIdStore } from "@src/store"

export const useGlobalMock = () => {
  const { setConfig } = useConfigStore()
  const [enabledGlobalMocks, setEnabledGlobalMocks] = useState<
    GlobalMockResponse[]
  >([])

  // 加载全局 Mock 数据
  const loadGlobalMock = useMemoizedFn(async () => {
    try {
      const list = await getAllGlobalMocks()

      // 获取已启用的全局 mock 列表（在全局响应设置中启用的）
      const enabled = list.filter((mock) => mock.enabled)
      setEnabledGlobalMocks(enabled)
    } catch (error) {
      console.error("Load global mock error:", error)
    }
  })

  useEffect(() => {
    loadGlobalMock()

    // 监听全局 Mock 更新事件
    const handleGlobalMockUpdate = () => {
      loadGlobalMock()
    }
    window.addEventListener("globalMockUpdated", handleGlobalMockUpdate)

    return () => {
      window.removeEventListener("globalMockUpdated", handleGlobalMockUpdate)
    }
  }, [loadGlobalMock])

  // 切换单个接口的全局 Mock 开关（每个接口只能选择一个全局 mock）
  const handleToggleApiGlobalMock = useMemoizedFn(
    async (apiId: string, mockId: string, enabled: boolean) => {
      try {
        // 获取最新配置，避免闭包问题
        const currentConfig = useConfigStore.getState().config
        const currentActiveModuleId =
          useActiveModuleIdStore.getState().activeModuleId

        // 找到对应的 API 配置
        const activeModule = currentConfig.modules.find(
          (module) => module.id === currentActiveModuleId
        )
        if (!activeModule) {
          message.error("未找到对应的模块")
          return
        }

        const apiIndex = activeModule.apiArr.findIndex(
          (api) => api.id === apiId
        )
        if (apiIndex === -1) {
          message.error("未找到对应的接口")
          return
        }

        // 更新接口配置
        const updatedApis = [...activeModule.apiArr]
        if (enabled) {
          // 启用选中的全局 mock，先清除该接口的其他全局 mock
          updatedApis[apiIndex] = {
            ...updatedApis[apiIndex],
            activeGlobalMockId: mockId,
          }
        } else {
          // 关闭当前接口的全局 mock
          updatedApis[apiIndex] = {
            ...updatedApis[apiIndex],
            activeGlobalMockId: undefined,
          }
        }

        // 更新配置
        const updatedModules = currentConfig.modules.map((module) =>
          module.id === currentActiveModuleId
            ? { ...module, apiArr: updatedApis }
            : module
        )

        const updatedConfig = { ...currentConfig, modules: updatedModules }
        setConfig(updatedConfig)
        await saveConfig(updatedConfig)

        message.success(enabled ? "已启用全局响应" : "已关闭全局响应")
      } catch (error) {
        message.error("操作失败")
        console.error("Toggle api global mock error:", error)
      }
    }
  )

  return {
    enabledGlobalMocks,
    loadGlobalMock,
    handleToggleApiGlobalMock,
  }
}
