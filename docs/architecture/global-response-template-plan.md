---
title: 全局响应模板技术方案
description: 在浏览器扩展内为指定接口返回可配置 JSON 响应的设计方案
outline: deep
---

# 全局响应模板技术方案

> **更新时间**：2026-07-23；**使用模型**：Codex（GPT-5）；**用户**：Jsmond2016

---

> **当前状态**：本方案尚未落地。此前的实现尝试已全部撤回，本文保留为技术调研、失败复盘和后续决策依据。

## 一、背景与目标

当前扩展通过 Manifest V3 的 `declarativeNetRequest`（以下简称 DNR）将命中接口重定向到 Apifox 或其他 Mock URL。DNR 只能改写请求，不能直接构造任意 JSON 响应；现有 `quickMockConfigs` 和单接口自定义响应字段虽可存储数据，但后台尚未将其接入真实响应链路。

目标能力是新增全局共享的响应模板库。用户创建常用异常响应模板后，可在指定接口上显式选择模板，并让真实页面请求收到该模板 JSON，无需在 Apifox 补充异常响应。

第一版目标：

- 模板可配置名称、JSON 响应体、HTTP 状态码和延迟。
- 仅已选择模板且已开启的接口使用本地响应；其他接口继续沿用现有重定向。
- 支持页面代码通过 `fetch` 和 `XMLHttpRequest` 发起的请求。
- Chrome、Edge 和 Firefox 都纳入兼容性验收。

非目标：变量替换、按请求体分支、自定义响应头、导航/图片等资源请求、Service Worker 内的请求，以及自动为新接口分配默认模板。

## 二、总体设计

```text
Options 页面
  -> 编辑全局模板 / 接口模板引用
  -> background 保存 GlobalConfig 至 chrome.storage.local

background
  -> 为重定向接口更新 DNR 规则
  -> 排除本地响应接口，防止请求被重定向

Chrome/Edge background
  -> 使用 chrome.debugger 的 Fetch 域暂停 XHR/fetch 请求
  -> 命中：Fetch.fulfillRequest 返回模板 JSON
  -> 未命中：Fetch.continueRequest 放行原请求
```

Chrome Debugger Protocol 是“只依赖 Chromium 扩展能力”时最接近网络层替换响应体的候选方案。它不依赖页面 CSP 或业务框架对 `fetch` / XHR 的封装，但会引入 `debugger` 权限提示，并且 Firefox 不支持等价能力。

## 三、数据模型与兼容策略

```ts
interface GlobalResponseTemplate {
  id: string;
  name: string;
  responseJson: string;
  statusCode: number;
  delay: number;
}

interface ApiConfig {
  // 既有字段保持不变
  responseMode?: "redirect" | "localResponse";
  globalResponseTemplateId?: string;
}

interface GlobalConfig {
  // 既有字段保持不变
  globalResponseTemplates?: GlobalResponseTemplate[];
}
```

- `responseMode` 缺省或为 `redirect` 时，保留当前 DNR 重定向行为。
- `localResponse` 必须同时存在有效的 `globalResponseTemplateId`；模板被删除或引用失效时，接口自动按 `redirect` 处理，并在配置页提示用户修复。
- 旧配置加载时不做破坏性迁移：缺失字段以默认值解释。导入、导出、存档和恢复需要保留新字段。
- 既有 `quickMockConfigs`、`mockWay`、`customMockResponses` 不作为新功能的运行依据，避免继续扩大未落地的 Quick Mock 分支。

## 四、交互与配置流

### 4.1 模板管理

复用顶部“快速联调设置”的入口，将其调整为“全局响应模板”。列表显示名称、状态码、延迟和引用数，支持新增、编辑与删除。

- 保存前必须执行 `JSON.parse(responseJson)`。
- 状态码限定为 `100` 至 `599`，延迟为非负整数。
- 模板名称必填；`id` 由扩展生成，不允许用户编辑。
- 被接口引用的模板不可删除，先在接口中切回“Mock URL”或选择其他模板后才能删除。

### 4.2 接口编辑

接口抽屉新增“响应来源”单选项：

- `Mock URL`：显示并校验现有重定向 URL，保存 `responseMode: "redirect"`。
- `全局响应模板`：显示模板选择器，保存 `responseMode: "localResponse"` 和模板 ID；该模式不要求重定向 URL。

接口启用开关与全局代理开关仍是总开关：任一关闭时，本地响应与 DNR 重定向均不生效。

## 五、运行时实现（历史页面注入草案，未采纳）

### 5.1 规则投影与同步

后台维护完整 `GlobalConfig`，页面只需要以下投影数据：接口 ID、匹配方式、URL、请求方法和已解析的模板响应。生成投影时应过滤：全局开关关闭、接口关闭、非 `localResponse` 模式或模板无效的接口。

隔离世界桥接脚本以 `document_start` 注入，初始读取 `chrome.storage.local`，并监听 `chrome.storage.onChanged`。它通过固定事件名向主世界传递新快照；主世界收到后原子替换内存规则。页面不拥有修改扩展配置的通道。

