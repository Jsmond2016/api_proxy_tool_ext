# [](https://github.com/Jsmond2016/api_proxy_tool_ext/compare/v1.5.9...v) (2026-03-17)

## [1.5.9](https://github.com/Jsmond2016/api_proxy_tool_ext/compare/v1.5.8...v1.5.9) (2026-03-17)

### Bug Fixes

- **release:** 将 Release 下载链接改为可点击的 Markdown 链接 ([e55b400](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/e55b400275d36777e45ef6df1ca9278ea7df7d65))

## [1.5.8](https://github.com/Jsmond2016/api_proxy_tool_ext/compare/v1.5.7...v1.5.8) (2026-03-17)

## [1.5.7](https://github.com/Jsmond2016/api_proxy_tool_ext/compare/v1.5.6...v1.5.7) (2026-03-17)

### Features

- Apifox 同步优化与导入导出移除 ([89f97a7](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/89f97a7325b5c8335c0af202ed012aaf8195b6eb))

## [1.5.6](https://github.com/Jsmond2016/api_proxy_tool_ext/compare/v1.5.5...v1.5.6) (2025-12-25)

### Bug Fixes

- 修改搜索框选中后下拉框高度异常问题 ([36432d2](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/36432d24e4101705d66a3acd9856fbdd35ed7b9a))

### Features

- 优化主页顶部信息栏展示 ([a8dc91b](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/a8dc91b2fa298dd203a9dd0c76169eb97102f179))
- 优化代码，抽离文档链接处理函数 ([69516ec](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/69516ec475c845cac1e0b2265b82987a3ddd1322))
- 优化存档相关 ui ([ed89ef9](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/ed89ef9cbc921bad15ef0c196a7c7b4e0398eb4d))
- 增加存档和查看功能 ([eb270d6](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/eb270d68484c3a72d9fd18fd175d5aab5a294fc5))
- 抽离聚合导入导出功能，更新废弃 api - Space.direction -> orientation ([0229c14](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/0229c14b66dacc72650348b41bb41e5996cc4551))
- 整理 apifox 自定义字段和文档 ([0bb1f3e](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/0bb1f3e7f80d83cc274335c6402b093eb333a84f))
- 部分代码优化，移除注释代码 ([7761590](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/776159072b6e72dbe605b57cc9c64d7910119027))
- 配置 mock 代码后，自动激活第一个tab ([6bc8228](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/6bc822868c55d2d0f855ac40b1ce95cc34a4e700))

## [1.5.5](https://github.com/Jsmond2016/api_proxy_tool_ext/compare/v1.5.4...v1.5.5) (2025-12-10)

## [1.5.4](https://github.com/Jsmond2016/api_proxy_tool_ext/compare/v1.5.3...v1.5.4) (2025-12-10)

### Features

- 添加迭代信息管理功能，更新 ModuleInfoBar 组件以支持动态加载和展示迭代信息，新增 SetIterationInfoModal 组件用于设置迭代文档链接，优化用户体验 ([f2a8b25](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/f2a8b258eb853e9751e2ca96274f785128b2c4a9))

## [1.5.3](https://github.com/Jsmond2016/api_proxy_tool_ext/compare/v1.5.2...v1.5.3) (2025-12-10)

### Features

- 优化 ModuleInfoBar 组件的接口标签展示逻辑，支持从配置中筛选相关标签，提升用户体验；更新 SyncApifoxModal 组件，移除迭代标签状态，简化状态管理 ([d809a8c](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/d809a8c517e33ef4cd4302fa26472b0c4206602f))

## [1.5.2](https://github.com/Jsmond2016/api_proxy_tool_ext/compare/v1.5.1...v1.5.2) (2025-12-10)

### Features

