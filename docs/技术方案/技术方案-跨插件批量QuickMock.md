# 跨插件批量QuickMock技术方案

> **编写时间**：2026-05-28；**使用模型**：GPT-5；**用户**：Jsmond2016

---

## 一、方案背景

为了支持外部插件批量将异常接口同步到当前插件中进行 Quick Mock 管理，需要为当前插件增加一条对外的扩展消息通道，并在当前插件内部完成 URL 标准化、接口信息补全、批量写入和结果展示。

本方案目标是在尽量少改动现有 options 与配置结构的前提下，实现一条稳定的跨插件批处理链路。

## 二、设计目标

1. 让外部插件只传递最小必要数据 `urls`
2. 将接口补全逻辑收敛到当前插件内部
3. 复用现有 `GlobalConfig / ModuleConfig / ApiConfig` 结构
4. 尽量不破坏现有 options 页面与模块管理逻辑
5. 让联调结果可直接在当前插件 UI 中验证

## 三、总体架构

### 3.1 角色划分

#### 外部插件 B

- 选择异常接口
- 发送 URL 列表
- 接收处理结果并提示用户

#### 当前插件 Background

- 接收外部消息
- 归一化并去重 URL
- 查询本地配置
- 拉取并解析 Apifox 数据
- 批量生成接口列表
- 写入配置
- 打开新的 options Tab

#### 当前插件 Options 页面

- 根据 query 参数识别批量 Quick Mock 上下文
- 读取批处理任务摘要
- 自动切换到批量模块
- 展示处理结果横幅

### 3.2 时序图

```text
外部插件 B
  -> chrome.runtime.sendMessage
当前插件 background
  -> URL 去重与标准化
  -> 本地配置匹配
  -> Apifox 数据补全
  -> 写入 quick.mock.external 模块
  -> chrome.storage.session 写入 job 摘要
  -> chrome.tabs.create 打开 options Tab
  -> 返回处理结果
当前插件 options
  -> 读取 jobId
  -> 展示摘要
  -> 自动选中本次成功接口
```

## 四、数据结构设计

### 4.1 外部请求协议

```ts
type ExternalBatchQuickMockRequest = {
  type: "BATCH_QUICK_MOCK";
  requestId: string;
  urls: string[];
};
```

设计说明：

- `type` 用于做协议路由
- `requestId` 用于请求追踪
- `urls` 保持最小输入，避免外部插件依赖当前插件内部数据结构

### 4.2 外部响应协议

```ts
type ExternalBatchQuickMockResponse = {
  success: boolean;
  jobId?: string;
  status: "success" | "partial_success" | "failed";
  total: number;
  successCount: number;
  failCount: number;
  message: string;
};
```

设计说明：

- `success` 表示是否至少成功处理一条
- `status` 用于前端直接展示不同文案
- `jobId` 用于日志和问题排查

### 4.3 批处理任务模型

```ts
interface BatchQuickMockJobItem {
  url: string;
  normalizedUrl: string;
  apiId: string;
  apiName: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  moduleId: string;
  moduleLabel: string;
  foundInLocalConfig: boolean;
  foundInApifox: boolean;
  apifoxLink?: string;
  tags?: string[];
  error?: string;
}

interface BatchQuickMockJob {
  jobId: string;
  requestId: string;
  sourceExtensionId: string;
  moduleId: string;
  moduleLabel: string;
  createdAt: number;
  total: number;
  successCount: number;
  failCount: number;
  status: "success" | "partial_success" | "failed";
  message: string;
  items: BatchQuickMockJobItem[];
}
```

设计说明：

- `BatchQuickMockJob` 存放在 `chrome.storage.session`
- `items` 用于 options 页展示本次任务详情
- `foundInLocalConfig` 和 `foundInApifox` 用于结果解释

## 五、核心实现方案

### 5.1 Background 外部消息入口

实现位置：

- [src/pages/background/index.ts](/Users/huangjing/Desktop/MyCode/github/api_proxy_tool_ext/src/pages/background/index.ts)

实现方式：

- 使用 `chrome.runtime.onMessageExternal.addListener`
- 识别 `BATCH_QUICK_MOCK` 类型消息
- 调用统一处理函数 `handleExternalBatchQuickMock`

原因：

- 跨插件消息必须在 background/service worker 中统一接收
- 当前项目已有 background 统一承担配置读写和开 tab 能力，便于复用

### 5.2 URL 标准化与去重

实现位置：

- [src/utils/batchQuickMock.ts](/Users/huangjing/Desktop/MyCode/github/api_proxy_tool_ext/src/utils/batchQuickMock.ts)

处理规则：

- 去掉首尾空格
- 解析完整 URL 时仅保留 pathname
- 去掉 query 和 hash
- 合并重复 `/`
- 补齐前导 `/`
- 去掉尾部 `/`

原因：

- 降低外部插件输入格式差异带来的匹配失败
- 保证本地配置匹配和 Apifox 匹配使用同一套标准

### 5.3 本地配置优先匹配

处理方式：

- 遍历 `globalConfig.modules[].apiArr`
- 按标准化后的 `apiUrl` 进行查找
- 命中后优先复用本地 `ApiConfig`

原因：

- 本地配置可能已经包含用户手工维护过的 mock 字段
- 本地信息通常比 Apifox 信息更贴近当前插件的运行配置

### 5.4 Apifox 补全

处理方式：

- 读取 `globalConfig.apifoxConfig?.apifoxUrl`
- 通过 `fetch` 拉取 Swagger/OpenAPI 数据
- 复用已有 `parseSwaggerData` 解析能力
- 以标准化 URL 为键构建 `Map`

