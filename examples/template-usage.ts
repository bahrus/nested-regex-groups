import { rx, rxPattern, rxParser } from '../dist/template.js';

console.log('=== Template Tag Examples ===\n');

// Example 1: Simple rx template tag
console.log('1. Simple rx template tag with dot notation:');
const emailParser = rx`^(?<user.name>\w+)@(?<user.domain>[\w.]+)$`;
const emailResult = emailParser('john@example.com');
console.log('Input:', 'john@example.com');
console.log('Result:', JSON.stringify(emailResult.success ? emailResult.value : emailResult.error, null, 2));
console.log();

// Example 2: Multiple nesting levels
console.log('2. Multiple nesting levels:');
const personParser = rx`^(?<person.name.first>\w+)\s+(?<person.name.last>\w+)$`;
const personResult = personParser('John Doe');
console.log('Input:', 'John Doe');
console.log('Result:', JSON.stringify(personResult.success ? personResult.value : personResult.error, null, 2));
console.log();

// Example 3: Template interpolation
console.log('3. Template interpolation:');
const idPattern = '#\\w+';
const comparisonParser = rx`^(?<lhs.id>${idPattern})\s+eq\s+(?<rhs.id>${idPattern})$`;
const comparisonResult = comparisonParser('#foo eq #bar');
console.log('Input:', '#foo eq #bar');
console.log('Result:', JSON.stringify(comparisonResult.success ? comparisonResult.value : comparisonResult.error, null, 2));
console.log();

// Example 4: rxPattern for multi-pattern parsing
console.log('4. Multi-pattern parsing with rxPattern:');
const parser = rxParser([
  rxPattern('email', 'Email address')`^(?<user.name>\w+)@(?<user.domain>[\w.]+)$`,
  rxPattern('username', 'Simple username')`^(?<user.name>\w+)$`
]);

const test1 = parser('john@example.com');
console.log('Input:', 'john@example.com');
console.log('Pattern:', test1.success ? test1.pattern : 'none');
console.log('Result:', JSON.stringify(test1.success ? test1.value : test1.error, null, 2));
console.log();

const test2 = parser('jane');
console.log('Input:', 'jane');
console.log('Pattern:', test2.success ? test2.pattern : 'none');
console.log('Result:', JSON.stringify(test2.success ? test2.value : test2.error, null, 2));
console.log();

// Example 5: Complex be-switched patterns
console.log('5. Complex be-switched patterns:');
const beSwitchedParser = rxParser([
  rxPattern('simpleComparison')`^(?<trigger>on|off)\s+when\s+(?<lhs.id>#\w+)\s+(?<op>equals|eq|lt|gt)\s+(?<rhs.id>#\w+)$`,
  rxPattern('fullComparison')`^(?<trigger>on|off)\s+when\s+(?<lhs.id>#\w+)(?:::(?<lhs.event>\w+))?\s+(?<op>equals|eq|lt|gt)\s+(?<rhs.id>#\w+)(?:::(?<rhs.event>\w+))?$`,
  rxPattern('boolean')`^(?<trigger>on|off)\s+when\s+(?<lhs.id>#\w+)$`
]);

const testCases = [
  'on when #lhs equals #rhs',
  'on when #lhs::change eq #rhs::input',
  'off when #isHappy'
];

testCases.forEach(testCase => {
  const result = beSwitchedParser(testCase);
  console.log('Input:', testCase);
  console.log('Pattern:', result.success ? result.pattern : 'none');
  console.log('Result:', JSON.stringify(result.success ? result.value : result.error, null, 2));
  console.log();
});

// Example 6: Comparison - Manual vs Template Tag
console.log('6. Comparison - Manual groupMap vs Template Tag:');
console.log('\nManual approach (verbose):');
console.log(`
import { nestedRegex } from 'nested-regex-groups';

const parser = nestedRegex(/^(?<user_name>\\w+)@(?<user_domain>\\w+)$/, {
  groupMap: { 
    user_name: 'user.name', 
    user_domain: 'user.domain' 
  }
});
`);

console.log('Template tag approach (clean):');
console.log(`
import { rx } from 'nested-regex-groups/template';

const parser = rx\`^(?<user.name>\\w+)@(?<user.domain>\\w+)$\`;
`);

console.log('✨ Same result, much cleaner syntax!');
