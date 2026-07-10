# 跨插件批量 Quick Mock 性能优化

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

## 优化方案

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

## 最终效果

| 场景                                | 优化前 | 优化后                          |
| ----------------------------------- | ------ | ------------------------------- |
| URL 已在本地配置                    | ~6s    | **~20ms**                       |
| URL 不在本地配置（首次）            | ~6s    | **~50ms**（无富化）+ 后台预拉取 |
| URL 不在本地配置（再次，10 分钟内） | ~6s    | **~50ms**（缓存命中）           |
| SW 重启后重复请求                   | ~6s    | **~50ms**（session 缓存存活）   |

## 缓存架构

```
请求 Apifox 富化数据
    │
    ├─① 内存缓存（SW 存活期） → 命中即返回（<1ms）
    │
    ├─② chrome.storage.session（跨 SW 重启） → 命中即返回（~10ms）
    │    └─ 存储内容：解析后的 ParsedApi[]（~360KB），非原始 JSON（5.4MB）
    │
    ├─③ in-flight 请求去重 → 相同参数复用 Promise
    │
    └─④ 网络请求 → 解析后写入①+②，仅首次/缓存过期时执行
```

## 后续优化方向

1. **Options 页面 Apifox 同步时同时填充缓存**：用户在配置页手动同步 Apifox 数据后，自动写入 parsed API Map 缓存，使批量 Quick Mock 首次就能命中
2. **缓存 TTL 策略**：当前 10 分钟 TTL 可调整为更长周期或手动刷新机制
3. **增量解析**：对于大型项目（5000+ 接口），可考虑只解析请求 URL 匹配的接口而非全量
