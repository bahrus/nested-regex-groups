---
inclusion: auto
---

# Workflow Efficiency Guidelines

## Documentation-Only Changes

When you've only modified documentation files (*.md), **skip compilation and testing steps**.

### Skip These Steps for Documentation-Only Changes:

- ❌ Don't run `npx tsc` (TypeScript compilation)
- ❌ Don't run `npm test` (test suite)
- ❌ Don't run `npm run build` (build process)
- ❌ Don't check for syntax errors in code files

### Documentation Files Include:

- `README.md`
- `*.md` files in root directory
- `*.md` files in subdirectories (e.g., `additionalRequirements/`)
- Steering files in `.kiro/steering/`
- Spec files in `.kiro/specs/`

### Why Skip These Steps?

1. **Efficiency** - Documentation changes don't affect code behavior
2. **Speed** - Compilation and tests take time unnecessarily
3. **Focus** - Keep the workflow focused on what changed
4. **User Experience** - Faster responses for documentation updates

### When to Run Checks:

**DO run compilation and tests when:**
- ✅ Any `.ts` file is modified
- ✅ Any `.js` file is modified
- ✅ `package.json` is modified
- ✅ `tsconfig.json` is modified
- ✅ Type definition files (`.d.ts`) are modified

**Example Decision Tree:**

```
Changed files: README.md, additionalRequirements/DefaultValues.md
→ Only .md files changed
→ Skip compilation and tests
→ Done!

Changed files: index.ts, README.md
→ Code file (.ts) changed
→ Run compilation and tests
→ Verify changes work correctly
```

### Quick Check Command

If you're unsure what changed, check with:

```bash
git status --short
```

Look at the file extensions:
- Only `.md` files? → Skip checks
- Any code files? → Run checks

## General Efficiency Principles

### 1. Minimal Verification

Only verify what's necessary for the changes made:
- Documentation changes → No verification needed
- Type changes → Run `tsc` only
- Code changes → Run `tsc` and `npm test`

### 2. Avoid Redundant Operations

Don't repeat the same operation multiple times in one session:
- If tests passed once, don't run them again unless code changed
- If compilation succeeded, don't recompile unless source changed

### 3. Trust Previous Work

If a previous step in the conversation verified something:
- Don't re-verify unless new changes were made
- Reference the previous verification instead

### 4. Batch Related Changes

When making multiple related changes:
- Make all changes first
- Verify once at the end
- Don't verify after each individual change

## Examples

### ✅ Good: Documentation Update

```
User: "Update the README to document defaultVals"
Agent: 
  1. Updates README.md
  2. Done! (no compilation or tests needed)
```

### ✅ Good: Code Update

```
User: "Fix the bug in parse-patterns.ts"
Agent:
  1. Updates parse-patterns.ts
  2. Runs npx tsc (verify compilation)
  3. Runs npm test (verify functionality)
  4. Done!
```

### ❌ Bad: Over-verification

```
User: "Update the README"
Agent:
  1. Updates README.md
  2. Runs npx tsc (unnecessary!)
  3. Runs npm test (unnecessary!)
  4. Done (but wasted time)
```

### ✅ Good: Mixed Changes

```
User: "Add defaultVals feature and document it"
Agent:
  1. Updates types.d.ts
  2. Updates parse-pattern-statements.ts
  3. Updates README.md
  4. Runs npx tsc (needed for code changes)
  5. Runs npm test (needed for code changes)
  6. Done!
```

## Summary

**Golden Rule:** Match verification effort to the scope of changes. Documentation changes need no code verification.
