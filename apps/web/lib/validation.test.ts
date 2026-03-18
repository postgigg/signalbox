import { describe, it, expect } from 'vitest';

import {
  submitSchema,
  widgetCreateSchema,
  flowCreateSchema,
  accountCreateSchema,
  webhookCreateSchema,
  loginSchema,
  signupSchema,
  memberInviteSchema,
  apiKeyCreateSchema,
  leadUpdateSchema,
  stripHtml,
} from './validation';

// ---------------------------------------------------------------------------
// stripHtml (from validation.ts)
// ---------------------------------------------------------------------------

describe('validation/stripHtml', () => {
  it('removes tags and trims', () => {
    expect(stripHtml('  <b>hi</b>  ')).toBe('hi');
  });
});

// ---------------------------------------------------------------------------
// submitSchema
// ---------------------------------------------------------------------------

describe('submitSchema', () => {
  const validSubmit = {
    widgetKey: 'abc123',
    visitorName: 'John Doe',
    visitorEmail: 'john@example.com',
    answers: [{ stepId: 's1', optionId: 'o1', question: 'Q?', label: 'A' }],
  };

  it('accepts valid submission', () => {
    const result = submitSchema.safeParse(validSubmit);
    expect(result.success).toBe(true);
  });

  it('lowercases email', () => {
    const result = submitSchema.safeParse({
      ...validSubmit,
      visitorEmail: 'JOHN@EXAMPLE.COM',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.visitorEmail).toBe('john@example.com');
    }
  });

  it('rejects email with leading/trailing spaces', () => {
    const result = submitSchema.safeParse({
      ...validSubmit,
      visitorEmail: '  john@example.com  ',
    });
    expect(result.success).toBe(false);
  });

  it('strips HTML from visitor name', () => {
    const result = submitSchema.safeParse({
      ...validSubmit,
      visitorName: '<script>alert("xss")</script>John',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.visitorName).not.toContain('<script>');
    }
  });

  it('rejects missing widget key', () => {
    const result = submitSchema.safeParse({ ...validSubmit, widgetKey: '' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = submitSchema.safeParse({ ...validSubmit, visitorEmail: 'notanemail' });
    expect(result.success).toBe(false);
  });

  it('rejects empty answers', () => {
    const result = submitSchema.safeParse({ ...validSubmit, answers: [] });
    expect(result.success).toBe(false);
  });

  it('rejects phone with invalid characters', () => {
    const result = submitSchema.safeParse({ ...validSubmit, visitorPhone: 'abc-phone' });
    expect(result.success).toBe(false);
  });

  it('accepts valid phone', () => {
    const result = submitSchema.safeParse({ ...validSubmit, visitorPhone: '+1 (555) 123-4567' });
    expect(result.success).toBe(true);
  });

  it('rejects honeypot with content', () => {
    const result = submitSchema.safeParse({ ...validSubmit, _hp: 'bot filled this' });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// widgetCreateSchema
// ---------------------------------------------------------------------------

describe('widgetCreateSchema', () => {
  it('accepts valid widget', () => {
    const result = widgetCreateSchema.safeParse({ name: 'My Widget' });
    expect(result.success).toBe(true);
  });

  it('strips HTML from name', () => {
    const result = widgetCreateSchema.safeParse({ name: '<b>Widget</b>' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Widget');
    }
  });

  it('rejects empty name', () => {
    const result = widgetCreateSchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid domain', () => {
    const result = widgetCreateSchema.safeParse({ name: 'W', domain: 'not-a-domain' });
    expect(result.success).toBe(false);
  });

  it('accepts valid domain', () => {
    const result = widgetCreateSchema.safeParse({ name: 'W', domain: 'example.com' });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// flowCreateSchema
// ---------------------------------------------------------------------------

describe('flowCreateSchema', () => {
  const validFlow = {
    widgetId: '550e8400-e29b-41d4-a716-446655440000',
    steps: [
      {
        id: 's1',
        question: 'Q1?',
        options: [
          { id: 'o1', label: 'A', scoreWeight: 5 },
          { id: 'o2', label: 'B', scoreWeight: 10 },
        ],
      },
      {
        id: 's2',
        question: 'Q2?',
        options: [
          { id: 'o3', label: 'C', scoreWeight: 3 },
          { id: 'o4', label: 'D', scoreWeight: 8 },
        ],
      },
    ],
  };

  it('accepts valid flow', () => {
    const result = flowCreateSchema.safeParse(validFlow);
    expect(result.success).toBe(true);
  });

  it('rejects fewer than 2 steps', () => {
    const result = flowCreateSchema.safeParse({
      ...validFlow,
      steps: [validFlow.steps[0]],
    });
    expect(result.success).toBe(false);
  });

  it('rejects scoreWeight out of range', () => {
    const bad = {
      ...validFlow,
      steps: [
        {
          id: 's1',
          question: 'Q?',
          options: [
            { id: 'o1', label: 'A', scoreWeight: 100 },
            { id: 'o2', label: 'B', scoreWeight: 10 },
          ],
        },
        validFlow.steps[1],
      ],
    };
    const result = flowCreateSchema.safeParse(bad);
    expect(result.success).toBe(false);
  });

  it('rejects invalid widget UUID', () => {
    const result = flowCreateSchema.safeParse({ ...validFlow, widgetId: 'not-uuid' });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// accountCreateSchema
// ---------------------------------------------------------------------------

describe('accountCreateSchema', () => {
  it('accepts valid account', () => {
    const result = accountCreateSchema.safeParse({ name: 'Acme', slug: 'acme-corp' });
    expect(result.success).toBe(true);
  });

  it('rejects slug with uppercase', () => {
    const result = accountCreateSchema.safeParse({ name: 'Acme', slug: 'Acme-Corp' });
    expect(result.success).toBe(false);
  });

  it('rejects slug starting with hyphen', () => {
    const result = accountCreateSchema.safeParse({ name: 'Acme', slug: '-acme' });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// webhookCreateSchema
// ---------------------------------------------------------------------------

describe('webhookCreateSchema', () => {
  it('accepts valid HTTPS webhook', () => {
    const result = webhookCreateSchema.safeParse({
      url: 'https://api.example.com/webhook',
      events: ['submission.created'],
    });
    expect(result.success).toBe(true);
  });

  it('rejects HTTP webhook', () => {
    const result = webhookCreateSchema.safeParse({
      url: 'http://api.example.com/webhook',
      events: ['submission.created'],
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty events array', () => {
    const result = webhookCreateSchema.safeParse({
      url: 'https://api.example.com/webhook',
      events: [],
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid event types', () => {
    const result = webhookCreateSchema.safeParse({
      url: 'https://api.example.com/webhook',
      events: ['invalid.event'],
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// loginSchema
// ---------------------------------------------------------------------------

describe('loginSchema', () => {
  it('accepts valid login', () => {
    const result = loginSchema.safeParse({ email: 'user@test.com', password: 'password123' });
    expect(result.success).toBe(true);
  });

  it('rejects short password', () => {
    const result = loginSchema.safeParse({ email: 'user@test.com', password: 'short' });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// signupSchema
// ---------------------------------------------------------------------------

describe('signupSchema', () => {
  it('rejects mismatched passwords', () => {
    const result = signupSchema.safeParse({
      email: 'user@test.com',
      password: 'password123',
      confirmPassword: 'different',
      fullName: 'John Doe',
    });
    expect(result.success).toBe(false);
  });

  it('accepts matching passwords', () => {
    const result = signupSchema.safeParse({
      email: 'user@test.com',
      password: 'password123',
      confirmPassword: 'password123',
      fullName: 'John Doe',
    });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// memberInviteSchema
// ---------------------------------------------------------------------------

describe('memberInviteSchema', () => {
  it('accepts valid invite', () => {
    const result = memberInviteSchema.safeParse({ email: 'new@team.com', role: 'admin' });
    expect(result.success).toBe(true);
  });

  it('rejects owner role (only admin/viewer allowed)', () => {
    const result = memberInviteSchema.safeParse({ email: 'new@team.com', role: 'owner' });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// apiKeyCreateSchema
// ---------------------------------------------------------------------------

describe('apiKeyCreateSchema', () => {
  it('accepts valid key name', () => {
    const result = apiKeyCreateSchema.safeParse({ name: 'Production Key' });
    expect(result.success).toBe(true);
  });

  it('strips HTML from name', () => {
    const result = apiKeyCreateSchema.safeParse({ name: '<b>Key</b>' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Key');
    }
  });
});

// ---------------------------------------------------------------------------
// leadUpdateSchema
// ---------------------------------------------------------------------------

describe('leadUpdateSchema', () => {
  it('accepts valid status update', () => {
    const result = leadUpdateSchema.safeParse({ status: 'contacted' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid status', () => {
    const result = leadUpdateSchema.safeParse({ status: 'invalid' });
    expect(result.success).toBe(false);
  });

  it('accepts notes', () => {
    const result = leadUpdateSchema.safeParse({ notes: 'Follow up next week' });
    expect(result.success).toBe(true);
  });
});