- 优化 ApiTable 组件的接口信息展示，调整样式并增强可读性，提升用户体验 ([134cc51](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/134cc51a6affe50f20a4bfddb224f4df04a43bb3))
- 更新 Ant Design 依赖至 6.0.0，添加模块信息栏组件，支持显示关联需求文档和接口标签，优化模块编辑功能，提升用户体验 ([cc7df42](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/cc7df42109930982f5ddb0d09db29224eea0d3ab))
- 更新 SyncApifoxModal 组件的合并策略为“合并”，优化冲突处理逻辑，提升用户体验 ([be37771](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/be377713b4f36db712d7a0dc1a18f2d80077a5a5))
- 添加冲突检测和合并策略功能，优化 SyncApifoxModal 组件，提升用户体验 ([47c47d4](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/47c47d4ae7c7d0dfdcc607c0885a5cdcdb8ff356))

## [1.5.1](https://github.com/Jsmond2016/api_proxy_tool_ext/compare/v1.4.18...v1.5.1) (2025-12-09)

### Bug Fixes

- 修复 ApiTable 组件中的列类型定义，确保类型安全性 ([b2e92e9](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/b2e92e98048339502aefd9fa60c66079dee8512c))

### Features

- 优化 API 表格和导航按钮的状态管理，使用最新配置防止闭包问题，提升用户交互体验 ([a970829](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/a970829e4a4fb7d4336d5f6c34478577fbd74b3b))
- 在 ApiFormDrawer 组件中将页面路由输入框更改为文本区域，支持多行输入，提升用户体验 ([898e515](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/898e5154e77d3396a8452514973fe3e2bb5f95b1))
- 在 ApiTable 组件中更新接口信息展示，增加接口地址和 Mock URL 的可复制功能，提升用户体验 ([071494e](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/071494e5547add523ca0da79a598bdd6a99475c7))
- 在 ApiTable 组件中添加页面路由列，支持相对路径和完整 URL 跳转，提升用户导航体验 ([01fcf9b](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/01fcf9b46c921580191ffe6262b9bb01be92b5c5))
- 在 ApiTable 组件中添加项目 ID 提取逻辑，并优化接口名称渲染，支持链接到 Apifox Web 版 ([72bd61a](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/72bd61a8001a1ce4339f814f401a5d4e0347dc0d))
- 在 ApiTable 组件中重构操作按钮，使用下拉菜单整合克隆、迁移和删除功能，提升用户交互体验 ([e4107d7](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/e4107d718384b10226da81b5da05e5236b042048))
- 在 SearchSelect 和 ApiTable 组件中添加高亮 API 功能，优化用户导航体验 ([2557723](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/2557723eacb6ba1e2bca4be4830b2587e7583aa8))
- 在 SyncApifoxModal 组件中添加接口状态选择功能，支持根据用户选择的状态过滤接口，提升数据解析灵活性 ([94d2ca3](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/94d2ca3d54f3d2f338157ed3b70017c647276c53))
- 在 TestButton 组件中添加 Mock 开关状态检查，优化测试流程，提升用户体验 ([d8b803a](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/d8b803a791e9b25988d1c0f40ac07e8ac10bb952))
- 添加 Apifox 缓存管理工具，支持缓存 Apifox 地址和标签历史记录，提升用户体验 ([7a99dbf](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/7a99dbf8807b67523f547a5ce6ab77ad9f74c458))
- 补充测试按钮，隐藏未实现的自定义响应体功能，后期完善恢复 ([44c3c74](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/44c3c749b05b2c75945e8189a3c8b4c8e8dd390e))
- 重构 SyncApifoxModal 组件，添加自定义 hooks 和新组件以优化 Apifox 地址验证和冲突检测功能，提升用户体验 ([a365b63](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/a365b63fa9d8d9b312c55bc1de568e74793a5061))

## [1.4.18](https://github.com/Jsmond2016/api_proxy_tool_ext/compare/v1.4.17...v1.4.18) (2025-11-04)

### Features

