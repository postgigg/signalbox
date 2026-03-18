import { describe, it, expect } from 'vitest';

import { stripHtml } from './sanitize';

describe('stripHtml', () => {
  it('removes basic HTML tags', () => {
    expect(stripHtml('<b>bold</b>')).toBe('bold');
  });

  it('removes nested tags', () => {
    expect(stripHtml('<div><p>nested</p></div>')).toBe('nested');
  });

  it('removes self-closing tags', () => {
    expect(stripHtml('line1<br/>line2')).toBe('line1line2');
  });

  it('removes script tags and content', () => {
    expect(stripHtml('<script>alert("xss")</script>safe')).toBe('alert("xss")safe');
  });

  it('removes unclosed tags', () => {
    expect(stripHtml('text<br')).toBe('text');
  });

  it('trims whitespace', () => {
    expect(stripHtml('  hello  ')).toBe('hello');
  });

  it('removes null bytes', () => {
    expect(stripHtml('he\0llo')).toBe('hello');
  });

  it('removes HTML entities', () => {
    expect(stripHtml('a&amp;b')).toBe('ab');
    expect(stripHtml('a&#60;b')).toBe('ab');
  });

  it('returns empty string for tags only', () => {
    expect(stripHtml('<div></div>')).toBe('');
  });

  it('preserves plain text', () => {
    expect(stripHtml('just text')).toBe('just text');
  });
});
