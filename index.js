/**
 * Converts a flat object with dot-notation keys into a nested object structure.
 *
 * @example
 * flatToNested({ 'user.name': 'John', 'user.age': '30' })
 * // Returns: { user: { name: 'John', age: '30' } }
 *
 * @param groups - Object with potentially dot-notated keys
 * @returns Nested object structure
 */
export function flatToNested(groups) {
    const result = {};
    for (const [key, value] of Object.entries(groups)) {
        if (value === undefined)
            continue;
        const parts = key.split('.');
        let current = result;
        for (let i = 0; i < parts.length - 1; i++) {
            if (!current[parts[i]]) {
                current[parts[i]] = {};
            }
            current = current[parts[i]];
        }
        current[parts[parts.length - 1]] = value;
    }
    return result;
}
/**
 * Applies a group mapping to convert underscore-based group names to dot notation
 *
 * @param groups - Original groups from regex match
 * @param groupMap - Mapping from original names to dot-notation paths
 * @returns Remapped groups object
 */
function applyGroupMap(groups, groupMap) {
    if (!groupMap)
        return groups;
    const remapped = {};
    for (const [key, value] of Object.entries(groups)) {
        const mappedKey = groupMap[key] || key;
        remapped[mappedKey] = value;
    }
    return remapped;
}
/**
 * Creates a parser function from a single regex pattern with dot-notation support.
 *
 * Since JavaScript regex doesn't support dots in capture group names, you can either:
 * 1. Use underscores in regex and provide a groupMap to convert them
 * 2. Use dots directly if your regex engine supports it (future-proofing)
 *
 * @example
 * // Using groupMap (recommended for compatibility)
 * const parser = nestedRegex(/^(?<user_name>\w+)@(?<user_domain>\w+)$/, {
 *   groupMap: { user_name: 'user.name', user_domain: 'user.domain' }
 * });
 * const result = parser('john@example.com');
 * // result.value = { user: { name: 'john', domain: 'example.com' } }
 *
 * @param pattern - Regular expression with named capture groups
 * @param options - Options including name and groupMap
 * @returns Parser function
 */
export function nestedRegex(pattern, options) {
    return (input) => {
        const match = input.match(pattern);
        if (!match || !match.groups) {
            return {
                success: false,
                error: options?.name
                    ? `Pattern '${options.name}' did not match`
                    : 'Pattern did not match',
                position: 0
            };
        }
        const remapped = applyGroupMap(match.groups, options?.groupMap);
        const nested = flatToNested(remapped);
        return {
            success: true,
            value: nested,
            matched: match[0],
            rest: input.slice(match[0].length)
        };
    };
}
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
/**
 * Creates an optimized parser function from an array of patterns.
 *
 * @example
 * const parser = createParser([
 *   {
 *     name: 'email',
 *     regex: /^(?<user_name>\w+)@(?<user_domain>\w+)$/,
 *     groupMap: { user_name: 'user.name', user_domain: 'user.domain' }
 *   },
 *   {
 *     name: 'username',
 *     regex: /^(?<user_name>\w+)$/,
 *     groupMap: { user_name: 'user.name' }
 *   }
 * ]);
 *
 * const result = parser('john@example.com');
 * // result = { success: true, value: { user: { name: 'john', domain: 'example.com' } }, pattern: 'email' }
 *
 * @param patterns - Array of pattern definitions
 * @param options - Parser options
 * @returns Parser function
 */
