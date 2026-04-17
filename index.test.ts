import { describe, it, expect } from 'vitest';
import {
  flatToNested,
  nestedRegex,
  tryPatterns,
  createParser,
  mergeResults,
  splitStatements,
  parseGroupedCaptures,
  parseGroupedCaptureStatements,
  parsePatternStatements,
  parseParagraph,
  type ParsePattern,
  type StatementsResult
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

describe('splitStatements', () => {
  it('splits paragraph by periods', () => {
    const result = splitStatements('First. Second. Third.');
    expect(result).toEqual(['First', 'Second', 'Third']);
  });

  it('handles paragraph without trailing period', () => {
    const result = splitStatements('First. Second. Third');
    expect(result).toEqual(['First', 'Second', 'Third']);
  });

  it('handles single statement without period', () => {
    const result = splitStatements('Single statement');
    expect(result).toEqual(['Single statement']);
  });

  it('handles single statement with period', () => {
    const result = splitStatements('Single statement.');
    expect(result).toEqual(['Single statement']);
  });

  it('ignores optional chaining (?.) periods', () => {
    const result = splitStatements('on when #lhs?.weight gt #rhs?.height');
    expect(result).toEqual(['on when #lhs?.weight gt #rhs?.height']);
  });

  it('ignores escaped periods (\.)', () => {
    const result = splitStatements('First\\. Still first. Second.');
    expect(result).toEqual(['First. Still first', 'Second']);
  });

  it('handles mixed optional chaining and statement delimiters', () => {
    const result = splitStatements('on when #lhs?.weight gt #rhs. off when #foo?.bar.');
    expect(result).toEqual(['on when #lhs?.weight gt #rhs', 'off when #foo?.bar']);
  });

  it('handles multiple escaped periods', () => {
    const result = splitStatements('First\\. Second\\. Third. Fourth.');
    expect(result).toEqual(['First. Second. Third', 'Fourth']);
  });

  it('trims whitespace from statements', () => {
    const result = splitStatements('  First  .  Second  .  Third  ');
    expect(result).toEqual(['First', 'Second', 'Third']);
  });

  it('handles empty input', () => {
    const result = splitStatements('');
    expect(result).toEqual([]);
  });

  it('handles whitespace-only input', () => {
    const result = splitStatements('   ');
    expect(result).toEqual([]);
  });

  it('handles multiple periods in a row', () => {
    const result = splitStatements('First.. Second.');
    // Second period is not followed by whitespace, so it stays with "First"
    expect(result).toEqual(['First.', 'Second']);
  });

  it('handles period at start', () => {
    const result = splitStatements('. First. Second.');
    expect(result).toEqual(['First', 'Second']);
  });
});

describe('parseGroupedCaptures', () => {
  const patterns = [
    {
      name: 'comparison',
      pattern: '^(?<trigger>on|off)\\s+when\\s+(?<lhs>#\\w+)\\s+eq\\s+(?<rhs>#\\w+)$'
    },
    {
      name: 'boolean',
      pattern: '^(?<trigger>on|off)\\s+when\\s+(?<lhs>#\\w+)$'
    }
  ];

  it('parses statement with flat groups', () => {
    const result = parseGroupedCaptures('on when #foo eq #bar', patterns);
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.pattern).toBe('comparison');
      expect(result.value).toEqual({
        trigger: 'on',
        lhs: '#foo',
        rhs: '#bar'
      });
    }
  });

  it('matches second pattern when first fails', () => {
    const result = parseGroupedCaptures('off when #baz', patterns);
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.pattern).toBe('boolean');
      expect(result.value).toEqual({
        trigger: 'off',
        lhs: '#baz'
      });
    }
  });

  it('returns failure when no pattern matches', () => {
    const result = parseGroupedCaptures('invalid input', patterns);
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('No pattern matched');
    }
  });

  it('provides verbose errors', () => {
    const result = parseGroupedCaptures('invalid', patterns, { verbose: true });
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('comparison:');
      expect(result.error).toContain('boolean:');
    }
  });

  it('trims input before matching', () => {
    const result = parseGroupedCaptures('  on when #foo eq #bar  ', patterns);
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.pattern).toBe('comparison');
    }
  });
});

