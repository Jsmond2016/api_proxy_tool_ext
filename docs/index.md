---
layout: home

title: API Proxy Tool
titleTemplate: Chrome & Firefox 扩展 — API 请求代理工具

hero:
  name: API Proxy Tool
  text: 在浏览器里管理 API Mock
  tagline: 拦截页面请求并重定向到 Mock 地址，集中完成规则管理、Apifox 同步、接口调试与配置存档
  image:
    src: /logo.png
    alt: API Proxy Tool
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 查看完整功能
      link: /guide/extension-usage
    - theme: alt
      text: 安装扩展
      link: https://chromewebstore.google.com/detail/dnjnkgbfdbciepmfcfpoelocadfdppak

features:
  - title: 快速代理请求
    details: 用包含、精确或正则方式匹配页面请求，重定向到 Mock 地址，并支持延迟、状态码和单接口调试。
    link: /guide/getting-started
    linkText: 创建第一条规则
  - title: 集中管理接口
    details: 按业务模块组织规则，在全部接口视图中搜索、排序、迁移、批量开关或删除配置。
    link: /guide/extension-usage#模块与接口管理
    linkText: 了解接口管理
  - title: 同步 Apifox
    details: 按 tag 拉取 OpenAPI 接口，自动补全 Mock 地址、请求方式、权限点及关联文档，并保留手工配置。
    link: /guide/extension-usage#apifox-同步
    linkText: 查看同步流程
  - title: 保存迭代现场
    details: 维护迭代资料，将当前规则和配套配置保存为本地存档，需要时一键恢复。
    link: /guide/extension-usage#存档与恢复
    linkText: 查看存档功能
  - title: 整理权限点
    details: 按单条接口、当前模块或全部模块生成 CMS 权限点数据，减少重复整理工作。
    link: /guide/extension-usage#权限点复制
    linkText: 查看权限点用法
  - title: 跨扩展 Quick Mock
    details: 接收其他扩展发送的 URL 列表，批量补全接口信息并创建独立的外部 Mock 模块。
    link: /guide/extension-usage#跨扩展批量-quick-mock
    linkText: 查看联调能力
---

## 三步开始 Mock

1. 从 [Chrome Web Store](https://chromewebstore.google.com/detail/dnjnkgbfdbciepmfcfpoelocadfdppak) 或 [Microsoft Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/fcnakllkigbofpkphmpfhblhdnfomahj) 安装扩展。
2. 新建业务模块，添加原始接口地址、Mock 地址和匹配方式。
3. 开启接口与全局 Mock，通过内置测试确认响应后回到业务页面联调。

[按照快速开始完成首次配置 →](/guide/getting-started)

## 按目标查找

| 我想要                         | 查看内容                                                              |
| :----------------------------- | :-------------------------------------------------------------------- |
| 临时替换一个接口响应           | [第一次配置 Mock](/guide/extension-usage#第一次配置-mock)             |
| 批量同步 Apifox 接口           | [Apifox 同步](/guide/extension-usage#apifox-同步)                     |
| 搜索、迁移或批量处理接口       | [模块与接口管理](/guide/extension-usage#模块与接口管理)               |
| 保存并恢复一套联调配置         | [存档与恢复](/guide/extension-usage#存档与恢复)                       |
| 生成 CMS 权限点数据            | [权限点复制](/guide/extension-usage#权限点复制)                       |
| 从另一个扩展批量创建 Mock 规则 | [跨扩展批量 Quick Mock](/guide/extension-usage#跨扩展批量-quick-mock) |

## 项目资料

功能之外的项目资料统一放在这里，方便开发者和维护者继续查阅：

- [集成接口](/api-reference/)：固定扩展 ID、跨扩展通信协议和联调说明。
- [开发指南](/developer-guide/)：开发环境、提交规范与协作约定。
- [架构设计](/architecture/)：技术架构、设计决策与性能优化方案。
- [发布指南](/publishing/)：浏览器商店发布流程、材料和隐私声明。
- [更新日志](/changelog/)：版本变化与近期改动记录。
