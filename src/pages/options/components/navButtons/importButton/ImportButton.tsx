import React, { useState } from "react"

import { Button, message, Modal } from "antd"

import { useMount } from "ahooks"
import { ImportOutlined } from "@ant-design/icons"
import ImportModal from "./ImportModal"
import { ModuleConfig } from "@src/types"
import { useActiveModuleIdStore, useConfigStore } from "@src/store"
import { saveConfig, hasOnlyDefaultModule } from "@src/utils/configUtil"
import {
  ImportModuleData,
  transformImportDataToModuleConfig,
} from "@src/utils/dataProcessor"
import { isApiUrlDuplicate, isModuleLabelDuplicate } from "@src/utils/chromeApi"
import ColorButton from "../../../../../components/ColorButton"

type ImportButtonProps = {}

const ImportButton: React.FC<ImportButtonProps> = () => {
  const [importModalVisible, setImportModalVisible] = useState(false)
  const { config, setConfig } = useConfigStore()
  const { setActiveModuleId } = useActiveModuleIdStore()

  // 执行导入操作
  const performImport = (
    newModules: ModuleConfig[],
    replaceAll: boolean = false
  ) => {
    console.log("转换后的模块:", newModules)

    // 智能判断：如果只有默认模块，直接替换
    const shouldReplace = replaceAll || hasOnlyDefaultModule(config.modules)

    const newConfig = {
      ...config,
      modules: shouldReplace
        ? newModules // 替换模式
        : [...config.modules, ...newModules], // 追加模式
    }

    setConfig(newConfig)
    saveConfig(newConfig)

    if (newModules.length > 0) {
      setActiveModuleId(newModules[0].id)
    }

    const importAction = shouldReplace ? "替换" : "追加"
    message.success(`成功${importAction}导入 ${newModules.length} 个模块`)
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

      // 如果有非默认模块，询问用户
      if (!hasOnlyDefaultModule(config.modules)) {
        Modal.confirm({
          title: "选择导入方式",
          content:
            "检测到已有配置数据，请选择导入方式：\n- 替换：清空现有配置，使用导入的配置\n- 追加：保留现有配置，追加导入的配置",
          okText: "替换所有",
          cancelText: "追加",
          onOk() {
            performImport(newModules, true) // 替换
          },
          onCancel() {
            performImport(newModules, false) // 追加
          },
        })
        return
      }

      // 没有重复项，直接导入（只有默认模块的情况）
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
      <ColorButton
        color="#52C7B0"
        icon={<ImportOutlined />}
        type="primary"
        onClick={() => setImportModalVisible(true)}
      >
        导入
      </ColorButton>
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
