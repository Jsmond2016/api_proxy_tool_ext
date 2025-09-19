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

# Update package.json version
print_status "Updating package.json version..."
npm version $VERSION --no-git-tag-version

# Build the project
print_status "Building project..."
pnpm run build:chrome
pnpm run build:firefox

# Create git tag
print_status "Creating git tag $VERSION..."
git add package.json
git commit -m "chore: bump version to $VERSION"
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
