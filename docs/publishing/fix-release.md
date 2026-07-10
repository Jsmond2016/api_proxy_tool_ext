---
title: 修复发布问题
description: 发布过程中"tag 已存在"等常见问题的排查和修复指南
outline: deep
---

# 修复发布问题指南

## 问题原因

tag `v1.5.0` 已经存在，但指向的是旧的 commit，导致 GitHub Actions 检测到 tag 已存在后跳过了发布流程。

## 解决方案

### 方案一：删除旧 tag 并重新触发（推荐）

```bash
# 1. 删除本地 tag
git tag -d v1.5.0

# 2. 删除远程 tag
git push origin :refs/tags/v1.5.0

# 3. 重新推送 commit 触发自动发布
git push origin main
```

### 方案二：更新 tag 指向最新 commit

```bash
# 1. 删除本地 tag
git tag -d v1.5.0

# 2. 删除远程 tag
git push origin :refs/tags/v1.5.0

# 3. 在最新 commit 上创建新 tag
git tag -a v1.5.0 -m "Release 1.5.0"

# 4. 推送 tag
git push origin v1.5.0

# 5. 手动创建 GitHub Release（如果需要）
git push origin main
```

### 方案三：使用新版本号

如果不想删除旧 tag，可以更新版本号：

```bash
# 1. 更新 package.json 版本号为 1.5.1
npm version patch --no-git-tag-version

# 2. 提交新版本
git add package.json
git commit -m "chore(release): 1.5.1"

# 3. 推送触发自动发布
git push origin main
```

## 验证步骤

1. 检查 GitHub Actions 是否运行：访问 https://github.com/Jsmond2016/api_proxy_tool_ext/actions
2. 检查 tag 是否创建：
   ```bash
   git fetch --tags
   git tag -l | grep v1.5
   ```
3. 检查 Release 是否创建：访问 https://github.com/Jsmond2016/api_proxy_tool_ext/releases
4. 检查 ZIP 包是否上传到 Release 页面

## 预防措施

- 使用 `pnpm run version:patch` 等命令发布
- 发布前检查 tag 是否存在：`git tag -l | grep v$(node -p "require('./package.json').version")`
- 确保 commit 消息格式正确：`chore(release): x.x.x`
- 推送到 main 分支
