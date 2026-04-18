import type { StatementsResult, PatternConfig, ParserOptions } from './types/nested-regex-groups/types.js';
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
export declare function parseGroupedCaptureStatements<T = any>(input: string, patternConfigs: PatternConfig[], options?: ParserOptions): StatementsResult<T>;
