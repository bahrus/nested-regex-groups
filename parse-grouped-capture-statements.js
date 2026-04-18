import { splitStatements } from './split-statements.js';
import { parseGroupedCaptures } from './parse-grouped-captures.js';
/**
 * Merges default values into a parsed result value (flat structure).
 * For flat parsing, default values are merged directly without nesting.
 * Parsed values take precedence over defaults.
 */
function mergeDefaults(parsedValue, defaultVals) {
    if (!defaultVals || Object.keys(defaultVals).length === 0) {
        return parsedValue;
    }
    // For flat parsing, just merge at the top level
    // Parsed values override defaults
    return { ...defaultVals, ...parsedValue };
}
/**
 * Parses a paragraph into multiple statements, applying flat group patterns to each.
 *
 * Splits the input by periods (respecting `?.` and `\.`), then parses each statement.
 * Returns an array of results, one per statement.
 *
 * @example
 * const patterns = [
 *   {
 *     name: 'comparison',
 *     pattern: '^(?<trigger>on|off)\\s+when\\s+(?<lhs>#\\w+)\\s+eq\\s+(?<rhs>#\\w+)$',
 *     defaultVals: { trigger: 'on' }
 *   },
 *   {
 *     name: 'boolean',
 *     pattern: '^(?<trigger>on|off)\\s+when\\s+(?<lhs>#\\w+)$'
 *   }
 * ];
 *
 * const paragraph = 'on when #foo eq #bar. off when #baz.';
 * const result = parseGroupedCaptureStatements(paragraph, patterns);
 * // {
 * //   success: true,
 * //   statements: [
 * //     { pattern: 'comparison', value: { trigger: 'on', lhs: '#foo', rhs: '#bar' } },
 * //     { pattern: 'boolean', value: { trigger: 'off', lhs: '#baz' } }
 * //   ]
 * // }
 *
 * @param input - Paragraph string to parse
 * @param patternConfigs - Array of pattern configurations (no dots in group names)
 * @param options - Parser options
 * @returns Statements result with array of flat objects
 */
export function parseGroupedCaptureStatements(input, patternConfigs, options) {
    const statements = splitStatements(input);
    const results = [];
    // Create a map of pattern names to their configs for default value lookup
    const configMap = new Map(patternConfigs.map(c => [c.name, c]));
    for (const statement of statements) {
        const result = parseGroupedCaptures(statement, patternConfigs, options);
        if (result.success) {
            // Find the matching config to get default values
            const config = result.pattern ? configMap.get(result.pattern) : undefined;
            const valueWithDefaults = mergeDefaults(result.value, config?.defaultVals);
            results.push({
                pattern: result.pattern,
                value: valueWithDefaults,
                matched: result.matched
            });
        }
        else {
            results.push({
                error: result.error
            });
        }
    }
    // Overall success if all statements parsed successfully
    const success = results.every(r => !r.error);
    return {
        success,
        statements: results
    };
}
