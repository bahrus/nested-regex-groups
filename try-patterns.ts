import type { ParseResult, ParsePattern, ParserOptions, ParseFailure } from './types/nested-regex-groups/types.js';
import { nestedRegex } from './nested-regex.js';

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
export function tryPatterns<T = any>(
  input: string,
  patterns: ParsePattern[],
  options: ParserOptions = {}
): ParseResult<T> & { pattern?: string } {
  const trimmed = input.trim();
  const errors: string[] = [];
  
  for (const pattern of patterns) {
    const parser = nestedRegex<T>(pattern.regex, {
      name: pattern.name,
      groupMap: pattern.groupMap
    });
    const result = parser(trimmed);
    
    if (result.success) {
      return {
        ...result,
        pattern: pattern.name
      };
    }
    
    if (options.verbose) {
      errors.push(`${pattern.name}: ${(result as ParseFailure).error}`);
    }
  }
  
  return {
    success: false,
    error: options.verbose
      ? `No pattern matched. Tried:\n${errors.join('\n')}`
      : `No pattern matched input: "${trimmed.slice(0, 50)}${trimmed.length > 50 ? '...' : ''}"`,
    position: 0
  };
}

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
