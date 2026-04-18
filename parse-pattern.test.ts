import { describe, it, expect } from 'vitest';
import { parsePattern, parsePatterns } from './index.js';

describe('parsePattern', () => {
  it('parses pattern string with dot notation', () => {
    const parser = parsePattern('^(?<user.name>\\w+)@(?<user.domain>[\\w.]+)$');
    const result = parser('john@example.com');
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toEqual({
        user: {
          name: 'john',
          domain: 'example.com'
        }
      });
    }
  });

  it('handles multiple nesting levels', () => {
    const parser = parsePattern('^(?<person.name.first>\\w+)\\s+(?<person.name.last>\\w+)$');
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

  it('handles patterns without dots', () => {
    const parser = parsePattern('^(?<name>\\w+)$');
    const result = parser('john');
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toEqual({ name: 'john' });
    }
  });

  it('handles mixed dot and non-dot groups', () => {
    const parser = parsePattern('^(?<trigger>on|off)\\s+(?<lhs.id>#\\w+)$');
    const result = parser('on #myId');
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toEqual({
        trigger: 'on',
        lhs: { id: '#myId' }
      });
    }
  });

  it('includes pattern name in error messages', () => {
    const parser = parsePattern('^(?<user.name>\\w+)$', 'username-pattern');
    const result = parser('123-invalid');
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('username-pattern');
    }
  });

  it('returns failure for non-matching input', () => {
    const parser = parsePattern('^(?<user.name>\\w+)@(?<user.domain>\\w+)$');
    const result = parser('invalid');
    
    expect(result.success).toBe(false);
  });

  it('handles complex be-switched patterns', () => {
    const parser = parsePattern(
      '^(?<trigger>on|off)\\s+when\\s+(?<lhs.id>#\\w+)(?:::(?<lhs.event>\\w+))?\\s+(?<op>eq|lt|gt)\\s+(?<rhs.id>#\\w+)(?:::(?<rhs.event>\\w+))?$'
    );
    const result = parser('on when #lhs::change eq #rhs::input');
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toEqual({
        trigger: 'on',
        lhs: { id: '#lhs', event: 'change' },
        op: 'eq',
        rhs: { id: '#rhs', event: 'input' }
      });
    }
  });

  it('works with patterns from JSON.parse', () => {
    // Simulate loading from JSON file
    const jsonString = JSON.stringify({
      pattern: '^(?<user.name>\\w+)@(?<user.domain>[\\w.]+)$'
    });
    
    const config = JSON.parse(jsonString);
    const parser = parsePattern(config.pattern);
    const result = parser('john@example.com');
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toEqual({
        user: {
          name: 'john',
          domain: 'example.com'
        }
      });
    }
  });
});

