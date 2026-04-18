# nested-regex-groups

[![npm version](https://img.shields.io/npm/v/nested-regex-groups.svg)](https://www.npmjs.com/package/nested-regex-groups)
[![CI](https://github.com/bahrus/nested-regex-groups/workflows/CI/badge.svg)](https://github.com/bahrus/nested-regex-groups/actions)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/nested-regex-groups)](https://bundlephobia.com/package/nested-regex-groups)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A lightweight TypeScript library that extends JavaScript's regular expressions with **dot notation** in capture group names to produce nested object structures.

## Why?

Standard regex named capture groups return flat objects:

```javascript
const match = 'john@example.com'.match(/^(?<name>\w+)@(?<domain>\w+\.\w+)$/);
console.log(match.groups);
// { name: 'john', domain: 'example.com' }
```

With `nested-regex-groups`, use **dot notation** to create nested structures:

```javascript
import { rx } from 'nested-regex-groups/template';

const parser = rx`^(?<user.name>\w+)@(?<user.domain>\w+\.\w+)$`;
const result = parser('john@example.com');

console.log(result.value);
// { user: { name: 'john', domain: 'example.com' } }
```

## Installation

```bash
npm install nested-regex-groups
```

## Features

- ✨ **Dot notation** in capture group names: `(?<user.name>...)` → `{ user: { name: ... } }`
- 🎯 **Multiple pattern matching**: Try patterns in priority order
- 📦 **Zero dependencies**: Tiny footprint
- 🔒 **Type-safe**: Full TypeScript support with type inference
- 🚀 **Fast**: Minimal overhead over native regex
- 🧩 **Composable**: Build complex parsers from simple patterns

## Quick Start

### JSON Config (Recommended for Runtime)

Perfect for configuration-driven applications:

```typescript
import { parsePatterns } from 'nested-regex-groups';

// Load from JSON file
const config = {
  patterns: [
    {
      name: 'email',
      pattern: '^(?<user.name>\\w+)@(?<user.domain>\\w+)$'
    }
  ]
};

const parser = parsePatterns(config.patterns);
const result = parser('john@example.com');
// { user: { name: 'john', domain: 'example.com' } }
```

### Template Tag (Recommended for Code)

The cleanest way for code-based patterns:

```typescript
import { rx } from 'nested-regex-groups/template';

const parser = rx`^(?<person.name.first>\w+)\s+(?<person.name.last>\w+)$`;
const result = parser('John Doe');

if (result.success) {
  console.log(result.value);
  // { person: { name: { first: 'John', last: 'Doe' } } }
}
```

### Multiple Patterns

```typescript
import { rxParser, rxPattern } from 'nested-regex-groups/template';

const parser = rxParser([
  rxPattern('email')`^(?<user.name>\w+)@(?<user.domain>\w+\.\w+)$`,
  rxPattern('username')`^(?<user.name>\w+)$`
]);

const result1 = parser('john@example.com');
// { success: true, pattern: 'email', value: { user: { name: 'john', domain: 'example.com' } } }

const result2 = parser('john');
// { success: true, pattern: 'username', value: { user: { name: 'john' } } }
```

## API

### Statements Parsing (Multiple Statements in Paragraphs)

Parse paragraphs containing multiple statements separated by periods, with support for nested object structures.

#### `splitStatements(input)`

Splits a paragraph into individual statements based on period delimiters.

```typescript
import { splitStatements } from 'nested-regex-groups';

const statements = splitStatements('First. Second. Third.');
// ['First', 'Second', 'Third']

// Handles optional chaining and escaped periods
splitStatements('Check #obj?.prop. Use file\\.txt.');
// ['Check #obj?.prop', 'Use file.txt']
```

**Rules:**
- Splits on `.` followed by whitespace or end of string
- Ignores `?.` (optional chaining)
- Ignores `\.` (escaped period - becomes `.` in output)
- Trailing period on last statement is optional

#### `parseGroupedCaptures(input, patternConfigs, options?)`

Parses a single statement using flat group patterns (no dots in group names).

```typescript
import { parseGroupedCaptures } from 'nested-regex-groups';

const patterns = [
  { name: 'comparison', pattern: '^(?<trigger>on|off)\\s+when\\s+(?<lhs>#\\w+)\\s+eq\\s+(?<rhs>#\\w+)$' }
];

const result = parseGroupedCaptures('on when #foo eq #bar', patterns);
// { success: true, pattern: 'comparison', value: { trigger: 'on', lhs: '#foo', rhs: '#bar' } }
```

**Use when:** You need flat objects without nesting.

#### `parseGroupedCaptureStatements(input, patternConfigs, options?)`

Parses multiple statements with flat group patterns.

```typescript
import { parseGroupedCaptureStatements } from 'nested-regex-groups';

const patterns = [
  { name: 'comparison', pattern: '^(?<trigger>on|off)\\s+when\\s+(?<lhs>#\\w+)\\s+eq\\s+(?<rhs>#\\w+)$' },
  { name: 'boolean', pattern: '^(?<trigger>on|off)\\s+when\\s+(?<lhs>#\\w+)$' }
];

const result = parseGroupedCaptureStatements('on when #foo eq #bar. off when #baz.', patterns);
// {
//   success: true,
//   statements: [
//     { pattern: 'comparison', value: { trigger: 'on', lhs: '#foo', rhs: '#bar' } },
//     { pattern: 'boolean', value: { trigger: 'off', lhs: '#baz' } }
//   ]
// }
```

#### `parsePatternStatements(input, patternConfigs, options?)`

Parses multiple statements with nested group patterns (dots in group names).

```typescript
import { parsePatternStatements } from 'nested-regex-groups';

const patterns = [
  { name: 'comparison', pattern: '^(?<trigger>on|off)\\s+when\\s+(?<lhs.id>#\\w+)\\s+eq\\s+(?<rhs.id>#\\w+)$' }
];

const result = parsePatternStatements('on when #foo eq #bar. off when #baz.', patterns);
// {
//   success: true,
//   statements: [
//     { pattern: 'comparison', value: { trigger: 'on', lhs: { id: '#foo' }, rhs: { id: '#bar' } } },
//     { pattern: 'comparison', value: { trigger: 'off', lhs: { id: '#baz' }, rhs: { id: '#baz' } } }
//   ]
// }
```

**Use when:** You need nested objects from multiple statements.

#### `parseParagraph(input, patternConfigs, options?)`

Convenience alias for `parsePatternStatements` (the most common use case).

```typescript
import { parseParagraph } from 'nested-regex-groups';

const result = parseParagraph('on when #foo eq #bar. off when #baz.', patterns);
```

#### `StatementsResult<T>`

Return type for statements parsing functions:

```typescript
interface StatementsResult<T = any> {
  success: boolean;  // true if all statements parsed successfully
  statements: Array<{
    pattern?: string;   // Name of matched pattern
    value?: T;          // Parsed value (if successful)
    error?: string;     // Error message (if failed)
    matched?: string;   // Matched text
  }>;
}
```

**Example: Real-world be-switched paragraph**

```typescript
import { parsePatternStatements } from 'nested-regex-groups';

const patterns = [
  {
    name: 'fullComparison',
    pattern: '^(?<trigger>on|off)\\s+when\\s+(?<lhs.id>#\\w+)(?:::(?<lhs.event>\\w+))?(?:\\?\\.(?<lhs.prop>\\w+))?\\s+(?<op>eq|gt|lt)\\s+(?<rhs.id>#\\w+)(?:::(?<rhs.event>\\w+))?(?:\\?\\.(?<rhs.prop>\\w+))?$'
  }
];

const paragraph = 'on when #lhs::change?.weight gt #rhs?.weight. off when #brother::change?.height lt #sister::input?.height.';
const result = parsePatternStatements(paragraph, patterns);

// {
//   success: true,
//   statements: [
//     {
//       pattern: 'fullComparison',
//       value: {
//         trigger: 'on',
//         lhs: { id: '#lhs', event: 'change', prop: 'weight' },
//         op: 'gt',
//         rhs: { id: '#rhs', prop: 'weight' }
//       }
//     },
//     {
//       pattern: 'fullComparison',
//       value: {
//         trigger: 'off',
//         lhs: { id: '#brother', event: 'change', prop: 'height' },
//         op: 'lt',
//         rhs: { id: '#sister', event: 'input', prop: 'height' }
//       }
//     }
//   ]
// }
```

See [examples/statements-usage.ts](./examples/statements-usage.ts) for more examples.

### Runtime Parsing (Recommended for JSON Config)

#### `parsePattern(patternString, name?)`

Parses a regex pattern string with dot notation and creates a parser. Perfect for loading patterns from JSON config files.

```typescript
import { parsePattern } from 'nested-regex-groups';

// From JSON config
const config = { pattern: "^(?<user.name>\\w+)@(?<user.domain>\\w+)$" };
const parser = parsePattern(config.pattern);
const result = parser('john@example.com');
```

**Parameters:**
- `patternString: string` - Regex pattern with dots in group names
- `name?: string` - Optional name for error messages

**Use when:**
- Loading patterns from JSON files
- Patterns stored as strings in config
- Dynamic pattern loading at runtime

#### `parsePatterns(patternConfigs, options?)`

Creates a multi-pattern parser from JSON-like configuration objects.

```typescript
import { parsePatterns } from 'nested-regex-groups';

const config = {
  patterns: [
    { name: 'email', pattern: "^(?<user.name>\\w+)@(?<user.domain>\\w+)$" },
    { name: 'username', pattern: "^(?<user.name>\\w+)$" }
  ]
};

const parser = parsePatterns(config.patterns);
```

**Use when:**
- Loading multiple patterns from JSON
- Configuration-driven applications
- Patterns need to be updated without code changes

See [JSON_CONFIG.md](./JSON_CONFIG.md) for complete guide.

### Template Tag API (Recommended for Code)

#### `rx`

Template tag for creating single-pattern parsers with dot notation.

```typescript
import { rx } from 'nested-regex-groups/template';

const parser = rx`^(?<user.name>\w+)@(?<user.domain>\w+)$`;
const result = parser('john@example.com');
```

**Benefits:**
- Clean syntax with dots directly in the pattern
- Automatically handles `String.raw` behavior
- No manual groupMap needed

**Use when:**
- Patterns are part of your code
- You want type inference and IDE support
- Patterns rarely change

#### `rxPattern`

Creates a pattern definition for use with `rxParser`.

```typescript
import { rxPattern } from 'nested-regex-groups/template';

const emailPattern = rxPattern('email', 'Email address')`^(?<user.name>\w+)@(?<user.domain>\w+)$`;
```

#### `rxParser`

Creates a multi-pattern parser from rxPattern definitions.

```typescript
import { rxParser, rxPattern } from 'nested-regex-groups/template';

const parser = rxParser([
  rxPattern('email')`^(?<user.name>\w+)@(?<user.domain>\w+)$`,
  rxPattern('username')`^(?<user.name>\w+)$`
]);
```

See [TEMPLATE_TAG.md](./TEMPLATE_TAG.md) for complete guide.

### Core API (Advanced Use)

#### `nestedRegex(pattern, options?)`

Creates a parser from a single regex pattern with manual groupMap.

**Parameters:**
- `pattern: RegExp` - Regular expression with named capture groups (use underscores, not dots)
- `options?: NestedRegexOptions` - Options including name and groupMap

**Returns:** `(input: string) => ParseResult`

**Example:**
```typescript
import { nestedRegex } from 'nested-regex-groups';

// Use underscores in regex, map to dots via groupMap
const parser = nestedRegex(/^(?<lhs_id>#\w+)\s+eq\s+(?<rhs_id>#\w+)$/, {
  name: 'comparison',
  groupMap: { lhs_id: 'lhs.id', rhs_id: 'rhs.id' }
});

const result = parser('#foo eq #bar');
// { lhs: { id: '#foo' }, rhs: { id: '#bar' } }
```

**Note:** For cleaner syntax, use `rx` template tag or `parsePattern()` instead.

### `createParser(patterns, options?)`

Creates a parser that tries multiple patterns in order.

**Parameters:**
- `patterns: ParsePattern[]` - Array of pattern definitions
- `options?: ParserOptions` - Parser options

**Returns:** `(input: string) => ParseResult & { pattern?: string }`

**Example:**
```typescript
import { createParser } from 'nested-regex-groups';

const parser = createParser([
  { 
    name: 'full', 
    regex: /^(?<a>\w+)\s+(?<b>\w+)$/
  },
  { 
    name: 'simple', 
    regex: /^(?<a>\w+)$/
  }
]);
```

### `tryPatterns(input, patterns, options?)`

Tries multiple patterns against input (used internally by `createParser`).

**Parameters:**
- `input: string` - String to parse
- `patterns: ParsePattern[]` - Array of patterns to try
- `options?: ParserOptions` - Parser options

**Returns:** `ParseResult & { pattern?: string }`

### `flatToNested(groups)`

Utility function to convert flat object with dot-notation keys to nested structure.

**Parameters:**
- `groups: Record<string, string | undefined>` - Flat object with dot-notation keys

**Returns:** Nested object

**Example:**
```typescript
flatToNested({ 'user.name': 'John', 'user.age': '30' });
// { user: { name: 'John', age: '30' } }
```

### `mergeResults(results)`

Merges multiple parse results into a single object.

**Parameters:**
- `results: ParseResult[]` - Array of parse results

**Returns:** `T | null` - Merged object or null if any parse failed

## Types

All TypeScript type definitions are available in a dedicated types module:

```typescript
// Import types from the types module
import type {
  ParseResult,
  ParseSuccess,
  ParseFailure,
  ParsePattern,
  NestedRegexOptions,
  ParserOptions,
  StatementsResult
} from 'nested-regex-groups/types';

// Or import from main module (backward compatible)
import type { ParseResult, ParsePattern } from 'nested-regex-groups';
```

### Type Organization

Types are organized in separate files for better tree-shaking and discoverability:

- `types/nested-regex-groups/parse-result.ts` - ParseResult, ParseSuccess, ParseFailure
- `types/nested-regex-groups/pattern.ts` - ParsePattern, NestedRegexOptions
- `types/nested-regex-groups/options.ts` - ParserOptions
- `types/nested-regex-groups/statements.ts` - StatementsResult

## Types Reference

### `ParseResult<T>`

```typescript
type ParseResult<T> = ParseSuccess<T> | ParseFailure;

interface ParseSuccess<T> {
  success: true;
  value: T;
  matched: string;  // The portion of input that matched
  rest: string;     // Remaining unparsed input
}

interface ParseFailure {
  success: false;
  error: string;
  position?: number;
}
```

### `ParsePattern`

```typescript
interface ParsePattern {
  name: string;
  regex: RegExp;
  description?: string;
}
```

### `ParserOptions`

```typescript
interface ParserOptions {
  verbose?: boolean;  // Include detailed error messages
}
```

## Real-World Example: be-switched Parser

This library was created to support parsing for [be-switched](https://github.com/bahrus/be-switched), a template behavior for conditional content loading.

```typescript
import { parsePatterns } from 'nested-regex-groups';

// Load from JSON config
const config = {
  patterns: [
    {
      name: 'fullComparison',
      pattern: '^(?<trigger>on|off)\\s+when\\s+(?<lhs.id>#\\w+)(?:::(?<lhs.event>\\w+))?(?:\\?\\.(?<lhs.prop>\\w+))?\\s+(?<op>equals|eq|lt|gt)\\s+(?<rhs.id>#\\w+)(?:::(?<rhs.event>\\w+))?(?:\\?\\.(?<rhs.prop>\\w+))?$',
      description: 'Comparison with events and properties'
    },
    {
      name: 'simpleComparison',
      pattern: '^(?<trigger>on|off)\\s+when\\s+(?<lhs.id>#\\w+)\\s+(?<op>equals|eq)\\s+(?<rhs.id>#\\w+)$',
      description: 'Simple comparison'
    },
    {
      name: 'booleanCondition',
      pattern: '^(?<trigger>on|off)\\s+when\\s+(?<lhs.id>#\\w+)$',
      description: 'Boolean condition'
    }
  ]
};

const beSwitchedParser = parsePatterns(config.patterns);

// Parse: "on when #lhs::change?.weight gt #rhs?.weight"
const result = beSwitchedParser('on when #lhs::change?.weight gt #rhs?.weight');

console.log(result);
// {
//   success: true,
//   pattern: 'fullComparison',
//   value: {
//     trigger: 'on',
//     lhs: { id: '#lhs', event: 'change', prop: 'weight' },
//     op: 'gt',
//     rhs: { id: '#rhs', prop: 'weight' }
//   }
// }
```

## Design Philosophy

### Why Array of Patterns?

For complex grammars, a **single monolithic regex** becomes:
- ❌ Unreadable (500+ characters)
- ❌ Unmaintainable (one change breaks everything)
- ❌ Poor error messages
- ❌ Difficult to extend

An **array of patterns** provides:
- ✅ Readable (each pattern ~100 chars)
- ✅ Maintainable (modify one pattern at a time)
- ✅ Better errors (know which pattern failed)
- ✅ Extensible (add new patterns easily)
- ✅ Testable (test each pattern independently)

Think of it like HTTP routing: Express.js doesn't use one giant regex for all routes—it uses an array of route patterns. Same principle applies here.

## Inspiration

This library was inspired by:
- **Raku (Perl 6) Grammars** - The gold standard for nested regex captures
- **Parser Combinators** - Composable parsing approach
- **be-switched** - Real-world need for declarative string parsing

## License

MIT © Bruce B. Anderson

## Contributing

Contributions welcome! Please open an issue or PR on [GitHub](https://github.com/bahrus/nested-regex-groups).
