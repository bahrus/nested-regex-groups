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
