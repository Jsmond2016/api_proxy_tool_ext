#!/bin/bash

set -e

# 获取版本类型 (patch/minor/major)
VERSION_TYPE=${1:-patch}

if [ -z "$VERSION_TYPE" ]; then
  echo "Usage: $0 {scripts}/bump-version.sh <patch|minor|major>"
  exit 1
fi

# 检查自最新 tag 以来是否有新提交（空版本保护）
LATEST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || true)
if [ -n "$LATEST_TAG" ]; then
  COMMITS_SINCE_TAG=$(git log "$LATEST_TAG"..HEAD --oneline --no-merges 2>/dev/null | wc -l | tr -d ' ')
  if [ "$COMMITS_SINCE_TAG" -eq 0 ]; then
    echo "⚠️  自 $LATEST_TAG 以来没有新提交，无需发版。"
    echo "   请先提交一些更改。"
    exit 1
  fi
fi

# 获取当前版本号并更新
NEW_VERSION=$(npm version $VERSION_TYPE --no-git-tag-version)
# 去掉 v 前缀
VERSION_NUMBER=$(echo $NEW_VERSION | sed 's/^v//')

# 写入发布日期用于页脚显示
RELEASE_DATE=$(date +%Y.%m.%d)
node -e "
  const pkg = require('./package.json');
  pkg.releaseDate = '$RELEASE_DATE';
  require('fs').writeFileSync('./package.json', JSON.stringify(pkg, null, 2) + '\n');
"

# 生成 changelog
# 使用 -u (unreleased) 基于「最新 tag → HEAD」范围生成，避免 tag 断裂导致重复
if [ -f CHANGELOG.md ]; then
  BODY_FILE=$(mktemp)
  NEW_ENTRY_FILE=$(mktemp)

  # 保存现有内容作为 body
  cat CHANGELOG.md > "$BODY_FILE"

  # 生成新版本条目（基于最新 tag → HEAD 的范围）
  conventional-changelog -p angular -u > "$NEW_ENTRY_FILE"

  # 合并：新条目 + 旧内容
  {
    cat "$NEW_ENTRY_FILE"
    cat "$BODY_FILE"
  } > CHANGELOG.md

  rm -f "$BODY_FILE" "$NEW_ENTRY_FILE"
fi

# 提交更改并创建 tag
git add package.json CHANGELOG.md
git commit --no-verify -m "chore(release): $VERSION_NUMBER"
git tag -a "v$VERSION_NUMBER" -m "Release $VERSION_NUMBER"

echo "✅ Version bumped to $NEW_VERSION (tagged as v$VERSION_NUMBER)"
