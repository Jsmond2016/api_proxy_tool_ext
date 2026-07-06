---
title: 商店提交流程
description: Chrome Web Store 和 Edge Add-ons 的发布前检查和提交指南
outline: deep
---

# Chrome Extension 商店提交流程

## 扩展信息

| 字段     | 内容                                                       |
| -------- | ---------------------------------------------------------- |
| **名称** | API Proxy Tool                                             |
| **描述** | A browser extension for proxying API requests to mock URLs |
| **类别** | Developer Tools                                            |
| **语言** | 简体中文 (zh-CN)                                           |

## 发布前检查清单

- [ ] 扩展图标 128x128 已就绪（`public/icon-128.png`）
- [ ] 至少 1 张功能截图已准备（建议 3-5 张 1280x800）
- [ ] 详细描述已填写完整
- [ ] 分类选择 "Developer Tools"
- [ ] 已逐条填写每个权限的用途说明
- [ ] 数据隐私说明已填写 "不收集用户数据"
- [ ] ZIP 包已打包
- [ ] 版本号已确认
- [ ] 已在本地测试功能正常
- [ ] Edge 额外：搜索关键词、年龄分级、发布者资料

## 权限说明

| 权限                            | 用途                                                          |
| ------------------------------- | ------------------------------------------------------------- |
| `activeTab`                     | 获取当前活动标签页的 URL 信息，仅在用户点击扩展图标时临时生效 |
| `storage`                       | 持久化存储用户的模块配置、API 规则和设置项                    |
| `declarativeNetRequest`         | 使用声明式网络请求规则拦截和重定向 API 请求                   |
| `declarativeNetRequestFeedback` | 获取规则匹配结果和调试信息                                    |
| `<all_urls>` (host_permissions) | 用户在配置中自定义需要拦截的域名范围                          |

## 构建与打包

```bash
# 构建
pnpm build:chrome

# 打包
cd dist_chrome && zip -r ../extension-v1.x.x.zip . && cd ..
```

## 提交流程

### Chrome Web Store

1. 访问 https://chrome.google.com/webstore/devconsole
2. 登录 Google 账号
3. 上传 ZIP 包，填写表单

### Edge Add-ons

1. 访问 https://partner.microsoft.com/ → "Edge Add-ons"
2. 登录 Microsoft 账号
3. 上传 ZIP 包，填写表单
   - 搜索关键词：API Proxy, Mock, 前端开发, API 拦截, 代理工具
   - 定价：免费
   - 可见性：公开
   - 年龄分级：3+
