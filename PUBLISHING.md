# Publishing Guide

## Pre-publish Checklist

- [x] TypeScript configured and compiling
- [x] Tests written and passing (26 tests)
- [x] README.md with examples and API docs
- [x] GETTING_STARTED.md for new users
- [x] Examples directory with working code
- [x] package.json properly configured
- [x] .gitignore includes dist/ and node_modules/
- [x] LICENSE file present

## Before First Publish

### 1. Update Version

```bash
npm version 0.1.0
```

### 2. Test the Build

```bash
npm run build
npm test
```

### 3. Test the Package Locally

```bash
# In this directory
npm pack

# In another project
npm install /path/to/nested-regex-groups-0.1.0.tgz
```

### 4. Verify Package Contents

```bash
npm pack --dry-run
```

Should include:
- dist/
- README.md
- LICENSE
- package.json

## Publishing to npm

### First Time Setup

```bash
# Login to npm
npm login

# Verify you're logged in
npm whoami
```

### Publish

```bash
# Dry run first
npm publish --dry-run

# Actual publish
npm publish
```

## Post-publish

### 1. Tag the Release on GitHub

```bash
git tag v0.1.0
git push origin v0.1.0
```

### 2. Create GitHub Release

Go to GitHub releases and create a new release with:
- Tag: v0.1.0
- Title: v0.1.0 - Initial Release
- Description: Copy from CHANGELOG or write release notes

### 3. Update README Badge (Optional)

Add npm version badge:
```markdown
[![npm version](https://badge.fury.io/js/nested-regex-groups.svg)](https://www.npmjs.com/package/nested-regex-groups)
```

## Maintenance

### Updating the Package

1. Make changes
2. Update tests
3. Run `npm test`
4. Update version: `npm version patch|minor|major`
5. Run `npm publish`
6. Push to GitHub: `git push && git push --tags`

### Version Guidelines

- **Patch** (0.1.0 → 0.1.1): Bug fixes, no API changes
- **Minor** (0.1.0 → 0.2.0): New features, backward compatible
- **Major** (0.1.0 → 1.0.0): Breaking changes

## Scripts Reference

```bash
# Build TypeScript
npm run build

# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run example
node examples/basic-usage.ts
```

## Troubleshooting

### "Cannot find module" errors

Make sure you've run `npm run build` before testing or running examples.

### Tests failing

```bash
# Clean and rebuild
rm -rf dist node_modules
npm install
npm run build
npm test
```

### Package size too large

Check what's being included:
```bash
npm pack --dry-run
```

Update `.npmignore` or `files` in package.json if needed.

## Support

After publishing, monitor:
- npm downloads: https://www.npmjs.com/package/nested-regex-groups
- GitHub issues: https://github.com/bahrus/nested-regex-groups/issues
- GitHub stars: https://github.com/bahrus/nested-regex-groups
