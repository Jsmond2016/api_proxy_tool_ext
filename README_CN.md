<div align="center">
<img src="public/icon-128.png" alt="API Proxy Tool Logo" width="128" height="128"/>
<h1>API Proxy Tool</h1>

<h3>Chrome & Firefox 扩展 — 拦截并重定向 API 请求到 Mock 服务器</h3>

<p>一款功能强大的前端开发浏览器扩展，支持 API 代理、Mock 管理、Apifox 集成、跨插件批量快速联调、存档归档和权限点管理。</p>

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.3.5-646CFF.svg)](https://vitejs.dev/)
[![Ant Design](https://img.shields.io/badge/Ant%20Design-6.0.0-0170FE.svg)](https://ant.design/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1.8-38B2AC.svg)](https://tailwindcss.com/)
[![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-4285F4.svg)](https://chromewebstore.google.com/detail/api-proxy-tool/dnjnkgbfdbciepmfcfpoelocadfdppak)
[![Edge Add-ons](https://img.shields.io/badge/Edge-Addons-0078D7.svg)](https://microsoftedge.microsoft.com/addons/detail/api-proxy-tool/fcnakllkigbofpkphmpfhblhdnfomahj?hl=zh-CN)

<p><strong>📚 完整文档站: <code>pnpm docs:dev</code> 本地启动，或访问 <a href="https://github.com/Jsmond2016/api_proxy_tool_ext/tree/main/docs">docs/</a></strong></p>

</div>

---

## 📋 目录

- [功能特性](#-功能特性)
- [技术栈](#-技术栈)
- [快速开始](#-快速开始)
- [安装扩展](#-安装扩展)
- [使用指南](#-使用指南)
- [项目结构](#-项目结构)
- [配置格式](#-配置格式)
- [应用商店](#-应用商店)
- [许可证](#-许可证)

---

## ✨ 功能特性

### 🎯 核心代理功能

- **API 请求拦截** — 通过 `declarativeNetRequest` 拦截页面 API 请求，重定向到 Mock 地址
- **多种匹配模式** — 支持 `contains`（包含）、`exact`（精确）、`regex`（正则）三种 URL 匹配方式
- **多层级开关** — 全局开关、模块级批量开关、单 API 开关，切换时图标联动
- **全局 Mock** — 一键开启/关闭所有代理规则，图标状态指示

### 📦 模块管理

- **多模块标签页** — 通过标签页界面创建、重命名、排序模块
- **模块级配置** — 每个模块支持独立配置 `apiDocUrl`、`dataWrapper`、`pageDomain`、`requestHeaders`
- **默认模块** — 首次运行时自动创建包含示例接口的默认模块

### 🔍 搜索与导航

- **实时搜索** — 按接口名称、URL、重定向地址、页面路由实时过滤
- **接口高亮** — 从批量操作或外部链接跳转时自动滚动并高亮目标接口

### 🔄 Apifox 集成

- **同步 OpenAPI 数据** — 解析 Apifox 导出链接（OpenAPI/Swagger 格式），自动导入接口定义
- **按标签过滤** — 选择特定 Apifox tag 仅导入相关接口
- **标签历史** — 记录最近 10 次标签选择
- **地址缓存** — 跨会话持久化 Apifox URL
- **智能自动填充** — 添加/编辑接口时自动填充 Apifox 分组名、接口类型、运行链接等字段
- **Swagger 数据缓存** — 缓存解析后的 Swagger 数据，支持离线访问

### ⚡ 跨插件批量快速联调

- **外部扩展集成** — 其他扩展可通过 `chrome.runtime.sendMessage` 发送接口地址列表，批量创建 Mock 配置
- **自动创建模块** — 自动生成专用模块，所有接口自动配置 Mock 地址
- **Apifox 数据增强** — 配置 Apifox 后可自动补充接口标签和链接
- **结果横幅** — 显示批量导入结果、成功/失败数量，并高亮目标接口

### 📋 迭代与文档管理

- **Tag 迭代信息** — 为 Apifox tag 绑定需求文档、技术文档、原型链接、测试用例、排期文档
- **信息栏展示** — 在可折叠的提示栏中展示迭代文档和接口标签
- **复制迭代信息** — 一键复制迭代信息，支持选择 CR 上线时间

### 🗃️ 存档归档

- **按 Tag 归档** — 按 Apifox tag 保存模块快照到 IndexedDB
- **存档列表** — 浏览、查看、恢复历史存档记录
- **迭代快照** — 包含 Quick Mock 配置和 Apifox 配置快照

### 🔐 权限点管理

- **复制权限点** — 从接口路由中提取 CMS 权限点，格式化为菜单路径格式
- **批量复制** — 一键生成所有模块所有接口的权限点数据
- **分组名校验** — 复制前校验模块标签格式（如 `a.b.c`）

### 🛠️ 接口操作

- **增删改查** — 完整的接口 CRUD，含表单校验
- **批量删除** — 多选接口后批量删除
- **跨模块迁移** — 将接口从一个模块迁移到另一个模块
- **Mock 测试** — 测试 Mock 地址连通性，显示响应状态、头部和体
- **克隆** — 克隆接口到当前模块或其它模块
- **复制 URL** — 一键复制接口地址或 Mock 地址
- **分页** — 可配置每页条数，持久化选中状态

### 🔧 配置管理

- **冲突检测** — 从 Apifox 同步时检测标签冲突，提供覆盖/合并策略
- **模块重置** — 支持单个模块重置和全部模块重置
- **Popup 返回导航** — 从弹窗打开配置页时显示返回按钮

---

## 🛠 技术栈

### 前端

- **React 18.3.1** — 用户界面库
- **TypeScript 5.8.3** — 类型安全的 JavaScript
- **Ant Design 6.0.0** — 组件库
- **TailwindCSS 4.1.8** — 工具类 CSS 框架

### 状态与数据

- **Zustand** — 轻量状态管理，Chrome Storage 持久化
- **IndexedDB** — 存档记录存储
- **Chrome Storage API** — 配置持久化

### 构建与开发

- **Vite 6.3.5** — 构建工具
- **@crxjs/vite-plugin** — Chrome 扩展 Vite 插件
- **pnpm 10.5.2** — 包管理器
- **ESLint + Prettier** — 代码质量

### 扩展 API

- **Manifest V3** — 最新扩展规范
- **declarativeNetRequest** — 声明式网络请求拦截
- **Chrome Storage API** — 数据持久化
- **externally_connectable** — 跨扩展消息通信

---

## 🚀 快速开始

### 环境要求

- **Node.js** >= 16.0.0
- **pnpm** >= 8.0.0
- **Chrome** >= 88 / **Firefox** >= 109

### 安装与运行

```bash
# 安装依赖
pnpm install

# 启动 Chrome 开发模式（热重载）
pnpm dev

# 构建生产版本
pnpm build        # Chrome
pnpm build:chrome # Chrome（显式）
pnpm build:firefox # Firefox
```

### 加载扩展

**Chrome：**

1. 打开 `chrome://extensions/`
2. 开启"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择 `dist_chrome/` 目录

**Firefox：**

1. 打开 `about:debugging#/runtime/this-firefox`
2. 点击"临时载入附加组件"
3. 选择 `dist_firefox/` 目录中的 `manifest.json`

---

## 📖 使用指南

### 1. 打开配置页面

- 点击浏览器工具栏中的扩展图标
- 配置页面将在新标签页中打开

### 2. 模块管理

- **添加模块**：点击标签栏 "+" 号，输入名称（如 `order.api`）
- **切换模块**：点击标签页查看对应接口列表
- **编辑模块**：右键或使用模块编辑功能设置 `apiDocUrl`、`dataWrapper`、`pageDomain`
- **导入接口**：使用"从 Apifox 同步"按 tag 自动导入接口定义

### 3. 添加与配置接口

点击"添加"按钮，填写以下信息：

- **接口地址** — 原始请求 URL（支持相对路径或完整 URL）
- **重定向地址** — Mock 服务器地址
- **接口名称** — 显示名称
- **请求方式** — GET、POST、PUT、DELETE、PATCH
- **匹配方式** — `contains`（包含）、`exact`（精确）或 `regex`（正则）
- **Mock 方式** — `redirect`（重定向）或 `mock`（直接返回）

### 4. 快速联调

- **全局设置**：点击齿轮图标配置预设 JSON Mock 响应
- **批量快速联调**：外部扩展可通过 `chrome.runtime.sendMessage` 发送接口地址列表，批量创建快速联调配置
- **自动模块创建**：自动生成专用模块，支持 URL 去重和 Apifox 数据增强

### 5. 从 Apifox 同步

1. 点击顶部导航栏的"从 Apifox 同步"按钮
2. 输入 Apifox OpenAPI 导出链接
3. 选择需要导入的标签
4. 冲突时选择合并策略（覆盖/合并）
5. 系统根据 Mock 前缀自动生成重定向地址

### 6. 存档归档

1. 配置 Apifox 并选择迭代 tag
2. 点击"存档" → "存档"保存当前模块状态
3. 通过"查看存档"浏览历史记录
4. 需要时可恢复之前的存档

### 7. 权限点管理

- 点击"复制权限点"从接口路由中提取 CMS 权限数据
- 模块标签需遵循 `a.b.c` 格式才能生成有效权限点

### 8. 测试 Mock

- 点击接口行的闪电图标
- 测试请求会调用 Mock 地址并展示响应信息（状态码、头部、体）

---

## 📁 项目结构

```
api_proxy_tool_ext/
├── public/                         # 静态资源（图标）
├── scripts/
│   └── generate-changelog.mjs     # CHANGELOG 生成脚本
├── src/
│   ├── assets/
│   │   ├── img/
│   │   └── styles/                # 全局样式
│   ├── constant/
│   │   ├── apifoxFields.ts        # Apifox 自定义字段名
│   │   ├── constant.ts            # 默认配置、日志/错误消息
│   │   └── model.ts               # 模型操作常量（CRUD）
│   ├── locales/en/                # 国际化消息
│   ├── pages/
│   │   ├── background/            # Service Worker
│   │   │   └── index.ts           # 规则管理、消息处理、图标控制
│   │   ├── options/               # 选项配置页
│   │   │   ├── components/
│   │   │   │   ├── listTable/     # API 表格（克隆、迁移、测试、删除）
│   │   │   │   ├── navButtons/    # 顶栏按钮（同步、存档、权限、重置）
│   │   │   │   ├── operateButtons/# 操作栏按钮（添加、批量删除、权限、重置）
│   │   │   │   ├── ModuleInfoBar.tsx    # 标签与迭代信息栏
│   │   │   │   ├── ModuleTabs.tsx       # 模块标签页
│   │   │   │   ├── SearchSelect.tsx     # 实时搜索
│   │   │   │   └── BatchQuickMockBanner.tsx # 批量导入结果横幅
│   │   │   └── Options.tsx        # 主布局
│   │   └── popup/                 # 弹窗页（跳转到配置页）
│   ├── store/                     # Zustand 状态管理
│   ├── types/                     # TypeScript 类型定义
│   └── utils/
│       ├── archiveUtil.ts         # IndexedDB 存档操作
│       ├── batchQuickMock.ts      # 跨扩展批量快速联调
│       ├── chromeApi.ts           # Chrome API 封装
│       ├── configUtil.tsx         # 配置保存/加载辅助
│       ├── dataProcessor.ts       # 数据处理工具
│       ├── docUtils.ts            # 文档链接解析
│       ├── logger.ts              # 控制台日志
│       └── permissionUtils.ts     # 权限点提取
├── manifest.json                  # 扩展清单
├── package.json
├── vite.config.chrome.ts
├── vite.config.firefox.ts
└── README.md
```

---

## 📄 配置格式

### 配置 JSON 示例

```json
[
  {
    "apiDocKey": "order.management",
    "label": "订单管理",
    "apiDocUrl": "https://docs.example.com/order",
    "dataWrapper": "data",
    "pageDomain": "https://admin.example.com",
    "requestHeaders": "X-Custom-Header: value",
    "apiArr": [
      {
        "apiKey": "/api/orders",
        "apiName": "获取订单列表",
        "apiUrl": "https://api.example.com/orders",
        "redirectURL": "http://127.0.0.1:4523/mock/orders",
        "method": "get",
        "filterType": "contains",
        "delay": 0,
        "isOpen": true,
        "mockWay": "redirect",
        "statusCode": 200,
        "authPointKey": "order.queryList",
        "pageRoute": "/order/list"
      }
    ]
  }
]
```

### 字段说明

| 字段             | 说明                                       |
| ---------------- | ------------------------------------------ |
| `apiDocKey`      | 模块唯一标识                               |
| `label`          | 模块显示名称                               |
| `apiDocUrl`      | 模块文档链接                               |
| `dataWrapper`    | 响应数据包装路径                           |
| `pageDomain`     | 页面域名                                   |
| `requestHeaders` | 自定义请求头                               |
| `apiKey`         | 接口唯一标识                               |
| `apiName`        | 接口显示名称                               |
| `apiUrl`         | 原始接口地址                               |
| `redirectURL`    | Mock 重定向地址                            |
| `method`         | HTTP 请求方法（get/post/put/delete/patch） |
| `filterType`     | URL 匹配方式（contains/exact/regex）       |
| `delay`          | 响应延迟（毫秒）                           |
| `isOpen`         | 是否启用                                   |
| `mockWay`        | Mock 方式（redirect/mockResponse）         |
| `authPointKey`   | 权限点标识                                 |
| `pageRoute`      | 页面路由                                   |

---

## 🏪 应用商店

- **[Chrome Web Store](https://chromewebstore.google.com/detail/api-proxy-tool/dnjnkgbfdbciepmfcfpoelocadfdppak)** — 从 Chrome 应用商店安装
- **[Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/api-proxy-tool/fcnakllkigbofpkphmpfhblhdnfomahj?hl=zh-CN)** — 从 Edge 加载项安装

---

## 📄 许可证

MIT License

---

<div align="center">
<p>如果这个项目对你有帮助，请给个 ⭐️ Star 支持一下！</p>
<p>Made with ❤️ by Jsmond2016</p>
</div>
