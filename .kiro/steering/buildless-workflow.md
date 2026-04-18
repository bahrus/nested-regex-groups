---
inclusion: auto
---

# Buildless Workflow Principles

## Philosophy

This library is designed to work seamlessly with consumers who use a **buildless workflow** - no build step, no bundler, just native ES modules with import maps.

## Core Requirements

### 1. All Imports Must Use Relative Paths with .js Extensions

**TypeScript source files must import with .js extensions:**

```typescript
// ✅ CORRECT
import { ParseResult } from './types/nested-regex-groups/parse-result.js';
import { nestedRegex } from './index.js';

// ❌ WRONG - No extension
import { ParseResult } from './types/nested-regex-groups/parse-result';

// ❌ WRONG - .ts extension
import { ParseResult } from './types/nested-regex-groups/parse-result.ts';
```

**Why .js in TypeScript files?**
- TypeScript doesn't rewrite import paths
- The compiled .js files will have the same imports
- Browsers and Node.js require explicit extensions for ES modules
- Import maps work with explicit extensions

### 2. Files in Root Directory (Not dist/)

The npm package structure should be flat:

```
nested-regex-groups/
├── index.js              # Main module
├── index.d.ts            # Type definitions
├── template.js           # Template tag module
├── template.d.ts         # Template types
├── types/                # Type definitions submodule
│   └── nested-regex-groups/
│       ├── index.js
│       ├── index.d.ts
│       └── ...
├── package.json
└── README.md
```

**Benefits:**
- Simpler import paths
- No need for path mapping in import maps
- Easier to understand package structure
- Works naturally with buildless workflows

### 3. Package.json Exports

The `exports` field should point directly to root files:

```json
{
  "exports": {
    ".": {
      "types": "./index.d.ts",
      "import": "./index.js"
    },
    "./template": {
      "types": "./template.d.ts",
      "import": "./template.js"
    },
    "./types": {
      "types": "./types/nested-regex-groups/index.d.ts",
      "import": "./types/nested-regex-groups/index.js"
    }
  }
}
```

### 4. TypeScript Configuration

```json
{
  "compilerOptions": {
    "outDir": ".",           // Compile to root
    "rootDir": ".",          // Source in root
    "module": "ESNext",      // Native ES modules
    "target": "ESNext"       // Modern JavaScript
  }
}
```

## Import Map Example

Consumers can use import maps to reference the library:

```html
<script type="importmap">
{
  "imports": {
    "nested-regex-groups": "./node_modules/nested-regex-groups/index.js",
    "nested-regex-groups/template": "./node_modules/nested-regex-groups/template.js",
    "nested-regex-groups/types": "./node_modules/nested-regex-groups/types/nested-regex-groups/index.js"
  }
}
</script>

<script type="module">
  import { nestedRegex } from 'nested-regex-groups';
  import { rx } from 'nested-regex-groups/template';
  import type { ParseResult } from 'nested-regex-groups/types';
  
  // Works without any build step!
</script>
```

## Verification Checklist

When adding new files or imports:

- [ ] All imports use relative paths
- [ ] All imports end with `.js` extension
- [ ] No imports reference `.ts` files
- [ ] Files compile to root directory (not dist/)
- [ ] Package.json exports point to root files
- [ ] No build step required for consumers

## Testing Buildless Workflow

To test that the library works in a buildless environment:

```bash
# 1. Build the library
npm run build

# 2. Create a test HTML file
cat > test-buildless.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
  <script type="importmap">
  {
    "imports": {
      "nested-regex-groups": "./index.js"
    }
  }
  </script>
</head>
<body>
  <script type="module">
    import { nestedRegex } from 'nested-regex-groups';
    console.log('Buildless import works!', nestedRegex);
  </script>
</body>
</html>
EOF

# 3. Serve with a simple HTTP server
npx http-server -p 8080

# 4. Open http://localhost:8080/test-buildless.html
# Should see "Buildless import works!" in console
```

## Common Pitfalls to Avoid

### ❌ Missing .js Extension

```typescript
// WRONG - Will fail in browsers
import { ParseResult } from './types/nested-regex-groups/parse-result';
```

### ❌ Using .ts Extension

```typescript
// WRONG - .ts files don't exist at runtime
import { ParseResult } from './types/nested-regex-groups/parse-result.ts';
```

### ❌ Absolute Imports

```typescript
// WRONG - Doesn't work without bundler
import { ParseResult } from 'types/nested-regex-groups/parse-result.js';
```

### ❌ Node-style Imports

```typescript
// WRONG - Doesn't work in browsers
const { nestedRegex } = require('./index.js');
```

## Benefits of Buildless Support

1. **Zero Setup** - Consumers can use the library immediately
2. **Fast Development** - No build step means instant feedback
3. **Debugging** - Source code matches runtime code exactly
4. **Modern** - Leverages native browser capabilities
5. **Flexible** - Works with or without a build step

## Compatibility

This approach works with:
- ✅ Modern browsers (ES modules support)
- ✅ Node.js 14+ (ES modules support)
- ✅ Deno (native ES modules)
- ✅ Bundlers (webpack, rollup, vite, etc.)
- ✅ Import maps
- ✅ Buildless workflows

## References

- [ES Modules in Browsers](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [Import Maps Specification](https://github.com/WICG/import-maps)
- [Node.js ES Modules](https://nodejs.org/api/esm.html)
- [TypeScript Module Resolution](https://www.typescriptlang.org/docs/handbook/module-resolution.html)