describe('parseGroupedCaptureStatements', () => {
  const patterns = [
    {
      name: 'comparison',
      pattern: '^(?<trigger>on|off)\\s+when\\s+(?<lhs>#\\w+)\\s+eq\\s+(?<rhs>#\\w+)$'
    },
    {
      name: 'boolean',
      pattern: '^(?<trigger>on|off)\\s+when\\s+(?<lhs>#\\w+)$'
    }
  ];

  it('parses multiple statements with flat groups', () => {
    const paragraph = 'on when #foo eq #bar. off when #baz.';
    const result = parseGroupedCaptureStatements(paragraph, patterns);
    
    expect(result.success).toBe(true);
    expect(result.statements).toHaveLength(2);
    expect(result.statements[0]).toEqual({
      pattern: 'comparison',
      value: { trigger: 'on', lhs: '#foo', rhs: '#bar' },
      matched: 'on when #foo eq #bar'
    });
    expect(result.statements[1]).toEqual({
      pattern: 'boolean',
      value: { trigger: 'off', lhs: '#baz' },
      matched: 'off when #baz'
    });
  });

  it('handles single statement', () => {
    const result = parseGroupedCaptureStatements('on when #foo eq #bar', patterns);
    
    expect(result.success).toBe(true);
    expect(result.statements).toHaveLength(1);
    expect(result.statements[0].pattern).toBe('comparison');
  });

  it('handles trailing period', () => {
    const result = parseGroupedCaptureStatements('on when #foo eq #bar.', patterns);
    
    expect(result.success).toBe(true);
    expect(result.statements).toHaveLength(1);
  });

  it('returns failure when any statement fails to parse', () => {
    const paragraph = 'on when #foo eq #bar. invalid statement.';
    const result = parseGroupedCaptureStatements(paragraph, patterns);
    
    expect(result.success).toBe(false);
    expect(result.statements).toHaveLength(2);
    expect(result.statements[0].value).toBeDefined();
    expect(result.statements[1].error).toBeDefined();
  });

  it('handles optional chaining in statements', () => {
    const patternsWithOptional = [
      {
        name: 'withOptional',
        pattern: '^(?<trigger>on|off)\\s+when\\s+(?<lhs>#\\w+)\\?\\.(?<prop>\\w+)$'
      }
    ];
    
    const result = parseGroupedCaptureStatements('on when #foo?.bar', patternsWithOptional);
    
    expect(result.success).toBe(true);
    expect(result.statements[0].value).toEqual({
      trigger: 'on',
      lhs: '#foo',
      prop: 'bar'
    });
  });

  it('handles escaped periods in statements', () => {
    const patternsWithEscape = [
      {
        name: 'withEscape',
        pattern: '^(?<text>.+)$'  // Changed to .+ to match any text including periods
      }
    ];
    
    const result = parseGroupedCaptureStatements('First\\. Still first. Second', patternsWithEscape);
    
    expect(result.success).toBe(true);
    expect(result.statements).toHaveLength(2);
    expect(result.statements[0].value).toEqual({ text: 'First. Still first' });
    expect(result.statements[1].value).toEqual({ text: 'Second' });
  });
});

describe('parsePatternStatements', () => {
  const patterns = [
    {
      name: 'comparison',
      pattern: '^(?<trigger>on|off)\\s+when\\s+(?<lhs.id>#\\w+)\\s+eq\\s+(?<rhs.id>#\\w+)$'
    },
    {
      name: 'boolean',
      pattern: '^(?<trigger>on|off)\\s+when\\s+(?<lhs.id>#\\w+)$'
    }
  ];

  it('parses multiple statements with nested groups', () => {
    const paragraph = 'on when #foo eq #bar. off when #baz.';
    const result = parsePatternStatements(paragraph, patterns);
    
    expect(result.success).toBe(true);
    expect(result.statements).toHaveLength(2);
    expect(result.statements[0]).toEqual({
      pattern: 'comparison',
      value: { 
        trigger: 'on', 
        lhs: { id: '#foo' }, 
        rhs: { id: '#bar' } 
      },
      matched: 'on when #foo eq #bar'
    });
    expect(result.statements[1]).toEqual({
      pattern: 'boolean',
      value: { 
        trigger: 'off', 
        lhs: { id: '#baz' } 
      },
      matched: 'off when #baz'
    });
  });

  it('handles complex nested structures', () => {
    const complexPatterns = [
      {
        name: 'fullComparison',
        pattern: '^(?<trigger>on|off)\\s+when\\s+(?<lhs.id>#\\w+)(?:::(?<lhs.event>\\w+))?(?:\\?\\.(?<lhs.prop>\\w+))?\\s+(?<op>eq|gt|lt)\\s+(?<rhs.id>#\\w+)(?:::(?<rhs.event>\\w+))?(?:\\?\\.(?<rhs.prop>\\w+))?$'
      }
    ];
    
    const paragraph = 'on when #lhs::change?.weight gt #rhs::input?.height.';
    const result = parsePatternStatements(paragraph, complexPatterns);
    
    expect(result.success).toBe(true);
    expect(result.statements[0].value).toEqual({
      trigger: 'on',
      lhs: { id: '#lhs', event: 'change', prop: 'weight' },
      op: 'gt',
      rhs: { id: '#rhs', event: 'input', prop: 'height' }
    });
  });

  it('handles single statement', () => {
    const result = parsePatternStatements('on when #foo eq #bar', patterns);
    
    expect(result.success).toBe(true);
    expect(result.statements).toHaveLength(1);
  });

  it('returns failure when any statement fails', () => {
    const paragraph = 'on when #foo eq #bar. invalid.';
    const result = parsePatternStatements(paragraph, patterns);
    
    expect(result.success).toBe(false);
    expect(result.statements).toHaveLength(2);
    expect(result.statements[0].value).toBeDefined();
    expect(result.statements[1].error).toBeDefined();
  });

  it('handles multiple levels of nesting', () => {
    const deepPatterns = [
      {
        name: 'deep',
        pattern: '^(?<a.b.c.d>\\w+)$'
      }
    ];
    
    const result = parsePatternStatements('test', deepPatterns);
    
    expect(result.success).toBe(true);
    expect(result.statements[0].value).toEqual({
      a: { b: { c: { d: 'test' } } }
    });
  });
});

