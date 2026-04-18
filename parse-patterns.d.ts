import type { ParseResult, ParsePattern, PatternConfig, ParserOptions } from './types/nested-regex-groups/types.js';
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
 * Helper to convert pattern configs to ParsePattern format with groupMap.
 * Exported for reuse by parse-pattern-statements module.
 */
export declare function convertToPatternsWithGroupMap(patternConfigs: PatternConfig[]): ParsePattern[];
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
export declare function parsePatterns<T = any>(patternConfigs: PatternConfig[], options?: ParserOptions): (input: string) => ParseResult<T> & {
    pattern?: string;
};
