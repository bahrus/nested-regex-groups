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
export declare function flatToNested(groups: Record<string, string | undefined>): any;
