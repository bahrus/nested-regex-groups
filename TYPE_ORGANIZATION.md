# Type Organization

This document describes the type organization structure implemented in nested-regex-groups.

## Overview

All TypeScript type definitions have been moved to a dedicated `types/nested-regex-groups/` directory for better organization, maintainability, and tree-shaking.

## Directory Structure

```
types/
  nested-regex-groups/
    index.ts              # Barrel export for all types
    parse-result.ts       # ParseResult, ParseSuccess, ParseFailure
    pattern.ts            # ParsePattern, NestedRegexOptions
    options.ts            # ParserOptions
    statements.ts         # StatementsResult
```

## Usage

### Import from Types Module

```typescript
import type {
  ParseResult,
  ParseSuccess,
  ParseFailure,
  ParsePattern,
  NestedRegexOptions,
  ParserOptions,
  StatementsResult
} from 'nested-regex-groups/types';
```

### Import from Main Module (Backward Compatible)

```typescript
import type {
  ParseResult,
  ParsePattern,
  StatementsResult
} from 'nested-regex-groups';
```

Both import methods work identically. The main module re-exports all types for backward compatibility.

## Benefits

1. **Separation of Concerns**: Type definitions are separate from implementation
2. **Better Tree-shaking**: Consumers can import only the types they need
3. **Improved Discoverability**: All types are in a predictable location
4. **Maintainability**: Each type category has its own file
5. **Documentation**: Types are organized logically with clear JSDoc comments

## Type Files

### parse-result.ts

Contains result types for parse operations:
- `ParseSuccess<T>` - Successful parse result
- `ParseFailure` - Failed parse result
- `ParseResult<T>` - Union of success and failure

### pattern.ts

Contains pattern-related types:
- `ParsePattern` - Pattern definition with regex and groupMap
- `NestedRegexOptions` - Options for nestedRegex function

### options.ts

Contains parser options:
- `ParserOptions` - Options for parser creation (verbose mode, etc.)

### statements.ts

Contains types for multi-statement parsing:
- `StatementsResult<T>` - Result type for parsing multiple statements

## Package Exports

The package.json includes a dedicated export for the types module:

```json
{
  "exports": {
    "./types": {
      "types": "./types/nested-regex-groups/index.d.ts",
      "import": "./types/nested-regex-groups/index.js"
    }
  }
}
```

## Migration

This change is **backward compatible**. Existing code that imports types from the main module will continue to work:

```typescript
// Still works!
import type { ParseResult } from 'nested-regex-groups';
```

New code can optionally use the dedicated types import:

```typescript
// New way (optional)
import type { ParseResult } from 'nested-regex-groups/types';
```

## Steering Principle

This organization follows the steering principle documented in `.kiro/steering/type-organization.md`:

> All TypeScript type definitions, interfaces, and type aliases should be organized in a dedicated types submodule for better maintainability and reusability.
