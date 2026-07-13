# 跨插件批量 Quick Mock 性能优化

> **更新时间**：2026-07-13；**使用模型**：GPT-5；**用户**：Jsmond2016

---

> 本文前半部分记录 2026-07-10 的第一阶段性能优化。该阶段使用 `chrome.storage.session` 和后台预拉取，存在首次请求无法补全接口名称的问题。当前实现已按本文“持久缓存修订”章节改为 IndexedDB。

## 背景

当用户通过其他浏览器扩展（如 API 调试工具）向 API Proxy Tool 发送批量 Quick Mock 请求时，从发出请求到收到响应的时间长达 6 秒以上，即便每次只传输 1~5 个接口 URL。本文档记录该问题的定位过程、根因分析和优化方案。

## 问题现象

- 外部扩展发送 `BATCH_QUICK_MOCK` 消息（含 1~5 个 URL）后，等待 6~8 秒才收到响应
- 30 秒内的重复请求响应很快（毫秒级）
- 30 秒后再次请求又恢复到 6~8 秒
- Service Worker 控制台日志显示大部分时间消耗在某处 "等待" 状态

## 诊断过程

### 第一步：添加性能埋点

在 `handleExternalBatchQuickMock` 函数的关键步骤添加 `performance.now()` 耗时日志：

```
[batch:xxx] [0ms]   ensureConfigLoaded start
[batch:xxx] [6ms]   ensureConfigLoaded done
[batch:xxx] [9ms]   URL dedup done: 1 urls
[batch:xxx] [12ms]  local config check: 0 missing
[batch:xxx] [13ms]  Apifox fetch SKIPPED
[batch:xxx] [17ms]  API configs built
[batch:xxx] [26ms]  session.set done
[batch:xxx] [32ms]  response ready → returning
[batch:xxx] [63ms]  sendResponse
[batch:xxx] [68ms]  tabs.create done
[batch:xxx] [75ms]  saveConfig done
[batch:xxx] [75ms]  updateDeclarativeRules done
```

**发现**：当 URL 已存在于本地配置中时，整个过程仅需 ~75ms。但当日志中出现 `Apifox fetch done` 时，该步骤耗时高达 3.7~8.4 秒。

### 第二步：定位 Apifox 数据拉取耗时

添加更细粒度的缓存层日志：

```
[cache:memory]  MISS xxx
[cache:session] MISS xxx
[cache:fetch]   START xxx         ← 开始网络请求
[cache:fetch]   DONE, storing xxx  ← 请求完成（3.7 秒后）
[cache:session] WRITE size=5421.6KB
[cache:session] WRITE FAILED: Session storage quota bytes exceeded.
```

**关键发现**：

- Apifox 项目包含约 1800 个接口，原始 OpenAPI/Swagger 数据达 **5.4MB**
- `chrome.storage.session` 的写入配额无法容纳 5.4MB，写入失败
- Service Worker 在空闲 30 秒后被 Chrome 销毁，内存缓存丢失
- 下次请求时 session 缓存也无数据，只能重新网络拉取

## 根因汇总

| 编号 | 问题                                                  | 影响                  |
| ---- | ----------------------------------------------------- | --------------------- |
| ①    | 不管 URL 是否在本地已有配置，每次都先拉取 Apifox 数据 | 浪费 3~5 秒           |
| ②    | 原始 Swagger JSON 达 5.4MB，无法存入 session 存储     | 跨 SW 重启缓存失效    |
| ③    | `saveConfig` + `updateDeclarativeRules` 同步阻塞响应  | 额外阻塞 200~500ms    |
| ④    | `tabs.create` 在响应返回前执行                        | 额外阻塞 200~800ms    |
| ⑤    | 外部消息处理使用完整初始化流程（含规则重建）          | 冷启动额外 150~1500ms |

## 第一阶段优化方案（历史）

### 1. 仅在需要时拉取 Apifox

**改动文件**：`src/pages/background/index.ts`

```typescript
// 优化前：无条件拉取全部 Apifox 数据
const apifoxApiMap = await fetchApifoxApiMap(globalConfig);

// 优化后：只检查本地找不到的 URL 才需要拉取
const urlsMissingLocally = normalizedUrls.filter(
  (url) => !findApiByNormalizedUrl(globalConfig, url),
);
if (urlsMissingLocally.length > 0) {
  apifoxApiMap = await fetchApifoxApiMap(globalConfig);
}
```

**效果**：当全部 URL 已在本地配置时，完全跳过 Apifox 拉取，响应时间从 ~6s 降至 ~20ms。

### 2. 缓存解析后的 API Map，而非原始 Swagger JSON

**改动文件**：`src/utils/batchQuickMock.ts`

原始 Swagger JSON（5.4MB）无法存入 `chrome.storage.session`。改为解析后只缓存精简的 API 映射表（约 360KB）：

