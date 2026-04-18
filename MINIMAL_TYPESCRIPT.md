# Minimal TypeScript Configuration

This document demonstrates the minimal TypeScript approach used in this project.

## Philosophy

TypeScript is used minimally - the compiled JavaScript looks almost identical to the TypeScript source, just without type annotations. This makes debugging easier and eliminates the need for source maps.

## Configuration

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ESNext",           // Modern JS, no transpilation
    "module": "ESNext",            // Native ES modules
    "lib": ["ESNext"],             // Modern JS APIs
    "declaration": true,           // Generate .d.ts files
    "declarationMap": false,       // No .d.ts.map files
    "sourceMap": false,            // No .js.map files
    "strict": true                 // Full type safety
  }
}
```

### Key Settings

- **target: ESNext** - Generates modern JavaScript without transpilation
- **sourceMap: false** - No source maps needed when JS matches TS
- **declarationMap: false** - No declaration maps needed

## Comparison: TypeScript vs Compiled JavaScript

### TypeScript Source

```typescript
export function flatToNested(groups: Record<string, string | undefined>): any {
  const result: any = {};
  
  for (const [key, value] of Object.entries(groups)) {
    if (value === undefined) continue;
    
    const parts = key.split('.');
    let current = result;
    
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }
    
    current[parts[parts.length - 1]] = value;
  }
  
  return result;
}
```

### Compiled JavaScript

```javascript
export function flatToNested(groups) {
    const result = {};
    for (const [key, value] of Object.entries(groups)) {
        if (value === undefined)
            continue;
        const parts = key.split('.');
        let current = result;
        for (let i = 0; i < parts.length - 1; i++) {
            if (!current[parts[i]]) {
                current[parts[i]] = {};
            }
            current = current[parts[i]];
        }
        current[parts[parts.length - 1]] = value;
    }
    return result;
}
```

### Differences

The only differences are:
1. Type annotations removed (`: Record<string, string | undefined>`, `: any`)
2. Slight formatting differences (indentation)

**The logic is identical** - making debugging straightforward without source maps.

## Benefits

### 1. Easy Debugging
When an error occurs in production, the line numbers and code structure match the source exactly. No need to configure source maps or deal with mapping issues.

### 2. Smaller Build Artifacts
No `.map` files means:
- Fewer files to manage
- Smaller npm package size
- Cleaner repository

### 3. Faster Builds
Less transformation means faster compilation:
- No source map generation
- No code transpilation
- Just type stripping

### 4. Forward-Compatible
Using ESNext means:
- Modern JavaScript features
- No legacy polyfills
- Consumers can transpile if needed for older environments

### 5. Transparent Output
Developers can easily understand what the compiled code will be by just mentally removing type annotations.

## Trade-offs

### Requires Modern JavaScript Environment

This library requires an environment that supports:
- ES modules (`import`/`export`)
- Modern JavaScript features (optional chaining, nullish coalescing, etc.)
- Typically Node.js 14+ or modern browsers

### No Automatic Polyfills

The library doesn't include polyfills for older environments. Consumers who need to support older environments should:
1. Use a bundler (webpack, rollup, etc.)
2. Configure their own transpilation
3. Add polyfills as needed

This is intentional - it keeps the library small and lets consumers control their own build pipeline.

## Package.json Configuration

The `files` array excludes `.map` files:

```json
{
  "files": [
    "index.js",
    "index.d.ts",
    "template.js",
    "template.d.ts",
    "types/",
    "README.md",
    "LICENSE"
  ]
}
```

Note: No `*.map` files included.

## Verification

After building, verify no `.map` files exist:

```bash
npm run build
find . -name "*.map" -not -path "./node_modules/*"
# Should return nothing
```

## Steering Principle

This configuration follows the steering principle in `.kiro/steering/minimal-typescript.md`:

> TypeScript should be used minimally - the compiled JavaScript should look almost identical to the TypeScript source, just without type annotations.
