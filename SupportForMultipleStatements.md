# Support for Multiple Statements

One primary goal of this package is to support a paragraph of repetitive text, where each sentence, separated by a period, gets parsed to a (nested) object based on the nested-regex-groups support.

So in addition to supporting:

```JavaScript
const result = beSwitchedParser('on when #lhs::change?.weight gt #rhs?.weight. Off when #brother::change?.height lt #sister::input?.height');
```

Periods at the end of the last sentence should be optional (so if there's only one sentence, no need for a period at the end.)

We should ignore periods that are preceded either by a question mark, as shown above, or by a \ escape symbol.

In addition, because the nested-regex-groups requires a significant payload to support, which may be overkill in some cases, we should also support simpler paragraphs that only need to specify flat object structures using the built-in named capture groups.

So I'm thinking to support this, we should have:

- parseStatements -- separates a paragraph into an array of strings, based on the period delimiter (with the exceptions mentioned above for ? and \).  If no period is present, it still generates an array for uniformity of the result.
- parsedGroupedCaptures -- we pass in patterns just like parsePatterns, but no periods are allowed in the named groups. We could just let the error get thrown when turning it into a regular expression, where periods aren't allowed.
- parseGroupedCaptureStatements -- we continue to pass in the config.patterns without nested support, but it first divides a paragraph into an array of strings, and then parses each one, producing an array of flat objects.
- parsePatterns -- already done previously.
- parsePatternedStatements -- we continue to pass in the config.patterns, but now with nested support, and again it first divides a paragraph into an array of strings, and then parses each one, producing an array of nested objects.


---

## Comments / Questions (Kiro)

### Overall Design - Looks Good! ✅

The design makes sense and follows a logical progression from simple to complex. A few thoughts:

### 1. Naming Consistency

The naming is a bit inconsistent:
- `parsedGroupedCaptures` (past tense)
- `parseGroupedCaptureStatements` (present tense)
- `parsePatterns` (present tense)
- `parsePatternedStatements` (present tense)

**Suggestion:** Use consistent present tense:
- `parseGroupedCaptures` (not "parsed")
- `parseGroupedCaptureStatements`
- `parsePatterns` ✅ (already correct)
- `parsePatternStatements` (not "patterned")

### 2. Period Splitting Logic

The rules are clear:
- Split on `.` 
- Ignore `?.` (optional chaining)
- Ignore `\.` (escaped period)

**Question:** Should we also ignore periods inside strings/quotes? For example:
```javascript
'on when #msg equals "Hello. World"'
```

If not, that's fine - just want to clarify the scope.

### 3. API Consistency

Current pattern:
- `parsePattern(string)` → single result
- `parsePatterns(array)` → single result (tries multiple patterns)
- `parsePatternStatements(array, string)` → array of results

**Suggestion:** Consider this naming for clarity:
- `parsePattern()` - Single pattern, single statement
- `parsePatterns()` - Multiple patterns, single statement ✅
- `parseParagraph()` - Multiple patterns, multiple statements (paragraph)

Or keep your naming but add aliases for clarity.

### 4. Flat vs Nested Distinction

You have two parallel APIs:
- **Flat:** `parseGroupedCaptures` / `parseGroupedCaptureStatements`
- **Nested:** `parsePatterns` / `parsePatternStatements`

**Question:** Do we need separate functions, or could we have a single API with an option?

```typescript
parsePatterns(patterns, { nested: false })  // Flat
parsePatterns(patterns, { nested: true })   // Nested (default)
```

**Pro:** Simpler API, less duplication
**Con:** Your approach is more explicit and type-safe

I'm fine with either approach - your explicit separation is clearer for users.

### 5. Return Type for Statements

For `parsePatternStatements`, what should the return type be?

**Option A:** Array of results
```typescript
[
  { success: true, pattern: 'comparison', value: {...} },
  { success: true, pattern: 'boolean', value: {...} }
]
```

**Option B:** Single result with array of values
```typescript
{
  success: true,
  statements: [
    { pattern: 'comparison', value: {...} },
    { pattern: 'boolean', value: {...} }
  ]
}
```

**Option C:** Fail-fast (stop on first error)
```typescript
{
  success: false,
  error: 'Statement 2 failed: ...',
  parsed: [{ pattern: 'comparison', value: {...} }]  // Partial results
}
```

I'd recommend **Option B** with fail-fast behavior, but collect all errors:
```typescript
{
  success: boolean,
  statements: Array<{ pattern?: string, value?: any, error?: string }>
}
```

### 6. Implementation Suggestion

The `parseStatements` utility should be exported so users can use it independently:

```typescript
import { parseStatements } from 'nested-regex-groups';

const statements = parseStatements('First. Second. Third.');
// ['First', 'Second', 'Third']
```

This is useful for debugging and custom workflows.

### 7. Example Usage

Could you add an example to the doc showing the expected input/output? For example:

```typescript
const paragraph = 'on when #lhs equals #rhs. off when #isHappy.';
const result = parsePatternStatements(config.patterns, paragraph);

// Expected output?
```

This would help clarify the exact behavior.

---

## Summary

**Overall:** The design is solid and well-thought-out! ✅

**Recommendations:**
1. Fix naming consistency (present tense)
2. Clarify period-in-strings behavior
3. Consider `parseParagraph` as an alias
4. Define return type structure for statements
5. Export `parseStatements` utility
6. Add example usage to doc

**Ready to implement?** Yes, with minor naming tweaks. Let me know your thoughts on the questions above and I'll proceed!

## Human Response I

1.  Fix naming consistency (present tense) -- good catch.
2.  Clarify period-in-strings behavior -- that's a reasonable suggestion.  How much weight would it add to the footprint
3.  Do you recommend Paragraph instead of Statements of across the board?  Or do you recommend aliases across the board, or only for the simplest one?
4.  Return Type for Statements.  Let's go with option B.
5.  Yes, good call.
6.  Yes, definitely, much appreciated.
