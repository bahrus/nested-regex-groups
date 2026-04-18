---
inclusion: auto
---

# Commit Compiled Files Principle

## Philosophy

For buildless workflow support, **compiled JavaScript files should be committed to the repository**. This approach:

1. **Simplifies CI/CD** - No build step needed in GitHub Actions
2. **Enables buildless consumption** - Users can import directly from npm
3. **Reduces CI complexity** - Tests run on committed files
4. **Faster CI** - No compilation time
5. **Transparency** - See exactly what gets published

## What to Commit

### ✅ DO Commit

- `*.js` - Compiled JavaScript files
- `*.d.ts` - TypeScript declaration files
- `types/**/*.js` - Compiled type module files
- `types/**/*.d.ts` - Type declarations

### ❌ DON'T Commit

- `*.map` - Source maps (not needed with minimal TypeScript)
- `*.d.ts.map` - Declaration maps (not needed)
- `node_modules/` - Dependencies
- `coverage/` - Test coverage reports
- `*.log` - Log files

## .gitignore Configuration

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

**Key point:** Do NOT ignore `*.js` or `*.d.ts` files at the root level.

## Workflow

### Local Development

1. Make changes to TypeScript files
2. Build locally: `npm run build`
3. Test locally: `npm test`
4. Commit both `.ts` and compiled `.js` files
5. Push to GitHub

```bash
# Example workflow
npm run build
npm test
git add .
git commit -m "Add new feature"
git push
```

### GitHub Actions CI

The CI workflow should:
1. ✅ Install dependencies
2. ✅ Run tests (on committed files)
3. ✅ Type-check TypeScript (no emit)
4. ❌ Skip build step (files already built)

```yaml
steps:
  - uses: actions/checkout@v4
  - name: Install dependencies
    run: npm ci
  - name: Run tests
    run: npm test
  - name: Check TypeScript
    run: npx tsc --noEmit
```

## Benefits

### 1. Simpler CI/CD

**Before (with build):**
```yaml
- name: Build
  run: npm run build
- name: Run tests
  run: npm test
```

**After (without build):**
```yaml
- name: Run tests
  run: npm test
```

### 2. Faster CI

- No TypeScript compilation time
- No waiting for build to complete
- Tests run immediately

### 3. Buildless Consumption

Users can:
- Clone the repo and use immediately
- Import directly from GitHub
- Use with import maps without building

```html
<script type="importmap">
{
  "imports": {
    "nested-regex-groups": "https://unpkg.com/nested-regex-groups/index.js"
  }
}
</script>
```

### 4. Transparency

- See exactly what code runs in production
- Review compiled output in PRs
- Catch compilation issues before CI

### 5. Consistency

- CI tests the same files that get published
- No "works locally but fails in CI" due to build differences
- What you commit is what users get

## Trade-offs

### Larger Repository Size

**Impact:** Minimal for small libraries
- TypeScript: ~50KB
- Compiled JS: ~45KB
- Total: ~95KB (still very small)

**Mitigation:** 
- No source maps (saves ~50%)
- Minimal TypeScript (output nearly identical to source)

### Merge Conflicts

**Issue:** Changes to `.ts` files also change `.js` files

**Mitigation:**
- Build before committing
- Use `npm run build` in pre-commit hook
- Resolve conflicts in `.ts`, then rebuild

### Accidental Commits

**Issue:** Might forget to rebuild before committing

**Mitigation:**
- Add pre-commit hook to build automatically
- CI type-check catches mismatches
- Review compiled output in PRs

## Pre-commit Hook (Optional)

To automatically build before committing:

```json
{
  "scripts": {
    "prepare": "npm run build"
  }
}
```

Or use husky:

```bash
npm install --save-dev husky
npx husky init
echo "npm run build" > .husky/pre-commit
```

## Verification

To verify compiled files are committed:

```bash
# Check that .js files are tracked
git ls-files "*.js" | grep -v node_modules

# Should show:
# index.js
# template.js
# types/nested-regex-groups/index.js
# etc.
```

## Alternative Approaches (Not Recommended)

### ❌ Build in CI

**Problems:**
- Slower CI
- Build might fail in CI but not locally
- Extra complexity
- Doesn't support buildless consumption

### ❌ Separate dist/ branch

**Problems:**
- Complex workflow
- Hard to review changes
- Doesn't work with npm
- Confusing for contributors

### ❌ Build on npm publish

**Problems:**
- Can't test published code before publishing
- Doesn't support GitHub imports
- Doesn't support buildless consumption

## Best Practices

1. **Always build before committing**
   ```bash
   npm run build && git add . && git commit
   ```

2. **Review compiled output in PRs**
   - Check that `.js` changes match `.ts` changes
   - Verify no unexpected transformations

3. **Keep builds minimal**
   - Use ESNext target (no transpilation)
   - No source maps
   - Output should be nearly identical to source

4. **Document the workflow**
   - Add to CONTRIBUTING.md
   - Mention in README
   - Include in PR template

## References

- [Buildless Workflow Principles](.kiro/steering/buildless-workflow.md)
- [Minimal TypeScript Principles](.kiro/steering/minimal-typescript.md)
- [npm package best practices](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
