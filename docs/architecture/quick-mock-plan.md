---
title: 跨插件批量 QuickMock 方案
description: 跨插件批量 QuickMock 的技术方案设计文档
outline: deep
---

# 跨插件批量QuickMock技术方案

> **编写时间**：2026-05-28

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

```
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

## 五、核心实现方案

### 5.1 Background 外部消息入口

实现方式：使用 `chrome.runtime.onMessageExternal.addListener` 识别 `BATCH_QUICK_MOCK` 类型消息，调用统一处理函数 `handleExternalBatchQuickMock`。

### 5.2 URL 标准化与去重

处理规则：

- 去掉首尾空格
- 解析完整 URL 时仅保留 pathname
- 去掉 query 和 hash
- 合并重复 `/`
- 补齐前导 `/`
- 去掉尾部 `/`

### 5.3 本地配置优先匹配

遍历 `globalConfig.modules[].apiArr`，按标准化后的 `apiUrl` 进行查找，命中后优先复用本地 `ApiConfig`。

### 5.4 Apifox 补全

读取 `globalConfig.apifoxConfig?.apifoxUrl`，通过 `fetch` 拉取 Swagger/OpenAPI 数据，复用已有 `parseSwaggerData` 解析能力，以标准化 URL 为键构建 `Map`。

### 5.5 基础信息兜底

若本地和 Apifox 都未命中，`apiName` 回退为 `normalizedUrl`，`method` 默认 `GET`，`redirectURL` 使用 `mockPrefix + normalizedUrl`，仍创建到批量模块中。

### 5.6 批量模块承载

模块常量：`apiDocKey = quick.mock.external`, `label = quick.mock.external`。若模块已存在则覆盖其 `apiArr`，不存在则插入新模块。

## 六、Options 页面展示方案

- 打开 tab 时拼接 query：`?batchQuickMock=1&jobId=xxx&moduleId=xxx`
- Options 页识别 `batchQuickMock`，根据 `jobId` 从 `chrome.storage.session` 读取任务摘要
- 自动勾选本次成功导入的接口，自动高亮第一条成功接口
- 顶部显示结果横幅

## 七、状态与提示策略

- `successCount === total` -> `success` -> `操作成功`
- `successCount === 0` 或 `total === 0` -> `failed` -> `操作失败`
- 其他 -> `partial_success` -> `部分操作成功，请前往 mock 列表查看`

## 八、存储设计

- 长期配置使用 `chrome.storage.local`，由现有 `globalConfig` 承载
- 会话级任务摘要使用 `chrome.storage.session`，Key 形式 `batch-quick-mock-job:${jobId}`

## 九、安全设计

联调阶段 `externally_connectable` 配置为 `["*"]`，正式发布建议收敛为固定白名单并增加 `sender.id` 校验。

## 十、方案取舍

- 外部只传 URL：接入成本最低，字段变更不互相影响
- 固定模块覆盖：实现复杂度最低，UI 复用成本最低，但不保留历史批次

## 十一、落地文件清单

- `manifest.json`
- `src/types/index.ts`
- `src/utils/batchQuickMock.ts`
- `src/pages/background/index.ts`
- `src/pages/options/Options.tsx`
- `src/pages/options/components/BatchQuickMockBanner.tsx`
