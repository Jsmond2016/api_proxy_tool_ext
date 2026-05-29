# 固定ID配置说明

> 说明，此方案 待实现，后续需要再采用

> **编写时间**：2026-05-28；**使用模型**：GPT-5；**用户**：Jsmond2016

---

## 说明

Chrome 扩展要获得固定 ID，本质上依赖 `manifest.key` 中的扩展公钥。当前项目已改造为支持通过环境变量注入公钥，这样可以：

- 本地联调时获得稳定 ID
- 不把私钥提交到仓库
- 不污染通用的 `manifest.json`

## 当前实现

已在构建配置中增加：

- 读取环境变量 `EXTENSION_PUBLIC_KEY`
- 若存在，则在构建时注入到 `manifest.key`
- 若不存在，则保持原来的动态 ID 行为

相关文件：

- [vite.config.base.ts](/Users/huangjing/Desktop/MyCode/github/api_proxy_tool_ext/vite.config.base.ts)
- [.env.extension.example](/Users/huangjing/Desktop/MyCode/github/api_proxy_tool_ext/.env.extension.example)

## 使用方式

### 1. 准备公钥

你需要准备一份 **base64 编码的扩展公钥**。

注意：

- 这里填的是 **公钥**
- 不要把私钥提交到仓库
- 若你已有历史打包生成的 `.pem`，可从对应流程中导出公钥再使用

### 2. 新建本地环境文件

在项目根目录新建一个本地环境文件，例如：

```bash
.env.local
```

写入：

```bash
EXTENSION_PUBLIC_KEY=你的扩展公钥
```

也可以先复制示例文件：

```bash
cp .env.extension.example .env.local
```

然后把占位内容替换成真实公钥。

### 3. 重新构建扩展

```bash
pnpm build:chrome
```

构建后重新在 `chrome://extensions/` 中加载 `dist_chrome`。

### 4. 查看固定 ID

重新加载后，在 `chrome://extensions/` 打开开发者模式，查看该扩展卡片中的 `ID`。

只要 `EXTENSION_PUBLIC_KEY` 不变，后续构建出来的扩展 ID 就会保持一致。

## 联调建议

### B 插件侧

将当前插件的固定 ID 填到 B 插件的发送逻辑中，例如：

```ts
const CURRENT_PLUGIN_ID = "这里替换为当前插件固定ID";
```

### 当前插件侧

如果后续不再需要允许所有扩展访问，建议把：

```json
"externally_connectable": {
  "ids": ["*"]
}
```

改成只允许 B 插件的固定 ID。

## 注意事项

- 没有公钥时，当前项目仍会正常构建，但 ID 不是固定的
- 固定 ID 的关键在于“公钥稳定”，不是构建命令本身
- 若更换公钥，扩展 ID 也会变化

## 结论

当前项目已经具备“固定 ID 配置能力”，你现在只差一份可复用的扩展公钥。拿到公钥后，把它放进本地环境变量 `EXTENSION_PUBLIC_KEY`，重新构建并加载扩展，就可以得到稳定的联调用固定 ID。
