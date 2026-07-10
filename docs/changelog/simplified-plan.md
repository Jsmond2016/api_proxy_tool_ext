---
title: 简化 Changelog 方案
description: 简化版的 Changelog 自动化方案说明
outline: deep
---

# 🚀 简化的Changelog自动化方案

## 📋 概述

项目使用简化的自动化方案，只保留必要的工具，避免复杂的配置问题。

## 🛠️ 工具链

### 1. Conventional Changelog

```bash
# 生成最新版本的changelog
pnpm run changelog

# 生成所有版本的changelog
pnpm run changelog:all
```

### 2. 自定义脚本 - 备用方案

```bash
bash scripts/generate-changelog.sh
```

## 📝 提交格式建议

虽然不强制校验，但建议使用Angular提交格式。

### 基本格式

```
<type>: <subject>

<body>

<footer>
```

### 类型

- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档变更
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 增加测试
- `chore`: 构建过程或辅助工具的变动
- `ci`: CI配置文件和脚本的变动
- `build`: 构建系统或外部依赖的变动
- `revert`: 回滚之前的commit

## 🔄 CI流程

1. **检测release commit**: `chore(release): x.x.x`
2. **生成changelog**: 使用 `conventional-changelog` 工具
3. **构建扩展**: Chrome和Firefox版本
4. **创建release**: 包含changelog内容
5. **更新CHANGELOG.md**: 自动提交更新

## 📊 优势

| 方面           | 之前（复杂工具链）  | 现在（简化方案） |
| -------------- | ------------------- | ---------------- |
| **配置复杂度** | 高（多个工具+钩子） | 低（单一工具）   |
| **稳定性**     | 容易出错            | 稳定可靠         |
| **维护成本**   | 高                  | 低               |

## 🎯 使用建议

### 开发时

```bash
# 推荐使用规范的提交信息
git commit -m "feat: Add new feature"
git commit -m "fix: Resolve bug in user login"
```

### 发布时

```bash
# 使用版本管理脚本
pnpm run version:patch
git push origin main
```

### 手动生成changelog

```bash
pnpm run changelog
```

## 🎉 总结

1. **简单可靠**: 只使用一个核心工具，减少配置复杂度
2. **功能完整**: 仍然能自动生成changelog和更新release
3. **易于维护**: 没有复杂的钩子和校验，减少出错可能
4. **灵活使用**: 支持手动和自动两种方式
5. **向后兼容**: 保留了自定义脚本作为备用方案
