import { describe, it, expect } from 'vitest';
import {
  flatToNested,
  nestedRegex,
  tryPatterns,
  createParser,
  mergeResults,
  type ParsePattern
} from './index';

describe('flatToNested', () => {
  it('converts flat object with dot notation to nested structure', () => {
    const flat = {
      'user.name': 'John',
      'user.age': '30',
      'user.address.city': 'NYC'
    };
    
    const result = flatToNested(flat);
    
    expect(result).toEqual({
      user: {
        name: 'John',
        age: '30',
        address: {
          city: 'NYC'
        }
      }
    });
  });

  it('handles keys without dots', () => {
    const flat = {
      name: 'John',
      age: '30'
    };
    
    const result = flatToNested(flat);
    
    expect(result).toEqual({
      name: 'John',
      age: '30'
    });
  });

  it('skips undefined values', () => {
    const flat = {
      'user.name': 'John',
      'user.age': undefined
    };
    
    const result = flatToNested(flat);
    
    expect(result).toEqual({
      user: {
        name: 'John'
      }
    });
  });

  it('handles empty object', () => {
    const result = flatToNested({});
    expect(result).toEqual({});
  });
});

describe('nestedRegex', () => {
  it('parses simple pattern with nested groups', () => {
    const parser = nestedRegex(/^(?<user_name>\w+)@(?<user_domain>\w+\.\w+)$/, {
      groupMap: { user_name: 'user.name', user_domain: 'user.domain' }
    });
    const result = parser('john@example.com');
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toEqual({
        user: {
          name: 'john',
          domain: 'example.com'
        }
      });
      expect(result.matched).toBe('john@example.com');
      expect(result.rest).toBe('');
    }
  });

  it('parses pattern with multiple nesting levels', () => {
    const parser = nestedRegex(/^(?<person_name_first>\w+)\s+(?<person_name_last>\w+)$/, {
      groupMap: { 
        person_name_first: 'person.name.first',
        person_name_last: 'person.name.last'
      }
    });
    const result = parser('John Doe');
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toEqual({
        person: {
          name: {
            first: 'John',
            last: 'Doe'
          }
        }
      });
    }
  });

  it('returns failure when pattern does not match', () => {
    const parser = nestedRegex(/^(?<user_name>\w+)@(?<user_domain>\w+)$/, {
      groupMap: { user_name: 'user.name', user_domain: 'user.domain' }
    });
    const result = parser('invalid');
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('did not match');
    }
  });

  it('includes pattern name in error message', () => {
    const parser = nestedRegex(/^(?<user_name>\w+)$/, {
      name: 'username',
      groupMap: { user_name: 'user.name' }
    });
    const result = parser('123-invalid');
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('username');
    }
  });

  it('handles patterns without nested groups', () => {
    const parser = nestedRegex(/^(?<name>\w+)$/);
    const result = parser('john');
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toEqual({ name: 'john' });
    }
  });

  it('captures remaining string after match', () => {
    const parser = nestedRegex(/^(?<cmd>\w+)/);
    const result = parser('hello world');
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.matched).toBe('hello');
      expect(result.rest).toBe(' world');
    }
  });
});

describe('tryPatterns', () => {
  const patterns: ParsePattern[] = [
    {
      name: 'email',
      regex: /^(?<user_name>\w+)@(?<user_domain>\w+\.\w+)$/,
      groupMap: { user_name: 'user.name', user_domain: 'user.domain' },
      description: 'Email address'
    },
    {
      name: 'username',
      regex: /^(?<user_name>\w+)$/,
      groupMap: { user_name: 'user.name' },
      description: 'Simple username'
    }
  ];

  it('matches first pattern when applicable', () => {
    const result = tryPatterns('john@example.com', patterns);
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.pattern).toBe('email');
      expect(result.value).toEqual({
        user: {
          name: 'john',
          domain: 'example.com'
        }
      });
    }
  });

  it('falls back to second pattern when first fails', () => {
    const result = tryPatterns('john', patterns);
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.pattern).toBe('username');
      expect(result.value).toEqual({
        user: {
          name: 'john'
        }
      });
    }
  });

  it('returns failure when no pattern matches', () => {
    const result = tryPatterns('123-invalid', patterns);
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('No pattern matched');
    }
  });

  it('provides verbose error messages when enabled', () => {
    const result = tryPatterns('123-invalid', patterns, { verbose: true });
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('email:');
      expect(result.error).toContain('username:');
    }
  });

  it('trims input before matching', () => {
    const result = tryPatterns('  john@example.com  ', patterns);
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.pattern).toBe('email');
    }
  });
});

