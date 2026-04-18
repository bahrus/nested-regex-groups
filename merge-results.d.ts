import type { ParseResult } from './types/nested-regex-groups/types.js';
/**
 * Utility to merge multiple parsed results into a single object.
 * Useful when parsing complex strings with multiple independent patterns.
 *
 * @param results - Array of parse results to merge
 * @returns Merged object or null if any parse failed
 */
export declare function mergeResults<T = any>(results: ParseResult[]): T | null;
