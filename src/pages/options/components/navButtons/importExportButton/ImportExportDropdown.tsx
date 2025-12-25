import React from "react"
import { Dropdown, MenuProps, ConfigProvider } from "antd"
import { ImportOutlined, ExportOutlined } from "@ant-design/icons"

import ImportModal from "../importButton/ImportModal"
import { ImportModuleData } from "@src/utils/dataProcessor"
import { useImport, useExport } from "./hooks"

const ImportExportDropdown: React.FC = () => {
  const { importModalVisible, setImportModalVisible, handleImport } =
    useImport()
  const { handleExport } = useExport()

  // 下拉菜单配置
  const menuItems: MenuProps["items"] = [
    {
      key: "import",
      label: "导入",
      icon: <ImportOutlined />,
      onClick: () => setImportModalVisible(true),
    },
    {
      key: "export",
      label: "导出",
      icon: <ExportOutlined />,
      onClick: handleExport,
    },
  ]

  return (
    <>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#52C7B0",
          },
        }}
      >
        <Dropdown.Button
          type="primary"
          menu={{ items: menuItems }}
          icon={<ImportOutlined />}
        >
          导入导出
        </Dropdown.Button>
      </ConfigProvider>
      {/* 导入模态框 */}
      <ImportModal
        visible={importModalVisible}
        onCancel={() => setImportModalVisible(false)}
        onOk={(data) => {
          handleImport(data as ImportModuleData[])
          setImportModalVisible(false)
        }}
      />
    </>
  )
}

export default ImportExportDropdown
