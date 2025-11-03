import React, { useState } from "react"

import { Dropdown, Button, message, Modal, Space } from "antd"
import type { MenuProps } from "antd"

import SyncApifoxModal from "./SyncApifoxModal"
import { ModuleConfig, ApifoxConfig } from "@src/types"
import { saveConfig } from "@src/utils/configUtil"
import { useActiveModuleIdStore, useConfigStore } from "@src/store"
import { useOnlyHaveDefaultMockConfig } from "@src/hooks"
import {
  SyncOutlined,
  ReloadOutlined,
  SettingOutlined,
} from "@ant-design/icons"
import {
  convertParsedApisToModules,
  parseSwaggerData,
  validateApifoxUrl,
  type ParsedApi,
  type SwaggerData,
} from "./apifoxUtils"
import { compareApifoxModules, hasChanges } from "./compareUtils"
import { ChangeSummaryTable } from "./ChangeSummaryTable"

type SyncApifoxModalComProps = {}

const MOCK_PREFIX = "http://127.0.0.1:4523/m1/3155205-1504204-default"

// 警告内容常量
const MOCK_DATA_WARNING = {
  title: "发现有模块有 mock 数据",
  content: (
    <Space direction="vertical">
      <div>发现有模块有 mock 数据, 无法直接同步 Apifox 接口，建议操作: </div>
      <Space direction="vertical">
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
  console.log("config XXX==>>", config)
  const setConfig = useConfigStore((state) => state.setConfig)
  const { setActiveModuleId } = useActiveModuleIdStore()

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
  const performSync = (newModules: ModuleConfig[]) => {
    // 使用函数式更新，自动获取最新 state，避免闭包问题
    setConfig((prev) => {
      const newConfig = {
        ...prev,
        modules: [...prev.modules, ...newModules],
      }
      saveConfig(newConfig)
      return newConfig
    })

    if (newModules.length > 0) {
      setActiveModuleId(newModules[0].id)
    }

    message.success(`成功同步 ${newModules.length} 个模块`)
  }

  // 智能同步 Apifox 模块
  const syncApifoxModules = (newModules: ModuleConfig[]) => {
    const apifoxUrl = config.apifoxConfig?.apifoxUrl
    if (!apifoxUrl) {
      // 没有配置，直接添加（首次设置场景）
      performSync(newModules)
      return
    }

    // 找出旧的 Apifox 模块（通过 apiDocUrl 识别）
    const oldApifoxModules = config.modules.filter(
      (m) => m.apiDocUrl === apifoxUrl
    )

    // 如果是首次设置（没有旧模块），直接添加
    if (oldApifoxModules.length === 0) {
      performSync(newModules)
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
        replaceApifoxModules(oldApifoxModules, newModules)
      },
    })
  }

  // 替换 Apifox 模块
  const replaceApifoxModules = (
    oldModules: ModuleConfig[],
    newModules: ModuleConfig[]
  ) => {
    setConfig((prev) => {
      // 过滤掉旧的 Apifox 模块
      const otherModules = prev.modules.filter(
        (m) => !oldModules.find((old) => old.id === m.id)
      )

      // 添加新模块
      const newConfig = {
        ...prev,
        modules: [...otherModules, ...newModules],
      }

      saveConfig(newConfig)
      return newConfig
    })

    // 设置激活模块
    if (newModules.length > 0) {
      setActiveModuleId(newModules[0].id)
    }

    message.success(`成功更新 ${newModules.length} 个模块`)
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

      // 验证并获取 Swagger 数据
      const swaggerData = await validateApifoxUrl(apifoxConfig.apifoxUrl)
      if (!swaggerData) {
        message.error("无法获取 Apifox 数据，请检查配置")
        return
      }

      // 解析数据
      const selectedTags = apifoxConfig.selectedTags || []
      const parsedApis = parseSwaggerData(swaggerData, selectedTags)

      if (parsedApis.length === 0) {
        message.warning("没有找到符合条件的接口")
        return
      }

      // 转换为 ModuleConfig 格式
      const newModules = convertParsedApisToModules(parsedApis, apifoxConfig)

      // 智能同步
      syncApifoxModules(newModules)
    } catch (error) {
      console.error("刷新失败:", error)
      message.error(
        `刷新失败: ${error instanceof Error ? error.message : "未知错误"}`
      )
    } finally {
      setRefreshing(false)
    }
  }

  // 处理设置配置
  const handleOpenSettings = () => {
    // 检查是否有模块有 mock 数据
    if (checkMockDataAndConfirm()) {
      setSyncApifoxModalVisible(true)
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

    message.success("Apifox 配置已保存")
  }

  // 处理同步Apifox接口（从弹窗）
  const handleSyncApifox = (newModules: ModuleConfig[]) => {
    try {
      syncApifoxModules(newModules)
      setSyncApifoxModalVisible(false)
    } catch (error) {
      console.error("同步失败:", error)
      message.error(
        `同步失败: ${error instanceof Error ? error.message : "未知错误"}`
      )
    }
  }

  // 下拉菜单项
  const menuItems: MenuProps["items"] = [
    {
      key: "settings",
      label: "设置 Apifox 配置",
      icon: <SettingOutlined />,
      onClick: handleOpenSettings,
    },
    {
      key: "refresh",
      label: "刷新 Apifox 接口",
      icon: <ReloadOutlined />,
      onClick: handleRefreshApifox,
      disabled: refreshing || !config.apifoxConfig?.apifoxUrl,
    },
  ]

  return (
    <>
      <Dropdown.Button
        type="primary"
        menu={{ items: menuItems }}
        onClick={handleOpenSettings}
        icon={<SyncOutlined />}
        loading={refreshing}
      >
        设置 Apifox 配置
      </Dropdown.Button>
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
