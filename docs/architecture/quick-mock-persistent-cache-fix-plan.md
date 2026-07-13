# Quick Mock 持久缓存修复开发计划

> **编写时间**：2026-07-13；**使用模型**：GPT-5；**用户**：Jsmond2016

---

## 一、背景

外部插件 `quick-copy-ext` 向 API Proxy Tool 发送待 Mock 的接口 URL 后，主面板新建模块中的接口名称和 Apifox 链接未被正确补全，接口名称回退成了 URL。

问题来自批量 Quick Mock 的缓存与数据生成流程：当前解析结果存放在 `chrome.storage.session`，并非 IndexedDB；缓存未命中时函数立即返回空 `Map`，后台预拉取完成后也不会回填已经创建的模块。

关联文档：

- [跨插件批量 QuickMock 技术方案](./quick-mock-plan.md)
- [跨插件批量 Quick Mock 性能优化](../cross-extension-batch-mock-performance-optimization.md)

## 二、开发目标

1. 将解析后的 Apifox API 映射持久化到 IndexedDB，跨浏览器重启继续可用。
2. 手动同步 Apifox 时主动更新持久缓存。
3. 批量 Quick Mock 缓存命中时直接复用接口名称、请求方法、Apifox 链接、权限点和标签。
4. 冷缓存时等待首次数据拉取和持久化完成后再创建模块，保证首次展示正确。
5. 保留本地配置优先级，本地已有接口不触发不必要的 Apifox 请求。
6. 增加缓存和批量构建核心逻辑测试，覆盖失败降级路径。

## 三、范围边界

### 3.1 本次包含

- `api_proxy_tool_ext` 内的 IndexedDB 缓存服务。
- Apifox 解析结果的读、写、过期和失效处理。
- 手动同步与跨插件批量 Quick Mock 的缓存接入。
- 相关单元测试、Lint 和 Chrome 构建验证。
- 同步更新本开发计划与现有性能优化文档。

### 3.2 本次不包含

- 修改 `quick-copy-ext` 项目或外部消息协议。
- 修改 Chrome Web Store / Edge Add-ons 已发布版本。
- 改造归档功能现有的 IndexedDB 数据库。
- 调整 `externally_connectable` 白名单策略。

## 四、技术方案

### 4.1 缓存结构

新增独立 IndexedDB 数据库和对象仓库，避免与归档数据耦合。

| 配置项     | 设计                                     |
| :--------- | :--------------------------------------- |
| 数据库     | `api-proxy-cache-db`                     |
| 对象仓库   | `parsed-api-maps`                        |
| 主键       | 由同步模式和 Apifox 地址组成的稳定缓存键 |
| 数据       | `Array<[normalizedPath, ParsedApi]>`     |
| 元数据     | `timestamp`、缓存版本                    |
| 默认有效期 | 24 小时                                  |

缓存键不保存 Apifox Token 原文。Token 变化时，由配置同步流程覆盖对应项目缓存；手动刷新始终强制写入最新解析结果。

### 4.2 数据流程

```text
外部 Quick Mock 请求
  -> 本地 GlobalConfig 匹配
  -> 仅对本地缺失接口读取 IndexedDB
  -> 缓存命中：直接补全并创建模块
  -> 缓存未命中：等待 Apifox 拉取、解析、写入 IndexedDB
  -> 使用完整 ParsedApi Map 创建模块
  -> 持久化配置、更新规则、打开主面板
```

手动同步 Apifox 成功后，使用本次已经解析出的全量 API 数据覆盖 IndexedDB 缓存，不重复发起网络请求。

### 4.3 降级策略

- IndexedDB 不可用：记录错误并直接拉取 Apifox，业务继续执行。
- Apifox 拉取失败：沿用现有 URL / GET 兜底，单次任务仍可创建。
- 缓存数据损坏或版本不匹配：删除无效记录并重新拉取。
- 缓存过期：重新拉取成功后覆盖旧记录；拉取失败不使用过期数据。

## 五、任务列表

