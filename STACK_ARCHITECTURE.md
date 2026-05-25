# API Proxy Tool — 技术架构

> 本文档记录项目的核心架构决策，是 AI 理解项目设计意图的主要依据。
> 由 `fe-set-ai-base` 初始化生成，请根据实际项目情况补充完善。

## 整体架构

Chrome Extension (Manifest V3) 浏览器扩展，采用弹出面板（Popup）+ 选项页面（Options Page）的架构模式。核心功能通过声明式网络请求 API（`declarativeNetRequest`）实现请求拦截与重定向。

### 架构模式

- **模式**: Popup + Options Page（Chrome Extension MV3）
- **数据流**: 单向数据流 — Zustand store 管理全局状态，组件通过 hooks 订阅和更新
- **渲染策略**: CSR（客户端渲染），扩展页面为独立 HTML 入口

## 目录结构与职责

```
src/
├── assets/              # 静态资源（图片、字体等）
├── components/          # 可复用 UI 组件
│   ├── common/          # 通用组件
│   ├── config/          # 配置相关组件
│   └── layout/          # 布局组件
├── constant/            # 常量与枚举定义
├── hooks/               # 自定义 React Hooks
├── locales/             # 国际化语言文件
├── pages/               # 扩展页面
│   ├── options/         # 选项/配置页面（新标签页打开）
│   └── popup/           # 弹出面板（点击图标弹出）
├── store/               # Zustand 状态管理
├── types/               # TypeScript 类型定义
└── utils/               # 工具函数
```

| 目录              | 职责                            |
| :---------------- | :------------------------------ |
| `src/pages/`      | 扩展页面入口（Popup + Options） |
| `src/components/` | 可复用 UI 组件                  |
| `src/store/`      | 全局状态管理                    |
| `src/hooks/`      | 业务逻辑封装                    |
| `src/utils/`      | 通用工具函数                    |

### 各层职责

- **UI 层**: `src/pages/` + `src/components/` — 页面渲染，用户交互
- **业务逻辑层**: `src/hooks/` + `src/utils/` — 数据转换、规则匹配、配置管理
- **数据访问层**: `src/store/` — 状态持久化（chrome.storage），与浏览器 API 交互

## 关键架构决策（ADR）

### ADR-001: 使用 declarativeNetRequest 实现请求代理

- **日期**: 2026-01
- **状态**: 接受
- **背景**: Manifest V3 废弃了 webRequest 的阻塞能力，需要符合 MV3 规范的请求拦截方案
- **选择**: 使用 `declarativeNetRequest` API 声明式规则，放弃编程式代理方案
- **结果**: 请求拦截逻辑由浏览器内核执行，性能更好但规则能力有限；需要 `declarativeNetRequestFeedback` 权限获取规则匹配状态

### ADR-002: 使用 Zustand 进行状态管理

- **日期**: 2026-01
- **状态**: 接受
- **背景**: 需要在 Popup 和 Options 页面之间共享配置状态，需实现 chrome.storage 持久化
- **选择**: 选择 Zustand（轻量）替代 Redux，结合 `persist` 中间件同步 chrome.storage
- **结果**: 状态管理代码简洁，无模板代码；通过订阅机制实现跨页面状态同步

## 组件架构

- **通用组件**: `src/components/` — 可复用的 UI 组件
- **页面组件**: `src/pages/options/` + `src/pages/popup/` — 扩展各页面的入口和布局组件

## 数据流

```
用户操作 → Zustand Action → chrome.storage 持久化
                         → 组件重渲染
浏览器请求 → declarativeNetRequest 规则匹配 → 重定向/拦截
```

## 外部依赖

| 依赖                  | 用途             | 版本约束 |
| :-------------------- | :--------------- | :------- |
| React                 | UI 框架          | ^18.3.1  |
| Ant Design            | UI 组件库        | ^6.0.0   |
| Zustand               | 状态管理         | ^5.0.8   |
| ahooks                | React Hooks 库   | ^3.9.0   |
| ramda                 | 函数式工具       | ^0.31.3  |
| Vite                  | 构建工具         | ^6.3.5   |
| TailwindCSS           | CSS 工具库       | ^4.1.8   |
| webextension-polyfill | 跨浏览器扩展 API | ^0.12.0  |

## 环境变量

当前项目无运行时环境变量。构建时通过 Vite 配置区分 Chrome/Firefox 构建目标。

---

> **维护说明**: 每次涉及架构变更时同步更新本文档。ADR 一经接受不应删除，已废弃的决策标注状态后保留。
