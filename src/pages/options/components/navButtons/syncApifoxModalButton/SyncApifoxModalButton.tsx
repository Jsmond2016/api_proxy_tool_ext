import React, { useState } from "react"

import { Button, message, Modal, Space, Tooltip } from "antd"
import { InfoCircleOutlined, ReloadOutlined } from "@ant-design/icons"

import SyncApifoxModal from "./SyncApifoxModal"
import { ModuleConfig, ApifoxConfig } from "@src/types"
import { saveConfig, hasOnlyDefaultModule } from "@src/utils/configUtil"
import { useActiveModuleIdStore, useConfigStore, useSearchKeywordStore } from "@src/store"
import { useOnlyHaveDefaultMockConfig } from "@src/hooks"
import {
  convertParsedApisToModules,
  parseSwaggerData,
  validateApifoxUrl,
} from "./apifoxUtils"
import { compareApifoxModules, hasChanges } from "./compareUtils"
import { ChangeSummaryTable } from "./ChangeSummaryTable"
import { setCachedParsedApis } from "@src/utils/parsedApiCache"
import {
  getApifoxModules,
  mergeApifoxModules as mergeApifoxModuleConfigs,
  replaceApifoxModules as replaceApifoxModuleConfigs,
} from "./apifoxSyncUtils"

type SyncApifoxModalComProps = Record<string, never>

// 警告内容常量
const MOCK_DATA_WARNING = {
  title: "发现有模块有 mock 数据",
  content: (
    <Space orientation="vertical">
      <div>发现有模块有 mock 数据, 无法直接同步 Apifox 接口，建议操作: </div>
      <Space orientation="vertical">
        <div>1. 先导出所有 mock 接口进行备份</div>
        <div>2. 一键重置所有 mock 接口</div>
        <div>3. 同步 Apifox 接口</div>
      </Space>
    </Space>
  ),
}

