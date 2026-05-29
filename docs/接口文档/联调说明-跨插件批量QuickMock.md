# 联调说明-跨插件批量QuickMock

> **编写时间**：2026-05-28；**使用模型**：GPT-5；**用户**：Jsmond2016

---

## 背景

当前插件已支持被其他 Chrome 扩展通过外部消息方式触发“批量 Quick Mock”流程。

目标效果：

- B 插件勾选多个异常接口
- B 插件按接口 URL 去重后发送到当前插件
- 当前插件按 URL 列表自动补全接口信息
- 当前插件生成一批 mock 配置并打开新的 options Tab
- 当前插件向 B 插件返回统一结果提示

## 任务清单

1. B 插件采集勾选接口 URL，并在发送前完成去重
2. B 插件调用当前插件的外部消息接口 `BATCH_QUICK_MOCK`
3. 当前插件接收 URL 列表并尝试补全本地配置和 Apifox 信息
4. 当前插件将本次批量结果写入 `quick.mock.external` 模块
5. 当前插件自动打开新的 options Tab，并展示本次批量导入摘要
6. B 插件根据返回结果提示“成功 / 失败 / 部分成功”

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

字段说明：

- `type`：固定值 `BATCH_QUICK_MOCK`
- `requestId`：B 插件生成的请求唯一标识，建议使用时间戳或 UUID
- `urls`：勾选接口的 URL 列表，建议发送前先去重

### 响应消息

当前插件返回：

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

字段说明：

- `success`：是否至少成功处理 1 条
- `jobId`：当前插件内部批处理任务 ID，可用于排查
- `status`：处理状态
- `total`：去重后总条数
- `successCount`：成功条数
- `failCount`：失败条数
- `message`：建议直接展示给用户的提示文案

## 当前插件处理规则

### URL 处理

- 会对 URL 做二次去重
- 若传入完整地址，如 `https://a.com/api/user?id=1`，会只取 pathname
- 会去掉 query 和 hash
- 会统一补齐前导 `/`

示例：

- `https://a.com/api/user?id=1` -> `/api/user`
- `api/user` -> `/api/user`
- `/api/user/` -> `/api/user`

### 信息补全优先级

1. 优先匹配当前插件本地已存在的接口配置
2. 若未命中本地配置，则尝试从当前 `apifoxUrl` 拉取接口信息补全
3. 若 Apifox 中也不存在，则仍按基础信息创建

### Apifox 缺失策略

当某个 URL 在 Apifox 中不存在时：

- 不视为失败
- `apiName` 回退为 URL 本身
- 不展示 Apifox 链接、标签等字段
- 仍会正常创建到批量模块中

### 落库模块

当前插件会将本次批量结果写入固定模块：

```txt
quick.mock.external
```

说明：

- 每次批量任务会覆盖该模块中的旧列表
- 这样新的 options Tab 可以稳定只展示本次批量结果

## B 插件接入示例

### manifest 配置

B 插件需要知道当前插件的扩展 ID，并确保其自身具备正常的扩展消息能力。

### 发送示例

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

### 建议的错误处理

- 若 `chrome.runtime.lastError` 存在，优先提示“当前插件未安装或不可访问”
- 若响应为空，提示“Quick Mock 调用失败”
- 若 `status === "partial_success"`，提示用户前往当前插件新打开的 tab 查看明细

## 新 Tab 展示行为

当前插件完成处理后会自动打开新的 options Tab，并执行以下动作：

- 自动切换到 `quick.mock.external` 模块
- 自动勾选本次成功导入的接口
- 自动高亮第一条成功接口
- 顶部展示批量处理摘要

摘要包含：

- 总数
- 成功数
- 失败数
- 未匹配到 Apifox 的接口数量
- 请求 ID

## 联调步骤

1. 在当前插件中先完成一次 Apifox 同步，保证 `apifoxUrl` 和 `mockPrefix` 已配置
2. 重新构建并安装当前插件
3. 在 B 插件中填入当前插件的扩展 ID
4. 选择多个接口 URL，调用 `BATCH_QUICK_MOCK`
5. 观察当前插件是否自动打开新的 options Tab
6. 核对 `quick.mock.external` 模块中的接口列表是否符合预期
7. 检查返回文案是否符合以下规则：

- 全部成功：`操作成功`
- 全部失败：`操作失败`
- 部分成功：`部分操作成功，请前往 mock 列表查看`

## 注意事项

### `externally_connectable`

当前实现为了方便联调，`manifest.json` 中已配置：

```json
"externally_connectable": {
  "ids": ["*"]
}
```

这适合开发联调阶段。

若要上线，建议改为仅允许指定的 B 插件 ID，例如：

```json
"externally_connectable": {
  "ids": ["abcdefghijklmnopabcdefghijklmnop"]
}
```

### 数据来源

- 若本地已有接口配置，则优先复用本地字段
- 若本地没有但 Apifox 有，则自动补全 Apifox 信息
- 若两者都没有，也不会阻断创建流程

### 模块覆盖

`quick.mock.external` 模块用于承载“最近一次”批量 Quick Mock 结果。

如果需要保留历史批次，建议后续扩展为“按时间生成独立批次模块”或“增加归档能力”。
