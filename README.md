# nested-regex-groups

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
import { nestedRegex } from 'nested-regex-groups';

const parser = nestedRegex(/^(?<user.name>\w+)@(?<user.domain>\w+\.\w+)$/);
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

### Single Pattern

```typescript
import { nestedRegex } from 'nested-regex-groups';

const parser = nestedRegex(/^(?<person.name.first>\w+)\s+(?<person.name.last>\w+)$/);
const result = parser('John Doe');

if (result.success) {
  console.log(result.value);
  // { person: { name: { first: 'John', last: 'Doe' } } }
}
```

### Multiple Patterns (Recommended)

For complex grammars, use an array of patterns tried in priority order:

```typescript
import { createParser } from 'nested-regex-groups';

const parser = createParser([
  {
    name: 'email',
    regex: /^(?<user.name>\w+)@(?<user.domain>\w+\.\w+)$/,
    description: 'Email address'
  },
  {
    name: 'username',
    regex: /^(?<user.name>\w+)$/,
    description: 'Simple username'
  }
]);

const result1 = parser('john@example.com');
// { success: true, pattern: 'email', value: { user: { name: 'john', domain: 'example.com' } } }

const result2 = parser('john');
// { success: true, pattern: 'username', value: { user: { name: 'john' } } }
```

## API

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

Creates a parser from a single regex pattern.

**Parameters:**
- `pattern: RegExp` - Regular expression with named capture groups (supports dot notation)
- `name?: string` - Optional name for error messages

**Returns:** `(input: string) => ParseResult`

**Example:**
```typescript
const parser = nestedRegex(/^(?<lhs.id>#\w+)\s+eq\s+(?<rhs.id>#\w+)$/, 'comparison');
const result = parser('#foo eq #bar');
```

### `createParser(patterns, options?)`

Creates a parser that tries multiple patterns in order.

**Parameters:**
- `patterns: ParsePattern[]` - Array of pattern definitions
- `options?: ParserOptions` - Parser options

**Returns:** `(input: string) => ParseResult & { pattern?: string }`

**Example:**
```typescript
const parser = createParser([
  { name: 'full', regex: /^(?<a>\w+)\s+(?<b>\w+)$/ },
  { name: 'simple', regex: /^(?<a>\w+)$/ }
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
import { createParser } from 'nested-regex-groups';

const beSwitchedParser = createParser([
  {
    name: 'fullComparison',
    regex: /^(?<trigger>on|off)\s+when\s+(?<lhs.id>#\w+)(?:::(?<lhs.event>\w+))?(?:\?\.(?<lhs.prop>\w+))?\s+(?<op>equals|eq|lt|gt)\s+(?<rhs.id>#\w+)(?:::(?<rhs.event>\w+))?(?:\?\.(?<rhs.prop>\w+))?$/,
    description: 'Comparison with events and properties'
  },
  {
    name: 'simpleComparison',
    regex: /^(?<trigger>on|off)\s+when\s+(?<lhs.id>#\w+)\s+(?<op>equals|eq)\s+(?<rhs.id>#\w+)$/,
    description: 'Simple comparison'
  },
  {
    name: 'booleanCondition',
    regex: /^(?<trigger>on|off)\s+when\s+(?<lhs.id>#\w+)$/,
    description: 'Boolean condition'
  }
]);

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
