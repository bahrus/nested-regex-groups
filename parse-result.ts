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