```typescript
// 解析 1800 个接口为 ParsedApi 对象数组（每个约 200B）
const parsedApis = parseSwaggerData(data, []);
const map = new Map(parsedApis.map((api) => [normalizePath(api.path), api]));

// 缓存精简数据到 session 存储
await chrome.storage.session.set({
  [key]: { entries: Array.from(map.entries()), timestamp: Date.now() },
});
```

**效果**：解析后数据约 360KB，远低于 session 存储限额（10MB），可跨 Service Worker 重启存活。

### 3. 批量 Quick Mock 不再阻塞等待 Apifox

**改动文件**：`src/utils/batchQuickMock.ts`

```typescript
// 优化前：缓存未命中时同步拉取（阻塞 3~5 秒）
const cached = await getParsedApiMapFromCache(...)
if (!cached) {
  const data = await fetchApifoxSwaggerData(...)  // ← 阻塞
  ...
}

// 优化后：缓存未命中时返回空 Map，后台异步预拉取
const cached = await getParsedApiMapFromCache(...)
if (!cached) {
  fireAsyncPrefetch(url, mode, token)  // ← 不阻塞
}
return new Map()
```

**效果**：首次请求不再等待 Apifox，后台预拉取完成后后续请求自动命中缓存。

### 4. `saveConfig` + `updateDeclarativeRules` 异步化

**改动文件**：`src/pages/background/index.ts`

```typescript
// 优化前：同步等待持久化和规则更新
await saveConfig()
await updateDeclarativeRules()
return response

// 优化后：先返回响应，后台异步执行
return response
saveConfig().catch(...)
updateDeclarativeRules().catch(...)
```

**效果**：响应不受持久化和规则重建影响，节省 200~500ms。

### 5. `tabs.create` 异步化

**改动文件**：`src/pages/background/index.ts`

```typescript
// 优化前
await chrome.tabs.create({...})
return response

// 优化后
return response
chrome.tabs.create({...}).catch(...)  // fire-and-forget
```

**效果**：打开配置页不阻塞响应，节省 200~800ms。

### 6. 外部消息使用轻量初始化

**改动文件**：`src/pages/background/index.ts`

新增 `ensureConfigLoaded()` 函数，仅加载配置不重建规则，用于外部消息处理：

```typescript
function ensureConfigLoaded(): Promise<void> {
  if (!configLoadedPromise) {
    configLoadedPromise = loadConfig(); // 只加载配置
  }
  return configLoadedPromise;
}
```

**效果**：Service Worker 冷启动时节省一次不必要的规则重建（150~1500ms）。

## 持久缓存修订

第一阶段在缓存未命中时立即返回空 `Map`，随后使用 URL 作为 `apiName` 创建并持久化模块。后台预拉取完成后只写缓存，不会回填已经创建的数据，因此首次请求的接口名称和 Apifox 链接必然不完整。

2026-07-13 修订后的处理方式：

1. 解析后的全量 `ParsedApi Map` 写入独立 IndexedDB 数据库 `api-proxy-cache-db`。
2. 缓存对象仓库为 `parsed-api-maps`，有效期调整为 24 小时。
3. 缓存主键使用同步模式和 Apifox 地址的 SHA-256 摘要，不保存 URL 或 Token 原文。
4. 手动验证、设置和刷新 Apifox 时，复用已取得的 Swagger 数据预热持久缓存。
5. 冷缓存时等待 Apifox 拉取、解析和缓存完成后再创建批量模块，保证首次数据正确。
6. IndexedDB 不可用时仍使用本次已解析的数据完成补全，不因缓存失败中断业务。

## 当前效果

| 场景                             | 当前行为                                     |
| -------------------------------- | -------------------------------------------- |
| URL 已在本地配置                 | 直接复用本地接口，不读取缓存、不请求 Apifox  |
| URL 不在本地配置，IndexedDB 命中 | 直接补全接口名称、方法、链接、权限点和标签   |
| URL 不在本地配置，首次冷缓存     | 等待一次 Apifox 拉取后补全，优先保证数据正确 |
| 浏览器或 Service Worker 重启     | IndexedDB 缓存继续有效                       |
| IndexedDB 读写失败               | 使用本次 Apifox 解析结果降级，不中断任务     |

## 缓存架构

```
请求 Apifox 富化数据
    │
    ├─① IndexedDB 持久缓存 → 命中即返回
    │    └─ 存储内容：解析后的 ParsedApi[]，有效期 24 小时
    │
    ├─② in-flight 请求去重 → 相同参数复用 Promise
    │
    └─③ 网络请求 → 解析后写入 IndexedDB，再返回完整 API Map
```

## 后续优化方向

1. **增量解析**：对于大型项目（5000+ 接口），可考虑只解析请求 URL 匹配的接口而非全量。
2. **缓存观测**：增加命中率、冷启动耗时和缓存写入失败的结构化日志。
3. **后台刷新**：在保留有效旧缓存的前提下异步刷新，进一步降低 24 小时过期后的首次等待。
