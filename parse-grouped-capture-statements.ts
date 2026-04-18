import type { StatementsResult, PatternConfig, ParserOptions, ParseFailure } from './types/nested-regex-groups/types.js';
import { splitStatements } from './split-statements.js';
import { parseGroupedCaptures } from './parse-grouped-captures.js';

/**
 * Merges default values into a parsed result value (flat structure).
 * For flat parsing, default values are merged directly without nesting.
 * Parsed values take precedence over defaults.
 * Undefined values from optional regex groups are ignored (defaults are used instead).
 */
function mergeDefaults(parsedValue: any, defaultVals?: Record<string, string>): any {
  if (!defaultVals || Object.keys(defaultVals).length === 0) {
    return parsedValue;
  }
  
  // Filter out undefined values from parsedValue (from optional regex groups)
  // so they don't override defaults
  const definedValues: Record<string, unknown> = {};
  for (const key in parsedValue) {
    if (parsedValue[key] !== undefined) {
      definedValues[key] = parsedValue[key];
    }
  }
  
  // For flat parsing, merge at the top level
  // Parsed values (excluding undefined) override defaults
  return { ...defaultVals, ...definedValues };
}

/**
 * Parses a paragraph into multiple statements, applying flat group patterns to each.
 * 
 * Splits the input by periods (respecting `?.` and `\.`), then parses each statement.
 * Returns an array of results, one per statement.
 * 
 * @example
 * const patterns = [
 *   { 
 *     name: 'comparison', 
 *     pattern: '^(?<trigger>on|off)\\s+when\\s+(?<lhs>#\\w+)\\s+eq\\s+(?<rhs>#\\w+)$',
 *     defaultVals: { trigger: 'on' }
 *   },
 *   { 
 *     name: 'boolean', 
 *     pattern: '^(?<trigger>on|off)\\s+when\\s+(?<lhs>#\\w+)$' 
 *   }
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
export function parseGroupedCaptureStatements<T = any>(
  input: string,
  patternConfigs: PatternConfig[],
  options?: ParserOptions
): StatementsResult<T> {
  const statements = splitStatements(input);
  const results: StatementsResult<T>['statements'] = [];
  
  // Create a map of pattern names to their configs for default value lookup
  const configMap = new Map(patternConfigs.map(c => [c.name, c]));
  
  for (const statement of statements) {
    const result = parseGroupedCaptures<T>(statement, patternConfigs, options);
    
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
        error: (result as ParseFailure).error
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
