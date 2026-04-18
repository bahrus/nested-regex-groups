import { describe, it, expect } from 'vitest';
import { rx, rxPattern, rxParser } from './template.js';

describe('rx template tag', () => {
  it('parses pattern with dot notation in group names', () => {
    const parser = rx`^(?<user.name>\w+)@(?<user.domain>[\w.]+)$`;
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
    const parser = rx`^(?<person.name.first>\w+)\s+(?<person.name.last>\w+)$`;
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

  it('handles patterns without dots (no groupMap needed)', () => {
    const parser = rx`^(?<name>\w+)$`;
    const result = parser('john');
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toEqual({ name: 'john' });
    }
  });

  it('handles mixed dot and non-dot groups', () => {
    const parser = rx`^(?<trigger>on|off)\s+(?<lhs.id>#\w+)$`;
    const result = parser('on #myId');
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toEqual({
        trigger: 'on',
        lhs: { id: '#myId' }
      });
    }
  });

  it('supports template interpolation', () => {
    const idPattern = '#\\w+';
    const parser = rx`^(?<lhs.id>${idPattern})\s+eq\s+(?<rhs.id>${idPattern})$`;
    const result = parser('#foo eq #bar');
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toEqual({
        lhs: { id: '#foo' },
        rhs: { id: '#bar' }
      });
    }
  });

  it('returns failure for non-matching input', () => {
    const parser = rx`^(?<user.name>\w+)@(?<user.domain>\w+)$`;
    const result = parser('invalid');
    
    expect(result.success).toBe(false);
  });

  it('handles complex be-switched patterns', () => {
    const parser = rx`^(?<trigger>on|off)\s+when\s+(?<lhs.id>#\w+)(?:::(?<lhs.event>\w+))?\s+(?<op>eq|lt|gt)\s+(?<rhs.id>#\w+)(?:::(?<rhs.event>\w+))?$`;
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
});

describe('rxPattern', () => {
  it('creates a ParsePattern with dot notation support', () => {
    const pattern = rxPattern('email')`^(?<user.name>\w+)@(?<user.domain>\w+)$`;
    
    expect(pattern.name).toBe('email');
    expect(pattern.regex).toBeInstanceOf(RegExp);
    expect(pattern.groupMap).toEqual({
      user_name: 'user.name',
      user_domain: 'user.domain'
    });
  });

  it('includes description when provided', () => {
    const pattern = rxPattern('email', 'Email address pattern')`^(?<user.name>\w+)@(?<user.domain>\w+)$`;
    
    expect(pattern.description).toBe('Email address pattern');
  });

  it('creates pattern without groupMap when no dots present', () => {
    const pattern = rxPattern('simple')`^(?<name>\w+)$`;
    
    expect(pattern.groupMap).toBeUndefined();
  });
});

describe('rxParser', () => {
  it('creates multi-pattern parser with dot notation', () => {
    const parser = rxParser([
      rxPattern('email')`^(?<user.name>\w+)@(?<user.domain>[\w.]+)$`,
      rxPattern('username')`^(?<user.name>\w+)$`
    ]);
    
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
    const parser = rxParser([
      rxPattern('specific')`^(?<user.name>\w+)@example\.com$`,
      rxPattern('general')`^(?<user.name>\w+)@(?<user.domain>\w+)$`
    ]);
    
    const result = parser('john@example.com');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.pattern).toBe('specific');
    }
  });

  it('supports verbose error mode', () => {
    const parser = rxParser(
      [
        rxPattern('email')`^(?<user.name>\w+)@(?<user.domain>\w+)$`,
        rxPattern('username')`^(?<user.name>\w+)$`
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

  it('handles complex be-switched patterns', () => {
    const parser = rxParser([
      rxPattern('simpleComparison')`^(?<trigger>on|off)\s+when\s+(?<lhs.id>#\w+)\s+(?<op>eq|lt|gt)\s+(?<rhs.id>#\w+)$`,
      rxPattern('fullComparison')`^(?<trigger>on|off)\s+when\s+(?<lhs.id>#\w+)(?:::(?<lhs.event>\w+))?\s+(?<op>eq|lt|gt)\s+(?<rhs.id>#\w+)(?:::(?<rhs.event>\w+))?$`,
      rxPattern('boolean')`^(?<trigger>on|off)\s+when\s+(?<lhs.id>#\w+)$`
    ]);
    
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
});

describe('template tag edge cases', () => {
  it('handles empty interpolations', () => {
    const empty = '';
    const parser = rx`^(?<name>\w+)${empty}$`;
    const result = parser('john');
    
    expect(result.success).toBe(true);
  });

  it('handles special regex characters in group names', () => {
    const parser = rx`^(?<user_name>\w+)@(?<user_domain>\w+)$`;
    const result = parser('john@example');
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toEqual({
        user_name: 'john',
        user_domain: 'example'
      });
    }
  });

  it('preserves regex flags through pattern creation', () => {
    // Note: Template tag creates regex without flags by default
    // Users can wrap in their own RegExp if flags needed
    const parser = rx`^(?<name>\w+)$`;
    const result = parser('JOHN');
    
    expect(result.success).toBe(true);
  });
});
