## [1.5.22](https://github.com/Jsmond2016/api_proxy_tool_ext/compare/v1.5.21...v1.5.22) (2026-03-30)



## [1.5.21](https://github.com/Jsmond2016/api_proxy_tool_ext/compare/v1.5.20...v1.5.21) (2026-03-30)


### Bug Fixes

* 修复 CHANGELOG 版本号生成问题 ([b92b48f](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/b92b48fcda12cc17a1b3e7b93759810a2f5c6a83))



## [1.5.20](https://github.com/Jsmond2016/api_proxy_tool_ext/compare/v1.5.15...v1.5.20) (2026-03-30)


### Bug Fixes

* 修复 commit message 格式以触发 GitHub Actions ([adb16f1](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/adb16f1c47142902b650459fcdfb97a7ad85d21b))



## [1.5.15](https://github.com/Jsmond2016/api_proxy_tool_ext/compare/v1.5.14...v1.5.15) (2026-03-30)



## [1.5.14](https://github.com/Jsmond2016/api_proxy_tool_ext/compare/v1.5.13...v1.5.14) (2026-03-30)


### Bug Fixes

* 优化添加接口时的自动填充逻辑 ([992a50e](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/992a50e606c3780e3631fe8f47d0dd4b010d232e))



## [1.5.13](https://github.com/Jsmond2016/api_proxy_tool_ext/compare/v1.5.11...v1.5.13) (2026-03-30)


### Features

* 添加接口时自动填充 Apifox 相关字段 ([a2e6f90](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/a2e6f90608cde14f67a3cc84455f94fbc295fed2))



## [1.5.11](https://github.com/Jsmond2016/api_proxy_tool_ext/compare/v1.5.10...v1.5.11) (2026-03-17)


### Bug Fixes

* **ci:** 只提取当前版本的 changelog 到 Release ([4a11551](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/4a11551f925c9df4d1bc0fb5f34fd33a02e77f1b))



## [1.5.10](https://github.com/Jsmond2016/api_proxy_tool_ext/compare/v1.0.3...v1.5.10) (2026-03-17)


### Bug Fixes

* **ci:** 修复 GitHub Release 中 changelog 不显示的问题 ([7925700](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/7925700d7cd3c1c9e32067f0838c3a0be0118d02))
* **release:** 将 Release 下载链接改为可点击的 Markdown 链接 ([5e77e54](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/5e77e546f6e3a5493c5029aec7f1eccae9628ea6))
* 修复 ApiTable 组件中的列类型定义，确保类型安全性 ([d543e33](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/d543e3333fec5aebae2a91b1e0590d7d082f6a8d))
* 修改搜索显示问题 ([0a71d1d](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/0a71d1d98ba61989dd89b6b78402ec7601cb7b46))
* 修改搜索框选中后下拉框高度异常问题 ([7109e2c](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/7109e2cdf5cf3fc477fcc1d48d2d6cf69480e139))
* 修改顶部搜索相关逻辑 ([34d77ad](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/34d77ad0a05bbd686c8c2abb71b2064cd944c6e7))
* 名字修改, helper->tool ([0b9dbd3](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/0b9dbd33f307fb00f50b94d60c7ef18d00895cbc))
* 更新 content_security_policy 以允许所有连接源 ([0abc7a0](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/0abc7a0ce243312b019bdb459e680cff272c8247))


### Features

