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

# 生成 changelog
pnpm run changelog

# 提交更改
git add package.json CHANGELOG.md
git commit --no-verify -m "chore(release): $NEW_VERSION"

echo "✅ Version bumped to $NEW_VERSION"
