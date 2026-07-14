# Memory Index

> 跨会话持久记忆索引。每次会话结束时记录关键变更和待办事项。
> 按日期倒序排列，最新的条目在顶部。

## 2026-07-14

- 修复 Apifox tag 刷新/确认同步误删自定义及外部接口：模块记录 Apifox 接口 ID，刷新只替换同步来源接口，并兼容历史 tag 数据。
- 存档改为保存当前面板全部模块、接口和快速联调配置；新增同步边界与全量存档回归测试。
- 本次全套 Vitest 19/19 通过，定向 ESLint 与 Chrome 生产构建通过；全量 TypeScript 仍有 2 个既有错误。

## 2026-07-13

- 修复模块重置后无法重新添加原接口的问题：重置读取最新 Store、等待持久化并清理残留勾选状态。
- 添加表单的 Swagger 匹配改为精确路径与当前请求方法优先，并忽略 `parameters` 等非 HTTP 方法字段。
- 新增 8 条模块重置及 Swagger 匹配回归测试；定向测试与 ESLint 通过，Chrome 生产构建通过。
- 修复跨插件批量 Quick Mock 首次缓存未命中时接口名称回退为 URL 的问题。
- 新增 IndexedDB `api-proxy-cache-db / parsed-api-maps`，持久保存解析后的 Apifox API Map，有效期 24 小时。
- Apifox 验证和刷新成功后预热持久缓存；冷缓存等待拉取完成后再生成批量模块。
- 新增 Vitest 与 fake-indexeddb，缓存及富化逻辑 6 个测试通过；Chrome 生产构建通过。
- 待办：发布前使用真实 quick-copy-ext 完成冷缓存、热缓存和浏览器重启联调。
- 既有问题：全量 TypeScript 仍有 4 个错误，全量 ESLint 有 24 个错误和 2 个警告，均不属于本次变更。

## 2026-05-25

- 初始化 AI 工程化配置（CLAUDE.md, AGENTS.md, STACK_ARCHITECTURE.md, DESIGN.md）
- 完善商店上架准备文档（docs/publish/ 目录，中英文各 4 份共 8 文件）
- 提交 AI 技能配置（.agents/ & skills-lock.json）
