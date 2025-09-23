import React, { useState } from "react"

import { Button, message, Modal } from "antd"

import { useMount } from "ahooks"
import { ImportOutlined } from "@ant-design/icons"
import ImportModal from "./ImportModal"
import { ModuleConfig } from '@src/types'
import { useActiveModuleIdStore, useConfigStore } from '@src/store'
import { saveConfig } from '@src/utils/configUtil'
import { ImportModuleData, transformImportDataToModuleConfig } from '@src/utils/dataProcessor'
import { isApiUrlDuplicate, isModuleLabelDuplicate } from '@src/utils/chromeApi'

type ImportButtonProps = {}

const ImportButton: React.FC<ImportButtonProps> = () => {
  const [importModalVisible, setImportModalVisible] = useState(false)
  const { config, setConfig } = useConfigStore()
  const { setActiveModuleId } = useActiveModuleIdStore()

  // 执行导入操作
  const performImport = (newModules: ModuleConfig[]) => {
    console.log("转换后的模块:", newModules)

    const newConfig = {
      ...config,
      modules: [...config.modules, ...newModules],
    }

    setConfig(newConfig)
    saveConfig(newConfig)

    if (newModules.length > 0) {
      setActiveModuleId(newModules[0].id)
    }

    message.success(`成功导入 ${newModules.length} 个模块`)
  }

  // 导入配置
  const handleImport = (importData: ImportModuleData[]) => {
    try {
      console.log("开始导入数据:", importData)

      const duplicateModules: string[] = []
      const duplicateApis: string[] = []

      // 使用工具函数转换数据
      const newModules: ModuleConfig[] =
        transformImportDataToModuleConfig(importData)

      // 检查重复项
      newModules.forEach((module) => {
        // 检查模块标签是否重复
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
        warningMessage += "这些重复项将被跳过，是否继续导入？"

        Modal.confirm({
          title: "发现重复项",
          content: warningMessage,
          onOk() {
            // 继续导入
            performImport(newModules)
          },
          onCancel() {
            // 取消导入
          },
        })
        return
      }

      // 没有重复项，直接导入
      performImport(newModules)
    } catch (error) {
      console.error("导入失败:", error)
      message.error(
        `导入失败: ${error instanceof Error ? error.message : "未知错误"}`
      )
    }
  }
  return (
    <>
      <Button
        icon={<ImportOutlined />}
        type="primary"
        onClick={() => setImportModalVisible(true)}
      >
        导入
      </Button>
      {/* 导入模态框 */}
      <ImportModal
        visible={importModalVisible}
        onCancel={() => setImportModalVisible(false)}
        onOk={(data) => handleImport(data as ImportModuleData[])}
      />
    </>
  )
}

export default ImportButton
