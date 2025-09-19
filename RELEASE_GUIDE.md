# 🚀 Release Guide

This guide explains how to use the automated CI/CD system for releasing the API Proxy Tool.

## Quick Start

### 1. Create a Release

```bash
# Method 1: Using the release script (Recommended)
pnpm run release v1.0.0 "Initial release"

# Method 2: Manual git commands
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

### 2. What Happens Next

1. **GitHub Action triggers automatically**
2. **Builds both Chrome and Firefox extensions**
3. **Creates ZIP files:**
   - `api_proxy_helper_v1.0.0.zip` (Chrome)
   - `api_proxy_helper_firefox_v1.0.0.zip` (Firefox)
4. **Creates GitHub release with:**
   - Download links
   - Installation instructions
   - Release notes

## Version Management

### Semantic Versioning

Use semantic versioning format: `vMAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Version Bumping

```bash
# Patch version (1.0.0 -> 1.0.1)
pnpm run version:patch

# Minor version (1.0.0 -> 1.1.0)
pnpm run version:minor

# Major version (1.0.0 -> 2.0.0)
pnpm run version:major
```

## Manual Release

If you prefer manual control:

1. Go to [GitHub Actions](https://github.com/your-username/vite-web-extension/actions)
2. Select "Release API Proxy Tool"
3. Click "Run workflow"
4. Enter version (e.g., `v1.0.0`)
5. Click "Run workflow"

## File Naming Convention

The CI system automatically creates ZIP files with the following naming:

- **Chrome**: `api_proxy_helper_vX.X.X.zip`
- **Firefox**: `api_proxy_helper_firefox_vX.X.X.zip`

## Prerequisites

- Node.js >= 16.0.0
- pnpm >= 8.0.0
- Git repository with push permissions
- GitHub Actions enabled

## Troubleshooting

### Common Issues

1. **"Tag already exists"**
   ```bash
   # Delete local tag
   git tag -d v1.0.0
   
   # Delete remote tag
   git push origin --delete v1.0.0
   
   # Try again
   pnpm run release v1.0.0 "Release message"
   ```

2. **"Working directory not clean"**
   ```bash
   # Commit or stash changes
   git add .
   git commit -m "Your changes"
   
   # Or stash changes
   git stash
   ```

3. **Build fails**
   - Check the GitHub Actions logs
   - Fix any linting errors: `pnpm run lint:fix`
   - Ensure all dependencies are installed: `pnpm install`

### Getting Help

- Check [GitHub Actions](https://github.com/your-username/vite-web-extension/actions) for workflow status
- Review the [CI Configuration](.github/README.md) for detailed information
- Open an issue if you encounter problems

## Examples

### First Release

```bash
# Create initial release
pnpm run release v0.1.0 "Initial release with basic functionality"
```

### Bug Fix Release

```bash
# Bump patch version
pnpm run version:patch

# Create release
pnpm run release v0.1.1 "Fix API interception bug"
```

### Feature Release

```bash
# Bump minor version
pnpm run version:minor

# Create release
pnpm run release v0.2.0 "Add module management features"
```

---

**Note**: Replace `your-username` with your actual GitHub username in the URLs above.
