---
title: 快速开始
description: 安装和快速上手 API Proxy Tool
outline: deep
---

# 快速开始

## 简介

API Proxy Tool 是一款 Chrome & Firefox 浏览器扩展，用于拦截和重定向 API 请求到 Mock 服务器。

### 核心功能

- **API 请求拦截** — 自动拦截页面中的 API 请求并重定向到指定的 Mock URL
- **模块化管理** — 支持创建多个模块来分类管理不同的 API 配置
- **灵活匹配** — 支持 contains（包含）、exact（精确）、regex（正则）三种匹配方式
- **延迟控制** — 可配置 API 响应延迟时间，模拟真实网络环境
- **Apifox 集成** — 与 Apifox 深度集成，支持基于 tag 自动同步 Mock 接口
- **批量操作** — 支持模块级别的批量操作和跨插件批量 QuickMock
- **权限管理** — 支持一键生成前端权限点

### 技术栈

React 18 + TypeScript + Ant Design 6 + Zustand + Vite 6 + TailwindCSS 4

## 安装

### 从应用商店安装

- **Chrome Web Store**: [API Proxy Tool](https://chromewebstore.google.com/detail/dnjnkgbfdbciepmfcfpoelocadfdppak)
- **Edge Add-ons**: [API Proxy Tool](https://microsoftedge.microsoft.com/addons/detail/fcnakllkigbofpkphmpfhblhdnfomahj)

### 从源码构建

```bash
# 1. 克隆项目
git clone https://github.com/Jsmond2016/api_proxy_tool_ext.git
cd api_proxy_tool_ext

# 2. 安装依赖
pnpm install

# 3. 构建
pnpm build:chrome    # Chrome 版本
pnpm build:firefox   # Firefox 版本

# 4. 加载扩展
# Chrome: chrome://extensions/ → 开启"开发者模式" → "加载已解压的扩展程序" → 选择 dist_chrome/
```

## 快速上手

### 1. 打开配置界面

点击 Chrome 工具栏中的扩展图标，系统会自动在新标签页打开配置界面。默认会有一个"默认模块"示例。

### 2. 创建模块

点击模块标签页右侧的"+"按钮，输入模块名称（如 `order.management`）即可创建。

### 3. 添加 API 配置

在模块中点击"添加"按钮，填写以下信息：

| 字段           | 说明                                           |
| -------------- | ---------------------------------------------- |
| **接口地址**   | 原始 API 地址（支持相对路径和完整 URL）        |
| **重定向地址** | Mock 服务器地址                                |
| **接口名称**   | 便于识别的名称                                 |
| **请求方式**   | GET、POST、PUT、DELETE、PATCH                  |
| **匹配方式**   | contains（包含）、exact（精确）、regex（正则） |
| **延迟时间**   | 响应延迟（毫秒）                               |

### 4. 全局控制

- **全局开关**: 顶部开关控制所有代理功能
- **模块开关**: 可单独控制某个模块的代理
- **重置功能**: 支持模块重置和全局重置

## 配置格式

```json
[
  {
    "apiDocKey": "order.management",
    "label": "订单管理",
    "apiArr": [
      {
        "apiKey": "/api/orders",
        "apiName": "获取订单列表",
        "apiUrl": "http://localhost:3000/api/orders",
        "redirectURL": "http://127.0.0.1:4523/mock/api/orders",
        "method": "get",
        "filterType": "contains",
        "delay": 0,
        "isOpen": true,
        "mockWay": "redirect",
        "statusCode": 200
      }
    ]
  }
]
```

## 注意事项

1. **权限要求**: 扩展需要访问所有网站权限来拦截 API 请求
2. **HTTPS 限制**: 某些 HTTPS 网站可能限制扩展功能
3. **数据安全**: 本扩展不会收集、上传或分享任何用户数据

## 相关链接

- [GitHub](https://github.com/Jsmond2016/api_proxy_tool_ext)
- [完整使用说明](/guide/extension-usage)
- [隐私声明](/publishing/privacy)
