---
title: 架构设计
description: API Proxy Tool 的技术架构和设计决策
---

# 架构设计

> **更新时间**：2026-07-14；**使用模型**：Codex（GPT-5）；**用户**：Jsmond2016

---

本部分文档介绍 API Proxy Tool 的技术架构、设计决策和技术方案。

## 章节

- **[技术架构](/architecture/stack-architecture)** — 项目架构模式、数据流和架构决策记录
- **[UI 设计规范](/architecture/design)** — 设计系统、组件规范和交互模式
- **[跨插件 QuickMock 方案](/architecture/quick-mock-plan)** — 跨插件批量 QuickMock 技术方案
- **[Quick Mock 持久缓存](/architecture/quick-mock-persistent-cache-fix-plan)** — IndexedDB 缓存、冷启动补全与降级策略
- **[批量 Quick Mock 性能优化](/cross-extension-batch-mock-performance-optimization)** — 外部消息处理、缓存和响应链路优化记录
