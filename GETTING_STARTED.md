# Getting Started with nested-regex-groups

## Installation

```bash
npm install nested-regex-groups
```

## Quick Start

### The Problem

JavaScript's regex named capture groups return flat objects:

```javascript
const match = 'john@example.com'.match(/^(?<name>\w+)@(?<domain>\w+\.\w+)$/);
console.log(match.groups);
// { name: 'john', domain: 'example.com' }
```

### The Solution

Use `nested-regex-groups` to create nested structures using a `groupMap`:

```typescript
import { nestedRegex } from 'nested-regex-groups';

const parser = nestedRegex(/^(?<user_name>\w+)@(?<user_domain>\w+\.\w+)$/, {
  groupMap: { 
    user_name: 'user.name', 
    user_domain: 'user.domain' 
  }
});

const result = parser('john@example.com');
console.log(result.value);
// { user: { name: 'john', domain: 'example.com' } }
```

## Core Concepts

### 1. Group Mapping

Since JavaScript regex doesn't support dots in capture group names, use underscores in your regex and map them to dot notation:

```typescript
// Regex uses underscores: user_name, user_domain
const regex = /^(?<user_name>\w+)@(?<user_domain>\w+)$/;

// Map to dot notation for nested structure
const groupMap = {
  user_name: 'user.name',
  user_domain: 'user.domain'
};
```

### 2. Single Pattern Parsing

Use `nestedRegex()` for a single pattern:

```typescript
import { nestedRegex } from 'nested-regex-groups';

const parser = nestedRegex(/^(?<person_name_first>\w+)\s+(?<person_name_last>\w+)$/, {
  groupMap: {
    person_name_first: 'person.name.first',
    person_name_last: 'person.name.last'
  }
});

const result = parser('John Doe');
// result.value = { person: { name: { first: 'John', last: 'Doe' } } }
```

### 3. Multiple Pattern Parsing (Recommended)

For complex grammars, use `createParser()` with an array of patterns:

```typescript
import { createParser } from 'nested-regex-groups';

const parser = createParser([
  {
    name: 'email',
    regex: /^(?<user_name>\w+)@(?<user_domain>\w+)$/,
    groupMap: { user_name: 'user.name', user_domain: 'user.domain' },
    description: 'Email address'
  },
  {
    name: 'username',
    regex: /^(?<user_name>\w+)$/,
    groupMap: { user_name: 'user.name' },
    description: 'Simple username'
  }
]);

const result1 = parser('john@example.com');
// result1.pattern = 'email'
// result1.value = { user: { name: 'john', domain: 'example.com' } }

const result2 = parser('jane');
// result2.pattern = 'username'
// result2.value = { user: { name: 'jane' } }
```

## Pattern Priority

Patterns are tried in order. Put more specific patterns first:

```typescript
const parser = createParser([
  // ✅ Specific pattern first
  { name: 'email', regex: /^(?<user_name>\w+)@(?<user_domain>\w+)$/ },
  
  // ✅ General pattern last
  { name: 'username', regex: /^(?<user_name>\w+)$/ }
]);
```

## Error Handling

### Basic Errors

```typescript
const result = parser('invalid-input');

if (!result.success) {
  console.log(result.error);
  // "No pattern matched input: "invalid-input""
}
```

### Verbose Errors

Enable verbose mode to see which patterns were tried:

```typescript
const parser = createParser(patterns, { verbose: true });
const result = parser('invalid-input');

if (!result.success) {
  console.log(result.error);
  // "No pattern matched. Tried:
  // email: Pattern 'email' did not match
  // username: Pattern 'username' did not match"
}
```

## Real-World Example: be-switched Parser

```typescript
import { createParser, type ParsePattern } from 'nested-regex-groups';

const beSwitchedPatterns: ParsePattern[] = [
  {
    name: 'simpleComparison',
    regex: /^(?<trigger>on|off)\s+when\s+(?<lhs_id>#\w+)\s+(?<op>eq|lt|gt)\s+(?<rhs_id>#\w+)$/,
    groupMap: {
      lhs_id: 'lhs.id',
      rhs_id: 'rhs.id'
    }
  },
  {
    name: 'fullComparison',
    regex: /^(?<trigger>on|off)\s+when\s+(?<lhs_id>#\w+)(?:::(?<lhs_event>\w+))?\s+(?<op>eq|lt|gt)\s+(?<rhs_id>#\w+)(?:::(?<rhs_event>\w+))?$/,
    groupMap: {
      lhs_id: 'lhs.id',
      lhs_event: 'lhs.event',
      rhs_id: 'rhs.id',
      rhs_event: 'rhs.event'
    }
  },
  {
    name: 'boolean',
    regex: /^(?<trigger>on|off)\s+when\s+(?<lhs_id>#\w+)$/,
    groupMap: {
      lhs_id: 'lhs.id'
    }
  }
];

const parser = createParser(beSwitchedPatterns);

// Parse: "on when #lhs::change eq #rhs::input"
const result = parser('on when #lhs::change eq #rhs::input');

console.log(result);
// {
//   success: true,
//   pattern: 'fullComparison',
//   value: {
//     trigger: 'on',
//     lhs: { id: '#lhs', event: 'change' },
//     op: 'eq',
//     rhs: { id: '#rhs', event: 'input' }
//   }
// }
```

