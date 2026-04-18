---
inclusion: auto
---

# Type Organization Principles

## Shared Type Definitions

All TypeScript type definitions, interfaces, and type aliases should be organized in a dedicated types submodule for better maintainability and reusability.

### Structure

```
types/
  nested-regex-groups/
    index.ts          # Main types export
    parse-result.ts   # ParseResult, ParseSuccess, ParseFailure
    pattern.ts        # ParsePattern, NestedRegexOptions
    options.ts        # ParserOptions
    statements.ts     # StatementsResult
```

### Principles

1. **Separation of Concerns**: Type definitions should be separate from implementation
2. **Reusability**: Types can be imported independently without pulling in implementation code
3. **Discoverability**: All types are in a predictable location
4. **Tree-shaking**: Consumers can import only the types they need
5. **Documentation**: Each type file should have clear JSDoc comments

### Implementation Rules

- Move all `export interface` and `export type` declarations to the types folder
- Keep implementation files focused on logic, not type definitions
- Re-export types from main module for backward compatibility
- Use barrel exports (index.ts) for convenient imports

### Example Usage

```typescript
// Consumers can import types directly
import type { ParseResult, ParsePattern } from 'nested-regex-groups/types';

// Or from the main module (re-exported for convenience)
import type { ParseResult } from 'nested-regex-groups';
```

### Migration Steps

1. Create `types/nested-regex-groups/` directory structure
2. Move type definitions to appropriate files in types folder
3. Create barrel export in `types/nested-regex-groups/index.ts`
4. Update main module to re-export types for backward compatibility
5. Update package.json exports to include types path
6. Verify all tests still pass
