import type { ParseResult, PatternConfig, ParserOptions } from './types/nested-regex-groups/types.js';
/**
 * Parses multiple patterns against a single statement (flat groups, no nesting).
 *
 * This is for patterns that use standard regex named groups without dots.
 * The regex engine will throw an error if dots are used in group names.
 *
 * @example
 * const patterns = [
 *   { name: 'comparison', pattern: '^(?<trigger>on|off)\\s+when\\s+(?<lhs>#\\w+)\\s+eq\\s+(?<rhs>#\\w+)$' }
 * ];
 *
 * const result = parseGroupedCaptures('on when #foo eq #bar', patterns);
 * // { success: true, pattern: 'comparison', value: { trigger: 'on', lhs: '#foo', rhs: '#bar' } }
 *
 * @param input - String to parse
 * @param patternConfigs - Array of pattern configurations (no dots in group names)
 * @param options - Parser options
 * @returns Parse result with flat object
 */
export declare function parseGroupedCaptures<T = any>(input: string, patternConfigs: PatternConfig[], options?: ParserOptions): ParseResult<T> & {
    pattern?: string;
};
