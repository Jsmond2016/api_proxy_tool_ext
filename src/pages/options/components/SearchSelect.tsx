import {
  useActiveModuleIdStore,
  useConfigStore,
  useHighlightApiStore,
  useSearchKeywordStore,
} from "@src/store"
import { ApiConfig } from "@src/types"
import { AutoComplete } from "antd"
import React from "react"

// 扩展的 AutoComplete Option 类型，包含自定义的 api 字段
type ExtendedAutoCompleteOption = {
  value: string
  label: React.ReactNode
  api: ApiConfig & { moduleId: string; moduleName: string }
}

const SearchSelect = () => {
  const { config } = useConfigStore()
  const { setActiveModuleId } = useActiveModuleIdStore()
  const { searchKeyword, setSearchKeyword } = useSearchKeywordStore()
  const { setHighlightApiId } = useHighlightApiStore()

  // 获取所有API数据用于搜索
  const getAllApis = () => {
    const allApis: (ApiConfig & { moduleId: string; moduleName: string })[] = []
    config.modules.forEach((module) => {
      module.apiArr.forEach((api) => {
        allApis.push({
          ...api,
          moduleId: module.id,
          moduleName: module.label,
        })
      })
    })
    return allApis
  }

  // 处理搜索结果选择
  const handleSearchResultClick = (
    api: ApiConfig & { moduleId: string; moduleName: string }
  ) => {
    setActiveModuleId(api.moduleId)
    setSearchKeyword("")
    // 设置高亮 ID，触发 ApiTable 的滚动逻辑
    setHighlightApiId(api.id)
  }

  // 自定义筛选函数
  const filterOption = (
    inputValue: string,
    option?: ExtendedAutoCompleteOption
  ) => {
    if (!option?.api) {
      return false
    }
    const searchText = inputValue.toLowerCase()
    const api = option.api

    return (
      api.apiName.toLowerCase().includes(searchText) ||
      api.apiUrl.toLowerCase().includes(searchText) ||
      api.redirectURL.toLowerCase().includes(searchText) ||
      api.moduleName.toLowerCase().includes(searchText)
    )
  }

  return (
    <AutoComplete
      allowClear
      placeholder="全局搜索:接口名字、接口地址、模块名称"
      value={searchKeyword}
      onChange={(value) => {
        setSearchKeyword(value)
      }}
      onSelect={(value, option) => {
        const extendedOption = option as ExtendedAutoCompleteOption
        if (extendedOption?.api) {
          handleSearchResultClick(extendedOption.api)
          // 立即清空输入框，避免显示长 URL
          setSearchKeyword("")
        }
      }}
      size="large"
      className="w-[650px]"
      style={{ width: 650 }}
      showSearch={{
        filterOption: filterOption,
      }}
      notFoundContent="未找到匹配的接口"
      options={getAllApis().map((api) => ({
        value: api.apiUrl,
        label: (
          <div className="py-2">
            <div className="font-medium text-sm">{api.apiName}</div>
            <div className="text-xs text-gray-500 truncate">{api.apiUrl}</div>
            <div className="text-xs text-blue-500">模块: {api.moduleName}</div>
          </div>
        ),
        api,
      }))}
    />
  )
}

export default SearchSelect
