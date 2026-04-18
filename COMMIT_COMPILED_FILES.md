# Committing Compiled Files

## Summary

This library commits compiled JavaScript files to the repository for buildless workflow support.

## Why Commit Compiled Files?

### 1. Simpler CI/CD
GitHub Actions doesn't need to build - it just runs tests on committed files.

**Before:**
```yaml
- name: Build
  run: npm run build
- name: Run tests
  run: npm test
```

**After:**
```yaml
- name: Run tests
  run: npm test
```

### 2. Buildless Consumption
Users can import directly without any build step:
- Clone and use immediately
- Import from GitHub
- Use with import maps
- No bundler required

### 3. Faster CI
- No TypeScript compilation time
- Tests run immediately
- Faster feedback loop

### 4. Transparency
- See exactly what code runs in production
- Review compiled output in PRs
- Catch compilation issues before CI

## What Gets Committed

✅ **DO Commit:**
- `index.js`, `index.d.ts`
- `template.js`, `template.d.ts`
- `lib-types/**/*.js`, `lib-types/**/*.d.ts`
- `vitest.config.js`, `vitest.config.d.ts`

❌ **DON'T Commit:**
- `*.map` files (source maps)
- `node_modules/`
- `coverage/`
- `*.log` files

## Workflow

### Local Development

```bash
# 1. Make changes to TypeScript files
# 2. Build locally
npm run build

# 3. Test locally
npm test

# 4. Commit both .ts and .js files
git add .
git commit -m "Add new feature"
git push
```

### GitHub Actions

The CI workflow is simplified:

```yaml
steps:
  - uses: actions/checkout@v4
  - name: Install dependencies
    run: npm ci
  - name: Run tests
    run: npm test  # No build step!
  - name: Check TypeScript
    run: npx tsc --noEmit
```

## Directory Structure

```
nested-regex-groups/
├── index.js              # Committed
├── index.d.ts            # Committed
├── index.ts              # Source
├── template.js           # Committed
├── template.d.ts         # Committed
├── template.ts           # Source
├── lib-types/            # Committed (compiled types)
│   └── nested-regex-groups/
│       ├── index.js
│       ├── index.d.ts
│       ├── parse-result.js
│       ├── parse-result.d.ts
│       └── ...
├── vitest.config.js      # Committed
├── vitest.config.d.ts    # Committed
└── package.json
```

## .gitignore Configuration

The `.gitignore` does NOT ignore compiled files:

```gitignore
# Dependency directories
node_modules
coverage
.nyc_output
*.log
.DS_Store

# Don't ignore compiled output - we commit built files for buildless workflow
# The compiled .js and .d.ts files are part of the package
```

## Why lib-types/ Instead of types/?

The `types/` directory is a git submodule containing type definitions for other projects. To avoid conflicts, our library's type definitions are in `lib-types/nested-regex-groups/`.

## Benefits

| Aspect | With Build in CI | With Committed Files |
|--------|------------------|---------------------|
| CI Speed | Slower (build + test) | Faster (test only) |
| Setup Complexity | Higher | Lower |
| Buildless Support | No | Yes |
| Transparency | Lower | Higher |
| Repository Size | Smaller | Slightly larger |

## Trade-offs

### Slightly Larger Repository
- TypeScript: ~50KB
- Compiled JS: ~45KB
- Total: ~95KB (still very small)

### Potential Merge Conflicts
- Changes to `.ts` files also change `.js` files
- **Solution:** Build before committing, resolve conflicts in `.ts`, then rebuild

### Must Remember to Build
- Might forget to rebuild before committing
- **Solution:** Add pre-commit hook or use `npm run prepare`

## Pre-commit Hook (Optional)

Automatically build before committing:

```json
{
  "scripts": {
    "prepare": "npm run build"
  }
}
```

Or with husky:

```bash
npm install --save-dev husky
npx husky init
echo "npm run build" > .husky/pre-commit
```

## Verification

Check that compiled files are tracked:

```bash
git ls-files "*.js" | grep -E "^(index|template|lib-types)"
```

Should show:
```
index.js
template.js
lib-types/nested-regex-groups/index.js
lib-types/nested-regex-groups/options.js
lib-types/nested-regex-groups/parse-result.js
lib-types/nested-regex-groups/pattern.js
lib-types/nested-regex-groups/statements.js
```

## Related Documentation

- [Buildless Workflow](./BUILDLESS_WORKFLOW.md)
- [Minimal TypeScript](./MINIMAL_TYPESCRIPT.md)
- [Type Organization](./TYPE_ORGANIZATION.md)
- [Steering Principle](./.kiro/steering/commit-compiled-files.md)