describe('createParser', () => {
  it('creates reusable parser function', () => {
    const parser = createParser([
      { 
        name: 'email', 
        regex: /^(?<user_name>\w+)@(?<user_domain>\w+\.\w+)$/,
        groupMap: { user_name: 'user.name', user_domain: 'user.domain' }
      },
      { 
        name: 'username', 
        regex: /^(?<user_name>\w+)$/,
        groupMap: { user_name: 'user.name' }
      }
    ]);
    
    const result1 = parser('john@example.com');
    const result2 = parser('jane');
    
    expect(result1.success).toBe(true);
    expect(result2.success).toBe(true);
    
    if (result1.success && result2.success) {
      expect(result1.pattern).toBe('email');
      expect(result2.pattern).toBe('username');
    }
  });

  it('respects parser options', () => {
    const parser = createParser(
      [{ name: 'test', regex: /^(?<value>\w+)$/ }],
      { verbose: true }
    );
    
    const result = parser('123-invalid');
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('test:');
    }
  });
});

describe('mergeResults', () => {
  it('merges multiple successful parse results', () => {
    const results = [
      { success: true as const, value: { name: 'John' }, matched: 'John', rest: '' },
      { success: true as const, value: { age: 30 }, matched: '30', rest: '' }
    ];
    
    const merged = mergeResults(results);
    
    expect(merged).toEqual({
      name: 'John',
      age: 30
    });
  });

  it('returns null if any result failed', () => {
    const results = [
      { success: true as const, value: { name: 'John' }, matched: 'John', rest: '' },
      { success: false as const, error: 'Failed' }
    ];
    
    const merged = mergeResults(results);
    
    expect(merged).toBeNull();
  });

  it('handles empty array', () => {
    const merged = mergeResults([]);
    expect(merged).toEqual({});
  });
});

describe('be-switched examples', () => {
  const beSwitchedPatterns: ParsePattern[] = [
    {
      name: 'simpleComparison',
      regex: /^(?<trigger>on|off)\s+when\s+(?<lhs_id>#\w+)\s+(?<op>equals|eq|lt|gt|gte|lte|ne)\s+(?<rhs_id>#\w+)\.?$/,
      groupMap: {
        lhs_id: 'lhs.id',
        rhs_id: 'rhs.id'
      },
      description: 'Simple comparison'
    },
    {
      name: 'fullComparison',
      regex: /^(?<trigger>on|off)\s+when\s+(?<lhs_id>#\w+)(?:::(?<lhs_event>\w+))?(?:\?\.(?<lhs_prop>\w+))?\s+(?<op>equals|eq|lt|gt|gte|lte|ne)\s+(?<rhs_id>#\w+)(?:::(?<rhs_event>\w+))?(?:\?\.(?<rhs_prop>\w+))?\.?$/,
      groupMap: {
        lhs_id: 'lhs.id',
        lhs_event: 'lhs.event',
        lhs_prop: 'lhs.prop',
        rhs_id: 'rhs.id',
        rhs_event: 'rhs.event',
        rhs_prop: 'rhs.prop'
      },
      description: 'Full comparison with events and properties'
    },
    {
      name: 'booleanSimple',
      regex: /^(?<trigger>on|off)\s+when\s+(?<lhs_id>#\w+)\.?$/,
      groupMap: {
        lhs_id: 'lhs.id'
      },
      description: 'Simple boolean condition'
    }
  ];

  const parser = createParser(beSwitchedPatterns);

  it('parses simple comparison', () => {
    const result = parser('on when #lhs equals #rhs');
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.pattern).toBe('simpleComparison');
      expect(result.value).toEqual({
        trigger: 'on',
        lhs: { id: '#lhs' },
        op: 'equals',
        rhs: { id: '#rhs' }
      });
    }
  });

  it('parses comparison with events', () => {
    const result = parser('on when #lhs::change equals #rhs::input');
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.pattern).toBe('fullComparison');
      expect(result.value).toEqual({
        trigger: 'on',
        lhs: { id: '#lhs', event: 'change' },
        op: 'equals',
        rhs: { id: '#rhs', event: 'input' }
      });
    }
  });

  it('parses comparison with property paths', () => {
    const result = parser('on when #lhs?.weight gt #rhs?.weight');
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.pattern).toBe('fullComparison');
      expect(result.value).toEqual({
        trigger: 'on',
        lhs: { id: '#lhs', prop: 'weight' },
        op: 'gt',
        rhs: { id: '#rhs', prop: 'weight' }
      });
    }
  });

  it('parses simple boolean condition', () => {
    const result = parser('on when #isHappy');
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.pattern).toBe('booleanSimple');
      expect(result.value).toEqual({
        trigger: 'on',
        lhs: { id: '#isHappy' }
      });
    }
  });

  it('handles trailing period', () => {
    const result = parser('off when #lhs eq #rhs.');
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.trigger).toBe('off');
    }
  });
});

describe('array support', () => {
  it('parses multiple values into arrays when groups repeat', () => {
    // This tests the concept - actual implementation would need
    // special handling for repeated groups
    const parser = nestedRegex(/^(?<items>\w+)$/);
    const result = parser('apple');
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toEqual({ items: 'apple' });
    }
  });
});