### 5.2 匹配规则

匹配器抽取为无浏览器依赖的纯函数，并同时服务于测试和主世界脚本：

- `contains`：请求 URL 包含配置值。
- `exact`：请求 URL 与配置值相等。
- `regex`：以配置值构造正则表达式；配置非法时忽略该规则并记录扩展日志。
- 请求方法以大写字符串比较；同一请求按配置列表顺序取第一个命中规则。

本地响应接口不参与 `updateDeclarativeRules()`；重定向接口继续使用现有 DNR 条件和优先级。

### 5.3 fetch 拦截

包装 `window.fetch`。从 `RequestInfo` 和 `RequestInit` 解析最终 URL、方法，命中后返回原生 `Response`：正文为模板 JSON、状态为模板状态码、响应头固定为 `Content-Type: application/json; charset=utf-8`。延迟通过 Promise 定时器实现，未命中时以原始参数调用原始 `fetch`。

### 5.4 XMLHttpRequest 拦截

包装 `open()` 与 `send()`，记录请求 URL 和方法。命中规则时不调用原始 `send()`，而是按 XHR 常用语义触发 `readystatechange`、`load`、`loadend`，提供 `readyState`、`status`、`responseText`、`response` 和 JSON 内容类型；非命中请求完全委托原生 XHR。

实现必须保持 `onreadystatechange`、`onload`、`addEventListener` 和 `responseType = "json"` 的常规用法可用。无法等价覆盖的原生细节不承诺兼容，例如上传进度、同步 XHR、流式响应和 `responseURL`。

## 六、权限与浏览器兼容性

Chrome/Edge 新增 `debugger` 权限。后台在存在有效本地模板时，对 `http/https` 标签页 attach Debugger，启用 CDP `Fetch` 域；关闭全局 Mock 或没有模板接口时 detach。浏览器会向用户提示扩展正在调试标签页，且可能与 DevTools 调试同一标签页冲突。

Firefox 不支持等价的 Debugger Protocol 响应填充能力，因此本地响应模式回退到既有 Mock URL 重定向。Firefox 用户必须保留有效的 `redirectURL`。

## 七、错误处理与可观测性

- 模板 JSON、正则和字段范围在 UI 保存时校验；运行时再次容错，单条坏规则不能影响其他规则。
- 本地响应规则同步失败、主世界事件发送失败或拦截器初始化失败时，记录带接口 ID 的扩展日志；请求回退到原生网络，不返回伪造的空响应。
- 配置更新后不要求刷新页面；已打开页面在收到存储变更后使用最新规则。脚本初始化完成前的极早期请求允许走原始网络。

## 八、测试与验收

单元测试：

- 配置默认值、旧配置兼容、模板引用失效回退。
- 模板 JSON、状态码、延迟和正则校验。
- 三种 URL 匹配方式、方法过滤、规则顺序和全局/接口开关。
- DNR 规则排除本地响应接口，保留重定向接口。

浏览器验收：

1. 新建一个 `401` 或 `500` JSON 模板，在接口中选择并开启。
2. 分别通过 `fetch` 与 `XMLHttpRequest` 调用接口，确认没有真实网络请求，且收到指定 JSON、状态码和延迟。
3. 切换回 Mock URL，确认请求恢复重定向；关闭接口或全局开关，确认请求恢复原始网络。
4. 在 Chrome、Edge、Firefox 完成以上场景，并验证编辑模板后已打开页面无需刷新即可使用新结果。

## 九、风险与应对

| 风险                   | 影响                                  | 应对                                                     |
| ---------------------- | ------------------------------------- | -------------------------------------------------------- |
| `debugger` 权限提示    | 用户可能不接受浏览器调试提示          | 仅在有有效本地模板时 attach，UI 明确说明行为             |
| 与 DevTools 冲突       | 已被 DevTools 调试的标签页无法 attach | 记录失败原因，提示用户关闭 DevTools 或使用 Apifox 重定向 |
| Firefox 不支持响应填充 | Firefox 无法使用本地模板返回真实请求  | 回退到已有 Mock URL 重定向，并在 UI 标注 Chromium-only   |

## 十、实施尝试与复盘

### 10.1 基础结论：DNR 不能改响应体

现有扩展使用 Manifest V3 `declarativeNetRequest` 将业务接口重定向到 Apifox Mock。调研和代码检查确认：DNR 能匹配、阻止、重定向及修改部分请求/响应头，但**不能读取或替换响应 body**。

因此下列链路不可行：

```text
页面 -> DNR -> Apifox Mock -> DNR 替换 Apifox 响应体 -> 页面
```

浏览器没有提供最后一步的响应 body 改写能力。扩展 Background Service Worker 也不能注册为任意网页请求的 HTTP 响应服务器。

### 10.2 尝试一：页面主世界拦截 `fetch` / XHR

尝试方案：内容脚本读取 `chrome.storage.local` 中的模板规则，通过事件同步到页面主世界；主世界包装 `window.fetch` 与 `XMLHttpRequest`，命中时不发送网络请求而构造 `Response`。

验证过程与问题：

