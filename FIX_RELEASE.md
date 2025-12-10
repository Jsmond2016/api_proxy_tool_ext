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
# 或者重新推送 commit 让 GitHub Actions 处理
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

1. 检查 GitHub Actions 是否运行：
   - 访问：https://github.com/YOUR_USERNAME/api_proxy_tool_ext/actions
   - 查看 "Auto Release on Commit" 工作流

2. 检查 tag 是否创建：
   ```bash
   git fetch --tags
   git tag -l | grep v1.5
   ```

3. 检查 Release 是否创建：
   - 访问：https://github.com/YOUR_USERNAME/api_proxy_tool_ext/releases

4. 检查 ZIP 包是否上传：
   - 在 Release 页面查看是否有 `api_proxy_tool_1.5.0.zip` 和 `api_proxy_tool_firefox_1.5.0.zip`

## 预防措施

为了避免将来出现类似问题：

1. **使用推荐的发布命令**：
   ```bash
   pnpm run version:patch  # 或 version:minor, version:major
   ```

2. **检查 tag 是否存在**：
   ```bash
   git tag -l | grep v$(node -p "require('./package.json').version")
   ```

3. **确保 commit 消息格式正确**：
   ```
   chore(release): x.x.x
   ```

4. **推送到 main 分支**：
   ```bash
   git push origin main
   ```
