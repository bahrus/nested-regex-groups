import { flatToNested } from './flat-to-nested.js';
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
