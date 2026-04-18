import { createParser } from './create-parser.js';
/**
 * Helper to convert pattern configs to ParsePattern format with groupMap.
 * Exported for reuse by parse-pattern-statements module.
 */
export function convertToPatternsWithGroupMap(patternConfigs) {
    return patternConfigs.map(config => {
        // Extract groups and create mapping (same logic as parsePatterns)
        const groupRegex = /\(\?<([^>]+)>/g;
        const groups = [];
        let match;
        while ((match = groupRegex.exec(config.pattern)) !== null) {
            const original = match[1];
            const sanitized = original.replace(/\./g, '_');
            groups.push({ original, sanitized });
        }
        // Create groupMap
        const groupMap = {};
        for (const { original, sanitized } of groups) {
            if (original !== sanitized) {
                groupMap[sanitized] = original;
            }
        }
        // Sanitize pattern
        const sanitizedPattern = config.pattern.replace(/\(\?<([^>]+)>/g, (match, groupName) => {
            return `(?<${groupName.replace(/\./g, '_')}>`;
        });
        return {
            name: config.name,
            regex: new RegExp(sanitizedPattern),
            groupMap: Object.keys(groupMap).length > 0 ? groupMap : undefined,
            description: config.description
        };
    });
}
/**
 * Parses multiple pattern definitions from JSON-like objects and creates a multi-pattern parser.
 *
 * This is designed for loading pattern configurations from JSON files at runtime.
 *
 * @example
 * // From JSON config file
 * const config = {
 *   patterns: [
 *     {
 *       name: "email",
 *       pattern: "^(?<user.name>\\w+)@(?<user.domain>\\w+)$",
 *       description: "Email address"
 *     },
 *     {
 *       name: "username",
 *       pattern: "^(?<user.name>\\w+)$",
 *       description: "Simple username"
 *     }
 *   ]
 * };
 *
 * const parser = parsePatterns(config.patterns);
 * const result = parser('john@example.com');
 * // result = { success: true, pattern: 'email', value: { user: { name: 'john', domain: 'example.com' } } }
 *
 * @param patternConfigs - Array of pattern configuration objects
 * @param options - Parser options
 * @returns Parser function
 */
export function parsePatterns(patternConfigs, options) {
    const patterns = convertToPatternsWithGroupMap(patternConfigs);
    return createParser(patterns, options);
}