* Apifox 同步优化与导入导出移除 ([aeaef2c](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/aeaef2cd3ff6844e609713433f51bf37f64b14da))
* ci 流程补充 changelog ([accb04f](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/accb04f2865f1d342f69261889427bad176978d2))
* update ([ed80fb3](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/ed80fb3f6065af850ed8552d0c4104744e219181))
* 优化 API 表格和导航按钮的状态管理，使用最新配置防止闭包问题，提升用户交互体验 ([642734e](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/642734ed528db9e9a6e5e3c4943b00786dd35c5f))
* 优化 Apifox 模块同步逻辑，增加成功提示控制选项 ([fbb21b9](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/fbb21b9af642fc8d162d26b3b879025d0d17b038))
* 优化 ApiTable 组件的接口信息展示，调整样式并增强可读性，提升用户体验 ([0fe5fbd](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/0fe5fbd7ccaacc83d521d57aa29f5a849055905e))
* 优化 ModuleInfoBar 组件的接口标签展示逻辑，支持从配置中筛选相关标签，提升用户体验；更新 SyncApifoxModal 组件，移除迭代标签状态，简化状态管理 ([9ee3304](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/9ee33048115be6cbba2c0c03359c224e8a4fa9c7))
* 优化主页顶部信息栏展示 ([e3e192b](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/e3e192bf29971d9cde2d775b39a691affc73a4cb))
* 优化代码，抽离文档链接处理函数 ([36835ad](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/36835ada70bc3509cfd82979898811bd83910f82))
* 优化全局开关 mock 提示，补充更新图标的代码，暂时功能隐藏 ([fe8cd43](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/fe8cd43bb52a7fd20cb79983a14bd390611c4717))
* 优化存档相关 ui ([64f4804](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/64f4804e5f99c343398c8908b897232fd312e872))
* 优化权限点复制功能，增加分组名格式验证，提升用户体验 ([2f14a73](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/2f14a73375013e54a80bee7950474d6c854e3b98))
* 修改重复添加和导入的 bug ([25627d4](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/25627d471d692ff43bd709a1e40068d868f80106))
* 修改页面页脚不展示问题，增加 控制台 log ([2746ade](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/2746ade5cc53f0869735bf4ca2046c632d7bb817))
* 修改默认值分组名为英文格式，完善表格，序号，排序分页功能 ([25ca34a](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/25ca34a02e01d953b2befbecf7c3b264bd84e092))
* 删除popup无关逻辑，优化options相关代码 ([91ba57a](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/91ba57ae1d8b6082f9e78b340a740bef4b77e492))
* 删除不需要的模块，仅保留使用的模块 ([0459d21](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/0459d215c22d6b210feee2743315e0670618a32b))
* 动态显示版本号并添加 Chrome 和 Edge 扩展安装链接至控制台输出 ([8eef2a1](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/8eef2a183ad4174bdf130451c9a6f8608c1c7737))
* 同步 apifox mock接口增加预处理逻辑 ([f9e078c](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/f9e078cd84f9132e61df71697b21ec1fe1939e9a))
* 在 ApiFormDrawer 组件中将页面路由输入框更改为文本区域，支持多行输入，提升用户体验 ([6be11ff](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/6be11fff3851925f2c89de2c2bdff190a1d2a963))
* 在 ApiTable 组件中更新接口信息展示，增加接口地址和 Mock URL 的可复制功能，提升用户体验 ([50c8f1c](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/50c8f1ce095be90cb4bd9f51e98c9249ca76002e))
* 在 ApiTable 组件中添加页面路由列，支持相对路径和完整 URL 跳转，提升用户导航体验 ([967df17](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/967df17d5e245a17ee84feda4de75e176ceb5437))
* 在 ApiTable 组件中添加项目 ID 提取逻辑，并优化接口名称渲染，支持链接到 Apifox Web 版 ([3099be6](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/3099be66ae7b5019c8a37301cbeca846cc164776))
* 在 ApiTable 组件中重构操作按钮，使用下拉菜单整合克隆、迁移和删除功能，提升用户交互体验 ([f48c917](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/f48c9173595bcd6d1e3c87275fadad03ee0d64cd))
* 在 SearchSelect 和 ApiTable 组件中添加高亮 API 功能，优化用户导航体验 ([d0e5605](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/d0e560554a9eb0c1807639dcae48cd0e3b8b18dd))
* 在 SyncApifoxModal 组件中添加接口状态选择功能，支持根据用户选择的状态过滤接口，提升数据解析灵活性 ([aa2672a](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/aa2672a7ad8a85c4a9688129fb14cfd41231bc35))
* 在 TestButton 组件中添加 Mock 开关状态检查，优化测试流程，提升用户体验 ([7c660b6](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/7c660b6d065140d6e6a8bf3be2bb5e7c9671ffe5))
* 增加 Apifox 配置操作提示，优化用户交互体验 ([6d3439e](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/6d3439e479b582d5ac624273d9812fe1b1e1fdb5))
* 增加复制权限点功能 ([fe2c1a5](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/fe2c1a55a9e8b503d00c6ddd52d0ee4df898d2f1))
* 增加存档和查看功能 ([93e25b3](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/93e25b3873927eb0691ff9b305482ed6f8610dc9))
* 增加迁移功能 ([0c66cb8](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/0c66cb849e7976e327ae36423115aeb72fae21bc))
* 增强导入和同步功能，支持根据模块类型智能选择替换或追加，优化用户交互体验 ([a4958c4](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/a4958c4db801236c229a7a3452092a933f6c80b7))
* 完善表单提交,文字国际化-中文 ([8d3c43e](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/8d3c43e85de6ad8e3cb3bc806642656b187a9722))
* 所有敏感操作增加二次确认 ([5bd89ae](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/5bd89ae611dd87eb702c284adaaf77badb0922b2))
* 抽离添加和编辑接口form 组件，统一交互 ([0176ac7](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/0176ac7308c82f2a5ddb04bedd8239bc85718979))
* 抽离聚合导入导出功能，更新废弃 api - Space.direction -> orientation ([6087b01](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/6087b01188b4ce5a0418448a945b9f7e1117f3cb))
* 数据持久化 ([11ca4d2](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/11ca4d2c93c151e630aa284789079def7e97caa3))
* 整理 apifox 自定义字段和文档 ([36e2f63](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/36e2f6385e13c16fbb75d58fc735c551306b8de8))
* 更新 Ant Design 依赖至 6.0.0，添加模块信息栏组件，支持显示关联需求文档和接口标签，优化模块编辑功能，提升用户体验 ([f4b2f92](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/f4b2f9293af250cb1ae5ae3e56c57b7778bb9ceb))
* 更新 SyncApifoxModal 组件的合并策略为“合并”，优化冲突处理逻辑，提升用户体验 ([3b7fd3f](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/3b7fd3f130a52d20dcefc37ee61206ca5d81e8e2))
* 替换图标 ([e45e614](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/e45e6145a40efc2cc6026ac85df60817a92fcca4))
* 替换图标，实现切换时图标变换 ([88d52d2](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/88d52d21a3ead9ea4be7b9a8e6f983408b30fb40))
* 添加 API 变化对比工具和变化摘要表格，优化 Apifox 模块同步逻辑 ([57219f3](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/57219f3117a92ed5b7dee7c1f6d7144e02fdb9f9))
* 添加 Apifox 相关工具函数，优化同步接口逻辑和配置管理 ([4bcbf04](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/4bcbf04428d74c6dc710a83affea4d9d8f922ca5))
* 添加 Apifox 缓存管理工具，支持缓存 Apifox 地址和标签历史记录，提升用户体验 ([2cd8181](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/2cd8181c4d4801d4099fe8722e0a7a38f233aeb9))
* 添加 ColorButton 组件并在导入和导出按钮中应用，优化按钮样式和用户交互体验 ([bddf6a1](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/bddf6a1de63dc8b155c77d1ff3769a8cbc398b5f))
* 添加作者和版本信息 ([4f559a4](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/4f559a443c66ddf64da9394300e8a2181d199772))
* 添加全局配置和日志工具，优化背景脚本消息处理 ([e0759ff](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/e0759ffc8870b27326f97ce1563768576ae2a0b2))
* 添加冲突检测和合并策略功能，优化 SyncApifoxModal 组件，提升用户体验 ([ecd602b](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/ecd602b98418b807817df930d06a6d14e7bfdc68))
* 添加同步 apifox url 功能 ([39ec0ae](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/39ec0aed8895595557d06ddfee2404fc298dd819))
* 添加模型操作常量和类型定义，优化 API 表格列配置 ([c86e88f](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/c86e88f6647ee76fe5aedf83230a773c67989c38))
* 添加迭代信息管理功能，更新 ModuleInfoBar 组件以支持动态加载和展示迭代信息，新增 SetIterationInfoModal 组件用于设置迭代文档链接，优化用户体验 ([d9a5805](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/d9a5805f1f55bbf62f1dc5c016663b8bf319eec8))
* 移除 tabs 权限，补充说明文档，优化重置功能 ([1bb9a75](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/1bb9a758808ba1b4b513e690e639a57e50555bcf))
* 简化changelog工具链，移除复杂配置 ([4b446d2](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/4b446d2965fcd4431e4f736e8367681044c4f57e))
* 补充 cursor 项目提示词规则 ([37579ea](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/37579ea626005f50ed165039051ac386acc58843))
* 补充 edge 发布信息文件，优化 build 过程，删除 dist 中多余 .vite 目录 ([f96db94](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/f96db942db378beeb4e50970bb7c61bce0d7ab1f))
* 补充测试按钮，隐藏未实现的自定义响应体功能，后期完善恢复 ([45711a4](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/45711a4b82e6a71212db870d1062c5f851f8dc21))
* 部分代码优化，移除注释代码 ([dbdf4c2](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/dbdf4c2dd51f49deed23ff0a72f5f1eee5517a53))
* 配置 mock 代码后，自动激活第一个tab ([d82d22d](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/d82d22df7ce601032f1c010bd1d2e7e2df616cb3))
* 重构 SyncApifoxModal 组件，添加自定义 hooks 和新组件以优化 Apifox 地址验证和冲突检测功能，提升用户体验 ([c5db5f2](https://github.com/Jsmond2016/api_proxy_tool_ext/commit/c5db5f2bb3afbed13f67c6880120dd2fc140f2a5))



## [1.0.3](https://github.com/Jsmond2016/api_proxy_tool_ext/compare/v1.0.1...v1.0.3) (2022-07-07)



## [1.0.1](https://github.com/Jsmond2016/api_proxy_tool_ext/compare/v1.0.0...v1.0.1) (2022-05-12)



# 1.0.0 (2022-04-25)



