---
title: 发布流程
description: API Proxy Tool 的版本管理、自动发布和手动发布流程
outline: deep
---

# 版本发布流程

> **更新时间**：2026-07-14；**使用模型**：Codex（GPT-5）；**用户**：Jsmond2016

---

项目使用语义化版本、Conventional Commits 和 GitHub Actions 管理 Chrome 与 Firefox 扩展发布。推荐使用版本升级命令生成 release commit，再由自动发布工作流创建远端 tag 和 GitHub Release。

## 发布前检查

1. 确认工作区中的功能变更已经提交。
2. 执行测试、Lint 和双浏览器构建。
3. 确认最新 tag 之后存在新的非合并提交。
4. 根据变更范围选择 patch、minor 或 major 版本。

```bash
pnpm test
pnpm lint
pnpm build:chrome
pnpm build:firefox
```

## 推荐：自动发布

根据版本类型执行一个命令：

```bash
pnpm version:patch
pnpm version:minor
pnpm version:major
```

`scripts/bump-version.sh` 会依次执行：

1. 检查最新 tag 之后是否有新提交，没有时终止，避免空版本。
2. 更新 `package.json` 的版本号和发布日期。
3. 根据最新 tag 到 `HEAD` 的提交增量更新 `CHANGELOG.md`。
4. 创建 `chore(release): x.y.z` 提交。
5. 创建本地 annotated tag `vx.y.z`。

检查 release commit 和 changelog 后，只推送 `main`：

```bash
git push origin main
```

::: warning 不要提前推送本地 tag
`.github/workflows/auto-release.yml` 只会在远端不存在目标 tag 时继续构建和创建 Release。提前推送本地 tag 会让工作流判定版本已经存在并跳过发布。
:::

自动工作流会：

1. 校验最新提交是否符合 `chore(release): x.y.z`。
2. 安装锁定版本的 Node.js、pnpm 和依赖。
3. 构建 Chrome 与 Firefox 扩展并校验产物。
4. 从 `CHANGELOG.md` 提取当前版本说明。
5. 打包两个 ZIP 文件。
6. 创建并推送版本 tag。
7. 创建 GitHub Release 并上传构建产物。

## 备用：完整手动脚本

`release` 脚本接受明确版本号和可选说明：

```bash
pnpm release v1.5.44 "修复接口同步问题"
```

该脚本会更新版本和 changelog、执行双端构建、创建 release commit 与 tag，并直接推送 `main` 和 tag。

::: info 使用边界
由于 tag 已由脚本推送，自动发布工作流会跳过同版本。这个入口适合需要自行处理 GitHub Release 的备用场景；希望由工作流自动创建 Release 时，请使用上面的版本升级命令。
:::

## 版本规则

| 类型  | 适用场景           | 示例                |
| :---- | :----------------- | :------------------ |
| patch | 向后兼容的缺陷修复 | `1.5.43` → `1.5.44` |
| minor | 向后兼容的新功能   | `1.5.43` → `1.6.0`  |
| major | 不兼容变更         | `1.5.43` → `2.0.0`  |

## 关键文件

| 文件                                 | 作用                                                            |
| :----------------------------------- | :-------------------------------------------------------------- |
| `scripts/bump-version.sh`            | 空版本检查、版本升级、增量 changelog、release commit 和本地 tag |
| `scripts/release.sh`                 | 指定版本的完整手动发布和远端推送                                |
| `scripts/generate-changelog.mjs`     | Changelog 生成辅助脚本                                          |
| `.github/workflows/auto-release.yml` | release commit 触发的扩展构建与 GitHub Release                  |
| `.github/workflows/deploy-docs.yml`  | 文档变更触发的 GitHub Pages 部署                                |

## 常见问题

### 没有新提交

版本脚本会在最新 tag 后没有非合并提交时主动退出。先完成并提交实际变更，不要绕过空版本保护。

### 目标 tag 已存在

先确认该版本是否已经发布。不要删除远端 tag 后重复覆盖正式版本；存在新的修复时应升级 patch 版本。

### 自动发布被跳过

检查两个条件：

- 最新提交必须严格匹配 `chore(release): x.y.z`。
- 远端不能提前存在 `vx.y.z` tag。

### 构建失败

在本地使用与工作流一致的命令复现：

```bash
pnpm install --frozen-lockfile
pnpm build:chrome
pnpm build:firefox
```

修复后创建新的变更提交，再重新执行版本升级流程，避免修改已经生成的正式 release commit。
