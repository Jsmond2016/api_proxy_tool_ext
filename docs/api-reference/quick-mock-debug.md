---
title: 跨插件批量 QuickMock 联调
description: 外部插件集成跨插件批量 QuickMock 功能的联调说明
outline: deep
---

# 联调说明-跨插件批量QuickMock

> **更新时间**：2026-07-14；**使用模型**：Codex（GPT-5）；**用户**：Jsmond2016

---

## 当前实现说明

- 本地已存在的接口优先复用，不读取缓存或请求 Apifox。
- 缺失接口优先读取 IndexedDB 中有效期为 24 小时的 Parsed API 缓存。
- 首次冷缓存会等待 Apifox 拉取与解析完成，再创建模块，保证接口名称、方法、链接、权限点和标签完整。
- 相同 Apifox 配置的并发请求会复用同一个进行中的请求，避免重复拉取。
- IndexedDB 失败时使用本次解析结果继续处理，不中断 Quick Mock。
- 新建的外部模块标记为 `external`，Apifox tag 刷新不会覆盖该模块。

详细缓存设计见[Quick Mock 持久缓存](/architecture/quick-mock-persistent-cache-fix-plan)。

## 背景

当前插件已支持被其他 Chrome 扩展通过外部消息方式触发"批量 Quick Mock"流程。

目标效果：

- B 插件勾选多个异常接口
- B 插件按接口 URL 去重后发送到当前插件
- 当前插件按 URL 列表自动补全接口信息
- 当前插件生成一批 mock 配置并打开新的 options Tab
- 当前插件向 B 插件返回统一结果提示

## 接口协议

### 请求消息

B 插件通过 `chrome.runtime.sendMessage` 向当前插件发送：

```ts
type ExternalBatchQuickMockRequest = {
  type: "BATCH_QUICK_MOCK";
  requestId: string;
  urls: string[];
};
```

### 响应消息

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

## 当前插件处理规则

### URL 处理

- 会对 URL 做二次去重
- 若传入完整地址，会只取 pathname
- 去掉 query 和 hash
- 补齐前导 `/`

示例：

- `https://a.com/api/user?id=1` -> `/api/user`
- `api/user` -> `/api/user`
- `/api/user/` -> `/api/user`

### 信息补全优先级

1. 优先匹配当前插件本地已存在的接口配置
2. 若未命中本地配置，则尝试从当前 `apifoxUrl` 拉取接口信息补全
3. 若 Apifox 中也不存在，则仍按基础信息创建

### 落库模块

插件将本次批量结果写入固定模块 `quick.mock.external`。每次批量任务会覆盖该模块中的旧列表。

## B 插件接入示例

```ts
const CURRENT_PLUGIN_ID = "替换为当前插件ID";

async function sendBatchQuickMock(urls: string[]) {
  const dedupedUrls = [...new Set(urls)];

  const response = await chrome.runtime.sendMessage(CURRENT_PLUGIN_ID, {
    type: "BATCH_QUICK_MOCK",
    requestId: String(Date.now()),
    urls: dedupedUrls,
  });

  if (response?.status === "success") {
    chrome.notifications?.create({
      type: "basic",
      iconUrl: "icon.png",
      title: "Quick Mock",
      message: "操作成功",
    });
    return;
  }

  if (response?.status === "failed") {
    chrome.notifications?.create({
      type: "basic",
      iconUrl: "icon.png",
      title: "Quick Mock",
      message: "操作失败",
    });
    return;
  }

  chrome.notifications?.create({
    type: "basic",
    iconUrl: "icon.png",
    title: "Quick Mock",
    message: "部分操作成功，请前往 mock 列表查看",
  });
}
```

## 新 Tab 展示行为

当前插件完成处理后会自动打开新的 options Tab，并：

- 自动切换到 `quick.mock.external` 模块
- 自动勾选本次成功导入的接口
- 自动高亮第一条成功接口
- 顶部展示批量处理摘要

## 联调步骤

1. 在当前插件中先完成一次 Apifox 同步，保证 `apifoxUrl` 和 `mockPrefix` 已配置
2. 重新构建并安装当前插件
3. 在 B 插件中填入当前插件的扩展 ID
4. 选择多个接口 URL，调用 `BATCH_QUICK_MOCK`
5. 观察当前插件是否自动打开新的 options Tab
6. 核对 `quick.mock.external` 模块中的接口列表是否符合预期

## 注意事项

- 联调阶段 `externally_connectable` 配置为 `["*"]`，上线建议改为白名单
- 若本地已有接口配置则优先复用本地字段，Apifox 缺失不阻断创建流程
- `quick.mock.external` 模块只承载最近一次结果，不保留历史批次
