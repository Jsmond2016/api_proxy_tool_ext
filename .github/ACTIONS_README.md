# GitHub Actions CI/CD

This repository includes automated CI/CD workflows for building, testing, and releasing the API Proxy Tool Chrome extension.

## Workflows

### 1. Build and Test (`ci.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches
- Manual dispatch

**Actions:**
- Installs dependencies using pnpm
- Runs linting checks
- Builds Chrome and Firefox extensions
- Uploads build artifacts

### 2. Release (`release.yml`)

**Triggers:**
- Push tags starting with `v*` (e.g., `v1.0.0`)
- Manual dispatch with version input

**Actions:**
- Builds both Chrome and Firefox extensions
- Creates ZIP files with naming: `api_proxy_helper_vX.X.X.zip`
- Creates GitHub release with download links
- Includes installation instructions

## Release Process

### Automatic Release (Recommended)

1. **Create a new tag:**
   ```bash
   # Using the release script
   pnpm run release v1.0.0 "Initial release"
   
   # Or manually
   git tag -a v1.0.0 -m "Release v1.0.0"
   git push origin v1.0.0
   ```

2. **GitHub Action will automatically:**
   - Build the extensions
   - Create ZIP files
   - Generate a GitHub release
   - Upload the ZIP files as release assets

### Manual Release

1. Go to [Actions](https://github.com/your-username/vite-web-extension/actions)
2. Select "Release API Proxy Tool"
3. Click "Run workflow"
4. Enter the version (e.g., `v1.0.0`)
5. Click "Run workflow"

### Version Management

Use the provided npm scripts for version management:

```bash
# Patch version (1.0.0 -> 1.0.1)
pnpm run version:patch

# Minor version (1.0.0 -> 1.1.0)
pnpm run version:minor

# Major version (1.0.0 -> 2.0.0)
pnpm run version:major
```

## File Structure

```
.github/
├── workflows/
│   ├── ci.yml          # Build and test workflow
│   └── release.yml     # Release workflow
├── dependabot.yml      # Dependency updates
├── stale.yml          # Issue management
└── README.md          # This file
```

## Configuration

### Dependabot

- Automatically creates PRs for dependency updates
- Runs weekly
- Uses pnpm for package management
- Limited to 10 open PRs

### Stale Issues

- Issues become stale after 14 days of inactivity
- Stale issues are closed after 3 additional days
- Issues with `pinned` or `security` labels are exempt

## Troubleshooting

### Common Issues

1. **Build fails due to linting errors:**
   - Fix linting issues locally: `pnpm run lint:fix`
   - Or check the CI logs for specific errors

2. **Release fails:**
   - Ensure you have push permissions to the repository
   - Check that the tag doesn't already exist
   - Verify the version format (must start with `v`)

3. **Dependencies not updating:**
   - Check the Dependabot configuration
   - Ensure the repository has the correct permissions

### Getting Help

- Check the [Actions tab](https://github.com/your-username/vite-web-extension/actions) for workflow runs
- Review the logs for specific error messages
- Open an issue if you encounter persistent problems
