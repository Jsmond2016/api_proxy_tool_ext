import { useState, useEffect } from "react"
import { useMemoizedFn } from "ahooks"
import { message } from "antd"
import { GlobalResponse } from "@src/types"
import { getAllGlobalResponses } from "@src/utils/globalResponseUtil"
import { saveConfig } from "@src/utils/configUtil"
import { useConfigStore, useActiveModuleIdStore } from "@src/store"

export const useGlobalResponse = () => {
  const { setConfig } = useConfigStore()
  const [enabledGlobalResponses, setEnabledGlobalResponses] = useState<
    GlobalResponse[]
  >([])

  // 加载全局 Mock 数据
  const loadGlobalResponse = useMemoizedFn(async () => {
    try {
      const list = await getAllGlobalResponses()

      // 获取已启用的全局响应 列表（在全局响应设置中启用的）
      const enabled = list.filter((response) => response.enabled)
      setEnabledGlobalResponses(enabled)
    } catch (error) {
      console.error("Load global response error:", error)
    }
  })

  useEffect(() => {
    loadGlobalResponse()

    // 监听全局响应更新事件
    const handleGlobalResponseUpdate = () => {
      loadGlobalResponse()
    }
    window.addEventListener("globalResponseUpdated", handleGlobalResponseUpdate)

    return () => {
      window.removeEventListener(
        "globalResponseUpdated",
        handleGlobalResponseUpdate
      )
    }
  }, [loadGlobalResponse])

  // 切换单个接口的全局响应开关（每个接口只能选择一个全局响应）
  const handleToggleApiGlobalResponse = useMemoizedFn(
    async (apiId: string, responseId: string, enabled: boolean) => {
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
          // 启用选中的全局响应，先清除该接口的其他全局响应
          updatedApis[apiIndex] = {
            ...updatedApis[apiIndex],
            activeGlobalResponseId: responseId,
          }
        } else {
          // 关闭当前接口的全局响应
          updatedApis[apiIndex] = {
            ...updatedApis[apiIndex],
            activeGlobalResponseId: undefined,
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
        console.error("Toggle api global response error:", error)
      }
    }
  )

  return {
    enabledGlobalResponses,
    loadGlobalResponse,
    handleToggleApiGlobalResponse,
  }
}
