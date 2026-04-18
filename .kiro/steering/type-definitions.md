---
inclusion: auto
---

# Type Definitions Principles

## Philosophy

Type definitions should be separated from implementation code and consolidated into `.d.ts` files that don't compile to JavaScript. This enables:

1. **JSDoc imports** - JavaScript consumers can import types via comments
2. **No empty .js files** - Pure type files don't generate useless JavaScript
3. **Clear separation** - Types are distinct from implementation
4. **Easy discovery** - Single file for all public types

## Structure

### Single types.d.ts File

All public type definitions should be in `types.d.ts`:

```typescript
// types.d.ts
export interface ParseResult<T> { ... }
export interface ParsePattern { ... }
export interface ParserOptions { ... }
// etc.
```

**Benefits:**
- ✅ Single import location for consumers
- ✅ No compilation to .js (it's already .d.ts)
- ✅ Easy to use in JSDoc comments
- ✅ Clear public API surface

### Implementation Files

Implementation files (`.ts` that compile to `.js`) import and re-export types:

```typescript
// index.ts
export type { ParseResult, ParsePattern } from './types.js';

import type { ParseResult, ParsePattern } from './types.js';

export function nestedRegex(...): ParseResult {
  // implementation
}
```

## Usage Patterns

### TypeScript Consumers

```typescript
import { nestedRegex, type ParseResult } from 'nested-regex-groups';

const result: ParseResult = nestedRegex(/pattern/)('input');
```

### JavaScript Consumers (JSDoc)

```javascript
/**
 * @typedef {import('nested-regex-groups').ParseResult} ParseResult
 * @typedef {import('nested-regex-groups').ParsePattern} ParsePattern
 */

/**
 * @param {string} input
 * @returns {ParseResult}
 */
function parse(input) {
  // implementation
}
```

### Direct Type Import

```typescript
import type { ParseResult, ParsePattern } from 'nested-regex-groups/types.js';
```

## Rules

### ✅ DO

1. **Put all public types in types.d.ts**
   - Interfaces consumers will use
   - Type aliases for public API
   - Exported types

2. **Use .d.ts extension for pure types**
   - Files with only type definitions
   - No runtime code
   - No side effects

3. **Re-export types from main module**
   - Makes types available from main import
   - Maintains backward compatibility
   - Convenient for consumers

4. **Import types with .js extension**
   ```typescript
   import type { ParseResult } from './types.js';
   ```
   Even though the file is `types.d.ts`, import as `.js` for module resolution

### ❌ DON'T

1. **Don't create separate .ts files for each type**
   ```
   ❌ parse-result.ts  (compiles to empty .js)
   ❌ pattern.ts       (compiles to empty .js)
   ❌ options.ts       (compiles to empty .js)
   ```

2. **Don't mix types and implementation in the same file**
   - Keep types in types.d.ts
   - Keep implementation in .ts files

3. **Don't create .ts files that only export types**
   - They compile to empty .js files
   - Wastes space in npm package
   - Confusing for consumers

## File Structure

```
nested-regex-groups/
├── types.d.ts           # All type definitions (no .js generated)
├── index.ts             # Main implementation
├── index.js             # Compiled implementation
├── index.d.ts           # Generated types (re-exports from types.d.ts)
├── template.ts          # Template implementation
├── template.js          # Compiled template
└── template.d.ts        # Generated types
```

## TypeScript Configuration

Ensure TypeScript doesn't try to compile `.d.ts` files:

```json
{
  "compilerOptions": {
    "declaration": true
  },
  "include": ["*.ts"],
  "exclude": ["**/*.d.ts", "**/*.test.ts"]
}
```

**Note:** `.d.ts` files are automatically excluded by TypeScript, but explicit exclusion makes intent clear.

## Package.json

Only include necessary files:

```json
{
  "files": [
    "index.js",
    "index.d.ts",
    "template.js",
    "template.d.ts",
    "types.d.ts",
    "README.md",
    "LICENSE"
  ]
}
```

**Note:** No empty `.js` files from pure type definitions!

## Benefits

### For Library Maintainers

- ✅ **Cleaner structure** - One file for all types
- ✅ **Smaller package** - No empty .js files
- ✅ **Easier maintenance** - Single source of truth for types
- ✅ **Clear API** - types.d.ts shows public interface

### For Library Consumers

- ✅ **JSDoc support** - Easy to use in JavaScript
- ✅ **Single import** - All types from one place
- ✅ **Better IDE support** - Clear type definitions
- ✅ **Smaller download** - No unnecessary files

## Example: JSDoc Usage

JavaScript consumers can use types without TypeScript:

```javascript
// my-app.js

/**
 * @typedef {import('nested-regex-groups').ParseResult} ParseResult
 * @typedef {import('nested-regex-groups').ParsePattern} ParsePattern
 */

const { nestedRegex } = require('nested-regex-groups');

/**
 * Parse an email address
 * @param {string} email
 * @returns {ParseResult<{user: {name: string, domain: string}}>}
 */
function parseEmail(email) {
  const parser = nestedRegex(/^(?<user_name>\w+)@(?<user_domain>\w+)$/, {
    groupMap: { user_name: 'user.name', user_domain: 'user.domain' }
  });
  return parser(email);
}
```

## Migration from Separate Type Files

If you have separate type files:

1. **Create types.d.ts** with all type definitions
2. **Update imports** in implementation files to use `./types.js`
3. **Delete old type files** (parse-result.ts, pattern.ts, etc.)
4. **Update package.json** files array
5. **Rebuild and test**

## Related Principles

- [Type Organization](.kiro/steering/type-organization.md)
- [Minimal TypeScript](.kiro/steering/minimal-typescript.md)
- [Commit Compiled Files](.kiro/steering/commit-compiled-files.md)
