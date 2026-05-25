# 🚀 Angular提交格式 + 自动化工具链使用指南

## 📋 概述

项目现在使用Angular提交格式规范，并集成了主流的自动化工具链，大大简化了changelog生成和CI流程。

## 🛠️ 工具链

### 1. Commitizen - 交互式提交

```bash
# 使用交互式提交工具
pnpm run commit
```

### 2. Commitlint - 提交信息校验

- 自动校验提交信息格式
- 通过husky钩子在提交前执行
- 支持自定义规则

### 3. Conventional Changelog - 自动生成changelog

```bash
# 生成最新版本的changelog
pnpm run changelog

# 生成所有版本的changelog
pnpm run changelog:all
```

### 4. Husky - Git钩子管理

- 自动配置pre-commit和commit-msg钩子
- 确保代码质量和提交规范

## 📝 提交格式规范

### 基本格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 类型 (type)

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

### 示例

```bash
# ✅ 正确的提交信息
feat: Add user authentication system
fix: Resolve memory leak in data processing
docs: Update API documentation
chore: Update dependencies

# ❌ 错误的提交信息
test: invalid commit message  # 缺少首字母大写
feat add feature              # 缺少冒号
```

## 🔄 CI流程简化

### 之前（自定义脚本）

- 复杂的bash脚本处理commit分类
- 手动解析git历史
- 容易出错，难以维护

### 现在（使用工具）

- 使用`conventional-changelog`工具
- 自动解析Angular格式的提交
- 生成标准化的changelog
- CI流程更简洁可靠

## 🎯 使用流程

### 1. 开发新功能

```bash
# 1. 编写代码
# 2. 使用交互式提交
pnpm run commit

# 选择类型：feat
# 输入描述：Add user profile management
# 输入详细说明（可选）
# 输入breaking changes（可选）
```

### 2. 发布新版本

```bash
# 1. 更新版本号
pnpm run version:patch  # 或 minor, major

# 2. 推送触发CI
git push origin main

# 3. CI自动：
#    - 生成changelog
#    - 构建扩展
#    - 创建release
#    - 更新CHANGELOG.md
```

## 📊 优势对比

| 方面       | 之前（自定义脚本） | 现在（工具链）   |
| ---------- | ------------------ | ---------------- |
| **代码量** | ~100行bash脚本     | ~10行配置        |
| **维护性** | 需要手动维护       | 工具自动处理     |
| **可靠性** | 容易出错           | 经过验证的工具   |
| **标准化** | 自定义格式         | Angular标准格式  |
| **功能**   | 基础分类           | 丰富的分类和链接 |

## 🔧 配置说明

### commitlint.config.js

```javascript
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', ['feat', 'fix', 'docs', ...]],
    'subject-case': [2, 'always', 'sentence-case'],
    'header-max-length': [2, 'always', 100]
  }
}
```

### package.json

```json
{
  "scripts": {
    "commit": "cz",
    "changelog": "conventional-changelog -p angular -i CHANGELOG.md -s -r 0"
  },
  "config": {
    "commitizen": {
      "path": "./node_modules/cz-conventional-changelog"
    }
  }
}
```

## 🎉 总结

通过引入Angular提交格式和主流工具链：

1. **简化了开发流程**：交互式提交工具引导开发者使用正确格式
2. **提高了代码质量**：自动校验确保提交信息规范
3. **自动化了changelog**：无需手动维护，工具自动生成
4. **减少了维护成本**：使用成熟工具，减少自定义脚本
5. **提升了专业性**：符合行业标准，便于团队协作

现在只需要专注于代码开发，工具链会自动处理提交规范、changelog生成和CI流程！
