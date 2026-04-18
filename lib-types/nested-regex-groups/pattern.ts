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
