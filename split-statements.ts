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
export function splitStatements(input: string): string[] {
  if (!input || input.trim().length === 0) {
    return [];
  }
  
  const statements: string[] = [];
  let current = '';
  let i = 0;
  
  while (i < input.length) {
    const char = input[i];
    const prevChar = i > 0 ? input[i - 1] : '';
    const nextChar = i < input.length - 1 ? input[i + 1] : '';
    
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
