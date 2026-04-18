import { splitStatements } from './split-statements.js';
import { tryPatterns } from './try-patterns.js';
import { convertToPatternsWithGroupMap } from './parse-patterns.js';
/**
 * Parses a paragraph into multiple statements, applying nested patterns to each.
 *
 * Splits the input by periods (respecting `?.` and `\.`), then parses each statement
 * using patterns with dot notation support for nested objects.
 *
 * @example
 * const patterns = [
 *   {
 *     name: 'comparison',
 *     pattern: '^(?<trigger>on|off)\\s+when\\s+(?<lhs.id>#\\w+)\\s+eq\\s+(?<rhs.id>#\\w+)$'
 *   },
 *   {
 *     name: 'boolean',
 *     pattern: '^(?<trigger>on|off)\\s+when\\s+(?<lhs.id>#\\w+)$'
 *   }
 * ];
 *
 * const paragraph = 'on when #foo eq #bar. off when #baz.';
 * const result = parsePatternStatements(paragraph, patterns);
 * // {
 * //   success: true,
 * //   statements: [
 * //     { pattern: 'comparison', value: { trigger: 'on', lhs: { id: '#foo' }, rhs: { id: '#bar' } } },
 * //     { pattern: 'boolean', value: { trigger: 'off', lhs: { id: '#baz' } } }
 * //   ]
 * // }
 *
 * @param input - Paragraph string to parse
 * @param patternConfigs - Array of pattern configurations (with dot notation support)
 * @param options - Parser options
 * @returns Statements result with array of nested objects
 */
export function parsePatternStatements(input, patternConfigs, options) {
    const statements = splitStatements(input);
    const results = [];
    for (const statement of statements) {
        const result = tryPatterns(statement, convertToPatternsWithGroupMap(patternConfigs), options);
        if (result.success) {
            results.push({
                pattern: result.pattern,
                value: result.value,
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
/**
 * Convenience alias for parsePatternStatements.
 *
 * This is the most common use case: parsing a paragraph with nested pattern support.
 *
 * @example
 * const result = parseParagraph(paragraph, patterns);
 */
export const parseParagraph = parsePatternStatements;
