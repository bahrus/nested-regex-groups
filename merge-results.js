/**
 * Utility to merge multiple parsed results into a single object.
 * Useful when parsing complex strings with multiple independent patterns.
 *
 * @param results - Array of parse results to merge
 * @returns Merged object or null if any parse failed
 */
export function mergeResults(results) {
    const merged = {};
    for (const result of results) {
        if (!result.success)
            return null;
        Object.assign(merged, result.value);
    }
    return merged;
}
