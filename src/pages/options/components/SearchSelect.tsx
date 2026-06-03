import {
  useActiveModuleIdStore,
  useConfigStore,
  useHighlightApiStore,
  useSearchKeywordStore,
} from "@src/store"
import { ApiConfig } from "@src/types"
import { AutoComplete } from "antd"
import React, { useRef } from "react"

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
  const dropdownContainerRef = useRef<HTMLDivElement>(null)

  // 每次下拉框打开时，将虚拟列表的滚动位置重置到顶部
  const handleDropdownVisibleChange = (open: boolean) => {
    if (open) {
      // 使用 setTimeout 确保虚拟列表 DOM 完全初始化后再操作
      setTimeout(() => {
        const dropdown = dropdownContainerRef.current?.closest(".ant-select-dropdown")
        if (!dropdown) return

        // 重置 antd 5 rc-virtual-list 的滚动容器
        const holder = dropdown.querySelector<HTMLElement>(".rc-virtual-list-holder")
        if (holder) {
          holder.scrollTop = 0
          // 通知虚拟列表更新内部状态
          holder.dispatchEvent(new Event("scroll"))
        }

        // 兜底：直接重置下拉面板本身
        dropdown.scrollTop = 0
      }, 100)
    }
  }

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
      className="w-full"
      style={{ width: "100%" }}
      showSearch={{
        filterOption: filterOption,
      }}
      notFoundContent="未找到匹配的接口"
      dropdownRender={(menu) => (
        <div ref={dropdownContainerRef}>{menu}</div>
      )}
      onDropdownVisibleChange={handleDropdownVisibleChange}
      options={getAllApis().map((api) => ({
        // 使用唯一前缀 ID 作为 value，避免用户输入的文本精确匹配 apiUrl 时触发 AutoComplete
        // 的"选中状态"渲染，将多行的 label 注入到输入框导致高度撑开
        value: `__search_option_${api.id}`,
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