原因：

- 当前项目已存在成熟的 Apifox 解析逻辑
- 复用现有代码能降低重复实现成本

### 5.5 基础信息兜底

若本地和 Apifox 都未命中：

- `apiName` 回退为 `normalizedUrl`
- `method` 默认 `GET`
- `redirectURL` 使用 `mockPrefix + normalizedUrl`
- 仍创建到批量模块中

原因：

- 需求明确要求 Apifox 缺失不应阻断本次操作
- “无 Apifox 信息”与“创建失败”在业务上需要区分

### 5.6 批量模块承载

模块常量：

- `apiDocKey = quick.mock.external`
- `label = quick.mock.external`

处理方式：

- 若模块已存在，则覆盖其 `apiArr`
- 若模块不存在，则插入新模块

原因：

- 最小侵入复用现有模块和表格展示能力
- 避免为本需求额外创建新的独立页面数据结构

## 六、Options 页面展示方案

实现位置：

- [src/pages/options/Options.tsx](/Users/huangjing/Desktop/MyCode/github/api_proxy_tool_ext/src/pages/options/Options.tsx)
- [src/pages/options/components/BatchQuickMockBanner.tsx](/Users/huangjing/Desktop/MyCode/github/api_proxy_tool_ext/src/pages/options/components/BatchQuickMockBanner.tsx)

### 6.1 上下文传递

打开 tab 时拼接 query：

```txt
?batchQuickMock=1&jobId=xxx&moduleId=xxx
```

Options 页启动后：

- 识别 `batchQuickMock`
- 根据 `jobId` 从 `chrome.storage.session` 读取任务摘要
- 根据 `moduleId` 自动切换模块

### 6.2 页面增强行为

- 自动勾选本次成功导入的接口
- 自动高亮第一条成功接口
- 顶部显示结果横幅

这样可以把“处理完成”转化成可见的 UI 反馈，便于联调和验收。

## 七、状态与提示策略

状态计算逻辑：

- `successCount === total` -> `success`
- `successCount === 0` 或 `total === 0` -> `failed`
- 其他情况 -> `partial_success`

提示文案：

- `success` -> `操作成功`
- `failed` -> `操作失败`
- `partial_success` -> `部分操作成功，请前往 mock 列表查看`

说明：

- Apifox 缺失但成功生成基础接口时，仍计入成功
- 只有真正无法生成接口项时才计入失败

## 八、存储设计

### 8.1 长期配置

- 使用 `chrome.storage.local`
- 由现有 `globalConfig` 承载模块与接口列表

### 8.2 会话级任务摘要

- 使用 `chrome.storage.session`
- Key 形式：`batch-quick-mock-job:${jobId}`

原因：

- 任务摘要只对当前联调过程有意义
- 不需要长期持久化
- 可避免污染长期配置结构

## 九、安全设计

### 9.1 `externally_connectable`

当前联调阶段配置为：

```json
"externally_connectable": {
  "ids": ["*"]
}
```

目的：

- 降低联调成本，方便外部插件快速接入

正式发布建议：

- 收敛为固定白名单插件 ID
- background 中增加显式 `sender.id` 校验

### 9.2 输入约束

- 只接受 `type/requestId/urls` 结构
- URL 会做标准化和空值过滤
- 不信任外部插件传入的附加业务字段

## 十、方案取舍

### 选择“外部只传 URL”的原因

- 外部插件接入成本最低
- 当前插件内部字段变更不会影响 B 插件
- 接口补全逻辑统一收敛到当前插件

### 选择“固定模块覆盖”的原因

- 当前实现复杂度最低
- UI 复用成本最低
- 联调验证路径最短

代价：

- 不保留历史批次
- 只能承载“最近一次”外部批处理结果

## 十一、可扩展方向

1. 将固定模块升级为“按批次生成模块”
2. 增加任务历史记录页
3. 增加来源插件白名单管理
4. 增加失败详情导出能力
5. 增加批量回滚或清理能力

## 十二、落地文件清单

- [manifest.json](/Users/huangjing/Desktop/MyCode/github/api_proxy_tool_ext/manifest.json)
- [src/types/index.ts](/Users/huangjing/Desktop/MyCode/github/api_proxy_tool_ext/src/types/index.ts)
- [src/utils/batchQuickMock.ts](/Users/huangjing/Desktop/MyCode/github/api_proxy_tool_ext/src/utils/batchQuickMock.ts)
- [src/pages/background/index.ts](/Users/huangjing/Desktop/MyCode/github/api_proxy_tool_ext/src/pages/background/index.ts)
- [src/pages/options/Options.tsx](/Users/huangjing/Desktop/MyCode/github/api_proxy_tool_ext/src/pages/options/Options.tsx)
- [src/pages/options/components/BatchQuickMockBanner.tsx](/Users/huangjing/Desktop/MyCode/github/api_proxy_tool_ext/src/pages/options/components/BatchQuickMockBanner.tsx)
- [docs/接口文档/联调说明-跨插件批量QuickMock.md](/Users/huangjing/Desktop/MyCode/github/api_proxy_tool_ext/docs/接口文档/联调说明-跨插件批量QuickMock.md)

## 十三、结论

本方案通过“外部插件最小输入 + 当前插件内部补全 + 固定模块承载 + 新 Tab 可视化反馈”的组合，实现了跨插件批量 Quick Mock 的闭环能力。方案复用了现有配置结构、Apifox 解析能力和 options 页面，改动范围可控，适合当前阶段快速落地与继续迭代。
