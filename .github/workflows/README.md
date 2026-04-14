# GitHub Actions Workflows

This directory contains automated workflows for the project.

## Workflows

### CI (Continuous Integration)

**File:** `ci.yml`

**Triggers:**
- Push to `main` or `master` branch
- Pull requests to `main` or `master` branch

**Jobs:**

1. **Test** - Runs on multiple Node.js versions
   - Node.js 18.x, 20.x, 22.x
   - Installs dependencies
   - Builds the project
   - Runs all tests
   - Checks TypeScript compilation

2. **Coverage** - Generates coverage report
   - Runs tests with coverage
   - Uploads to Codecov (if configured)

**Status Badge:**
```markdown
[![CI](https://github.com/bahrus/nested-regex-groups/workflows/CI/badge.svg)](https://github.com/bahrus/nested-regex-groups/actions)
```

### Publish (NPM Publishing)

**File:** `publish.yml`

**Triggers:**
- GitHub release created

**Jobs:**

1. **Publish** - Publishes to npm
   - Installs dependencies
   - Builds the project
   - Runs tests
   - Publishes to npm with provenance

**Requirements:**
- `NPM_TOKEN` secret must be configured in repository settings

## Setup Instructions

### 1. Enable GitHub Actions

GitHub Actions are enabled by default for public repositories. For private repositories:

1. Go to repository Settings
2. Navigate to Actions → General
3. Enable "Allow all actions and reusable workflows"

### 2. Configure NPM Token (for publishing)

1. Generate npm token:
   ```bash
   npm login
   npm token create
   ```

2. Add to GitHub secrets:
   - Go to repository Settings
   - Navigate to Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: Your npm token

### 3. Configure Codecov (optional)

1. Sign up at [codecov.io](https://codecov.io)
2. Add your repository
3. Get the upload token
4. Add to GitHub secrets:
   - Name: `CODECOV_TOKEN`
   - Value: Your Codecov token

## Badges

The README already includes these badges:

```markdown
[![npm version](https://img.shields.io/npm/v/nested-regex-groups.svg)](https://www.npmjs.com/package/nested-regex-groups)
[![CI](https://github.com/bahrus/nested-regex-groups/workflows/CI/badge.svg)](https://github.com/bahrus/nested-regex-groups/actions)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/nested-regex-groups)](https://bundlephobia.com/package/nested-regex-groups)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
```

Optional badge (if Codecov is configured):
```markdown
[![codecov](https://codecov.io/gh/bahrus/nested-regex-groups/branch/main/graph/badge.svg)](https://codecov.io/gh/bahrus/nested-regex-groups)
```

## Local Testing

Test workflows locally using [act](https://github.com/nektos/act):

```bash
# Install act
brew install act  # macOS
choco install act  # Windows

# Run CI workflow
act push

# Run specific job
act -j test
```

## Troubleshooting

### Tests Fail in CI but Pass Locally

- Check Node.js version compatibility
- Ensure all dependencies are in `package.json`
- Check for environment-specific issues

### Publish Fails

- Verify `NPM_TOKEN` is set correctly
- Check npm package name is available
- Ensure version number is incremented
- Verify you have publish permissions

### Coverage Upload Fails

- Check `CODECOV_TOKEN` is set
- Verify coverage files are generated
- Check Codecov service status

## Workflow Customization

### Change Node.js Versions

Edit `ci.yml`:
```yaml
strategy:
  matrix:
    node-version: [18.x, 20.x, 22.x]  # Modify versions here
```

### Add More Tests

Add steps to `ci.yml`:
```yaml
- name: Run integration tests
  run: npm run test:integration

- name: Run linting
  run: npm run lint
```

### Change Coverage Threshold

Edit `vitest.config.ts`:
```typescript
coverage: {
  thresholds: {
    lines: 80,      // Minimum line coverage
    functions: 80,  // Minimum function coverage
    branches: 80,   // Minimum branch coverage
    statements: 80  // Minimum statement coverage
  }
}
```

## Best Practices

1. **Keep workflows fast**
   - Use caching for dependencies
   - Run tests in parallel when possible
   - Only run necessary checks

2. **Fail fast**
   - Run quick checks first (linting, type checking)
   - Run expensive tests last

3. **Use matrix builds**
   - Test on multiple Node.js versions
   - Test on multiple operating systems if needed

4. **Secure secrets**
   - Never commit secrets to repository
   - Use GitHub secrets for sensitive data
   - Rotate tokens regularly

5. **Monitor workflow runs**
   - Check Actions tab regularly
   - Fix failing workflows promptly
   - Review workflow logs for issues

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [npm Publishing](https://docs.npmjs.com/cli/v8/commands/npm-publish)
- [Codecov Documentation](https://docs.codecov.com/)
