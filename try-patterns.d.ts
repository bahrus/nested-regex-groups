import type { ParseResult, ParsePattern, ParserOptions } from './types/nested-regex-groups/types.js';
/**
 * Tries multiple patterns in order and returns the first successful match.
 *
 * @example
 * const result = tryPatterns('on when #lhs eq #rhs', [
 *   {
 *     name: 'comparison',
 *     regex: /^on when (?<lhs_id>#\w+) eq (?<rhs_id>#\w+)$/,
 *     groupMap: { lhs_id: 'lhs.id', rhs_id: 'rhs.id' }
 *   },
 *   {
 *     name: 'boolean',
 *     regex: /^on when (?<lhs_id>#\w+)$/,
 *     groupMap: { lhs_id: 'lhs.id' }
 *   }
 * ]);
 *
 * @param input - String to parse
 * @param patterns - Array of pattern definitions to try
 * @param options - Parser options
 * @returns Parse result with pattern name
 */
export declare function tryPatterns<T = any>(input: string, patterns: ParsePattern[], options?: ParserOptions): ParseResult<T> & {
    pattern?: string;
};
/**
 * Creates an optimized parser function from an array of patterns.
 *
 * @example
 * const parser = createParser([
 *   {
 *     name: 'email',
 *     regex: /^(?<user_name>\w+)@(?<user_domain>\w+)$/,
 *     groupMap: { user_name: 'user.name', user_domain: 'user.domain' }
 *   },
 *   {
 *     name: 'username',
 *     regex: /^(?<user_name>\w+)$/,
 *     groupMap: { user_name: 'user.name' }
 *   }
 * ]);
 *
 * const result = parser('john@example.com');
 * // result = { success: true, value: { user: { name: 'john', domain: 'example.com' } }, pattern: 'email' }
 *
 * @param patterns - Array of pattern definitions
 * @param options - Parser options
 * @returns Parser function
 */
export declare function createParser<T = any>(patterns: ParsePattern[], options?: ParserOptions): (input: string) => ParseResult<T> & {
    pattern?: string;
};