export function createParser(patterns, options = {}) {
    return (input) => tryPatterns(input, patterns, options);
}
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
    // Convert pattern configs to ParsePattern objects
    const patterns = patternConfigs.map(config => {
        // Extract groups and create mapping
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
    return createParser(patterns, options);
}
/**
 * Splits a paragraph into individual statements based on period delimiters.
 *
 * Rules:
 * - Splits on `.` followed by whitespace or end of string
 * - Ignores `?.` (optional chaining)
 * - Ignores `\.` (escaped period)
 * - Trailing period on last statement is optional
 * - Returns array even for single statement (for consistency)
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
 * @param input - Paragraph string to split
 * @returns Array of statement strings (trimmed)
 */
export function splitStatements(input) {
    if (!input || input.trim().length === 0) {
        return [];
    }
    const statements = [];
    let current = '';
    let i = 0;
    while (i < input.length) {
        const char = input[i];
        const prevChar = i > 0 ? input[i - 1] : '';
        const nextChar = i < input.length - 1 ? input[i + 1] : '';
        if (char === '.') {
            // Check if it's escaped: \.
            if (prevChar === '\\') {
                // Remove the escape character and add the period
                current = current.slice(0, -1) + '.';
                i++;
                continue;
            }
            // Check if it's optional chaining: ?.
            if (prevChar === '?') {
                current += char;
                i++;
                continue;
            }
            // It's a statement delimiter
            // Only split if followed by whitespace or end of string
            if (nextChar === '' || /\s/.test(nextChar)) {
                const trimmed = current.trim();
                if (trimmed.length > 0) {
                    statements.push(trimmed);
                }
                current = '';
                i++;
                // Skip whitespace after period
                while (i < input.length && /\s/.test(input[i])) {
                    i++;
                }
                continue;
            }
        }
        current += char;
        i++;
    }
    // Add remaining content as final statement
    const trimmed = current.trim();
    if (trimmed.length > 0) {
        statements.push(trimmed);
    }
    return statements;
}
/**
 * Parses multiple patterns against a single statement (flat groups, no nesting).
 *
 * This is for patterns that use standard regex named groups without dots.
 * The regex engine will throw an error if dots are used in group names.
 *
 * @example
 * const patterns = [
 *   { name: 'comparison', pattern: '^(?<trigger>on|off)\\s+when\\s+(?<lhs>#\\w+)\\s+eq\\s+(?<rhs>#\\w+)$' }
 * ];
 *
 * const result = parseGroupedCaptures('on when #foo eq #bar', patterns);
 * // { success: true, pattern: 'comparison', value: { trigger: 'on', lhs: '#foo', rhs: '#bar' } }
 *
 * @param input - String to parse
 * @param patternConfigs - Array of pattern configurations (no dots in group names)
 * @param options - Parser options
 * @returns Parse result with flat object
 */
export function parseGroupedCaptures(input, patternConfigs, options) {
    const trimmed = input.trim();
    const errors = [];
    for (const config of patternConfigs) {
        try {
            const regex = new RegExp(config.pattern);
            const match = trimmed.match(regex);
            if (match && match.groups) {
                return {
                    success: true,
                    value: match.groups,
                    matched: match[0],
                    rest: trimmed.slice(match[0].length),
                    pattern: config.name
                };
            }
            if (options?.verbose) {
                errors.push(`${config.name}: Pattern did not match`);
            }
        }
        catch (error) {
            if (options?.verbose) {
                errors.push(`${config.name}: ${error instanceof Error ? error.message : 'Invalid pattern'}`);
            }
        }
    }
    return {
        success: false,
        error: options?.verbose
            ? `No pattern matched. Tried:\n${errors.join('\n')}`
            : `No pattern matched input: "${trimmed.slice(0, 50)}${trimmed.length > 50 ? '...' : ''}"`,
        position: 0
    };
}
/**
 * Parses a paragraph into multiple statements, applying flat group patterns to each.
 *
 * Splits the input by periods (respecting `?.` and `\.`), then parses each statement.
 * Returns an array of results, one per statement.
 *
 * @example
 * const patterns = [
 *   { name: 'comparison', pattern: '^(?<trigger>on|off)\\s+when\\s+(?<lhs>#\\w+)\\s+eq\\s+(?<rhs>#\\w+)$' },
 *   { name: 'boolean', pattern: '^(?<trigger>on|off)\\s+when\\s+(?<lhs>#\\w+)$' }
 * ];
 *
 * const paragraph = 'on when #foo eq #bar. off when #baz.';
 * const result = parseGroupedCaptureStatements(paragraph, patterns);
 * // {
 * //   success: true,
 * //   statements: [
 * //     { pattern: 'comparison', value: { trigger: 'on', lhs: '#foo', rhs: '#bar' } },
 * //     { pattern: 'boolean', value: { trigger: 'off', lhs: '#baz' } }
 * //   ]
 * // }
 *
 * @param input - Paragraph string to parse
 * @param patternConfigs - Array of pattern configurations (no dots in group names)
 * @param options - Parser options
 * @returns Statements result with array of flat objects
 */
export function parseGroupedCaptureStatements(input, patternConfigs, options) {
    const statements = splitStatements(input);
    const results = [];
    for (const statement of statements) {
        const result = parseGroupedCaptures(statement, patternConfigs, options);
        if (result.success) {
            results.push({
                pattern: result.pattern,
                value: result.value,
                matched: result.matched
            });
        }
        else {
            results.push({
                error: result.error
            });
        }
    }
    // Overall success if all statements parsed successfully
    const success = results.every(r => !r.error);
    return {
        success,
        statements: results
    };
}
/**
 * Parses a paragraph into multiple statements, applying nested patterns to each.
 *
 * Splits the input by periods (respecting `?.` and `\.`), then parses each statement
 * using patterns with dot notation support for nested objects.
 *
 * @example
 * const patterns = [
 *   {
 *     name: 'comparison',
 *     pattern: '^(?<trigger>on|off)\\s+when\\s+(?<lhs.id>#\\w+)\\s+eq\\s+(?<rhs.id>#\\w+)$'
 *   },
 *   {
 *     name: 'boolean',
 *     pattern: '^(?<trigger>on|off)\\s+when\\s+(?<lhs.id>#\\w+)$'
 *   }
 * ];
 *
 * const paragraph = 'on when #foo eq #bar. off when #baz.';
 * const result = parsePatternStatements(paragraph, patterns);
 * // {
 * //   success: true,
 * //   statements: [
 * //     { pattern: 'comparison', value: { trigger: 'on', lhs: { id: '#foo' }, rhs: { id: '#bar' } } },
 * //     { pattern: 'boolean', value: { trigger: 'off', lhs: { id: '#baz' } } }
 * //   ]
 * // }
 *
 * @param input - Paragraph string to parse
 * @param patternConfigs - Array of pattern configurations (with dot notation support)
 * @param options - Parser options
 * @returns Statements result with array of nested objects
 */
export function parsePatternStatements(input, patternConfigs, options) {
    const statements = splitStatements(input);
    const results = [];
    for (const statement of statements) {
        const result = tryPatterns(statement, convertToPatternsWithGroupMap(patternConfigs), options);
        if (result.success) {
            results.push({
                pattern: result.pattern,
                value: result.value,
                matched: result.matched
            });
        }
        else {
            results.push({
                error: result.error
            });
        }
    }
    // Overall success if all statements parsed successfully
    const success = results.every(r => !r.error);
    return {
        success,
        statements: results
    };
}
/**
 * Helper to convert pattern configs to ParsePattern format with groupMap
 */
function convertToPatternsWithGroupMap(patternConfigs) {
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
 * Convenience alias for parsePatternStatements.
 *
 * This is the most common use case: parsing a paragraph with nested pattern support.
 *
 * @example
 * const result = parseParagraph(paragraph, patterns);
 */
export const parseParagraph = parsePatternStatements;
