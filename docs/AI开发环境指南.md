# Api Proxy Tool - AI 开发环境文档

## 项目概述

A simple chrome & firefox extension template with Vite, React, TypeScript and Tailwind CSS.

## 技术栈

- **React**: ^18.3.1
- **TypeScript**: ^5.8.3
- **Ant Design**: ^5.26.5
- **TailwindCSS**: ^4.1.8
- **Vite**: ^6.3.5
- **Zustand**: ^5.0.8
- **ahooks**: ^3.9.0
- **ramda**: ^0.31.3

## 开发环境设置

```bash
# 安装依赖
pnpm install

# 启动开发模式
pnpm run dev

# 构建生产版本
pnpm run build
```

## 代码规范

- 使用 TypeScript 进行类型安全开发
- 优先使用 Ant Design 组件
- 使用 TailwindCSS 进行样式定制
- 遵循 React Hooks 最佳实践
- 使用函数式编程风格

## 项目结构

```
src/
├── pages/options/          # 扩展配置页面
│   ├── components/        # 页面组件
│   ├── index.tsx         # 页面入口
│   └── Options.css       # 页面样式
├── utils/                 # 工具函数
├── types/                 # 类型定义
├── store/                 # 状态管理
└── assets/                # 静态资源
```

## AI 助手使用指南

1. 优先使用 Ant Design 组件进行 UI 开发
2. 使用 TypeScript 类型定义确保代码安全
3. 遵循 React 函数式组件和 Hooks 模式
4. 使用 TailwindCSS 进行样式定制
5. 保持代码简洁、可读性强

## 常用命令

- `pnpm run dev`: 启动开发模式
- `pnpm run build`: 构建生产版本
- `pnpm run lint`: 代码检查
- `pnpm run lint:fix`: 自动修复代码问题
- `pnpm run init`: 初始化 AI 开发环境

## Chrome 扩展特性

- 基于 Manifest V3 开发
- 支持 API 请求拦截和重定向
- 提供 Mock 数据管理功能
- 支持多模块配置管理
- 提供直观的配置界面

## 开发最佳实践

- 使用函数式组件和 Hooks
- 合理使用 TypeScript 类型定义
- 遵循组件化开发原则
- 使用 Ant Design 设计系统
- 保持代码简洁和可维护性

---

_此文档由 AI 开发环境自动生成 - 10/16/2025_
