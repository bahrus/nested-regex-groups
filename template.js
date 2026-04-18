import { nestedRegex } from './nested-regex.js';
import { createParser } from './create-parser.js';
/**
 * Extracts all named capture groups from a regex pattern string
 * Returns both the original names (with dots) and sanitized names (with underscores)
 */
function extractGroups(pattern) {
    const groupRegex = /\(\?<([^>]+)>/g;
    const groups = [];
    let match;
    while ((match = groupRegex.exec(pattern)) !== null) {
        const original = match[1];
        const sanitized = original.replace(/\./g, '_');
        groups.push({ original, sanitized });
    }
    return groups;
}
/**
 * Replaces dots in capture group names with underscores
 */
function sanitizePattern(pattern) {
    return pattern.replace(/\(\?<([^>]+)>/g, (match, groupName) => {
        return `(?<${groupName.replace(/\./g, '_')}>`;
    });
}
/**
 * Creates a groupMap from extracted groups
 */
function createGroupMap(groups) {
    const groupMap = {};
    for (const { original, sanitized } of groups) {
        if (original !== sanitized) {
            groupMap[sanitized] = original;
        }
    }
    return groupMap;
}
/**
 * Template tag for creating regex parsers with dot notation in capture group names.
 *
 * Automatically converts dots in group names to underscores and creates the groupMap.
 *
 * @example
 * import { rx } from 'nested-regex-groups/template';
 *
 * const parser = rx`^(?<person.name.first>\w+)\s+(?<person.name.last>\w+)$`;
 * const result = parser('John Doe');
 * // result.value = { person: { name: { first: 'John', last: 'Doe' } } }
 *
 * @param strings - Template string array
 * @param values - Interpolated values
 * @returns Parser function
 */
export function rx(strings, ...values) {
    // Reconstruct the pattern string from template parts using raw strings
    // This preserves backslashes like \w, \s, etc.
    let pattern = strings.raw[0];
    for (let i = 0; i < values.length; i++) {
        pattern += String(values[i]) + strings.raw[i + 1];
    }
    // Extract groups and create mapping
    const groups = extractGroups(pattern);
    const groupMap = createGroupMap(groups);
    const sanitizedPattern = sanitizePattern(pattern);
    // Create regex with sanitized pattern
    const regex = new RegExp(sanitizedPattern);
    // Return parser with groupMap
    return nestedRegex(regex, {
        groupMap: Object.keys(groupMap).length > 0 ? groupMap : undefined
    });
}
/**
 * Template tag for creating multi-pattern parsers with dot notation support.
 *
 * @example
 * import { rxPattern } from 'nested-regex-groups/template';
 *
 * const patterns = [
 *   rxPattern('email')`^(?<user.name>\w+)@(?<user.domain>\w+)$`,
 *   rxPattern('username')`^(?<user.name>\w+)$`
 * ];
 *
 * const parser = createParser(patterns);
 *
 * @param name - Pattern name
 * @param description - Optional pattern description
 * @returns Template tag function that returns a ParsePattern
 */
export function rxPattern(name, description) {
    return (strings, ...values) => {
        // Reconstruct the pattern string using raw strings
        let pattern = strings.raw[0];
        for (let i = 0; i < values.length; i++) {
            pattern += String(values[i]) + strings.raw[i + 1];
        }
        // Extract groups and create mapping
        const groups = extractGroups(pattern);
        const groupMap = createGroupMap(groups);
        const sanitizedPattern = sanitizePattern(pattern);
        return {
            name,
            regex: new RegExp(sanitizedPattern),
            groupMap: Object.keys(groupMap).length > 0 ? groupMap : undefined,
            description
        };
    };
}
/**
 * Helper to create a parser from multiple rxPattern definitions
 *
 * @example
 * import { rxParser, rxPattern } from 'nested-regex-groups/template';
 *
 * const parser = rxParser([
 *   rxPattern('email')`^(?<user.name>\w+)@(?<user.domain>\w+)$`,
 *   rxPattern('username')`^(?<user.name>\w+)$`
 * ]);
 *
 * @param patterns - Array of patterns created with rxPattern
 * @param options - Parser options
 * @returns Parser function
 */
export function rxParser(patterns, options) {
    return createParser(patterns, options);
}
