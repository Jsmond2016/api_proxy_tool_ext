# 自动发布流程使用文档

## 概述

新增的自动发布流程 (`auto-release.yml`) 允许您通过特定格式的 commit 消息自动触发版本发布，无需手动创建 tag 或运行发布脚本。

## 触发条件

当您推送 commit 到 `main` 分支时，如果 commit 消息格式为 `chore(release): x.x.x`，系统将自动：

1. ✅ 验证 commit 消息格式
2. ✅ 检查版本 tag 是否已存在
3. ✅ 构建 Chrome 和 Firefox 扩展
4. ✅ 创建版本 tag (`vx.x.x`)
5. ✅ 生成 ZIP 包
6. ✅ 创建 GitHub Release

## 使用方法

### 方法一：使用现有的 npm scripts（推荐）

```bash
# 补丁版本 (1.0.0 -> 1.0.1)
pnpm run version:patch

# 次要版本 (1.0.0 -> 1.1.0)  
pnpm run version:minor

# 主要版本 (1.0.0 -> 2.0.0)
pnpm run version:major
```

这些命令会自动：
- 更新 `package.json` 中的版本号
- 创建符合格式的 commit 消息
- 推送到远程仓库
- 触发自动发布流程

### 方法二：手动创建 commit

```bash
# 1. 更新 package.json 版本号
npm version patch --no-git-tag-version

# 2. 创建符合格式的 commit
git add package.json
git commit -m "chore(release): 1.0.1"

# 3. 推送到 main 分支
git push origin main
```

## Commit 消息格式

**正确格式：**
```
chore(release): 1.0.1
chore(release): 2.1.0
chore(release): 1.0.0-beta.1
chore(release): 1.0.0-alpha.2
chore(release): 2.1.0-rc.1
```

**错误格式：**
```
chore(release): v1.0.1          # 不要包含 v 前缀
chore(release): 1.0.1 "fix bug" # 不要包含额外描述
chore(release): 1.0.1            # 格式不正确
feat: add new feature           # 不是发布类型
```

## 工作流程

### 1. 自动检测
- 监听推送到 `main` 分支的 commit
- 解析 commit 消息，提取版本号
- 验证版本格式（支持 `x.x.x` 和 `x.x.x-prerelease` 格式）

### 2. 安全检查
- 检查版本 tag 是否已存在
- 如果 tag 已存在，跳过发布流程
- 避免重复发布同一版本

### 3. 构建流程
- 安装依赖 (`pnpm install`)
- 构建 Chrome 扩展 (`pnpm run build:chrome`)
- 构建 Firefox 扩展 (`pnpm run build:firefox`)
- 验证构建输出

### 4. 打包发布
- 创建 Chrome 扩展 ZIP 包
- 创建 Firefox 扩展 ZIP 包
- 创建 Git tag (`vx.x.x`)
- 创建 GitHub Release
- 上传 ZIP 包作为发布资源

## 输出文件

每次发布会生成以下文件：

- `api_proxy_tool_x.x.x.zip` - Chrome 扩展包
- `api_proxy_tool_firefox_x.x.x.zip` - Firefox 扩展包

## 监控和调试

### 查看工作流状态
1. 访问 GitHub Actions 页面
2. 查看 "Auto Release on Commit" 工作流
3. 检查运行日志

### 常见问题

**Q: 为什么我的 commit 没有触发发布？**
A: 请检查：
- Commit 消息格式是否正确：`chore(release): x.x.x`
- 是否推送到 `main` 分支
- 版本 tag 是否已存在

**Q: 如何跳过某些文件的更改？**
A: 工作流已配置忽略以下文件：
- `README.md`
- `README_CN.md` 
- `RELEASE_GUIDE.md`
- `edge-market-description.md`
- `edge-tester-info.md`
- `需求-*.md`

**Q: 发布失败怎么办？**
A: 检查：
- 构建是否成功
- 是否有足够的权限创建 tag 和 release
- 网络连接是否正常

## 与现有流程的兼容性

- ✅ 不影响现有的 `ci.yml` 工作流
- ✅ 不影响现有的 `release.yml` 工作流  
- ✅ 不影响现有的 `scripts/release.sh` 脚本
- ✅ 可以同时使用手动发布和自动发布

## 权限要求

确保 GitHub Actions 具有以下权限：
- `contents: write` - 创建 tag 和 release
- `packages: write` - 上传发布资源

## 示例

### 完整发布流程示例

```bash
# 1. 开发完成，准备发布
git add .
git commit -m "feat: add new feature"

# 2. 使用自动版本管理
pnpm run version:patch

# 3. 推送触发自动发布
git push origin main

# 4. 查看发布状态
# 访问 GitHub Actions 页面查看进度
```

### 手动发布示例

```bash
# 1. 更新版本号
npm version patch --no-git-tag-version

# 2. 创建发布 commit
git add package.json
git commit -m "chore(release): 1.4.7"

# 3. 推送触发发布
git push origin main
```

## 注意事项

1. **版本格式**：支持语义化版本格式 `x.x.x` 和预发布版本 `x.x.x-prerelease`
2. **分支限制**：仅在 `main` 分支触发
3. **重复检查**：系统会自动检查 tag 是否已存在
4. **构建验证**：发布前会验证构建输出
5. **权限要求**：需要仓库的写入权限

## 故障排除

如果遇到问题，请检查：

1. **Commit 消息格式**
   ```bash
   git log -1 --pretty=%B  # 查看最新 commit 消息
   ```

2. **Tag 是否存在**
   ```bash
   git tag -l | grep v1.0.1  # 检查特定版本 tag
   ```

3. **工作流日志**
   - 访问 GitHub Actions 页面
   - 查看 "Auto Release on Commit" 工作流
   - 检查失败步骤的详细日志

4. **权限设置**
   - 确保仓库设置中启用了 Actions
   - 检查 Actions 权限设置
