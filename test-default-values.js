import { parsePatternStatements } from './parse-pattern-statements.js';
import { parseGroupedCaptureStatements } from './parse-grouped-capture-statements.js';
// Test nested pattern statements with default values
const nestedPatterns = [
    {
        name: 'comparison',
        pattern: '^(?<trigger>on|off)?\\s*when\\s+(?<lhs.id>#\\w+)\\s+eq\\s+(?<rhs.id>#\\w+)$',
        defaultVals: {
            trigger: 'on',
            'lhs.id': '#default'
        }
    }
];
const nestedResult = parsePatternStatements('when #foo eq #bar', nestedPatterns);
console.log('Nested with defaults:', JSON.stringify(nestedResult, null, 2));
// Test flat pattern statements with default values
const flatPatterns = [
    {
        name: 'comparison',
        pattern: '^(?<trigger>on|off)?\\s*when\\s+(?<lhs>#\\w+)\\s+eq\\s+(?<rhs>#\\w+)$',
        defaultVals: {
            trigger: 'on'
        }
    }
];
const flatResult = parseGroupedCaptureStatements('when #foo eq #bar', flatPatterns);
console.log('\nFlat with defaults:', JSON.stringify(flatResult, null, 2));
// Test that parsed values override defaults
const overrideResult = parsePatternStatements('off when #foo eq #bar', nestedPatterns);
console.log('\nOverride test (should have trigger: "off"):', JSON.stringify(overrideResult, null, 2));
