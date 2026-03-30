#!/bin/bash

set -e

# 获取版本类型 (patch/minor/major)
VERSION_TYPE=${1:-patch}

if [ -z "$VERSION_TYPE" ]; then
  echo "Usage: $0 {scripts}/bump-version.sh <patch|minor|major>"
  exit 1
fi

# 获取当前版本号并更新
NEW_VERSION=$(npm version $VERSION_TYPE --no-git-tag-version)
# 去掉 v 前缀
VERSION_NUMBER=$(echo $NEW_VERSION | sed 's/^v//')

# 生成 changelog（确保版本号正确）
# conventional-changelog 会从 package.json 读取版本号
pnpm run changelog

# 修复 CHANGELOG.md 中可能为空的版本号标题
# 将 "# [](" 替换为 "# [版本号]("
if grep -q "^# \[\](.*\.\.\.v)$" CHANGELOG.md 2>/dev/null; then
  echo "🔧 Fixing empty version number in CHANGELOG.md..."
  # 获取上一个版本号用于比较链接
  PREV_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
  if [ -n "$PREV_TAG" ]; then
    # 替换空的版本号和比较链接
    sed -i '' "s|^# \[\](https://github.com/.*/compare/v.*\.\.\.v)$|# [$VERSION_NUMBER](https://github.com/Jsmond2016/api_proxy_tool_ext/compare/${PREV_TAG}...v${VERSION_NUMBER})|" CHANGELOG.md
  else
    # 如果没有上一个标签，直接替换版本号
    sed -i '' "s|^# \[\](.*\.\.\.v)$|# [$VERSION_NUMBER]|" CHANGELOG.md
  fi
  echo "✅ Fixed version number in CHANGELOG.md"
fi

# 提交更改
git add package.json CHANGELOG.md
git commit --no-verify -m "chore(release): $VERSION_NUMBER"

echo "✅ Version bumped to $NEW_VERSION"
