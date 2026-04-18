export type { ParseSuccess, ParseFailure, ParseResult } from './parse-result.js';
export type { ParsePattern, NestedRegexOptions } from './pattern.js';
export type { ParserOptions } from './options.js';
export type { StatementsResult } from './statements.js';
import type { ParseResult } from './parse-result.js';
import type { ParsePattern, NestedRegexOptions } from './pattern.js';
import type { ParserOptions } from './options.js';
import type { StatementsResult } from './statements.js';
/**
 * Converts a flat object with dot-notation keys into a nested object structure.
 *
 * @example
 * flatToNested({ 'user.name': 'John', 'user.age': '30' })
 * // Returns: { user: { name: 'John', age: '30' } }
 *
 * @param groups - Object with potentially dot-notated keys
 * @returns Nested object structure
 */
export declare function flatToNested(groups: Record<string, string | undefined>): any;
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
/**
 * Utility to merge multiple parsed results into a single object.
 * Useful when parsing complex strings with multiple independent patterns.
 *
 * @param results - Array of parse results to merge
 * @returns Merged object or null if any parse failed
 */
export declare function mergeResults<T = any>(results: ParseResult[]): T | null;
/**
 * Parses a regex pattern string with dot notation in group names and creates a parser.
 *
 * This is designed for runtime parsing of patterns stored in JSON config files.
 * The pattern string should use dots in group names, which will be automatically
 * converted to underscores for JavaScript regex compatibility.
 *
 * @example
 * // From JSON config
 * const config = {
 *   pattern: "^(?<user.name>\\w+)@(?<user.domain>\\w+)$"
 * };
 *
 * const parser = parsePattern(config.pattern);
 * const result = parser('john@example.com');
 * // result.value = { user: { name: 'john', domain: 'example.com' } }
 *
 * @example
 * // With pattern name for better error messages
 * const parser = parsePattern(config.pattern, 'email-pattern');
 *
 * @param patternString - Regex pattern string with dot notation in group names
 * @param name - Optional name for the pattern (used in error messages)
 * @returns Parser function
 */
export declare function parsePattern<T = any>(patternString: string, name?: string): (input: string) => ParseResult<T>;
/**
 * Parses multiple pattern definitions from JSON-like objects and creates a multi-pattern parser.
 *
 * This is designed for loading pattern configurations from JSON files at runtime.
 *
 * @example
 * // From JSON config file
 * const config = {
 *   patterns: [
 *     {
 *       name: "email",
 *       pattern: "^(?<user.name>\\w+)@(?<user.domain>\\w+)$",
 *       description: "Email address"
 *     },
 *     {
 *       name: "username",
 *       pattern: "^(?<user.name>\\w+)$",
 *       description: "Simple username"
 *     }
 *   ]
 * };
 *
 * const parser = parsePatterns(config.patterns);
 * const result = parser('john@example.com');
 * // result = { success: true, pattern: 'email', value: { user: { name: 'john', domain: 'example.com' } } }
 *
 * @param patternConfigs - Array of pattern configuration objects
 * @param options - Parser options
 * @returns Parser function
 */
export declare function parsePatterns<T = any>(patternConfigs: Array<{
    name: string;
    pattern: string;
    description?: string;
}>, options?: ParserOptions): (input: string) => ParseResult<T> & {
    pattern?: string;
};
/**
 * Splits a paragraph into individual statements based on period delimiters.
 *
 * Rules:
 * - Splits on `.` followed by whitespace or end of string
 * - Ignores `?.` (optional chaining)
 * - Ignores `\.` (escaped period)
 * - Trailing period on last statement is optional
 * - Returns array even for single statement (for consistency)
 *
 * @example
 * splitStatements('First. Second. Third')
 * // ['First', 'Second', 'Third']
 *
 * splitStatements('on when #lhs?.weight gt #rhs')
 * // ['on when #lhs?.weight gt #rhs']
 *
 * splitStatements('First\\. Still first. Second.')
 * // ['First. Still first', 'Second']
 *
 * @param input - Paragraph string to split
 * @returns Array of statement strings (trimmed)
 */
export declare function splitStatements(input: string): string[];
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
export declare function parseGroupedCaptures<T = any>(input: string, patternConfigs: Array<{
    name: string;
    pattern: string;
    description?: string;
}>, options?: ParserOptions): ParseResult<T> & {
    pattern?: string;
};
/**
 * Parses a paragraph into multiple statements, applying flat group patterns to each.
 *
 * Splits the input by periods (respecting `?.` and `\.`), then parses each statement.
 * Returns an array of results, one per statement.
 *
 * @example
 * const patterns = [
 *   { name: 'comparison', pattern: '^(?<trigger>on|off)\\s+when\\s+(?<lhs>#\\w+)\\s+eq\\s+(?<rhs>#\\w+)$' },
 *   { name: 'boolean', pattern: '^(?<trigger>on|off)\\s+when\\s+(?<lhs>#\\w+)$' }
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
export declare function parseGroupedCaptureStatements<T = any>(input: string, patternConfigs: Array<{
    name: string;
    pattern: string;
    description?: string;
}>, options?: ParserOptions): StatementsResult<T>;
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
export declare function parsePatternStatements<T = any>(input: string, patternConfigs: Array<{
    name: string;
    pattern: string;
    description?: string;
}>, options?: ParserOptions): StatementsResult<T>;
/**
 * Convenience alias for parsePatternStatements.
 *
 * This is the most common use case: parsing a paragraph with nested pattern support.
 *
 * @example
 * const result = parseParagraph(paragraph, patterns);
 */
export declare const parseParagraph: typeof parsePatternStatements;