1. Options 页“测试”按钮运行在 `chrome-extension://` 页面，内容脚本不注入该页面，因此它最初不能验证真实拦截能力。后续测试按钮被改为直接展示模板，证明的只是模板配置读取正确，不能证明页面网络层拦截成功。
2. CRX/Vite 将 `world: "MAIN"` 内容脚本包装为动态导入，包装代码调用 `chrome.runtime.getURL(...)`；主世界没有扩展 API，脚本可能无法加载。
3. 改为由隔离世界动态插入 Web Accessible Resource 页面脚本后，仍受页面 CSP、异步加载时机和业务框架提前缓存原生 `fetch` 的影响。
4. 即使注入成功，该方式也无法可靠覆盖 Service Worker、部分 frame、框架封装及非 `fetch` / XHR 的网络路径。

结论：该方案只能作为 best-effort 调试工具，不能承诺“真实接口一定被模板响应拦截”。已撤回。

### 10.3 尝试二：Chrome Debugger Protocol

尝试方案：在 Chrome/Edge 中申请 `debugger` 权限，对标签页 attach DevTools Protocol，使用 `Fetch.enable` 暂停 `XHR` / `Fetch` 请求；命中规则时调用 `Fetch.fulfillRequest` 返回模板 JSON，未命中调用 `Fetch.continueRequest` 放行。

理论链路：

```text
页面请求 -> CDP Fetch.requestPaused -> 扩展后台匹配模板
         -> Fetch.fulfillRequest / Fetch.continueRequest
```

该方案是纯 Chromium 扩展能力中最可靠的候选方案，但本轮没有完成真实页面端到端验证。验证过程中全局开关先被既有 DNR 规则错误阻断，后台日志为：

```text
Failed to update declarative rules
Rule with id 1 does not provide a valid URL for action.redirect.url key.
```

这说明现有配置中至少有一条普通重定向规则的最终 URL 不被 DNR 接受。由于该错误使全局开关失败，Debugger attach/请求暂停链路没有获得可验证的稳定前提。

该路线还需要接受以下产品约束：

- Chrome/Edge 专属；Firefox 没有等价的响应填充 API。
- 浏览器会提示扩展正在调试标签页。
- 可能与用户打开的 DevTools 调试会话冲突。
- 需要定义 attach 范围、失败状态展示、tab 生命周期和性能上限。

结论：技术上值得单独做 Chromium POC，但不应在未解决既有 DNR 规则健康度、未补充浏览器端到端测试前合入主功能。已撤回。

### 10.4 Service Worker 可行性

- **扩展 Background Service Worker**：不能拦截任意网页请求并返回动态 HTTP 响应，不可用作本方案的响应服务。
- **业务网站 Service Worker**：可对其控制范围内页面的请求返回 `new Response(...)`，但 Worker 脚本必须由业务站点同源注册；扩展不能用 `chrome-extension://` 脚本控制任意 `https://` 业务站点。

若允许改造业务开发环境，业务 Service Worker 是可行且稳定的方案；若不允许改造业务项目，则不满足“仅扩展且跨浏览器”的目标。

### 10.5 候选方案对比

| 方案                     | 动态模板响应 | 浏览器范围          | 主要代价                                           |
| ------------------------ | ------------ | ------------------- | -------------------------------------------------- |
| DNR 直连 Apifox          | 否           | Chrome/Edge/Firefox | 无法修改响应体                                     |
| 页面注入 fetch/XHR       | 是，但不可靠 | Chrome/Edge/Firefox | CSP、时机、Worker、框架兼容问题                    |
| Chrome Debugger Protocol | 是           | Chrome/Edge         | `debugger` 权限提示、DevTools 冲突、Firefox 不支持 |
| 业务 Service Worker      | 是           | 支持 SW 的浏览器    | 必须改造业务站点并受同源 scope 限制                |
| 本地/远程响应网关 + DNR  | 是           | Chrome/Edge/Firefox | 需要额外服务和模板同步机制                         |

### 10.6 后续决策建议

在重新实施前，先选择一个明确边界：

1. **跨浏览器优先**：引入本地或远程响应网关。DNR 只负责重定向，网关直接返回模板；未命中模板时代理至 Apifox。
2. **纯扩展优先**：仅支持 Chrome/Edge，以 Debugger Protocol 做独立 POC，并将 Firefox 明确降级为 Apifox 重定向。
3. **不接受权限提示且不引入服务**：模板仅用于配置页预览，真实页面继续使用 Apifox Mock，不承诺动态响应替换。

无论选择哪条路线，首先应修复或审计现有 DNR 规则中的无效 `redirectURL`，否则全局 Mock 的基础能力不稳定。

## 十一、后续落地顺序

1. 完成类型、默认配置、导入导出与存档的兼容改造。
2. 完成全局模板管理和接口响应来源选择。
3. 实现纯匹配器、后台 DNR 排除和规则投影。
4. 实现 Debugger attach/detach 与 `Fetch.fulfillRequest` 响应填充。
5. 补齐单元测试、三浏览器手工验收和使用文档。