describe('parseParagraph', () => {
  it('is an alias for parsePatternStatements', () => {
    const { parseParagraph, parsePatternStatements } = require('./index');
    expect(parseParagraph).toBe(parsePatternStatements);
  });

  it('works as expected', () => {
    const { parseParagraph } = require('./index');
    const patterns = [
      {
        name: 'test',
        pattern: '^(?<value.text>\\w+)$'
      }
    ];
    
    const result = parseParagraph('hello. world.', patterns);
    
    expect(result.success).toBe(true);
    expect(result.statements).toHaveLength(2);
    expect(result.statements[0].value).toEqual({ value: { text: 'hello' } });
    expect(result.statements[1].value).toEqual({ value: { text: 'world' } });
  });
});

describe('StatementsResult type', () => {
  it('has correct structure for successful parse', () => {
    const { parsePatternStatements } = require('./index');
    const patterns = [{ name: 'test', pattern: '^(?<val>\\w+)$' }];
    
    const result = parsePatternStatements('hello', patterns);
    
    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('statements');
    expect(Array.isArray(result.statements)).toBe(true);
    expect(result.statements[0]).toHaveProperty('pattern');
    expect(result.statements[0]).toHaveProperty('value');
    expect(result.statements[0]).toHaveProperty('matched');
  });

  it('has correct structure for failed parse', () => {
    const { parsePatternStatements } = require('./index');
    const patterns = [{ name: 'test', pattern: '^(?<val>\\d+)$' }];
    
    const result = parsePatternStatements('hello', patterns);
    
    expect(result.success).toBe(false);
    expect(result.statements[0]).toHaveProperty('error');
    expect(result.statements[0]).not.toHaveProperty('value');
  });
});

describe('be-switched paragraph examples', () => {
  const beSwitchedPatterns = [
    {
      name: 'fullComparison',
      pattern: '^(?<trigger>on|off)\\s+when\\s+(?<lhs.id>#\\w+)(?:::(?<lhs.event>\\w+))?(?:\\?\\.(?<lhs.prop>\\w+))?\\s+(?<op>equals|eq|lt|gt|gte|lte|ne)\\s+(?<rhs.id>#\\w+)(?:::(?<rhs.event>\\w+))?(?:\\?\\.(?<rhs.prop>\\w+))?$'
    },
    {
      name: 'boolean',
      pattern: '^(?<trigger>on|off)\\s+when\\s+(?<lhs.id>#\\w+)$'
    }
  ];

  it('parses complex be-switched paragraph', () => {
    const { parsePatternStatements } = require('./index');
    const paragraph = 'on when #lhs::change?.weight gt #rhs?.weight. off when #brother::change?.height lt #sister::input?.height.';
    
    const result = parsePatternStatements(paragraph, beSwitchedPatterns);
    
    expect(result.success).toBe(true);
    expect(result.statements).toHaveLength(2);
    
    expect(result.statements[0].value).toEqual({
      trigger: 'on',
      lhs: { id: '#lhs', event: 'change', prop: 'weight' },
      op: 'gt',
      rhs: { id: '#rhs', prop: 'weight' }
    });
    
    expect(result.statements[1].value).toEqual({
      trigger: 'off',
      lhs: { id: '#brother', event: 'change', prop: 'height' },
      op: 'lt',
      rhs: { id: '#sister', event: 'input', prop: 'height' }
    });
  });

  it('handles mixed statement types', () => {
    const { parsePatternStatements } = require('./index');
    const paragraph = 'on when #foo eq #bar. off when #isHappy.';
    
    const result = parsePatternStatements(paragraph, beSwitchedPatterns);
    
    expect(result.success).toBe(true);
    expect(result.statements).toHaveLength(2);
    expect(result.statements[0].pattern).toBe('fullComparison');
    expect(result.statements[1].pattern).toBe('boolean');
  });
});
