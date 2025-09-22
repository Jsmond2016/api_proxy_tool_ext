# CI/CD 使用说明

## 概述

本项目使用 GitHub Actions 进行自动化构建和发布。当推送 tag 时，会自动触发构建和发布流程。

## 工作流程

### 1. 自动发布（推荐）

当推送 tag 到仓库时，会自动触发构建和发布：

```bash
# 方法1：使用项目脚本（推荐）
npm run version:patch  # 或 version:minor, version:major
git push origin main
git push origin --tags

# 方法2：使用 npm version
npm version patch  # 或 minor, major
git push origin main
git push origin --tags
```

或者直接创建和推送 tag：

```bash
# 创建 tag
git tag v1.0.0

# 推送 tag
git push origin v1.0.0
```

### 2. 手动发布

在 GitHub Actions 页面可以手动触发发布：

1. 进入 GitHub 仓库的 Actions 页面
2. 选择 "Build and Release Extension" 工作流程
3. 点击 "Run workflow"
4. 输入版本号（如：v1.0.0）
5. 点击 "Run workflow"

## 工作流程步骤

1. **检出代码** - 获取最新代码
2. **环境设置** - 安装 Node.js 和 pnpm
3. **安装依赖** - 运行 `pnpm install`
4. **构建 Chrome 扩展** - 运行 `pnpm run build:chrome`
5. **构建 Firefox 扩展** - 运行 `pnpm run build:firefox`
6. **验证构建** - 检查构建输出
7. **创建 ZIP 文件** - 为每个浏览器创建发布包
8. **创建 GitHub Release** - 上传文件并创建发布

## 输出文件

每次发布会生成以下文件：

- `api_proxy_helper_{version}.zip` - Chrome 扩展包
- `api_proxy_helper_firefox_{version}.zip` - Firefox 扩展包

## 版本管理

### 版本号格式

- 使用语义化版本号：`v1.0.0`
- 支持 patch、minor、major 版本更新
- tag 必须以 `v` 开头

### 版本更新脚本

项目提供了便捷的版本更新脚本：

```bash
# Patch 版本更新 (1.0.0 -> 1.0.1)
npm run version:patch

# Minor 版本更新 (1.0.0 -> 1.1.0)
npm run version:minor

# Major 版本更新 (1.0.0 -> 2.0.0)
npm run version:major
```

这些脚本会：
1. 自动更新 `package.json` 中的版本号
2. 自动创建 commit，格式为：`chore(release): [version]`
3. 不会自动创建 git tag（需要手动推送）

### 完整的发布流程

```bash
# 1. 更新版本并创建 commit
npm run version:patch

# 2. 创建并推送 tag
git tag v$(node -p "require('./package.json').version")
git push origin main
git push origin --tags
```

## 故障排除

如果构建失败，请检查：

1. **构建输出** - 确保 `dist_chrome` 和 `dist_firefox` 目录存在
2. **manifest.json** - 确保两个目录都包含 manifest.json 文件
3. **ZIP 文件** - 确保 ZIP 文件创建成功
4. **权限** - 确保 GitHub token 有足够权限创建 release

## 本地测试

在推送 tag 之前，可以本地测试构建：

```bash
# 安装依赖
pnpm install

# 构建 Chrome 扩展
pnpm run build:chrome

# 构建 Firefox 扩展
pnpm run build:firefox

# 检查构建输出
ls -la dist_chrome/
ls -la dist_firefox/
```
