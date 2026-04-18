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
export function createParser(patterns, options = {}) {
    return (input) => tryPatterns(input, patterns, options);
}
