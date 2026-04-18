import type { ParseResult, ParsePattern, ParserOptions } from './types/nested-regex-groups/types.js';
import { tryPatterns } from './try-patterns.js';

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
export function createParser<T = any>(
  patterns: ParsePattern[],
  options: ParserOptions = {}
): (input: string) => ParseResult<T> & { pattern?: string } {
  return (input: string) => tryPatterns<T>(input, patterns, options);
}
