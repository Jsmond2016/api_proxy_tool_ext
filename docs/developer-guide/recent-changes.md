# 近期改动说明

> **编写时间**：2026-07-14；**使用模型**：Codex（GPT-5）；**用户**：Jsmond2016

---

本文汇总 VitePress 文档站创建后（`fe5ad2f`，2026-07-06）到当前版本 `v1.5.43` 的有效代码变更。发布提交和合并提交不重复展开。

::: info 正式版本日志
本文侧重解释近期改动的设计、行为和兼容策略。按版本整理的完整发布记录请查看[更新日志](/changelog/)。
:::

## 变更摘要

| 日期       | 变更                     | 用户影响                                                                   | 主要代码位置                               |
| :--------- | :----------------------- | :------------------------------------------------------------------------- | :----------------------------------------- |
| 2026-07-09 | Swagger 请求复用         | 添加接口和 Apifox 验证复用同一份 Swagger 数据，减少重复网络请求            | `apifoxCache.ts`、`ApiFormDrawer.tsx`      |
| 2026-07-10 | 发版脚本修正             | 无新提交时阻止重复发版，增量生成 changelog，并创建本地版本 tag             | `bump-version.sh`、`release.sh`            |
| 2026-07-10 | 批量 Quick Mock 响应优化 | 外部消息使用轻量初始化和请求去重，已缓存场景减少等待                       | `background/index.ts`、`batchQuickMock.ts` |
| 2026-07-13 | Parsed API 持久缓存      | 解析结果保存到 IndexedDB，浏览器重启后仍可复用；冷缓存优先保证首次数据完整 | `parsedApiCache.ts`、`batchQuickMock.ts`   |
| 2026-07-13 | 模块重置与接口重加修复   | 重置后可重新添加同一路径接口，同路径多请求方法可正确消歧                   | `resetModuleUtils.ts`、`apiFormUtils.ts`   |
| 2026-07-14 | Apifox 同步边界修复      | 刷新只替换 Apifox 来源接口，保留手工与外部接口；存档保存当前面板全量数据   | `apifoxSyncUtils.ts`、`archiveUtil.ts`     |

## Quick Mock 缓存行为

Parsed API 缓存使用独立 IndexedDB 数据库 `api-proxy-cache-db` 和对象仓库 `parsed-api-maps`，默认有效期为 24 小时。缓存键由同步模式与 Apifox 地址生成 SHA-256 摘要，不保存 Token 原文。

处理优先级如下：

1. 本地配置已存在接口时直接复用。
2. 本地缺失时读取 IndexedDB 持久缓存。
3. 缓存未命中时等待 Apifox 拉取、解析和写入完成。
4. IndexedDB 不可用时使用本次解析结果继续创建模块。
5. Apifox 请求失败时按 URL 和默认请求方法降级。

手动验证或刷新 Apifox 成功后会预热缓存。相同配置的并发请求会复用进行中的 Promise，避免重复下载大型 Swagger 数据。

## 模块重置与 Swagger 匹配

模块重置会读取最新 Store，只清空当前模块并等待持久化完成，同时清理已删除接口的勾选状态。

添加接口时会统一规范化完整 URL、查询参数、重复斜杠和尾斜杠。精确路径优先于模糊路径；同一路径存在多个 HTTP 方法时优先当前表单方法，否则选择首个有效方法，不再要求用户通过补充相同地址来消歧。

## Apifox 刷新与存档

模块增加来源信息和 `apifoxApiIds` 后，Apifox tag 刷新只维护同步产生的接口。手工添加接口和 `external` Quick Mock 模块保持不变，历史配置在首次更新时自动补齐来源元数据。

存档范围调整为当前面板完整快照，包括全部模块、接口、快速联调配置和来源信息。所选 tag 仅用于关联迭代及排期文档，不再限制存档内容。

## 发布行为

- `version:patch`、`version:minor`、`version:major` 检查最新 tag 后是否有非合并提交，随后更新版本、发布日期和 `CHANGELOG.md`，创建 release commit 与本地 annotated tag。
- `release` 接受明确版本号，执行双浏览器构建，创建 release commit 与 tag，并推送到远端。
- 自动发布工作流只处理格式为 `chore(release): x.y.z` 且远端尚无对应 tag 的提交。
- 文档站更新由独立 GitHub Pages 工作流负责，不参与扩展发版。

## 关联文档

- [Quick Mock 持久缓存](/architecture/quick-mock-persistent-cache-fix-plan)
- [批量 Quick Mock 性能优化](/cross-extension-batch-mock-performance-optimization)
- [模块重置问题复盘](/requirements/reset-module-readd-api)
- [Apifox 标签同步与存档修复](/requirements/tag-sync-apifox)
- [跨插件批量 Quick Mock 联调](/api-reference/quick-mock-debug)