## TypeScript Support

Full type inference is supported:

```typescript
interface User {
  name: string;
  domain: string;
}

const parser = nestedRegex<{ user: User }>(/^(?<user_name>\w+)@(?<user_domain>\w+)$/, {
  groupMap: { user_name: 'user.name', user_domain: 'user.domain' }
});

const result = parser('john@example.com');

if (result.success) {
  // TypeScript knows result.value is { user: User }
  console.log(result.value.user.name); // ✅ Type-safe
}
```

## Best Practices

### 1. Use Descriptive Group Names

```typescript
// ❌ Bad: unclear names
{ user_n: 'user.name', user_d: 'user.domain' }

// ✅ Good: clear names
{ user_name: 'user.name', user_domain: 'user.domain' }
```

### 2. Order Patterns by Specificity

```typescript
// ✅ Most specific first
[
  { name: 'emailWithPlus', regex: /^(?<name>\w+)\+(?<tag>\w+)@(?<domain>\w+)$/ },
  { name: 'email', regex: /^(?<name>\w+)@(?<domain>\w+)$/ },
  { name: 'username', regex: /^(?<name>\w+)$/ }
]
```

### 3. Use Verbose Mode During Development

```typescript
// Development
const devParser = createParser(patterns, { verbose: true });

// Production
const prodParser = createParser(patterns);
```

### 4. Add Descriptions to Patterns

```typescript
{
  name: 'email',
  regex: /^(?<user_name>\w+)@(?<user_domain>\w+)$/,
  groupMap: { user_name: 'user.name', user_domain: 'user.domain' },
  description: 'Email address with username and domain' // ✅ Helpful!
}
```

## Next Steps

- Check out the [examples](./examples/) directory for more use cases
- Read the [API documentation](./README.md#api) for detailed reference
- See [Specs.md](./Specs.md) for the design rationale

## Parsing Multiple Statements (Paragraphs)

For parsing paragraphs containing multiple statements separated by periods:

### Basic Statement Splitting

```typescript
import { splitStatements } from 'nested-regex-groups';

const statements = splitStatements('First statement. Second statement. Third statement.');
// ['First statement', 'Second statement', 'Third statement']

// Handles optional chaining and escaped periods
splitStatements('Check #obj?.prop. Use file\\.txt. Done.');
// ['Check #obj?.prop', 'Use file.txt', 'Done']
```

### Parsing Multiple Statements with Nested Groups

```typescript
import { parsePatternStatements } from 'nested-regex-groups';

const patterns = [
  {
    name: 'comparison',
    pattern: '^(?<trigger>on|off)\\s+when\\s+(?<lhs.id>#\\w+)\\s+eq\\s+(?<rhs.id>#\\w+)$'
  },
  {
    name: 'boolean',
    pattern: '^(?<trigger>on|off)\\s+when\\s+(?<lhs.id>#\\w+)$'
  }
];

const paragraph = 'on when #foo eq #bar. off when #baz.';
const result = parsePatternStatements(paragraph, patterns);

console.log(result);
// {
//   success: true,
//   statements: [
//     {
//       pattern: 'comparison',
//       value: { trigger: 'on', lhs: { id: '#foo' }, rhs: { id: '#bar' } }
//     },
//     {
//       pattern: 'boolean',
//       value: { trigger: 'off', lhs: { id: '#baz' } }
//     }
//   ]
// }
```

### Using parseParagraph Alias

```typescript
import { parseParagraph } from 'nested-regex-groups';

// parseParagraph is an alias for parsePatternStatements
const result = parseParagraph(paragraph, patterns);
```

### Flat Groups (No Nesting)

If you don't need nested objects, use `parseGroupedCaptureStatements`:

```typescript
import { parseGroupedCaptureStatements } from 'nested-regex-groups';

const flatPatterns = [
  {
    name: 'comparison',
    pattern: '^(?<trigger>on|off)\\s+when\\s+(?<lhs>#\\w+)\\s+eq\\s+(?<rhs>#\\w+)$'
  }
];

const result = parseGroupedCaptureStatements('on when #foo eq #bar.', flatPatterns);
// {
//   success: true,
//   statements: [
//     { pattern: 'comparison', value: { trigger: 'on', lhs: '#foo', rhs: '#bar' } }
//   ]
// }
```

### Real-World Example: be-switched Paragraph

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

// Each statement is parsed into a nested object
result.statements.forEach((stmt, i) => {
  console.log(`Statement ${i + 1}:`, stmt.value);
});
// Statement 1: { trigger: 'on', lhs: { id: '#lhs', event: 'change', prop: 'weight' }, ... }
// Statement 2: { trigger: 'off', lhs: { id: '#brother', event: 'change', prop: 'height' }, ... }
```

See [examples/statements-usage.ts](./examples/statements-usage.ts) for more examples.

## Need Help?

- [GitHub Issues](https://github.com/bahrus/nested-regex-groups/issues)
- [Repository](https://github.com/bahrus/nested-regex-groups)
