# API Proxy Tool

> **更新时间**：2026-07-14；**使用模型**：Codex（GPT-5）；**用户**：Jsmond2016

---

<div align="center">
  <img src="public/icon-128.png" alt="API Proxy Tool Logo" width="128" height="128" />
  <p><strong>Chrome、Edge 与 Firefox API Mock 请求代理扩展</strong></p>
  <p>管理接口代理规则，同步 Apifox 接口，并为联调、归档和权限点整理提供一套集中工作台。</p>

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.3.5-646CFF.svg)](https://vite.dev/)
[![Ant Design](https://img.shields.io/badge/Ant%20Design-6.0.0-1677FF.svg)](https://ant.design/)
[![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-4285F4.svg)](https://chromewebstore.google.com/detail/api-proxy-tool/dnjnkgbfdbciepmfcfpoelocadfdppak)
[![Edge Add-ons](https://img.shields.io/badge/Edge%20Add--ons-0078D7.svg)](https://microsoftedge.microsoft.com/addons/detail/api-proxy-tool/fcnakllkigbofpkphmpfhblhdnfomahj?hl=zh-CN)

**中文（默认）** · [English](./README_EN.md) · [在线文档](https://jsmond2016.github.io/api_proxy_tool_ext/)

</div>

## 功能概览

- **请求代理**：使用 Manifest V3 `declarativeNetRequest` 将匹配的 API 请求重定向到 Mock 地址。
- **模块化管理**：按业务模块管理接口，提供“全部接口”聚合视图、搜索和状态排序。
- **接口操作**：支持添加、编辑、复制、迁移、删除、批量删除、单接口测试和单接口调试。
- **Apifox 同步**：通过项目 ID 和访问令牌在线导出 OpenAPI 数据，按 tag 同步并处理合并冲突。
- **迭代信息**：为 tag 维护需求、技术、原型、测试用例和排期文档，并复制迭代或 CR 信息。
- **存档恢复**：将当前面板的完整配置保存到 IndexedDB，支持查看、恢复和删除历史快照。
- **权限点复制**：按当前模块、勾选接口或全部模块生成 CMS 权限点数据。
- **跨扩展 Quick Mock**：接收其他扩展发送的 URL 列表，批量补全并创建外部 Mock 模块。
- **Chrome 与 Firefox**：同一代码库提供 Chrome/Edge 和 Firefox 构建。

完整操作流程见[功能使用指南](./docs/guide/extension-usage.md)。

## 安装

### 应用商店

- [Chrome Web Store](https://chromewebstore.google.com/detail/api-proxy-tool/dnjnkgbfdbciepmfcfpoelocadfdppak)
- [Microsoft Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/api-proxy-tool/fcnakllkigbofpkphmpfhblhdnfomahj?hl=zh-CN)

### 从源码构建

环境版本以 [`package.json`](./package.json) 中的 Volta 配置为准：Node.js `22.17.0`、pnpm `10.5.2`。

```bash
git clone https://github.com/Jsmond2016/api_proxy_tool_ext.git
cd api_proxy_tool_ext
pnpm install
pnpm build:chrome
```

Chrome/Edge 加载方式：

1. 打开 `chrome://extensions/` 或 `edge://extensions/`。
2. 开启“开发者模式”。
3. 点击“加载已解压的扩展程序”。
4. 选择项目中的 `dist_chrome/` 目录。

Firefox 构建与加载：

```bash
pnpm build:firefox
```

打开 `about:debugging#/runtime/this-firefox`，选择“临时载入附加组件”，再选择 `dist_firefox/manifest.json`。

## 快速使用

1. 点击扩展图标，在 Popup 中开启全局 Mock，并进入配置页。
2. 选择默认模块或点击模块栏 `+` 新建模块。
3. 点击“添加”，填写接口地址、名称、Mock URL、请求方式和匹配方式。
4. 开启接口行的 Mock 开关。
5. 使用“测试”验证 Mock 地址，再从业务页面发起真实请求。

需要批量导入接口时，可在顶部使用“设置 Apifox 配置”；需要保留迭代状态时，可设置迭代信息后创建存档。

## Apifox 同步

当前同步界面使用 Apifox 在线导出能力，需要：

- Apifox 项目数字 ID
- 个人访问令牌 Access Token
- 云端 Mock 令牌
- 一个或多个接口 tag

同步后，添加接口表单可根据路径自动补充名称、方法、Mock 地址、权限点和 Apifox 链接。刷新操作只替换 Apifox 同步维护的接口，不覆盖手工接口或外部 Quick Mock 模块。

> 不要把 Access Token、Mock 令牌或其他凭据写入仓库、Issue、截图或共享文档。

## 开发命令

| 命令                 | 说明                                   |
| :------------------- | :------------------------------------- |
| `pnpm dev`           | 启动 Chrome 开发模式                   |
| `pnpm dev:firefox`   | 启动 Firefox 开发模式                  |
| `pnpm build:chrome`  | 构建到 `dist_chrome/`                  |
| `pnpm build:firefox` | 构建到 `dist_firefox/`                 |
| `pnpm test`          | 运行 Vitest 测试                       |
| `pnpm lint`          | 检查 `src/` 下的 TypeScript/React 代码 |
| `pnpm docs:dev`      | 启动 VitePress 文档站                  |
| `pnpm docs:build`    | 构建 VitePress 文档站                  |

## 项目结构

```text
api_proxy_tool_ext/
├── src/
│   ├── pages/
│   │   ├── background/       # Service Worker 与代理规则
│   │   ├── options/          # 完整配置页面
│   │   └── popup/            # 快速全局开关与配置页入口
│   ├── store/                # Zustand 状态
│   ├── types/                # 配置与消息类型
│   └── utils/                # 缓存、归档、权限点和数据处理
├── docs/                     # VitePress 文档
├── scripts/                  # 版本与 changelog 脚本
├── manifest.json             # Chrome Manifest V3 清单
├── vite.config.chrome.ts
└── vite.config.firefox.ts
```

## 文档

- [快速开始](./docs/guide/getting-started.md)
- [功能使用指南](./docs/guide/extension-usage.md)
- [跨插件批量 Quick Mock 联调](./docs/api-reference/quick-mock-debug.md)
- [架构设计](./docs/architecture/index.md)
- [发布流程](./docs/publishing/release-guide.md)
- [更新日志](./CHANGELOG.md)

在线文档由 GitHub Pages 自动部署：<https://jsmond2016.github.io/api_proxy_tool_ext/>

## 数据与权限

扩展需要 `storage`、`declarativeNetRequest`、`declarativeNetRequestFeedback` 以及 HTTP/HTTPS 页面访问权限，用于保存配置、生成代理规则和匹配页面请求。

用户配置保存在浏览器本地存储；存档和 Parsed API 缓存保存在 IndexedDB。隐私说明见[隐私声明](./docs/publishing/privacy.md)。

## 许可证

[MIT](./LICENSE)
