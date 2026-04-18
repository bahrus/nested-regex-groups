import { nestedRegex } from './nested-regex.js';
/**
 * Tries multiple patterns in order and returns the first successful match.
 *
 * @example
 * const result = tryPatterns('on when #lhs eq #rhs', [
 *   {
 *     name: 'comparison',
 *     regex: /^on when (?<lhs_id>#\w+) eq (?<rhs_id>#\w+)$/,
 *     groupMap: { lhs_id: 'lhs.id', rhs_id: 'rhs.id' }
 *   },
 *   {
 *     name: 'boolean',
 *     regex: /^on when (?<lhs_id>#\w+)$/,
 *     groupMap: { lhs_id: 'lhs.id' }
 *   }
 * ]);
 *
 * @param input - String to parse
 * @param patterns - Array of pattern definitions to try
 * @param options - Parser options
 * @returns Parse result with pattern name
 */
export function tryPatterns(input, patterns, options = {}) {
    const trimmed = input.trim();
    const errors = [];
    for (const pattern of patterns) {
        const parser = nestedRegex(pattern.regex, {
            name: pattern.name,
            groupMap: pattern.groupMap
        });
        const result = parser(trimmed);
        if (result.success) {
            return {
                ...result,
                pattern: pattern.name
            };
        }
        if (options.verbose) {
            errors.push(`${pattern.name}: ${result.error}`);
        }
    }
    return {
        success: false,
        error: options.verbose
            ? `No pattern matched. Tried:\n${errors.join('\n')}`
            : `No pattern matched input: "${trimmed.slice(0, 50)}${trimmed.length > 50 ? '...' : ''}"`,
        position: 0
    };
}
