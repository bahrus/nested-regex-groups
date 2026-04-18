import { nestedRegex } from './nested-regex.js';
/**
 * Parses a regex pattern string with dot notation in group names and creates a parser.
 *
 * This is designed for runtime parsing of patterns stored in JSON config files.
 * The pattern string should use dots in group names, which will be automatically
 * converted to underscores for JavaScript regex compatibility.
 *
 * @example
 * // From JSON config
 * const config = {
 *   pattern: "^(?<user.name>\\w+)@(?<user.domain>\\w+)$"
 * };
 *
 * const parser = parsePattern(config.pattern);
 * const result = parser('john@example.com');
 * // result.value = { user: { name: 'john', domain: 'example.com' } }
 *
 * @example
 * // With pattern name for better error messages
 * const parser = parsePattern(config.pattern, 'email-pattern');
 *
 * @param patternString - Regex pattern string with dot notation in group names
 * @param name - Optional name for the pattern (used in error messages)
 * @returns Parser function
 */
export function parsePattern(patternString, name) {
    // Extract all named capture groups
    const groupRegex = /\(\?<([^>]+)>/g;
    const groups = [];
    let match;
    while ((match = groupRegex.exec(patternString)) !== null) {
        const original = match[1];
        const sanitized = original.replace(/\./g, '_');
        groups.push({ original, sanitized });
    }
    // Create groupMap for groups that have dots
    const groupMap = {};
    for (const { original, sanitized } of groups) {
        if (original !== sanitized) {
            groupMap[sanitized] = original;
        }
    }
    // Replace dots with underscores in the pattern
    const sanitizedPattern = patternString.replace(/\(\?<([^>]+)>/g, (match, groupName) => {
        return `(?<${groupName.replace(/\./g, '_')}>`;
    });
    // Create regex from sanitized pattern
    const regex = new RegExp(sanitizedPattern);
    // Return parser with groupMap
    return nestedRegex(regex, {
        name,
        groupMap: Object.keys(groupMap).length > 0 ? groupMap : undefined
    });
}
