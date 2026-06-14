/**
 * Options for splitStatements
 */
export interface SplitStatementsOptions {
  /**
   * When true, periods inside matched pairs of { } are not treated
   * as statement delimiters.
   */
  ignorePeriodInsideBraces?: boolean;
}

/**
 * Splits a paragraph into individual statements based on period delimiters.
 * 
 * Rules:
 * - Splits on `.` followed by whitespace or end of string
 * - Ignores `?.` (optional chaining)
 * - Ignores `\.` (escaped period)
 * - Trailing period on last statement is optional
 * - Returns array even for single statement (for consistency)
 * - When ignorePeriodInsideBraces is true, periods inside { } pairs are not split on
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
 * splitStatements('#search then ON{"?": "Searching...", ":": "idle"}.', { ignorePeriodInsideBraces: true })
 * // ['#search then ON{"?": "Searching...", ":": "idle"}']
 * 
 * @param input - Paragraph string to split
 * @param options - Optional configuration
 * @returns Array of statement strings (trimmed)
 */
export function splitStatements(input: string, options?: SplitStatementsOptions): string[] {
  if (!input || input.trim().length === 0) {
    return [];
  }
  
  const ignoreBraces = options?.ignorePeriodInsideBraces ?? false;
  const statements: string[] = [];
  let current = '';
  let i = 0;
  let braceDepth = 0;
  
  while (i < input.length) {
    const char = input[i];
    const prevChar = i > 0 ? input[i - 1] : '';
    const nextChar = i < input.length - 1 ? input[i + 1] : '';
    
    if (ignoreBraces) {
      if (char === '{') {
        braceDepth++;
        current += char;
        i++;
        continue;
      }
      if (char === '}') {
        braceDepth--;
        current += char;
        i++;
        continue;
      }
    }

    if (char === '.') {
      // Check if it's escaped: \.
      if (prevChar === '\\') {
        // Remove the escape character and add the period
        current = current.slice(0, -1) + '.';
        i++;
        continue;
      }
      
      // Check if it's optional chaining: ?.
      if (prevChar === '?') {
        current += char;
        i++;
        continue;
      }

      // If inside braces, don't treat as delimiter
      if (ignoreBraces && braceDepth > 0) {
        current += char;
        i++;
        continue;
      }
      
      // It's a statement delimiter
      // Only split if followed by whitespace or end of string
      if (nextChar === '' || /\s/.test(nextChar)) {
        const trimmed = current.trim();
        if (trimmed.length > 0) {
          statements.push(trimmed);
        }
        current = '';
        i++;
        // Skip whitespace after period
        while (i < input.length && /\s/.test(input[i])) {
          i++;
        }
        continue;
      }
    }
    
    current += char;
    i++;
  }
  
  // Add remaining content as final statement
  const trimmed = current.trim();
  if (trimmed.length > 0) {
    statements.push(trimmed);
  }
  
  return statements;
}
