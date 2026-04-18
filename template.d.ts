import type { ParseResult, ParsePattern, ParserOptions } from './types/nested-regex-groups/types.js';
/**
 * Template tag for creating regex parsers with dot notation in capture group names.
 *
 * Automatically converts dots in group names to underscores and creates the groupMap.
 *
 * @example
 * import { rx } from 'nested-regex-groups/template';
 *
 * const parser = rx`^(?<person.name.first>\w+)\s+(?<person.name.last>\w+)$`;
 * const result = parser('John Doe');
 * // result.value = { person: { name: { first: 'John', last: 'Doe' } } }
 *
 * @param strings - Template string array
 * @param values - Interpolated values
 * @returns Parser function
 */
export declare function rx<T = any>(strings: TemplateStringsArray, ...values: any[]): (input: string) => ParseResult<T>;
/**
 * Template tag for creating multi-pattern parsers with dot notation support.
 *
 * @example
 * import { rxPattern } from 'nested-regex-groups/template';
 *
 * const patterns = [
 *   rxPattern('email')`^(?<user.name>\w+)@(?<user.domain>\w+)$`,
 *   rxPattern('username')`^(?<user.name>\w+)$`
 * ];
 *
 * const parser = createParser(patterns);
 *
 * @param name - Pattern name
 * @param description - Optional pattern description
 * @returns Template tag function that returns a ParsePattern
 */
export declare function rxPattern(name: string, description?: string): (strings: TemplateStringsArray, ...values: any[]) => ParsePattern;
/**
 * Helper to create a parser from multiple rxPattern definitions
 *
 * @example
 * import { rxParser, rxPattern } from 'nested-regex-groups/template';
 *
 * const parser = rxParser([
 *   rxPattern('email')`^(?<user.name>\w+)@(?<user.domain>\w+)$`,
 *   rxPattern('username')`^(?<user.name>\w+)$`
 * ]);
 *
 * @param patterns - Array of patterns created with rxPattern
 * @param options - Parser options
 * @returns Parser function
 */
export declare function rxParser<T = any>(patterns: ParsePattern[], options?: ParserOptions): (input: string) => ParseResult<T> & {
    pattern?: string;
};