| 编号 | 任务                                     | 状态                           | 关联文件                                              |
| :--- | :--------------------------------------- | :----------------------------- | :---------------------------------------------------- |
| T1   | 创建开发计划并确认实现边界               | 已完成                         | 本文档                                                |
| T2   | 实现 ParsedApi IndexedDB 缓存服务        | 已完成                         | `src/utils/parsedApiCache.ts`                         |
| T3   | 重构批量 Quick Mock 缓存读取与冷启动流程 | 已完成                         | `src/utils/batchQuickMock.ts`                         |
| T4   | 手动同步 Apifox 时写入持久缓存           | 已完成                         | `SyncApifoxModalButton.tsx`、`useApifoxValidation.ts` |
| T5   | 补充缓存与批量构建测试                   | 已完成                         | `parsedApiCache.test.ts`、`vitest.config.ts`          |
| T6   | 执行 Lint、测试和 Chrome 构建            | 已完成（全量检查存在既有问题） | 全部变更                                              |
| T7   | 更新关联文档并完成代码审查               | 已完成                         | 本文档、性能优化文档                                  |

## 六、验收标准

- [x] 浏览器首次冷启动且没有缓存时，Quick Mock 创建的接口名称不是 URL fallback（Apifox 存在对应接口时）。
- [x] 第二次请求相同项目时不再请求 Apifox，直接命中 IndexedDB。
- [x] 浏览器重启后缓存仍可读取。
- [x] 手动同步 Apifox 后，首次 Quick Mock 可直接命中持久缓存。
- [x] Apifox 找不到对应接口时，仍按 URL / GET 正常降级。
- [x] 本地已有接口时保持本地配置优先，不读取或请求 Apifox。
- [x] 缓存键和 IndexedDB 记录中不包含 Apifox Token 原文。
- [x] 变更文件 Lint、单元测试和 Chrome 构建通过。

## 七、验证记录

| 检查项                   | 结果                                                  |
| :----------------------- | :---------------------------------------------------- |
| `pnpm test`              | 通过，1 个测试文件、6 个用例                          |
| 变更文件 ESLint          | 通过，0 个错误、0 个警告                              |
| `pnpm build:chrome`      | 通过，存在项目原有的大 chunk 提示                     |
| `pnpm exec tsc --noEmit` | 未全量通过，剩余 4 个既有类型错误，均不在本次新增逻辑 |
| `pnpm lint`              | 未全量通过，项目原有 24 个错误和 2 个警告             |

## 八、风险与应对

| 风险                    | 影响                         | 应对方案                                                             |
| :---------------------- | :--------------------------- | :------------------------------------------------------------------- |
| 首次冷缓存拉取耗时较长  | 外部插件首次响应变慢         | 以首次数据正确为优先；通过手动同步预热和 24 小时持久缓存降低发生频率 |
| Apifox 项目接口数量较大 | IndexedDB 写入或解析耗时增加 | 仅保存精简后的 `ParsedApi`，不保存原始 Swagger JSON                  |
| 多个请求同时冷启动      | 重复请求和重复写入           | 保留按缓存键去重的 in-flight Promise                                 |
| 缓存 schema 后续变化    | 旧缓存反序列化异常           | 增加缓存版本，版本不匹配时自动失效                                   |

## 九、交付物

1. IndexedDB 持久缓存实现。
2. Quick Mock 与手动同步接入代码。
3. 自动化测试和验证结果。
4. 更新后的开发计划和性能优化说明。

## 十、代码审查

- **审查范围**：IndexedDB 缓存服务、Quick Mock 富化流程、Apifox 缓存预热、测试配置和关联文档。
- **评级**：B（良好）。
- **关键发现**：未发现新增的安全、性能或逻辑阻断问题；缓存主键不落盘 URL 或 Token 原文，缓存失败具备业务降级。
- **修复建议**：发布前使用真实 `quick-copy-ext` 与当前扩展完成一次冷缓存、热缓存和浏览器重启后的人工联调。
- **已知风险**：首次冷缓存会等待 Apifox；项目全量 TypeScript 和 Lint 仍受既有问题影响。
