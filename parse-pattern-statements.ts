import type { StatementsResult, PatternConfig, ParserOptions, ParseFailure } from './types/nested-regex-groups/types.js';
import { splitStatements } from './split-statements.js';
import { tryPatterns } from './try-patterns.js';
import { convertToPatternsWithGroupMap } from './parse-patterns.js';
import { flatToNested } from './flat-to-nested.js';

/**
 * Merges default values into a parsed result value.
 * Default values with dot notation are converted to nested structure.
 * Parsed values take precedence over defaults.
 * Undefined values from optional regex groups are ignored (defaults are used instead).
 */
function mergeDefaults(parsedValue: any, defaultVals?: Record<string, unknown>): any {
  if (!defaultVals || Object.keys(defaultVals).length === 0) {
    return parsedValue;
  }
  
  // Filter out undefined values from parsedValue (from optional regex groups)
  // so they don't override defaults
  const cleanedValue = removeUndefined(parsedValue);
  
  // Convert defaultVals to nested structure
  const nestedDefaults = flatToNested(defaultVals as Record<string, string | undefined>);
  
  // Deep merge: parsed values override defaults
  return deepMerge(nestedDefaults, cleanedValue);
}

/**
 * Recursively removes undefined values from an object
 */
function removeUndefined(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(removeUndefined);
  }
  
  const result: Record<string, any> = {};
  for (const key in obj) {
    if (obj[key] !== undefined) {
      result[key] = removeUndefined(obj[key]);
    }
  }
  return result;
}

/**
 * Deep merge two objects, with values from 'override' taking precedence
 */
function deepMerge(base: any, override: any): any {
  if (!override || typeof override !== 'object') {
    return override;
  }
  
  if (!base || typeof base !== 'object') {
    return override;
  }
  
  const result = { ...base };
  
  for (const key in override) {
    if (override.hasOwnProperty(key)) {
      if (typeof override[key] === 'object' && override[key] !== null && !Array.isArray(override[key])) {
        result[key] = deepMerge(result[key], override[key]);
      } else {
        result[key] = override[key];
      }
    }
  }
  
  return result;
}

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
 *     pattern: '^(?<trigger>on|off)\\s+when\\s+(?<lhs.id>#\\w+)\\s+eq\\s+(?<rhs.id>#\\w+)$',
 *     defaultVals: { trigger: 'on', 'lhs.id': '#lhs' }
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
export function parsePatternStatements<T = any>(
  input: string,
  patternConfigs: PatternConfig[],
  options?: ParserOptions
): StatementsResult<T> {
  const statements = splitStatements(input);
  const results: StatementsResult<T>['statements'] = [];
  
  // Create a map of pattern names to their configs for default value lookup
  const configMap = new Map(patternConfigs.map(c => [c.name, c]));
  
  for (const statement of statements) {
    const result = tryPatterns<T>(statement, convertToPatternsWithGroupMap(patternConfigs), options);
    
    if (result.success) {
      // Find the matching config to get default values
      const config = result.pattern ? configMap.get(result.pattern) : undefined;
      const valueWithDefaults = mergeDefaults(result.value, config?.defaultVals);
      
      results.push({
        pattern: result.pattern,
        value: valueWithDefaults,
        matched: result.matched
      });
    } else {
      results.push({
        error: (result as ParseFailure & { pattern?: string }).error
      });
    }
  }
  
  // Overall success if all statements parsed successfully
  const success = results.every(r => !r.error);
  
  return {
    success,
    statements: results
  };
}

/**
 * Convenience alias for parsePatternStatements.
 * 
 * This is the most common use case: parsing a paragraph with nested pattern support.
 * 
 * @example
 * const result = parseParagraph(paragraph, patterns);
 */
export const parseParagraph = parsePatternStatements;
