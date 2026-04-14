import { readFileSync } from 'fs';
import { parsePatterns } from '../dist/index.js';

console.log('=== JSON Config Workflow Example ===\n');

// Step 1: Load JSON config file
console.log('1. Loading config from json-config.json...');
const configContent = readFileSync('./examples/json-config.json', 'utf-8');
const config = JSON.parse(configContent);

console.log(`   Parser: ${config.parserName}`);
console.log(`   Patterns: ${config.patterns.length}`);
config.patterns.forEach((p: any) => {
  console.log(`   - ${p.name}: ${p.description}`);
});
console.log();

// Step 2: Create parser from config
console.log('2. Creating parser from config...');
const parser = parsePatterns(config.patterns);
console.log('   ✓ Parser created\n');

// Step 3: Test the parser with various inputs
console.log('3. Testing parser:\n');

const testCases = [
  'on when #lhs equals #rhs',
  'on when #lhs::change equals #rhs::input',
  'on when #lhs?.weight gt #rhs?.weight',
  'off when #isHappy'
];

testCases.forEach(testCase => {
  const result = parser(testCase);
  
  console.log(`Input: "${testCase}"`);
  console.log(`Pattern matched: ${result.success ? result.pattern : 'none'}`);
  
  if (result.success) {
    console.log('Result:', JSON.stringify(result.value, null, 2));
  } else {
    console.log('Error:', result.error);
  }
  console.log();
});

// Step 4: Demonstrate the workflow benefits
console.log('4. Workflow Benefits:\n');
console.log('✅ JSON config is human-readable with dots in group names');
console.log('✅ No build step required - parse at runtime');
console.log('✅ Easy to update patterns without code changes');
console.log('✅ Config can be shared across projects');
console.log('✅ Patterns can be loaded dynamically from any source');
console.log();

// Step 5: Show how to use with dynamic config
console.log('5. Dynamic Config Example:\n');

// Simulate loading config from an API or database
const dynamicConfig = {
  patterns: [
    {
      name: 'email',
      pattern: '^(?<user.name>\\w+)@(?<user.domain>[\\w.]+)$',
      description: 'Email address'
    },
    {
      name: 'username',
      pattern: '^(?<user.name>\\w+)$',
      description: 'Username only'
    }
  ]
};

const dynamicParser = parsePatterns(dynamicConfig.patterns);

const emailTest = dynamicParser('john@example.com');
console.log('Input: "john@example.com"');
console.log('Pattern:', emailTest.success ? emailTest.pattern : 'none');
console.log('Result:', JSON.stringify(emailTest.success ? emailTest.value : emailTest.error, null, 2));
console.log();

const usernameTest = dynamicParser('jane');
console.log('Input: "jane"');
console.log('Pattern:', usernameTest.success ? usernameTest.pattern : 'none');
console.log('Result:', JSON.stringify(usernameTest.success ? usernameTest.value : usernameTest.error, null, 2));
console.log();

console.log('✨ Perfect for configuration-driven applications!');