describe('parsePatterns', () => {
  it('parses multiple pattern configs from JSON-like objects', () => {
    const config = {
      patterns: [
        {
          name: 'email',
          pattern: '^(?<user.name>\\w+)@(?<user.domain>[\\w.]+)$',
          description: 'Email address'
        },
        {
          name: 'username',
          pattern: '^(?<user.name>\\w+)$',
          description: 'Simple username'
        }
      ]
    };
    
    const parser = parsePatterns(config.patterns);
    
    const result1 = parser('john@example.com');
    expect(result1.success).toBe(true);
    if (result1.success) {
      expect(result1.pattern).toBe('email');
      expect(result1.value).toEqual({
        user: {
          name: 'john',
          domain: 'example.com'
        }
      });
    }
    
    const result2 = parser('jane');
    expect(result2.success).toBe(true);
    if (result2.success) {
      expect(result2.pattern).toBe('username');
      expect(result2.value).toEqual({
        user: { name: 'jane' }
      });
    }
  });

  it('respects pattern priority order', () => {
    const parser = parsePatterns([
      {
        name: 'specific',
        pattern: '^(?<user.name>\\w+)@example\\.com$'
      },
      {
        name: 'general',
        pattern: '^(?<user.name>\\w+)@(?<user.domain>\\w+)$'
      }
    ]);
    
    const result = parser('john@example.com');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.pattern).toBe('specific');
    }
  });

  it('supports verbose error mode', () => {
    const parser = parsePatterns(
      [
        { name: 'email', pattern: '^(?<user.name>\\w+)@(?<user.domain>\\w+)$' },
        { name: 'username', pattern: '^(?<user.name>\\w+)$' }
      ],
      { verbose: true }
    );
    
    const result = parser('123-invalid');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('email:');
      expect(result.error).toContain('username:');
    }
  });

  it('handles complex be-switched patterns from config', () => {
    const config = {
      patterns: [
        {
          name: 'simpleComparison',
          pattern: '^(?<trigger>on|off)\\s+when\\s+(?<lhs.id>#\\w+)\\s+(?<op>eq|lt|gt)\\s+(?<rhs.id>#\\w+)$'
        },
        {
          name: 'fullComparison',
          pattern: '^(?<trigger>on|off)\\s+when\\s+(?<lhs.id>#\\w+)(?:::(?<lhs.event>\\w+))?\\s+(?<op>eq|lt|gt)\\s+(?<rhs.id>#\\w+)(?:::(?<rhs.event>\\w+))?$'
        },
        {
          name: 'boolean',
          pattern: '^(?<trigger>on|off)\\s+when\\s+(?<lhs.id>#\\w+)$'
        }
      ]
    };
    
    const parser = parsePatterns(config.patterns);
    
    const result1 = parser('on when #lhs eq #rhs');
    expect(result1.success).toBe(true);
    if (result1.success) {
      expect(result1.pattern).toBe('simpleComparison');
      expect(result1.value).toEqual({
        trigger: 'on',
        lhs: { id: '#lhs' },
        op: 'eq',
        rhs: { id: '#rhs' }
      });
    }
    
    const result2 = parser('on when #lhs::change eq #rhs::input');
    expect(result2.success).toBe(true);
    if (result2.success) {
      expect(result2.pattern).toBe('fullComparison');
      expect(result2.value).toEqual({
        trigger: 'on',
        lhs: { id: '#lhs', event: 'change' },
        op: 'eq',
        rhs: { id: '#rhs', event: 'input' }
      });
    }
    
    const result3 = parser('off when #isHappy');
    expect(result3.success).toBe(true);
    if (result3.success) {
      expect(result3.pattern).toBe('boolean');
      expect(result3.value).toEqual({
        trigger: 'off',
        lhs: { id: '#isHappy' }
      });
    }
  });

  it('works with actual JSON.parse from file content', () => {
    // Simulate reading and parsing a JSON config file
    const jsonContent = `{
      "patterns": [
        {
          "name": "email",
          "pattern": "^(?<user.name>\\\\w+)@(?<user.domain>[\\\\w.]+)$",
          "description": "Email address"
        },
        {
          "name": "username",
          "pattern": "^(?<user.name>\\\\w+)$",
          "description": "Username only"
        }
      ]
    }`;
    
    const config = JSON.parse(jsonContent);
    const parser = parsePatterns(config.patterns);
    
    const result = parser('john@example.com');
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
});

describe('JSON config workflow', () => {
  it('demonstrates complete JSON config workflow', () => {
    // Step 1: Define config (would be in a .json file)
    const configJson = `{
      "parserName": "be-switched",
      "patterns": [
        {
          "name": "comparison",
          "pattern": "^(?<trigger>on|off)\\\\s+when\\\\s+(?<lhs.id>#\\\\w+)\\\\s+(?<op>eq)\\\\s+(?<rhs.id>#\\\\w+)$",
          "description": "Simple comparison"
        },
        {
          "name": "boolean",
          "pattern": "^(?<trigger>on|off)\\\\s+when\\\\s+(?<lhs.id>#\\\\w+)$",
          "description": "Boolean condition"
        }
      ]
    }`;
    
    // Step 2: Load and parse config at runtime
    const config = JSON.parse(configJson);
    
    // Step 3: Create parser from config
    const parser = parsePatterns(config.patterns);
    
    // Step 4: Use parser
    const result1 = parser('on when #lhs eq #rhs');
    expect(result1.success).toBe(true);
    if (result1.success) {
      expect(result1.pattern).toBe('comparison');
      expect(result1.value).toEqual({
        trigger: 'on',
        lhs: { id: '#lhs' },
        op: 'eq',
        rhs: { id: '#rhs' }
      });
    }
    
    const result2 = parser('off when #isHappy');
    expect(result2.success).toBe(true);
    if (result2.success) {
      expect(result2.pattern).toBe('boolean');
      expect(result2.value).toEqual({
        trigger: 'off',
        lhs: { id: '#isHappy' }
      });
    }
  });
});
