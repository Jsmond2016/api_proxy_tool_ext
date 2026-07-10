---
title: Edge 测试者信息
description: Edge 市场测试人员使用指南
outline: deep
---

# Edge 市场测试人员信息

## 扩展功能概述

API Proxy Tool 是一个用于前端开发的API代理工具，允许开发者拦截和重定向API请求到Mock服务器，无需修改源代码。

## 测试环境准备

### 1. 安装步骤

- 下载扩展包（.zip文件）
- 打开 Edge 浏览器，访问 `edge://extensions/`
- 开启"开发人员模式"
- 点击"加载解压缩的扩展"
- 选择解压后的扩展文件夹

### 2. 权限说明

- 扩展需要访问所有网站权限来拦截API请求
- 需要存储权限来保存配置数据
- 需要标签页权限来打开配置界面

## 核心功能测试

### 1. 基础API代理功能

- 点击扩展图标打开配置界面
- 创建新模块（如：test.module）
- 添加API配置，启用配置后验证请求被重定向

### 2. 模块管理功能

- 测试创建多个模块、模块间切换、启用/禁用、删除功能

### 3. Apifox同步功能

- 配置Apifox本地地址，选择标签进行API同步
- 验证同步后的API配置正确性

### 4. 权限点生成功能

- 在API配置中点击"复制权限点"，验证生成的权限点JSON格式正确

## 测试用例

### 用例1：基础代理功能

配置一个GET请求代理，访问目标网页，检查Network面板确认请求被重定向。

### 用例2：多种匹配方式

测试contains（包含）、exact（精确）、regex（正则表达式）三种匹配方式。

### 用例3：延迟功能

设置API响应延迟为2000ms，验证响应确实延迟。

### 用例4：Mock响应

配置mockResponse模式，验证直接返回Mock数据而不重定向。

### 用例5：全局控制

使用全局开关禁用/启用所有代理，验证功能正常。

## 已知限制

- 需要支持Manifest V3的浏览器（Edge/Chrome >= 88.0.0）
- 某些HTTPS网站可能限制扩展功能
- 不支持WebSocket连接拦截

## 故障排除

- **无法拦截请求**：检查扩展是否启用、API配置是否正确
- **配置界面无法打开**：检查扩展安装，尝试重新加载

## 测试数据

### 示例API配置

```json
{
  "apiDocKey": "test.module",
  "label": "测试模块",
  "apiArr": [
    {
      "apiKey": "/api/test/users",
      "apiName": "获取用户列表",
      "apiUrl": "https://api.example.com/users",
      "redirectURL": "http://127.0.0.1:3000/mock/users",
      "method": "get",
      "filterType": "contains",
      "delay": 0,
      "isOpen": true,
      "mockWay": "redirect",
      "statusCode": 200
    }
  ]
}
```

### 测试网站推荐

- https://httpbin.org/ - HTTP测试服务
- https://jsonplaceholder.typicode.com/ - JSON API测试

## 完成标准

- ✅ 所有核心功能正常工作
- ✅ 配置保存和加载正确
- ✅ 错误处理机制完善
- ✅ Edge最新版本兼容
