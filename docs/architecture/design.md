---
title: UI 设计规范
description: API Proxy Tool 的 UI 设计语言、组件规范和交互模式
outline: deep
---

# API Proxy Tool — UI 设计与交互规范

> 本文档规范项目的 UI 设计语言与交互行为，是前端开发与设计协作的依据。

## 设计系统

### 设计语言

- **风格**: Ant Design Design Language
- **品牌色**: Ant Design 默认色板 + 自定义扩展配色
- **字体**: 系统字体栈（-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif）

### 组件规范

| 组件   | 规范                                           | 状态   |
| :----- | :--------------------------------------------- | :----- |
| Button | Ant Design Button，主操作使用 `type="primary"` | 进行中 |
| Form   | Ant Design Form + 表单校验                     | 进行中 |
| Table  | Ant Design Table，分页、筛选、排序             | 进行中 |
| Modal  | Ant Design Modal，确认/取消                    | 进行中 |
| Tag    | Ant Design Tag，状态标记                       | 进行中 |
| Input  | Ant Design Input + Search                      | 进行中 |

### 布局

- **栅格系统**: Ant Design 24 列栅格
- **断点**: Ant Design 标准断点（xs/sm/md/lg/xl/xxl）
- **间距**: Ant Design 间距尺度（4px 基准）

## 交互模式

### 页面交互

- **Popup 面板**: 点击扩展图标弹出，快速查看和管理当前代理状态
- **Options 页面**: 新标签页打开完整配置界面，支持模块管理、规则编辑
- **模块管理**: 卡片列表形式展示模块，支持展开/折叠查看规则
- **搜索过滤**: 实时搜索过滤 API 规则列表
- **批量操作**: 支持批量启用/禁用模块和规则

### 交互动效

- **过渡**: Ant Design 默认过渡动画（300ms ease）
- **反馈**: Ant Design 加载态（Spin）、空态（Empty）、错误提示（message/notification）
- **状态切换**: 开关切换配有即时视觉反馈

## 无障碍

- 所有交互元素支持键盘导航
- 图片和图标提供合适的 alt 文本 / aria-label
- 表单输入关联 label 元素

## 主题定制

- **亮色主题**: Ant Design 默认亮色主题
- **暗色主题**: 未实现（计划中）
- **主题切换**: 未实现

---

> **维护说明**: 设计团队维护此文档，每次 UI 迭代或设计系统变更时同步更新。
