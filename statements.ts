/**
 * Result type for parsing multiple statements
 */
export interface StatementsResult<T = any> {
  success: boolean;
  statements: Array<{
    pattern?: string;
    value?: T;
    error?: string;
    matched?: string;
  }>;
}
