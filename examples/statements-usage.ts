/**
 * Example: Parsing Multiple Statements (Paragraphs)
 * 
 * This example demonstrates how to parse paragraphs containing multiple
 * statements separated by periods, with support for nested object structures.
 */

import {
  splitStatements,
  parseGroupedCaptures,
  parseGroupedCaptureStatements,
  parsePatternStatements,
  parseParagraph
} from '../index.js';

console.log('=== Statements Parsing Examples ===\n');

// Example 1: Split statements utility
console.log('1. Split Statements Utility');
console.log('----------------------------');
const paragraph1 = 'First statement. Second statement. Third statement.';
const statements = splitStatements(paragraph1);
console.log('Input:', paragraph1);
console.log('Statements:', statements);
console.log();

// Example 2: Handling optional chaining and escaped periods
console.log('2. Optional Chaining and Escaped Periods');
console.log('----------------------------------------');
const paragraph2 = 'Check #obj?.prop value. Use file\\.txt name. Done.';
const statements2 = splitStatements(paragraph2);
console.log('Input:', paragraph2);
console.log('Statements:', statements2);
console.log('Note: ?. is preserved, \\. becomes .');
console.log();

// Example 3: Flat groups (parseGroupedCaptures)
console.log('3. Parse Single Statement with Flat Groups');
console.log('-------------------------------------------');
const flatPatterns = [
  {
    name: 'comparison',
    pattern: '^(?<trigger>on|off)\\s+when\\s+(?<lhs>#\\w+)\\s+eq\\s+(?<rhs>#\\w+)$'
  },
  {
    name: 'boolean',
    pattern: '^(?<trigger>on|off)\\s+when\\s+(?<lhs>#\\w+)$'
  }
];

const singleStatement = 'on when #foo eq #bar';
const result1 = parseGroupedCaptures(singleStatement, flatPatterns);
console.log('Input:', singleStatement);
console.log('Result:', JSON.stringify(result1, null, 2));
console.log();

// Example 4: Multiple statements with flat groups
console.log('4. Parse Multiple Statements with Flat Groups');
console.log('----------------------------------------------');
const paragraph3 = 'on when #foo eq #bar. off when #baz.';
const result2 = parseGroupedCaptureStatements(paragraph3, flatPatterns);
console.log('Input:', paragraph3);
console.log('Result:', JSON.stringify(result2, null, 2));
console.log();

// Example 5: Nested groups (parsePatternStatements)
console.log('5. Parse Multiple Statements with Nested Groups');
console.log('------------------------------------------------');
const nestedPatterns = [
  {
    name: 'comparison',
    pattern: '^(?<trigger>on|off)\\s+when\\s+(?<lhs.id>#\\w+)\\s+eq\\s+(?<rhs.id>#\\w+)$'
  },
  {
    name: 'boolean',
    pattern: '^(?<trigger>on|off)\\s+when\\s+(?<lhs.id>#\\w+)$'
  }
];

const paragraph4 = 'on when #foo eq #bar. off when #baz.';
const result3 = parsePatternStatements(paragraph4, nestedPatterns);
console.log('Input:', paragraph4);
console.log('Result:', JSON.stringify(result3, null, 2));
console.log();

// Example 6: Complex nested structures (be-switched style)
console.log('6. Complex Nested Structures (be-switched)');
console.log('-------------------------------------------');
const beSwitchedPatterns = [
  {
    name: 'fullComparison',
    pattern: '^(?<trigger>on|off)\\s+when\\s+(?<lhs.id>#\\w+)(?:::(?<lhs.event>\\w+))?(?:\\?\\.(?<lhs.prop>\\w+))?\\s+(?<op>eq|gt|lt|gte|lte|ne)\\s+(?<rhs.id>#\\w+)(?:::(?<rhs.event>\\w+))?(?:\\?\\.(?<rhs.prop>\\w+))?$'
  },
  {
    name: 'boolean',
    pattern: '^(?<trigger>on|off)\\s+when\\s+(?<lhs.id>#\\w+)$'
  }
];

const paragraph5 = 'on when #lhs::change?.weight gt #rhs?.weight. off when #isHappy.';
const result4 = parsePatternStatements(paragraph5, beSwitchedPatterns);
console.log('Input:', paragraph5);
console.log('Result:', JSON.stringify(result4, null, 2));
console.log();

// Example 7: Using parseParagraph alias
console.log('7. Using parseParagraph Alias');
console.log('------------------------------');
const paragraph6 = 'on when #foo eq #bar. off when #baz.';
const result5 = parseParagraph(paragraph6, nestedPatterns);
console.log('Input:', paragraph6);
console.log('Result:', JSON.stringify(result5, null, 2));
console.log('Note: parseParagraph is an alias for parsePatternStatements');
console.log();

// Example 8: Handling parse failures
console.log('8. Handling Parse Failures');
console.log('--------------------------');
const paragraph7 = 'on when #foo eq #bar. invalid statement.';
const result6 = parsePatternStatements(paragraph7, nestedPatterns);
console.log('Input:', paragraph7);
console.log('Success:', result6.success);
console.log('Statements:');
result6.statements.forEach((stmt, i) => {
  console.log(`  Statement ${i + 1}:`, stmt.error ? `ERROR: ${stmt.error}` : `OK (${stmt.pattern})`);
});
console.log();

// Example 9: Real-world be-switched paragraph
console.log('9. Real-World be-switched Paragraph');
console.log('------------------------------------');
const realWorldParagraph = 'on when #lhs::change?.weight gt #rhs?.weight. off when #brother::change?.height lt #sister::input?.height.';
const result7 = parsePatternStatements(realWorldParagraph, beSwitchedPatterns);
console.log('Input:', realWorldParagraph);
console.log('Success:', result7.success);
console.log('Parsed statements:');
result7.statements.forEach((stmt, i) => {
  if (stmt.value) {
    console.log(`\n  Statement ${i + 1} (${stmt.pattern}):`);
    console.log('    Trigger:', stmt.value.trigger);
    console.log('    LHS:', JSON.stringify(stmt.value.lhs));
    if (stmt.value.op) {
      console.log('    Operator:', stmt.value.op);
      console.log('    RHS:', JSON.stringify(stmt.value.rhs));
    }
  }
});
