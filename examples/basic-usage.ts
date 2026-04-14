import { nestedRegex, createParser, type ParsePattern } from '../index.js';

console.log('=== Basic Usage Examples ===\n');

// Example 1: Simple nested groups
console.log('1. Simple nested groups:');
const emailParser = nestedRegex(/^(?<user_name>\w+)@(?<user_domain>[\w.]+)$/, {
  groupMap: { user_name: 'user.name', user_domain: 'user.domain' }
});

const emailResult = emailParser('john@example.com');
console.log('Input:', 'john@example.com');
console.log('Result:', JSON.stringify(emailResult, null, 2));
console.log();

// Example 2: Multiple nesting levels
console.log('2. Multiple nesting levels:');
const personParser = nestedRegex(/^(?<person_name_first>\w+)\s+(?<person_name_last>\w+)$/, {
  groupMap: { 
    person_name_first: 'person.name.first',
    person_name_last: 'person.name.last'
  }
});

const personResult = personParser('John Doe');
console.log('Input:', 'John Doe');
console.log('Result:', JSON.stringify(personResult, null, 2));
console.log();

// Example 3: Multiple patterns (recommended approach)
console.log('3. Multiple patterns with priority:');
const patterns: ParsePattern[] = [
  {
    name: 'email',
    regex: /^(?<user_name>\w+)@(?<user_domain>[\w.]+)$/,
    groupMap: { user_name: 'user.name', user_domain: 'user.domain' },
    description: 'Email address'
  },
  {
    name: 'username',
    regex: /^(?<user_name>\w+)$/,
    groupMap: { user_name: 'user.name' },
    description: 'Simple username'
  }
];

const parser = createParser(patterns);

const result1 = parser('john@example.com');
console.log('Input:', 'john@example.com');
console.log('Matched pattern:', result1.success ? result1.pattern : 'none');
console.log('Result:', JSON.stringify(result1, null, 2));
console.log();

const result2 = parser('jane');
console.log('Input:', 'jane');
console.log('Matched pattern:', result2.success ? result2.pattern : 'none');
console.log('Result:', JSON.stringify(result2, null, 2));
console.log();

// Example 4: be-switched style parsing
console.log('4. Complex grammar (be-switched style):');
const beSwitchedPatterns: ParsePattern[] = [
  {
    name: 'simpleComparison',
    regex: /^(?<trigger>on|off)\s+when\s+(?<lhs_id>#\w+)\s+(?<op>equals|eq|lt|gt)\s+(?<rhs_id>#\w+)$/,
    groupMap: {
      lhs_id: 'lhs.id',
      rhs_id: 'rhs.id'
    },
    description: 'Simple comparison'
  },
  {
    name: 'fullComparison',
    regex: /^(?<trigger>on|off)\s+when\s+(?<lhs_id>#\w+)(?:::(?<lhs_event>\w+))?\s+(?<op>equals|eq|lt|gt)\s+(?<rhs_id>#\w+)(?:::(?<rhs_event>\w+))?$/,
    groupMap: {
      lhs_id: 'lhs.id',
      lhs_event: 'lhs.event',
      rhs_id: 'rhs.id',
      rhs_event: 'rhs.event'
    },
    description: 'Comparison with events'
  },
  {
    name: 'boolean',
    regex: /^(?<trigger>on|off)\s+when\s+(?<lhs_id>#\w+)$/,
    groupMap: {
      lhs_id: 'lhs.id'
    },
    description: 'Boolean condition'
  }
];

const beSwitchedParser = createParser(beSwitchedPatterns);

const testCases = [
  'on when #lhs equals #rhs',
  'on when #lhs::change equals #rhs::input',
  'off when #isHappy'
];

testCases.forEach(testCase => {
  const result = beSwitchedParser(testCase);
  console.log('Input:', testCase);
  console.log('Pattern:', result.success ? result.pattern : 'none');
  console.log('Result:', JSON.stringify(result.success ? result.value : result.error, null, 2));
  console.log();
});

// Example 5: Error handling
console.log('5. Error handling:');
const strictParser = createParser(patterns, { verbose: true });
const failResult = strictParser('123-invalid');
console.log('Input:', '123-invalid');
console.log('Result:', JSON.stringify(failResult, null, 2));
