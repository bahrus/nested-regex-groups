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
export function flatToNested(groups: Record<string, string | undefined>): any {
  const result: any = {};
  
  for (const [key, value] of Object.entries(groups)) {
    if (value === undefined) continue;
    
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
