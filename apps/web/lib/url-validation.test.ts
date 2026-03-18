import { describe, it, expect } from 'vitest';

import { validateWebhookUrl, isPrivateIp } from './url-validation';

describe('validateWebhookUrl', () => {
  it('accepts valid HTTPS URL', () => {
    const result = validateWebhookUrl('https://api.example.com/webhook');
    expect(result.valid).toBe(true);
  });

  it('rejects HTTP URL', () => {
    const result = validateWebhookUrl('http://api.example.com/webhook');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('HTTPS');
  });

  it('rejects localhost', () => {
    const result = validateWebhookUrl('https://localhost/webhook');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('localhost');
  });

  it('rejects localhost.localdomain', () => {
    const result = validateWebhookUrl('https://localhost.localdomain/hook');
    expect(result.valid).toBe(false);
  });

  it('rejects subdomain of localhost', () => {
    const result = validateWebhookUrl('https://sub.localhost/hook');
    expect(result.valid).toBe(false);
  });

  it('rejects private IPs (10.x)', () => {
    const result = validateWebhookUrl('https://10.0.0.1/webhook');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('private');
  });

  it('rejects private IPs (192.168.x)', () => {
    const result = validateWebhookUrl('https://192.168.1.1/webhook');
    expect(result.valid).toBe(false);
  });

  it('rejects private IPs (172.16.x)', () => {
    const result = validateWebhookUrl('https://172.16.0.1/webhook');
    expect(result.valid).toBe(false);
  });

  it('rejects loopback (127.x)', () => {
    const result = validateWebhookUrl('https://127.0.0.1/webhook');
    expect(result.valid).toBe(false);
  });

  it('rejects non-standard ports', () => {
    const result = validateWebhookUrl('https://api.example.com:8443/webhook');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('port');
  });

  it('accepts port 443 explicitly', () => {
    const result = validateWebhookUrl('https://api.example.com:443/webhook');
    expect(result.valid).toBe(true);
  });

  it('rejects URLs with credentials', () => {
    const result = validateWebhookUrl('https://user:pass@api.example.com/webhook');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('credentials');
  });

  it('rejects invalid URL format', () => {
    const result = validateWebhookUrl('not a url');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid URL');
  });
});

describe('isPrivateIp', () => {
  it('identifies 10.x as private', () => {
    expect(isPrivateIp('10.0.0.1')).toBe(true);
    expect(isPrivateIp('10.255.255.255')).toBe(true);
  });

  it('identifies 192.168.x as private', () => {
    expect(isPrivateIp('192.168.0.1')).toBe(true);
  });

  it('identifies 172.16-31.x as private', () => {
    expect(isPrivateIp('172.16.0.1')).toBe(true);
    expect(isPrivateIp('172.31.255.255')).toBe(true);
  });

  it('identifies 172.32.x as public', () => {
    expect(isPrivateIp('172.32.0.1')).toBe(false);
  });

  it('identifies 127.x as private (loopback)', () => {
    expect(isPrivateIp('127.0.0.1')).toBe(true);
  });

  it('identifies public IPs as non-private', () => {
    expect(isPrivateIp('8.8.8.8')).toBe(false);
    expect(isPrivateIp('1.1.1.1')).toBe(false);
  });

  it('identifies IPv6 loopback', () => {
    expect(isPrivateIp('::1')).toBe(true);
  });

  it('identifies non-IP strings as not private', () => {
    expect(isPrivateIp('example.com')).toBe(false);
  });
});
