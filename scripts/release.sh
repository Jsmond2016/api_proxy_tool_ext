#!/bin/bash

# API Proxy Tool Release Script
# Usage: ./scripts/release.sh [version] [message]
# Example: ./scripts/release.sh v1.0.0 "Initial release"

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if version is provided
if [ -z "$1" ]; then
    print_error "Version is required!"
    echo "Usage: $0 <version> [message]"
    echo "Example: $0 v1.0.0 'Initial release'"
    exit 1
fi

VERSION=$1
MESSAGE=${2:-"Release $VERSION"}

# Validate version format
if [[ ! $VERSION =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    print_error "Invalid version format! Use format: v1.0.0"
    exit 1
fi

print_status "Starting release process for $VERSION..."

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Not in a git repository!"
    exit 1
fi

# Check if working directory is clean
if ! git diff-index --quiet HEAD --; then
    print_error "Working directory is not clean! Please commit or stash your changes."
    exit 1
fi

# Check if tag already exists
if git rev-parse "$VERSION" >/dev/null 2>&1; then
    print_error "Tag $VERSION already exists!"
    exit 1
fi

# Check if there are new commits since the latest tag（空版本保护）
LATEST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || true)
if [ -n "$LATEST_TAG" ]; then
    COMMITS_SINCE_TAG=$(git log "$LATEST_TAG"..HEAD --oneline --no-merges 2>/dev/null | wc -l | tr -d ' ')
    if [ "$COMMITS_SINCE_TAG" -eq 0 ]; then
        print_warning "自 $LATEST_TAG 以来没有新提交，无需发版。"
        exit 1
    fi
fi

# Update package.json version
print_status "Updating package.json version..."
npm version $VERSION --no-git-tag-version

# 写入发布日期用于页脚显示
RELEASE_DATE=$(date +%Y.%m.%d)
node -e "
  const pkg = require('./package.json');
  pkg.releaseDate = '$RELEASE_DATE';
  require('fs').writeFileSync('./package.json', JSON.stringify(pkg, null, 2) + '\n');
"

# Generate changelog entry（同步引入 -u 模式）
VERSION_NUMBER=${VERSION#v}
if [ -f CHANGELOG.md ]; then
    print_status "Generating changelog entry..."
    BODY_FILE=$(mktemp)
    NEW_ENTRY_FILE=$(mktemp)

    cat CHANGELOG.md > "$BODY_FILE"
    conventional-changelog -p angular -u > "$NEW_ENTRY_FILE"

    {
        cat "$NEW_ENTRY_FILE"
        cat "$BODY_FILE"
    } > CHANGELOG.md

    rm -f "$BODY_FILE" "$NEW_ENTRY_FILE"
    print_success "CHANGELOG.md updated"
fi

# Build the project
print_status "Building project..."
pnpm run build:chrome
pnpm run build:firefox

# Create git tag
print_status "Creating git tag $VERSION..."
git add package.json CHANGELOG.md
git commit -m "chore(release): $VERSION_NUMBER"
git tag -a "$VERSION" -m "$MESSAGE"

# Push changes and tags
print_status "Pushing changes and tags..."
git push origin main
git push origin "$VERSION"

print_success "Release $VERSION created successfully!"
print_status "The GitHub Action will now build and create a release automatically."
print_status "You can monitor the progress at: https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^.]*\).*/\1/')/actions"

echo ""
print_status "Release checklist:"
echo "  ✓ Version updated in package.json"
echo "  ✓ Git tag created: $VERSION"
echo "  ✓ Changes pushed to remote"
echo "  ✓ GitHub Action triggered for release build"
