import { describe, it, expect } from 'vitest';
import { cx } from './cx';

describe('cx', () => {
  it('returns a single string', () => {
    expect(cx('foo')).toBe('foo');
  });

  it('joins multiple strings', () => {
    expect(cx('foo', 'bar')).toBe('foo bar');
  });

  it('flattens arrays of strings', () => {
    expect(cx(['foo', 'bar'], 'baz')).toBe('foo bar baz');
  });

  it('handles object with true/false values', () => {
    expect(cx({ foo: true, bar: false, baz: true })).toBe('foo baz');
  });

  it('mixes strings, arrays, and objects', () => {
    expect(cx('foo', ['bar', 'baz'], { qux: true, quux: false })).toBe('foo bar baz qux');
  });

  it('ignores empty strings', () => {
    expect(cx('', 'foo')).toBe(' foo');
  });

  it('returns empty string for no arguments', () => {
    expect(cx()).toBe('');
  });

  it('handles object with all false values', () => {
    expect(cx({ foo: false, bar: false })).toBe('');
  });
});
