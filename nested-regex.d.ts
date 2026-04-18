import type { ParseResult, NestedRegexOptions } from './types/nested-regex-groups/types.js';
/**
 * Creates a parser function from a single regex pattern with dot-notation support.
 *
 * Since JavaScript regex doesn't support dots in capture group names, you can either:
 * 1. Use underscores in regex and provide a groupMap to convert them
 * 2. Use dots directly if your regex engine supports it (future-proofing)
 *
 * @example
 * // Using groupMap (recommended for compatibility)
 * const parser = nestedRegex(/^(?<user_name>\w+)@(?<user_domain>\w+)$/, {
 *   groupMap: { user_name: 'user.name', user_domain: 'user.domain' }
 * });
 * const result = parser('john@example.com');
 * // result.value = { user: { name: 'john', domain: 'example.com' } }
 *
 * @param pattern - Regular expression with named capture groups
 * @param options - Options including name and groupMap
 * @returns Parser function
 */
export declare function nestedRegex<T = any>(pattern: RegExp, options?: NestedRegexOptions): (input: string) => ParseResult<T>;