const SyncApifoxModalCom: React.FC<SyncApifoxModalComProps> = () => {
  const [syncApifoxModalVisible, setSyncApifoxModalVisible] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const config = useConfigStore((state) => state.config)
  const setConfig = useConfigStore((state) => state.setConfig)
  const { activeModuleId, setActiveModuleId } = useActiveModuleIdStore()

  const isOnlyHaveDefaultMock = useOnlyHaveDefaultMockConfig()

  /**
   * 检查是否有 Mock 数据，如果有则显示警告
   * @returns 是否可以继续操作
   */
  const checkMockDataAndConfirm = (): boolean => {
    if (!isOnlyHaveDefaultMock) {
      Modal.confirm(MOCK_DATA_WARNING)
      return false
    }
    return true
  }

  // 执行同步操作
  const performSync = (
    newModules: ModuleConfig[],
    showMessage = true,
    replaceAll = false,
  ) => {
    // 使用函数式更新，自动获取最新 state，避免闭包问题
    setConfig((prev) => {
      // 智能判断：如果只有默认模块，直接替换
      const shouldReplace = replaceAll || hasOnlyDefaultModule(prev.modules)

      const newConfig = {
        ...prev,
        modules: shouldReplace
          ? newModules // 替换模式
          : [...prev.modules, ...newModules], // 追加模式
      }
      saveConfig(newConfig)
      return newConfig
    })

    if (newModules.length > 0) {
      setActiveModuleId(newModules[0].id)
    }

    if (showMessage) {
      message.success(`成功同步 ${newModules.length} 个模块`)
    }
  }

  // 智能同步 Apifox 模块
  const syncApifoxModules = (
    newModules: ModuleConfig[],
    showMessage = true,
  ) => {
    const latestConfig = useConfigStore.getState().config
    const apifoxUrl = latestConfig.apifoxConfig?.apifoxUrl
    if (!apifoxUrl) {
      // 没有配置，直接添加（首次设置场景）
      performSync(newModules, showMessage)
      return
    }

    // 找出旧的 Apifox 模块（通过 apiDocUrl 识别）
    const oldApifoxModules = getApifoxModules(latestConfig.modules, apifoxUrl)

    // 如果是首次设置（没有旧模块），直接添加
    if (oldApifoxModules.length === 0) {
      performSync(newModules, showMessage)
      return
    }

    // 刷新场景：对比变化
    const changes = compareApifoxModules(oldApifoxModules, newModules)

    // 如果没有变化
    if (!hasChanges(changes)) {
      message.info("接口无变化")
      return
    }

    // 显示变化摘要，让用户确认
    Modal.confirm({
      title: "检测到 Apifox 接口变化",
      content: <ChangeSummaryTable changes={changes} />,
      width: 1400,
      okText: "确认更新",
      cancelText: "取消",
      onOk() {
        replaceApifoxModules(apifoxUrl, newModules)
      },
    })
  }

  // 替换 Apifox 模块（全量替换，不检测变化）
  const replaceApifoxModules = (
    apifoxUrl: string | undefined,
    newModules: ModuleConfig[],
  ) => {
    let finalModules: ModuleConfig[] = []

    setConfig((prev) => {
      finalModules = replaceApifoxModuleConfigs(
        prev.modules,
        newModules,
        apifoxUrl,
      )

      const newConfig = {
        ...prev,
        modules: finalModules,
      }

      saveConfig(newConfig)
      return newConfig
    })

    if (!finalModules.some((module) => module.id === activeModuleId)) {
      const firstApifoxModule = getApifoxModules(finalModules, apifoxUrl)[0]
      if (firstApifoxModule) {
        setActiveModuleId(firstApifoxModule.id)
      } else if (finalModules.length > 0) {
        setActiveModuleId(finalModules[0].id)
      }
    }

    message.success(`成功修改配置并更新 ${newModules.length} 个模块`)
  }

  // 处理刷新 Apifox 接口
  const handleRefreshApifox = async () => {
    // 检查是否已配置 Apifox
    if (!config.apifoxConfig || !config.apifoxConfig.apifoxUrl) {
      message.warning("请先设置 Apifox 配置")
      return
    }

    try {
      setRefreshing(true)
      const apifoxConfig = config.apifoxConfig
      const apifoxUrl = apifoxConfig.apifoxUrl

      // 验证并获取 Swagger 数据
      const swaggerData = await validateApifoxUrl(
        apifoxUrl,
        apifoxConfig.mode || "local",
        apifoxConfig.apifoxToken
      )
      if (!swaggerData) {
        message.error("无法获取 Apifox 数据，请检查配置")
        return
      }

      // 解析数据
      const selectedTags = apifoxConfig.selectedTags || []
      const parsedApis = parseSwaggerData(swaggerData, selectedTags)

      try {
        const allParsedApis =
          selectedTags.length === 0
            ? parsedApis
            : parseSwaggerData(swaggerData, [])
        await setCachedParsedApis(
          {
            url: apifoxUrl,
            mode: apifoxConfig.mode || "local",
          },
          allParsedApis,
        )
      } catch (error) {
        console.error("Failed to persist parsed Apifox cache:", error)
      }

      if (parsedApis.length === 0) {
        message.warning("没有找到符合条件的接口")
        return
      }

      // 转换为 ModuleConfig 格式
      const newModules = convertParsedApisToModules(parsedApis, apifoxConfig)

      // 智能同步
      syncApifoxModules(newModules)
      // 刷新后清空全局搜索关键词，避免旧搜索词过滤新接口
      useSearchKeywordStore.getState().setSearchKeyword("")
    } catch (error) {
      console.error("刷新失败:", error)
      message.error(
        `刷新失败: ${error instanceof Error ? error.message : "未知错误"}`,
      )
    } finally {
      setRefreshing(false)
    }
  }

  // 处理设置配置
  const handleOpenSettings = () => {
    // 如果已有 Apifox 配置，提示用户选择刷新还是修改配置
    if (config.apifoxConfig?.apifoxUrl) {
      const modal = Modal.warning({
        title: "选择操作",
        icon: <InfoCircleOutlined />,
        closable: true,
        maskClosable: true,
        onCancel: () => {
          modal.destroy()
        },
        content: (
          <div className="space-y-3">
            <p>检测到已有 Apifox 配置：</p>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>
                如果只是<strong>接口内容变化</strong>（增删改接口），请点击
                <strong className="text-blue-600">「刷新接口」</strong>
              </li>
              <li>
                如果需要<strong>修改配置</strong>（修改 URL、Mock 前缀、选择的
                tags），请点击
                <strong className="text-orange-600">「修改设置」</strong>
              </li>
              <li>
                <InfoCircleOutlined className="text-blue-600" /> 温馨提示:
                <span className="font-bold">
                  请点击【存档】按钮 存档当前接口和配置，方便后续恢复
                </span>
              </li>
            </ul>
          </div>
        ),
        footer: (
          <div className="flex justify-end gap-2">
            <Button
              onClick={() => {
                modal.destroy()
                handleRefreshApifox()
              }}
            >
              刷新接口
            </Button>
            <Button
              type="primary"
              danger
              onClick={() => {
                modal.destroy()
                // 用户已经选择修改设置，直接打开弹框
                setSyncApifoxModalVisible(true)
              }}
            >
              修改设置
            </Button>
          </div>
        ),
      })
    } else {
      // 首次设置，检查是否有模块有 mock 数据
      if (checkMockDataAndConfirm()) {
        setSyncApifoxModalVisible(true)
      }
    }
  }

  // 处理保存配置
  const handleSaveConfig = (apifoxConfig: ApifoxConfig) => {
    // 使用函数式更新，自动获取最新 state，避免闭包问题
    setConfig((prev) => {
      const newConfig = {
        ...prev,
        apifoxConfig,
      }
      saveConfig(newConfig)
      return newConfig
    })

    // 注意：不在这里显示成功提示，由 handleSyncApifox 统一显示
  }

  // 差异合并：保留旧接口，只添加新接口
  const mergeApifoxModules = (
    newModules: ModuleConfig[],
    apifoxUrl?: string,
  ) => {
    let result = mergeApifoxModuleConfigs([], [], apifoxUrl)

    setConfig((prev) => {
      result = mergeApifoxModuleConfigs(prev.modules, newModules, apifoxUrl)

      const newConfig = {
        ...prev,
        modules: result.modules,
      }

      saveConfig(newConfig)
      return newConfig
    })

    // 设置激活模块：如果当前激活的模块还存在，保持它；否则使用第一个合并后的模块
    const activeModuleStillExists = result.modules.some(
      (m) => m.id === activeModuleId,
    )
    if (activeModuleStillExists) {
      // 保持当前激活的模块
      setActiveModuleId(activeModuleId)
    } else if (result.firstApifoxModuleId) {
      // 使用第一个合并后的模块
      setActiveModuleId(result.firstApifoxModuleId)
    } else if (result.modules.length > 0) {
      // 如果合并后没有新模块，使用第一个模块
      setActiveModuleId(result.modules[0].id)
    }

    message.success(
      `成功合并配置，新增 ${result.addedCount} 个接口，保留 ${result.retainedCount} 个旧接口`,
    )
  }

  // 处理同步Apifox接口（从弹窗）

  const handleSyncApifox = (
    newModules: ModuleConfig[],
    mergeStrategy?: "replace" | "merge",
  ) => {
    try {
      // 使用 useConfigStore.getState() 获取最新 config，避免闭包中 config 未更新导致模块匹配错误
      const latestConfig = useConfigStore.getState().config
      const apifoxUrl = latestConfig.apifoxConfig?.apifoxUrl
      const oldApifoxModules = getApifoxModules(
        latestConfig.modules,
        apifoxUrl
      )

      // 判断是否为首次设置（没有旧模块）
      const isFirstSetup = oldApifoxModules.length === 0

      if (isFirstSetup) {
        // 首次设置：直接添加模块
        performSync(newModules, false)
        message.success(`成功保存配置并同步 ${newModules.length} 个模块`)
      } else if (mergeStrategy === "merge") {
        // 差异合并：保留旧接口，只添加新接口
        mergeApifoxModules(newModules, apifoxUrl)
      } else {
        // 全量替换：删除旧模块，添加新模块
        replaceApifoxModules(apifoxUrl, newModules)
      }

      setSyncApifoxModalVisible(false)
      // 同步后清空全局搜索关键词，避免旧搜索词过滤新导入的接口
      useSearchKeywordStore.getState().setSearchKeyword("")
    } catch (error) {
      console.error("同步失败:", error)
      message.error(
        `同步失败: ${error instanceof Error ? error.message : "未知错误"}`,
      )
    }
  }

  return (
    <>
      <Space.Compact>
        <Button type="primary" onClick={handleOpenSettings}>
          设置 Apifox 配置
        </Button>
        <Tooltip title="刷新 Apifox 接口">
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            loading={refreshing}
            onClick={handleRefreshApifox}
          />
        </Tooltip>
      </Space.Compact>
      <SyncApifoxModal
        visible={syncApifoxModalVisible}
        onCancel={() => setSyncApifoxModalVisible(false)}
        onOk={handleSyncApifox}
        onSaveConfig={handleSaveConfig}
        config={config}
      />
    </>
  )
}

export default SyncApifoxModalCom
