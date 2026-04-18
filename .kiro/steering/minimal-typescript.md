---
inclusion: auto
---

# Minimal TypeScript Principles

## Philosophy

TypeScript should be used minimally - the compiled JavaScript should look almost identical to the TypeScript source, just without type annotations. This approach:

1. **Simplifies debugging** - No need for source maps when JS closely matches TS
2. **Reduces build artifacts** - No .map files cluttering the repository
3. **Forward-looking** - Target modern JavaScript (ESNext) for cleaner output
4. **Transparency** - Easy to understand what the compiled code will be

## Configuration Rules

### Target: ESNext

Use `"target": "ESNext"` to:
- Generate modern JavaScript syntax
- Avoid unnecessary transpilation
- Keep output close to source
- Let consumers handle transpilation if needed for older environments

### No Source Maps

Disable source map generation:
- `"sourceMap": false`
- `"declarationMap": false`

**Rationale:** When compiled JS is nearly identical to TS, source maps add little value and create extra files.

### Module: ESNext

Use `"module": "ESNext"` to:
- Generate native ES modules
- Avoid module system transpilation
- Support modern import/export syntax

## TypeScript Usage Guidelines

1. **Use types for safety, not transformation**
   - Types should only add annotations
   - Avoid features that require heavy transpilation
   - Prefer modern JS features over TS-specific syntax

2. **Keep it simple**
   - Use interfaces and type aliases
   - Use type annotations on parameters and returns
   - Avoid decorators, enums (prefer const objects), and other TS-specific features that transform code significantly

3. **Modern JavaScript first**
   - Write code that would work in modern JS
   - Add types as annotations
   - Don't rely on TS to polyfill or transform

## Example

**TypeScript source:**
```typescript
export function parse(input: string): ParseResult {
  const result = input.match(/pattern/);
  return result ? { success: true, value: result } : { success: false };
}
```

**Compiled JavaScript (should be nearly identical):**
```javascript
export function parse(input) {
  const result = input.match(/pattern/);
  return result ? { success: true, value: result } : { success: false };
}
```

## Benefits

- ✅ Easier debugging (JS matches TS line-by-line)
- ✅ Smaller build artifacts (no .map files)
- ✅ Faster builds (less transformation)
- ✅ Cleaner repository (fewer generated files)
- ✅ Forward-compatible (modern JS syntax)
