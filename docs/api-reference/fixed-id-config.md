---
title: 固定 ID 配置
description: 配置固定 Chrome 扩展 ID 的说明文档
outline: deep
---

# 固定ID配置说明

> 说明：此方案待实现，后续需要再采用

---

Chrome 扩展要获得固定 ID，本质上依赖 `manifest.key` 中的扩展公钥。当前项目已改造为支持通过环境变量注入公钥，这样可以：

- 本地联调时获得稳定 ID
- 不把私钥提交到仓库
- 不污染通用的 `manifest.json`

## 当前实现

已在构建配置中增加：

- 读取环境变量 `EXTENSION_PUBLIC_KEY`
- 若存在，则在构建时注入到 `manifest.key`
- 若不存在，则保持原来的动态 ID 行为

相关文件：`vite.config.base.ts`

## 使用方式

### 1. 准备公钥

准备一份 **base64 编码的扩展公钥**。注意填的是公钥，不要把私钥提交到仓库。

### 2. 新建本地环境文件

在项目根目录新建 `.env.local`：

```bash
EXTENSION_PUBLIC_KEY=你的扩展公钥
```

### 3. 重新构建扩展

```bash
pnpm build:chrome
```

### 4. 查看固定 ID

重新加载后，在 `chrome://extensions/` 打开开发者模式，查看扩展卡片中的 `ID`。

## 联调建议

B 插件侧将当前插件的固定 ID 填入发送逻辑中：

```ts
const CURRENT_PLUGIN_ID = "这里替换为当前插件固定ID";
```

当前插件侧建议把 `externally_connectable` 从 `["*"]` 改为只允许 B 插件的固定 ID。

## 注意事项

- 没有公钥时，当前项目仍会正常构建，但 ID 不是固定的
- 固定 ID 的关键在于"公钥稳定"，不是构建命令本身
- 若更换公钥，扩展 ID 也会变化
