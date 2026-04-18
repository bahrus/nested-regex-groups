# Buildless Workflow Support

This document demonstrates that `nested-regex-groups` works seamlessly in buildless environments with no build step required.

## Package Structure

All files are in the root directory (not in `dist/`):

```
nested-regex-groups/
├── index.js              ← Main module
├── index.d.ts            ← Type definitions
├── template.js           ← Template tag module
├── template.d.ts         ← Template types
├── types/                ← Type definitions submodule
│   └── nested-regex-groups/
│       ├── index.js
│       ├── index.d.ts
│       ├── parse-result.js
│       ├── parse-result.d.ts
│       ├── pattern.js
│       ├── pattern.d.ts
│       ├── options.js
│       ├── options.d.ts
│       ├── statements.js
│       └── statements.d.ts
├── package.json
└── README.md
```

## Import Path Verification

All imports use relative paths with `.js` extensions:

### TypeScript Source Files

```typescript
// index.ts
export type { ParseResult } from './types/nested-regex-groups/parse-result.js';
export type { ParsePattern } from './types/nested-regex-groups/pattern.js';

// template.ts
import { nestedRegex, createParser } from './index.js';

// Test files
import { nestedRegex } from './index.js';
import { rx } from './template.js';
```

### Compiled JavaScript Files

```javascript
// template.js
import { nestedRegex, createParser } from './index.js';
```

✅ All imports use `.js` extensions - ready for buildless workflows!

## Usage with Import Maps

### Browser Example

```html
<!DOCTYPE html>
<html>
<head>
  <script type="importmap">
  {
    "imports": {
      "nested-regex-groups": "./node_modules/nested-regex-groups/index.js",
      "nested-regex-groups/template": "./node_modules/nested-regex-groups/template.js",
      "nested-regex-groups/types": "./node_modules/nested-regex-groups/types/nested-regex-groups/index.js"
    }
  }
  </script>
</head>
<body>
  <script type="module">
    import { nestedRegex } from 'nested-regex-groups';
    import { rx } from 'nested-regex-groups/template';
    
    // Use directly - no build step!
    const parser = nestedRegex(/^(?<user_name>\w+)$/, {
      groupMap: { user_name: 'user.name' }
    });
    
    const result = parser('john');
    console.log(result.value); // { user: { name: 'john' } }
  </script>
</body>
</html>
```

### Node.js Example (with import maps)

Create `package.json` with imports:

```json
{
  "type": "module",
  "imports": {
    "#nested-regex-groups": "./node_modules/nested-regex-groups/index.js",
    "#nested-regex-groups/template": "./node_modules/nested-regex-groups/template.js"
  }
}
```

Use in your code:

```javascript
import { nestedRegex } from '#nested-regex-groups';
import { rx } from '#nested-regex-groups/template';

// Works without any build step!
```

### Deno Example

```typescript
import { nestedRegex } from 'npm:nested-regex-groups';
import { rx } from 'npm:nested-regex-groups/template';

// Works natively in Deno!
```

## Testing Buildless Workflow

### Option 1: Test HTML File

Open `test-buildless.html` in a browser:

```bash
# Serve with any HTTP server
npx http-server -p 8080

# Open http://localhost:8080/test-buildless.html
```

The page will:
- ✅ Load modules via import map
- ✅ Run tests without any build step
- ✅ Display results in the browser

### Option 2: Node.js Direct Import

```bash
node --input-type=module -e "
  import { nestedRegex } from './index.js';
  const parser = nestedRegex(/^(?<name>\w+)$/);
  console.log(parser('test'));
"
```

### Option 3: Deno Direct Import

```bash
deno eval "
  import { nestedRegex } from './index.js';
  const parser = nestedRegex(/^(?<name>\w+)$/);
  console.log(parser('test'));
"
```

## Package.json Configuration

The package is configured for buildless workflows:

```json
{
  "type": "module",
  "main": "./index.js",
  "types": "./index.d.ts",
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

Key points:
- ✅ `"type": "module"` - ES modules by default
- ✅ All paths point to root files (not `dist/`)
- ✅ Explicit `.js` extensions in exports
- ✅ Separate exports for submodules

## TypeScript Configuration

The `tsconfig.json` is configured to output to root:

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "outDir": ".",        // Compile to root
    "rootDir": ".",       // Source in root
    "sourceMap": false    // No source maps needed
  }
}
```

## Compatibility

This buildless approach works with:

| Environment | Version | Status |
|-------------|---------|--------|
| Modern Browsers | Chrome 89+, Firefox 108+, Safari 16.4+ | ✅ Native ES modules + import maps |
| Node.js | 14.13.0+ | ✅ ES modules support |
| Node.js | 20.6.0+ | ✅ Import maps support |
| Deno | All versions | ✅ Native ES modules |
| Bun | All versions | ✅ Native ES modules |
| Webpack | 5+ | ✅ Handles ES modules |
| Rollup | 2+ | ✅ Handles ES modules |
| Vite | All versions | ✅ Native ES modules |
| esbuild | All versions | ✅ Handles ES modules |

## Benefits

### For Library Consumers

1. **Zero Setup** - Install and use immediately
2. **No Build Step** - Instant feedback during development
3. **Debugging** - Source code matches runtime code
4. **Flexibility** - Works with or without a bundler
5. **Modern** - Leverages native browser capabilities

### For Library Maintainers

1. **Simple Structure** - Files in root, no dist/ folder
2. **Easy Testing** - Test directly without building
3. **Clear Imports** - Explicit `.js` extensions
4. **No Transpilation** - Modern JavaScript output
5. **Smaller Package** - No source maps or build artifacts

## Verification Checklist

✅ All imports use relative paths  
✅ All imports end with `.js` extension  
✅ No imports reference `.ts` files  
✅ Files compile to root directory (not dist/)  
✅ Package.json exports point to root files  
✅ No build step required for consumers  
✅ Works in browsers with import maps  
✅ Works in Node.js with ES modules  
✅ Works in Deno natively  
✅ Compatible with bundlers  

## Steering Principle

This implementation follows the steering principle in `.kiro/steering/buildless-workflow.md`:

> This library is designed to work seamlessly with consumers who use a buildless workflow - no build step, no bundler, just native ES modules with import maps.

## References

- [ES Modules in Browsers](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [Import Maps Specification](https://github.com/WICG/import-maps)
- [Node.js ES Modules](https://nodejs.org/api/esm.html)
- [Package.json Exports](https://nodejs.org/api/packages.html#exports)
