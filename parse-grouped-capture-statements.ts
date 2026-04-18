import type { StatementsResult, PatternConfig, ParserOptions, ParseFailure } from './types/nested-regex-groups/types.js';
import { splitStatements } from './split-statements.js';
import { parseGroupedCaptures } from './parse-grouped-captures.js';

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
export function parseGroupedCaptureStatements<T = any>(
  input: string,
  patternConfigs: PatternConfig[],
  options?: ParserOptions
): StatementsResult<T> {
  const statements = splitStatements(input);
  const results: StatementsResult<T>['statements'] = [];
  
  for (const statement of statements) {
    const result = parseGroupedCaptures<T>(statement, patternConfigs, options);
    
    if (result.success) {
      results.push({
        pattern: result.pattern,
        value: result.value,
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
