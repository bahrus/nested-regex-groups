import type { ParseResult, ParsePattern, PatternConfig, ParserOptions } from './types/nested-regex-groups/types.js';
import { nestedRegex } from './nested-regex.js';
import { createParser } from './try-patterns.js';

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
export function parsePattern<T = any>(
  patternString: string,
  name?: string
): (input: string) => ParseResult<T> {
  // Extract all named capture groups
  const groupRegex = /\(\?<([^>]+)>/g;
  const groups: { original: string; sanitized: string }[] = [];
  let match;
  
  while ((match = groupRegex.exec(patternString)) !== null) {
    const original = match[1];
    const sanitized = original.replace(/\./g, '_');
    groups.push({ original, sanitized });
  }
  
  // Create groupMap for groups that have dots
  const groupMap: Record<string, string> = {};
  for (const { original, sanitized } of groups) {
    if (original !== sanitized) {
      groupMap[sanitized] = original;
    }
  }
  
  // Replace dots with underscores in the pattern
  const sanitizedPattern = patternString.replace(/\(\?<([^>]+)>/g, (match, groupName) => {
    return `(?<${groupName.replace(/\./g, '_')}>`;
  });
  
  // Create regex from sanitized pattern
  const regex = new RegExp(sanitizedPattern);
  
  // Return parser with groupMap
  return nestedRegex<T>(regex, {
    name,
    groupMap: Object.keys(groupMap).length > 0 ? groupMap : undefined
  });
}

/**
 * Helper to convert pattern configs to ParsePattern format with groupMap.
 * Exported for reuse by parse-pattern-statements module.
 */
export function convertToPatternsWithGroupMap(
  patternConfigs: PatternConfig[]
): ParsePattern[] {
  return patternConfigs.map(config => {
    // Extract groups and create mapping (same logic as parsePattern)
    const groupRegex = /\(\?<([^>]+)>/g;
    const groups: { original: string; sanitized: string }[] = [];
    let match;
    
    while ((match = groupRegex.exec(config.pattern)) !== null) {
      const original = match[1];
      const sanitized = original.replace(/\./g, '_');
      groups.push({ original, sanitized });
    }
    
    // Create groupMap
    const groupMap: Record<string, string> = {};
    for (const { original, sanitized } of groups) {
      if (original !== sanitized) {
        groupMap[sanitized] = original;
      }
    }
    
    // Sanitize pattern
    const sanitizedPattern = config.pattern.replace(/\(\?<([^>]+)>/g, (match, groupName) => {
      return `(?<${groupName.replace(/\./g, '_')}>`;
    });
    
    return {
      name: config.name,
      regex: new RegExp(sanitizedPattern),
      groupMap: Object.keys(groupMap).length > 0 ? groupMap : undefined,
      description: config.description
    };
  });
}

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
export function parsePatterns<T = any>(
  patternConfigs: PatternConfig[],
  options?: ParserOptions
): (input: string) => ParseResult<T> & { pattern?: string } {
  const patterns = convertToPatternsWithGroupMap(patternConfigs);
  return createParser<T>(patterns, options);
}
