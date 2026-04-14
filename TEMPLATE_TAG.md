# Template Tag Guide

The template tag syntax is the recommended way to use `nested-regex-groups`. It provides the cleanest API and automatically handles the conversion from dot notation to nested objects.

## Why Template Tags?

Template tags solve the key limitation: **JavaScript regex doesn't support dots in capture group names**.

### The Problem

```javascript
// ❌ This doesn't work in JavaScript
const regex = /^(?<user.name>\w+)$/;  // SyntaxError: Invalid capture group name
```

### The Solution

```javascript
// ✅ Template tag handles the conversion automatically
import { rx } from 'nested-regex-groups/template';

const parser = rx`^(?<user.name>\w+)$`;
// Internally converts to: /^(?<user_name>\w+)$/
// And creates groupMap: { user_name: 'user.name' }
```

## Basic Usage

### Single Pattern

```typescript
import { rx } from 'nested-regex-groups/template';

// Simple nested structure
const emailParser = rx`^(?<user.name>\w+)@(?<user.domain>[\w.]+)$`;
const result = emailParser('john@example.com');

console.log(result.value);
// { user: { name: 'john', domain: 'example.com' } }
```

### Multiple Nesting Levels

```typescript
const personParser = rx`^(?<person.name.first>\w+)\s+(?<person.name.last>\w+)$`;
const result = personParser('John Doe');

console.log(result.value);
// { person: { name: { first: 'John', last: 'Doe' } } }
```

### Template Interpolation

You can interpolate values into the pattern:

```typescript
const idPattern = '#\\w+';
const parser = rx`^(?<lhs.id>${idPattern})\s+eq\s+(?<rhs.id>${idPattern})$`;

const result = parser('#foo eq #bar');
// { lhs: { id: '#foo' }, rhs: { id: '#bar' } }
```

## Multi-Pattern Parsing

For complex grammars, use `rxPattern` and `rxParser`:

```typescript
import { rxParser, rxPattern } from 'nested-regex-groups/template';

const parser = rxParser([
  rxPattern('email', 'Email address')`^(?<user.name>\w+)@(?<user.domain>[\w.]+)$`,
  rxPattern('username', 'Simple username')`^(?<user.name>\w+)$`
]);

const result1 = parser('john@example.com');
// { success: true, pattern: 'email', value: { user: { name: 'john', domain: 'example.com' } } }

const result2 = parser('jane');
// { success: true, pattern: 'username', value: { user: { name: 'jane' } } }
```

## Real-World Example: be-switched

```typescript
import { rxParser, rxPattern } from 'nested-regex-groups/template';

const beSwitchedParser = rxParser([
  rxPattern('simpleComparison')`^(?<trigger>on|off)\s+when\s+(?<lhs.id>#\w+)\s+(?<op>eq|lt|gt)\s+(?<rhs.id>#\w+)$`,
  
  rxPattern('fullComparison')`^(?<trigger>on|off)\s+when\s+(?<lhs.id>#\w+)(?:::(?<lhs.event>\w+))?\s+(?<op>eq|lt|gt)\s+(?<rhs.id>#\w+)(?:::(?<rhs.event>\w+))?$`,
  
  rxPattern('boolean')`^(?<trigger>on|off)\s+when\s+(?<lhs.id>#\w+)$`
]);

// Parse: "on when #lhs::change eq #rhs::input"
const result = beSwitchedParser('on when #lhs::change eq #rhs::input');

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

## String.raw Behavior

Template tags automatically receive raw strings, which preserves backslashes:

```typescript
// ✅ Backslashes are preserved automatically
const parser = rx`^\w+\s+\d+$`;

// Equivalent to:
const manual = /^\w+\s+\d+$/;
```

This is why `String.raw` is not needed with template tags—they handle it for you!

## Comparison: Template Tag vs Manual

### Template Tag (Clean)

```typescript
import { rx } from 'nested-regex-groups/template';

const parser = rx`^(?<user.name>\w+)@(?<user.domain>\w+)$`;
```

### Manual (Verbose)

```typescript
import { nestedRegex } from 'nested-regex-groups';

const parser = nestedRegex(/^(?<user_name>\w+)@(?<user_domain>\w+)$/, {
  groupMap: {
    user_name: 'user.name',
    user_domain: 'user.domain'
  }
});
```

**Same result, but template tag is:**
- ✅ More readable
- ✅ Less boilerplate
- ✅ Fewer chances for typos
- ✅ Dots directly in the pattern

## When to Use Manual API

Use the manual API when you need:
- Dynamic regex construction
- Regex flags (i, g, m, etc.)
- More control over the groupMap
- To work with pre-compiled RegExp objects

```typescript
import { nestedRegex } from 'nested-regex-groups';

// With flags
const regex = new RegExp('^(?<user_name>\\w+)$', 'i');
const parser = nestedRegex(regex, {
  groupMap: { user_name: 'user.name' }
});

// Dynamic construction
const buildParser = (field: string) => {
  return nestedRegex(new RegExp(`^(?<${field}_value>\\w+)$`), {
    groupMap: { [`${field}_value`]: `${field}.value` }
  });
};
```

## TypeScript Support

Full type inference works with template tags:

```typescript
interface User {
  name: string;
  domain: string;
}

const parser = rx<{ user: User }>`^(?<user.name>\w+)@(?<user.domain>\w+)$`;

const result = parser('john@example.com');

if (result.success) {
  // TypeScript knows result.value is { user: User }
  const name: string = result.value.user.name; // ✅ Type-safe
}
```

## Best Practices

### 1. Use Template Tags by Default

```typescript
// ✅ Preferred
import { rx } from 'nested-regex-groups/template';
const parser = rx`^(?<user.name>\w+)$`;

// ⚠️ Only when needed
import { nestedRegex } from 'nested-regex-groups';
const parser = nestedRegex(/^(?<user_name>\w+)$/, { groupMap: { user_name: 'user.name' } });
```

### 2. Use Descriptive Group Names

```typescript
// ❌ Bad: unclear
rx`^(?<a.b>\w+)$`

// ✅ Good: clear
rx`^(?<user.name>\w+)$`
```

### 3. Order Patterns by Specificity

```typescript
rxParser([
  rxPattern('specific')`^(?<user.name>\w+)@example\.com$`,  // Most specific first
  rxPattern('general')`^(?<user.name>\w+)@(?<user.domain>\w+)$`
]);
```

### 4. Add Descriptions

```typescript
rxPattern('email', 'Matches email addresses with username and domain')`...`
```

## Performance

Template tags have minimal overhead:
- Pattern parsing happens once at creation time
- Runtime performance is identical to manual API
- No regex compilation overhead

## Tree-Shaking

The template tag module is separate, so if you don't use it, it won't be included in your bundle:

```typescript
// Only imports core (smaller bundle)
import { nestedRegex } from 'nested-regex-groups';

// Imports template tag module (slightly larger)
import { rx } from 'nested-regex-groups/template';
```

## Summary

- **Use `rx`** for single patterns with clean syntax
- **Use `rxParser` + `rxPattern`** for multi-pattern grammars
- **Use manual API** when you need dynamic construction or regex flags
- Template tags automatically handle `String.raw` behavior
- Zero runtime overhead compared to manual API