- 优化 Apifox 模块同步逻辑，增加成功提示控制选项 ([aa2f793](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/aa2f793e3fc120f8d84b358a7d190207fec40591))
- 优化权限点复制功能，增加分组名格式验证，提升用户体验 ([e2b4c61](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/e2b4c61732ff293a8f9e08bc038a4ddfed2f5fb3))
- 增加 Apifox 配置操作提示，优化用户交互体验 ([9da5c00](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/9da5c0056294c056266e1342871cdc2774fd6816))
- 增强导入和同步功能，支持根据模块类型智能选择替换或追加，优化用户交互体验 ([e4b1b4d](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/e4b1b4d3a6ab3e25ffe147e8340f14e3944a5fa4))
- 添加 API 变化对比工具和变化摘要表格，优化 Apifox 模块同步逻辑 ([4258acb](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/4258acb70b6d4898273fcbfd5ac3f88c43801f89))
- 添加 Apifox 相关工具函数，优化同步接口逻辑和配置管理 ([69ae42d](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/69ae42d36a9345c4717bda474144ad4cf0176d2a))
- 添加 ColorButton 组件并在导入和导出按钮中应用，优化按钮样式和用户交互体验 ([9257c8f](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/9257c8fd7ae2dae5a71d09fad194b20ce006cfa0))
- 添加全局配置和日志工具，优化背景脚本消息处理 ([f550697](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/f550697580b809cb417809becbe4d54e214587a6))
- 添加模型操作常量和类型定义，优化 API 表格列配置 ([8640243](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/86402432741f14ea7df9dfe343de0cfa989b45d8))

## [1.4.17](https://github.com/Jsmond2016/api_proxy_tool_ext/compare/v1.4.16...v1.4.17) (2025-10-22)

### Features

- 动态显示版本号并添加 Chrome 和 Edge 扩展安装链接至控制台输出 ([5b72a71](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/5b72a7177372b17ccc2a34891a25a686c0f81a56))

## [1.4.16](https://github.com/Jsmond2016/api_proxy_tool_ext/compare/v1.4.15...v1.4.16) (2025-10-21)

### Bug Fixes

- 更新 content_security_policy 以允许所有连接源 ([cbc02d0](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/cbc02d0d34cb0c0f7c60551ca41472a22bc77758))

## [1.4.15](https://github.com/Jsmond2016/api_proxy_tool_ext/compare/v1.4.14...v1.4.15) (2025-10-16)

### Features

- 移除 tabs 权限，补充说明文档，优化重置功能 ([222002b](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/222002b5e732df4cf240b664e2c7f71d4ac2c415))

## [1.4.14](https://github.com/Jsmond2016/api_proxy_tool_ext/compare/v1.4.13...v1.4.14) (2025-10-16)

### Features

- 修改页面页脚不展示问题，增加 控制台 log ([93b6000](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/93b6000be7e83e5160c74226b968c8edb0ba28b1))
- 添加作者和版本信息 ([a9d2191](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/a9d2191e83243926e862b4f1114364f0f67ea89e))
- 补充 cursor 项目提示词规则 ([3f4f2ba](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/3f4f2ba0a4f6be75cdc0ecd92e5ef922df5ca402))

## [1.4.13](https://github.com/Jsmond2016/api_proxy_tool_ext/compare/v1.4.12...v1.4.13) (2025-09-29)

## [1.4.12](https://github.com/Jsmond2016/api_proxy_tool_ext/compare/v1.4.11...v1.4.12) (2025-09-29)

### Bug Fixes

- 名字修改, helper->tool ([147ba0e](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/147ba0e15519dc4fbd990b11a9396d5ad88de867))

## [1.4.11](https://github.com/Jsmond2016/api_proxy_tool_ext/compare/v1.4.10...v1.4.11) (2025-09-29)

### Features

- 完善表单提交,文字国际化-中文 ([a1d7173](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/a1d7173c9928ab701cc19a105730fe658a3be412))
- 数据持久化 ([4aad266](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/4aad266cf495bea34b3a03f4144cd9893bc3401e))

## [1.4.10](https://github.com/Jsmond2016/api_proxy_tool_ext/compare/v1.4.7...v1.4.10) (2025-09-29)

### Features

- ci 流程补充 changelog ([a684d52](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/a684d52c6c6533a87b7f963b8d3d967c11b04d41))
- 简化changelog工具链，移除复杂配置 ([d74317d](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/d74317ddd566d9778616895468d14f86b1602313))

## [1.4.7](https://github.com/Jsmond2016/api_proxy_tool_ext/compare/v1.4.6...v1.4.7) (2025-09-26)

