import { ParserOptions } from './types/nested-regex-groups/types';
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
export declare function splitStatements(input: string, options?: ParserOptions): string[];
