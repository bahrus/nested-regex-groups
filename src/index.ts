/**
 * Result of a successful parse operation
 */
export interface ParseSuccess<T = any> {
  success: true;
  value: T;
  matched: string;
  rest: string;
}

/**
 * Result of a failed parse operation
 */
export interface ParseFailure {
  success: false;
  error: string;
  position?: number;
}

/**
 * Union type for parse results
 */
export type ParseResult<T = any> = ParseSuccess<T> | ParseFailure;

/**
 * A pattern definition with metadata
 */
export interface ParsePattern {
  name: string;
  regex: RegExp;
  description?: string;
  /**
   * Optional mapping from regex group names to dot-notation paths
   * Example: { user_name: 'user.name', user_domain: 'user.domain' }
   */
  groupMap?: Record<string, string>;
}

/**
 * Options for nestedRegex function
 */
export interface NestedRegexOptions {
  /**
   * Optional name for the pattern (used in error messages)
   */
  name?: string;
  /**
   * Optional mapping from regex group names to dot-notation paths
   * Example: { user_name: 'user.name', user_domain: 'user.domain' }
   */
  groupMap?: Record<string, string>;
}

/**
 * Options for creating a parser
 */
export interface ParserOptions {
  /**
   * If true, returns detailed error information when no pattern matches
   */
  verbose?: boolean;
}

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
export function flatToNested(groups: Record<string, string | undefined>): any {
  const result: any = {};
  
  for (const [key, value] of Object.entries(groups)) {
    if (value === undefined) continue;
    
    const parts = key.split('.');
    let current = result;
    
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }
    
    current[parts[parts.length - 1]] = value;
  }
  
  return result;
}

/**
 * Applies a group mapping to convert underscore-based group names to dot notation
 * 
 * @param groups - Original groups from regex match
 * @param groupMap - Mapping from original names to dot-notation paths
 * @returns Remapped groups object
 */
function applyGroupMap(
  groups: Record<string, string | undefined>,
  groupMap?: Record<string, string>
): Record<string, string | undefined> {
  if (!groupMap) return groups;
  
  const remapped: Record<string, string | undefined> = {};
  
  for (const [key, value] of Object.entries(groups)) {
    const mappedKey = groupMap[key] || key;
    remapped[mappedKey] = value;
  }
  
  return remapped;
}

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
export function nestedRegex<T = any>(
  pattern: RegExp,
  options?: NestedRegexOptions
): (input: string) => ParseResult<T> {
  return (input: string): ParseResult<T> => {
    const match = input.match(pattern);
    
    if (!match || !match.groups) {
      return {
        success: false,
        error: options?.name 
          ? `Pattern '${options.name}' did not match`
          : 'Pattern did not match',
        position: 0
      };
    }
    
    const remapped = applyGroupMap(match.groups, options?.groupMap);
    const nested = flatToNested(remapped);
    
    return {
      success: true,
      value: nested as T,
      matched: match[0],
      rest: input.slice(match[0].length)
    };
  };
}

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
      errors.push(`${pattern.name}: ${result.error}`);
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

/**
 * Utility to merge multiple parsed results into a single object.
 * Useful when parsing complex strings with multiple independent patterns.
 * 
 * @param results - Array of parse results to merge
 * @returns Merged object or null if any parse failed
 */
export function mergeResults<T = any>(results: ParseResult[]): T | null {
  const merged: any = {};
  
  for (const result of results) {
    if (!result.success) return null;
    Object.assign(merged, result.value);
  }
  
  return merged as T;
}

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
  patternConfigs: Array<{
    name: string;
    pattern: string;
    description?: string;
  }>,
  options?: ParserOptions
): (input: string) => ParseResult<T> & { pattern?: string } {
  // Convert pattern configs to ParsePattern objects
  const patterns: ParsePattern[] = patternConfigs.map(config => {
    // Extract groups and create mapping
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
  
  return createParser<T>(patterns, options);
}