### Features

- 补充 edge 发布信息文件，优化 build 过程，删除 dist 中多余 .vite 目录 ([8573c9b](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/8573c9b6f17e886648e535d63f26d055d8990b00))

## [1.4.6](https://github.com/Jsmond2016/api_proxy_tool_ext/compare/v1.4.5...v1.4.6) (2025-09-25)

### Features

- 优化全局开关 mock 提示，补充更新图标的代码，暂时功能隐藏 ([5006625](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/50066250d927f01d8ceba6ebf751c3e0a9d2a790))
- 修改默认值分组名为英文格式，完善表格，序号，排序分页功能 ([1459405](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/1459405210565631bf32f422444ee987d2bc7383))
- 增加复制权限点功能 ([90a7d3d](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/90a7d3d2f98c9001e1dd67e259292931f6ca5b70))
- 所有敏感操作增加二次确认 ([986c2f6](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/986c2f62ff26676d0d3c71b7ed6df54451230879))
- 替换图标 ([b3bd0d8](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/b3bd0d8fb553195adca23d6253473acc61895546))
- 替换图标，实现切换时图标变换 ([1fd54ec](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/1fd54ec42b61b73a3ad6261b9975cb24accfa12c))

## [1.4.5](https://github.com/Jsmond2016/api_proxy_tool_ext/compare/v1.4.4...v1.4.5) (2025-09-24)

### Features

- 同步 apifox mock接口增加预处理逻辑 ([2c940bb](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/2c940bbf53cfebb35c16142789da8f2e45d9abf1))

## [1.4.4](https://github.com/Jsmond2016/api_proxy_tool_ext/compare/v1.4.3...v1.4.4) (2025-09-22)

### Features

- 添加同步 apifox url 功能 ([5f229c1](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/5f229c1d8c2381e359f0dfd18ce9728693767582))

## [1.4.3](https://github.com/Jsmond2016/api_proxy_tool_ext/compare/v1.4.2...v1.4.3) (2025-09-22)

## [1.4.2](https://github.com/Jsmond2016/api_proxy_tool_ext/compare/v1.6.0...v1.4.2) (2025-09-19)

### Bug Fixes

- 修改搜索显示问题 ([9ccc0c7](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/9ccc0c72310481d31aae6515b444f8366596ced0))
- 修改顶部搜索相关逻辑 ([8fe18d0](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/8fe18d0509608236df36162c31993cbd8dc4b3ac))

### Features

- 修改重复添加和导入的 bug ([fbf2446](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/fbf2446aec7a9c4d0c319c1fa87c9a3a55100f55))
- 删除popup无关逻辑，优化options相关代码 ([926ab48](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/926ab484ccad2830e22ef16e18cad816e89d3904))
- 删除不需要的模块，仅保留使用的模块 ([557bbab](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/557bbab38e76a660ba26921fea0969a6ebc05e09))
- 增加迁移功能 ([132059d](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/132059d5e8be0af03fd7224f9080146c0e871a30))
- 抽离添加和编辑接口form 组件，统一交互 ([aa4ab3d](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/aa4ab3da57995c52b36cbc5234953a0a87118b71))

# [1.6.0](https://github.com/Jsmond2016/api_proxy_tool_ext/compare/v1.4.0...v1.6.0) (2024-12-12)

# [1.4.0](https://github.com/Jsmond2016/api_proxy_tool_ext/compare/v1.3.0...v1.4.0) (2024-10-24)

# [1.3.0](https://github.com/Jsmond2016/api_proxy_tool_ext/compare/v1.2.0...v1.3.0) (2024-10-19)

### Features

- update ([ed80fb3](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/ed80fb3f6065af850ed8552d0c4104744e219181))

## [1.0.3](https://github.com/Jsmond2016/api_proxy_tool_ext/compare/v1.0.1...v1.0.3) (2022-07-07)

## [1.0.1](https://github.com/Jsmond2016/api_proxy_tool_ext/compare/v1.0.0...v1.0.1) (2022-05-12)

# 1.0.0 (2022-04-25)
