# JSON Config Guide

The runtime parsing functions (`parsePattern` and `parsePatterns`) are designed for loading regex patterns from JSON configuration files. This is perfect for configuration-driven applications where patterns need to be updated without code changes.

## Why JSON Config?

### Your Workflow

You mentioned using `.mjs` files that get converted to JSON strings and parsed at runtime. The runtime parser functions are designed exactly for this use case:

```javascript
// 1. Define patterns in JSON (human-readable with dots)
{
  "pattern": "^(?<user.name>\\w+)@(?<user.domain>\\w+)$"
}

// 2. Load and parse at runtime
const config = JSON.parse(configString);
const parser = parsePattern(config.pattern);

// 3. Use immediately
const result = parser('john@example.com');
// { user: { name: 'john', domain: 'example.com' } }
```

### Benefits

- ✅ **Human-readable**: Dots in group names (not underscores)
- ✅ **No build step**: Parse at runtime
- ✅ **Dynamic updates**: Change patterns without redeploying
- ✅ **Shareable**: Same config across projects
- ✅ **Flexible**: Load from files, APIs, databases, etc.

## Basic Usage

### Single Pattern

```typescript
import { parsePattern } from 'nested-regex-groups';

// From JSON config
const config = {
  pattern: "^(?<user.name>\\w+)@(?<user.domain>\\w+)$"
};

const parser = parsePattern(config.pattern);
const result = parser('john@example.com');

console.log(result.value);
// { user: { name: 'john', domain: 'example.com' } }
```

### Multiple Patterns

```typescript
import { parsePatterns } from 'nested-regex-groups';

// From JSON config file
const config = {
  patterns: [
    {
      name: "email",
      pattern: "^(?<user.name>\\w+)@(?<user.domain>\\w+)$",
      description: "Email address"
    },
    {
      name: "username",
      pattern: "^(?<user.name>\\w+)$",
      description: "Simple username"
    }
  ]
};

const parser = parsePatterns(config.patterns);

const result1 = parser('john@example.com');
// { success: true, pattern: 'email', value: { user: { name: 'john', domain: 'example.com' } } }

const result2 = parser('jane');
// { success: true, pattern: 'username', value: { user: { name: 'jane' } } }
```

## Complete Workflow Example

### 1. Create JSON Config File

**config/patterns.json:**
```json
{
  "parserName": "be-switched",
  "patterns": [
    {
      "name": "simpleComparison",
      "pattern": "^(?<trigger>on|off)\\s+when\\s+(?<lhs.id>#\\w+)\\s+(?<op>eq)\\s+(?<rhs.id>#\\w+)$",
      "description": "Simple comparison"
    },
    {
      "name": "booleanCondition",
      "pattern": "^(?<trigger>on|off)\\s+when\\s+(?<lhs.id>#\\w+)$",
      "description": "Boolean condition"
    }
  ]
}
```

### 2. Load and Parse at Runtime

```typescript
import { readFileSync } from 'fs';
import { parsePatterns } from 'nested-regex-groups';

// Load config
const configContent = readFileSync('./config/patterns.json', 'utf-8');
const config = JSON.parse(configContent);

// Create parser
const parser = parsePatterns(config.patterns);

// Use parser
const result = parser('on when #lhs eq #rhs');
console.log(result);
// {
//   success: true,
//   pattern: 'simpleComparison',
//   value: {
//     trigger: 'on',
//     lhs: { id: '#lhs' },
//     op: 'eq',
//     rhs: { id: '#rhs' }
//   }
// }
```

## Your .mjs → JSON Workflow

Based on your description, here's how it would work:

### Before (Manual groupMap)

```javascript
// patterns.mjs
export const patterns = [
  {
    name: 'email',
    regex: String.raw`^(?<user_name>\w+)@(?<user_domain>\w+)$`,
    groupMap: { user_name: 'user.name', user_domain: 'user.domain' }
  }
];

// Convert to JSON string, parse at runtime
const config = JSON.parse(JSON.stringify(patterns));
// Then manually create parser with groupMap...
```

### After (Automatic with parsePatterns)

```javascript
// patterns.mjs
export const patterns = [
  {
    name: 'email',
    pattern: String.raw`^(?<user.name>\w+)@(?<user.domain>\w+)$`,
    description: 'Email address'
  }
];

// Convert to JSON string, parse at runtime
const config = JSON.parse(JSON.stringify(patterns));
const parser = parsePatterns(config);
// Done! Dots automatically converted to underscores + groupMap created
```

Or even simpler - just use JSON directly:

```json
{
  "patterns": [
    {
      "name": "email",
      "pattern": "^(?<user.name>\\w+)@(?<user.domain>\\w+)$",
      "description": "Email address"
    }
  ]
}
```

## Dynamic Configuration

Load patterns from anywhere:

### From API

```typescript
import { parsePatterns } from 'nested-regex-groups';

// Fetch from API
const response = await fetch('https://api.example.com/patterns');
const config = await response.json();

// Create parser
const parser = parsePatterns(config.patterns);
```

### From Database

```typescript
import { parsePatterns } from 'nested-regex-groups';

// Load from database
const config = await db.query('SELECT * FROM parser_configs WHERE name = ?', ['be-switched']);

// Create parser
const parser = parsePatterns(config.patterns);
```

### From Environment

```typescript
import { parsePatterns } from 'nested-regex-groups';

// Load from environment variable
const config = JSON.parse(process.env.PARSER_CONFIG);

// Create parser
const parser = parsePatterns(config.patterns);
```

## Pattern String Format

### Escaping in JSON

When writing patterns in JSON, remember to escape backslashes:

```json
{
  "pattern": "^(?<name>\\w+)$"
}
```

The `\\w` becomes `\w` after JSON.parse.

### Common Patterns

```json
{
  "patterns": [
    {
      "name": "word",
      "pattern": "^(?<value>\\w+)$"
    },
    {
      "name": "number",
      "pattern": "^(?<value>\\d+)$"
    },
    {
      "name": "whitespace",
      "pattern": "^(?<value>\\s+)$"
    },
    {
      "name": "email",
      "pattern": "^(?<user.name>\\w+)@(?<user.domain>[\\w.]+)$"
    }
  ]
}
```

## Error Handling

### With Pattern Names

```typescript
const parser = parsePattern(config.pattern, 'email-pattern');
const result = parser('invalid');

if (!result.success) {
  console.log(result.error);
  // "Pattern 'email-pattern' did not match"
}
```

### Verbose Mode

```typescript
const parser = parsePatterns(config.patterns, { verbose: true });
const result = parser('invalid');

if (!result.success) {
  console.log(result.error);
  // "No pattern matched. Tried:
  // email: Pattern 'email' did not match
  // username: Pattern 'username' did not match"
}
```

## Best Practices

### 1. Use Descriptive Names

```json
{
  "name": "emailWithDomain",
  "pattern": "...",
  "description": "Matches email addresses with username and domain"
}
```

### 2. Order by Specificity

```json
{
  "patterns": [
    {
      "name": "specificEmail",
      "pattern": "^(?<user.name>\\w+)@example\\.com$"
    },
    {
      "name": "generalEmail",
      "pattern": "^(?<user.name>\\w+)@(?<user.domain>\\w+)$"
    }
  ]
}
```

### 3. Add Descriptions

```json
{
  "name": "comparison",
  "pattern": "...",
  "description": "Matches comparison expressions like 'on when #lhs eq #rhs'"
}
```

### 4. Validate Config at Startup

```typescript
try {
  const parser = parsePatterns(config.patterns);
  console.log('✓ Parser initialized successfully');
} catch (error) {
  console.error('✗ Failed to initialize parser:', error);
  process.exit(1);
}
```

## Comparison: Template Tag vs JSON Config

### Template Tag (Development)

```typescript
import { rx } from 'nested-regex-groups/template';

// Best for: Code-based patterns, type safety, IDE support
const parser = rx`^(?<user.name>\w+)@(?<user.domain>\w+)$`;
```

**Use when:**
- Patterns are part of your code
- You want type inference
- Patterns rarely change
- You want IDE autocomplete

### JSON Config (Runtime)

```typescript
import { parsePattern } from 'nested-regex-groups';

// Best for: Configuration-driven, dynamic updates, sharing
const parser = parsePattern(config.pattern);
```

**Use when:**
- Patterns come from config files
- You need dynamic updates
- Patterns are shared across projects
- Non-developers need to update patterns

## Real-World Example: be-switched

See `examples/json-config.json` and `examples/json-config-usage.ts` for a complete working example of the be-switched parser loaded from JSON config.

## Summary

- **`parsePattern()`** - Single pattern from string
- **`parsePatterns()`** - Multiple patterns from config objects
- **Dots in JSON** - Automatically converted to underscores
- **No build step** - Parse at runtime
- **Dynamic** - Load from files, APIs, databases, etc.
- **Perfect for** - Configuration-driven applications

Your `.mjs` → JSON workflow is now much simpler with automatic dot-to-underscore conversion!
