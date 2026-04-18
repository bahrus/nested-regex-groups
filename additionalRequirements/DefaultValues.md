# Support for Default Values

I would like to propose another property be added to PatternConfig -- defaultVals:

```TypeScript
/**
 * Pattern configuration for parsePatterns and parsePattern functions
 * Used when loading patterns from JSON or defining patterns as strings
 */
export interface PatternConfig {
  name: string;
  pattern: string;
  description?: string;
  defaultVals?: Record<string, unknown>
}
```

I'm not sure if thee typing is correct. 

So for example:

```JavaScript
const patterns = [
  { 
    name: 'comparison', 
    pattern: '^(?<trigger>on|off)\\s+when\\s+(?<lhs.id>#\\w+)\\s+eq\\s+(?<rhs.id>#\\w+)$',
    defaultVals: {
        trigger: 'on',
        'lhs.id': '#lhs',
    }
  }
];
```