import React, { useState } from "react"

import { Button, message, Modal, Space } from "antd"

import SyncApifoxModal from "./SyncApifoxModal"
import { ModuleConfig } from "@src/types"
import { saveConfig } from "@src/utils/configUtil"
import { useActiveModuleIdStore, useConfigStore } from "@src/store"
import { isApiUrlDuplicate, isModuleLabelDuplicate } from "@src/utils/chromeApi"
import { useOnlyHaveDefaultMockConfig } from "@src/hooks"
import { SyncOutlined } from "@ant-design/icons"
type SyncApifoxModalComProps = {}

const SyncApifoxModalCom: React.FC<SyncApifoxModalComProps> = () => {
  const [syncApifoxModalVisible, setSyncApifoxModalVisible] = useState(false)

  const { config, setConfig } = useConfigStore()
  const { setActiveModuleId } = useActiveModuleIdStore()

  const isOnlyHaveDefaultMock = useOnlyHaveDefaultMockConfig()

  const handlePreSyncApifox = () => {
    // 检查是否有模块-有 mock 数据，若有，提示：是否先导出所有 mock 接口进行备份？
    if (!isOnlyHaveDefaultMock) {
      Modal.confirm({
        title: "发现有模块有 mock 数据",
        content: (
          <Space direction="vertical">
            <div>
              发现有模块有 mock 数据, 无法直接同步 Apifox 接口，建议操作:{" "}
            </div>
            <Space direction="vertical">
              <div>1. 先导出所有 mock 接口进行备份</div>
              <div>2. 一键重置所有 mock 接口</div>
              <div>3. 同步 Apifox 接口</div>
            </Space>
          </Space>
        ),
      })
    } else {
      setSyncApifoxModalVisible(true)
    }
  }

  // 执行同步操作
  const performSync = (newModules: ModuleConfig[]) => {
    const newConfig = {
      ...config,
      modules: [...config.modules, ...newModules],
    }

    setConfig(newConfig)
    saveConfig(newConfig)

    if (newModules.length > 0) {
      setActiveModuleId(newModules[0].id)
    }

    message.success(`成功同步 ${newModules.length} 个模块`)
    setSyncApifoxModalVisible(false)
  }

  // 处理同步Apifox接口
  const handleSyncApifox = (newModules: ModuleConfig[]) => {
    try {
      const duplicateModules: string[] = []
      const duplicateApis: string[] = []

      // 检查模块标签是否重复
      newModules.forEach((module) => {
        if (isModuleLabelDuplicate(config.modules, module.label)) {
          duplicateModules.push(module.label)
        }

        // 检查API URL是否重复
        module.apiArr.forEach((api) => {
          if (isApiUrlDuplicate(config.modules, api.apiUrl)) {
            duplicateApis.push(`${api.apiName} (${api.apiUrl})`)
          }
        })
      })

      // 显示重复项警告
      if (duplicateModules.length > 0 || duplicateApis.length > 0) {
        let warningMessage = "发现重复项：\n"
        if (duplicateModules.length > 0) {
          warningMessage += `重复的模块: ${duplicateModules.join(", ")}\n`
        }
        if (duplicateApis.length > 0) {
          warningMessage += `重复的接口: ${duplicateApis.join(", ")}\n`
        }
        warningMessage += "这些重复项将被跳过，是否继续同步？"

        Modal.confirm({
          title: "发现重复项",
          content: warningMessage,
          onOk() {
            // 继续同步
            performSync(newModules)
          },
          onCancel() {
            // 取消同步
          },
        })
        return
      }

      // 没有重复项，直接同步
      performSync(newModules)
    } catch (error) {
      console.error("同步失败:", error)
      message.error(
        `同步失败: ${error instanceof Error ? error.message : "未知错误"}`
      )
    }
  }

  return (
    <>
      <Button
        icon={<SyncOutlined />}
        type="primary"
        onClick={() => handlePreSyncApifox()}
      >
        同步 Apifox 接口
      </Button>
      <SyncApifoxModal
        visible={syncApifoxModalVisible}
        onCancel={() => setSyncApifoxModalVisible(false)}
        onOk={handleSyncApifox}
        config={config}
      />
    </>
  )
}

export default SyncApifoxModalCom
