import { describe, it, expect } from 'vitest';

import {
  calculateLeadScore,
  generateSuggestedOpener,
  denormalizeAnswers,
  parseFlowSteps,
  validateFlowSteps,
} from './scoring';

import type { FlowStep, Answer } from './scoring';

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

const STEPS: FlowStep[] = [
  {
    id: 'step-1',
    question: 'What is your budget?',
    options: [
      { id: 'opt-1a', label: 'Under $1k', scoreWeight: -10 },
      { id: 'opt-1b', label: '$1k-$5k', scoreWeight: 5 },
      { id: 'opt-1c', label: '$5k+', scoreWeight: 20 },
    ],
  },
  {
    id: 'step-2',
    question: 'When do you need this?',
    options: [
      { id: 'opt-2a', label: 'ASAP', scoreWeight: 15 },
      { id: 'opt-2b', label: '1-3 months', scoreWeight: 5 },
      { id: 'opt-2c', label: 'Not sure', scoreWeight: -5 },
    ],
  },
];

// ---------------------------------------------------------------------------
// calculateLeadScore
// ---------------------------------------------------------------------------

describe('calculateLeadScore', () => {
  it('returns hot tier for high scores', () => {
    const answers: Answer[] = [
      { stepId: 'step-1', optionId: 'opt-1c' },
      { stepId: 'step-2', optionId: 'opt-2a' },
    ];
    const result = calculateLeadScore(STEPS, answers);
    expect(result.leadTier).toBe('hot');
    expect(result.leadScore).toBeGreaterThanOrEqual(70);
    expect(result.rawScore).toBe(35);
  });

  it('returns cold tier for low scores', () => {
    const answers: Answer[] = [
      { stepId: 'step-1', optionId: 'opt-1a' },
      { stepId: 'step-2', optionId: 'opt-2c' },
    ];
    const result = calculateLeadScore(STEPS, answers);
    expect(result.leadTier).toBe('cold');
    expect(result.leadScore).toBeLessThan(40);
    expect(result.rawScore).toBe(-15);
  });

  it('returns warm tier for mid-range scores', () => {
    const answers: Answer[] = [
      { stepId: 'step-1', optionId: 'opt-1b' },
      { stepId: 'step-2', optionId: 'opt-2b' },
    ];
    const result = calculateLeadScore(STEPS, answers);
    expect(result.leadTier).toBe('warm');
  });

  it('normalizes to 0-100 range', () => {
    const answers: Answer[] = [
      { stepId: 'step-1', optionId: 'opt-1c' },
      { stepId: 'step-2', optionId: 'opt-2a' },
    ];
    const result = calculateLeadScore(STEPS, answers);
    expect(result.leadScore).toBeGreaterThanOrEqual(0);
    expect(result.leadScore).toBeLessThanOrEqual(100);
  });

  it('uses custom thresholds', () => {
    const answers: Answer[] = [
      { stepId: 'step-1', optionId: 'opt-1b' },
      { stepId: 'step-2', optionId: 'opt-2b' },
    ];
    const result = calculateLeadScore(STEPS, answers, 30, 10);
    expect(result.leadTier).toBe('hot');
  });

  it('handles empty answers gracefully', () => {
    const result = calculateLeadScore(STEPS, []);
    expect(result.rawScore).toBe(0);
    expect(result.leadScore).toBeGreaterThanOrEqual(0);
  });

  it('skips answers for unknown steps', () => {
    const answers: Answer[] = [
      { stepId: 'nonexistent', optionId: 'opt-1a' },
    ];
    const result = calculateLeadScore(STEPS, answers);
    expect(result.rawScore).toBe(0);
  });

  it('returns 50 when all weights are equal (zero range)', () => {
    const equalSteps: FlowStep[] = [{
      id: 's1',
      question: 'Q?',
      options: [
        { id: 'a', label: 'A', scoreWeight: 10 },
        { id: 'b', label: 'B', scoreWeight: 10 },
      ],
    }];
    const result = calculateLeadScore(equalSteps, [{ stepId: 's1', optionId: 'a' }]);
    expect(result.leadScore).toBe(50);
  });
});

// ---------------------------------------------------------------------------
// generateSuggestedOpener
// ---------------------------------------------------------------------------

describe('generateSuggestedOpener', () => {
  it('uses first name only', () => {
    const result = generateSuggestedOpener('John Smith', []);
    expect(result).toContain('Hi John');
    expect(result).not.toContain('Smith');
  });

  it('includes answer labels for 3+ answers', () => {
    const answers = [
      { question: 'Budget', label: 'Enterprise' },
      { question: 'Timeline', label: 'Immediate' },
      { question: 'Size', label: 'Large' },
    ];
    const result = generateSuggestedOpener('Jane', answers);
    expect(result).toContain('enterprise');
    expect(result).toContain('immediate');
    expect(result).toContain('large');
  });

  it('handles two answers', () => {
    const answers = [
      { question: 'Budget', label: 'Starter' },
      { question: 'Timeline', label: 'Next Month' },
    ];
    const result = generateSuggestedOpener('Alex', answers);
    expect(result).toContain('starter');
    expect(result).toContain('next month');
  });

  it('handles single or no answers', () => {
    const result = generateSuggestedOpener('Bob', []);
    expect(result).toContain('Hi Bob');
    expect(result).toContain('next step');
  });
});

// ---------------------------------------------------------------------------
// denormalizeAnswers
// ---------------------------------------------------------------------------

describe('denormalizeAnswers', () => {
  it('enriches answers with question and label', () => {
    const answers: Answer[] = [
      { stepId: 'step-1', optionId: 'opt-1b' },
    ];
    const result = denormalizeAnswers(STEPS, answers);
    expect(result).toHaveLength(1);
    expect(result[0]?.question).toBe('What is your budget?');
    expect(result[0]?.label).toBe('$1k-$5k');
    expect(result[0]?.scoreWeight).toBe(5);
  });

  it('handles missing steps gracefully', () => {
    const answers: Answer[] = [
      { stepId: 'nonexistent', optionId: 'opt-1a' },
    ];
    const result = denormalizeAnswers(STEPS, answers);
    expect(result[0]?.question).toBe('');
    expect(result[0]?.label).toBe('');
  });
});

// ---------------------------------------------------------------------------
// parseFlowSteps
// ---------------------------------------------------------------------------

describe('parseFlowSteps', () => {
  it('parses valid flow JSON', () => {
    const json = [
      {
        id: 's1',
        question: 'Q1?',
        options: [
          { id: 'o1', label: 'A', scoreWeight: 5 },
          { id: 'o2', label: 'B', scoreWeight: 10 },
        ],
      },
    ];
    const result = parseFlowSteps(json);
    expect(result).toHaveLength(1);
    expect(result[0]?.options).toHaveLength(2);
  });

  it('throws on non-array input', () => {
    expect(() => parseFlowSteps('not an array')).toThrow('must be an array');
  });

  it('throws on step missing id', () => {
    expect(() =>
      parseFlowSteps([{ question: 'Q?', options: [] }])
    ).toThrow('must have string id');
  });

  it('throws on option missing scoreWeight', () => {
    expect(() =>
      parseFlowSteps([{
        id: 's1',
        question: 'Q?',
        options: [{ id: 'o1', label: 'A' }],
      }])
    ).toThrow('must have string id, string label, number scoreWeight');
  });
});

// ---------------------------------------------------------------------------
// validateFlowSteps
// ---------------------------------------------------------------------------

describe('validateFlowSteps', () => {
  const validSteps = [
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
  ];

  it('returns valid for correct flow', () => {
    const result = validateFlowSteps(validSteps);
    expect(result.valid).toBe(true);
  });

  it('rejects fewer than 2 steps', () => {
    const result = validateFlowSteps([validSteps[0]!]);
    expect(result.valid).toBe(false);
    expect('error' in result && result.error).toContain('between 2 and 5');
  });

  it('rejects more than 5 steps', () => {
    const sixSteps = Array.from({ length: 6 }, (_, i) => ({
      id: `s${String(i)}`,
      question: `Q${String(i)}?`,
      options: [
        { id: `o${String(i)}a`, label: 'A', scoreWeight: 1 },
        { id: `o${String(i)}b`, label: 'B', scoreWeight: 2 },
      ],
    }));
    const result = validateFlowSteps(sixSteps);
    expect(result.valid).toBe(false);
  });

  it('rejects options with out-of-range scoreWeight', () => {
    const bad = [
      {
        id: 's1',
        question: 'Q1?',
        options: [
          { id: 'o1', label: 'A', scoreWeight: 100 },
          { id: 'o2', label: 'B', scoreWeight: 10 },
        ],
      },
      validSteps[1]!,
    ];
    const result = validateFlowSteps(bad);
    expect(result.valid).toBe(false);
    expect('error' in result && result.error).toContain('between -50 and +50');
  });

  it('rejects duplicate step IDs', () => {
    const dup = [
      { ...validSteps[0]!, id: 'same' },
      { ...validSteps[1]!, id: 'same' },
    ];
    const result = validateFlowSteps(dup);
    expect(result.valid).toBe(false);
    expect('error' in result && result.error).toContain('Duplicate step IDs');
  });

  it('rejects duplicate option IDs within a step', () => {
    const dup = [
      {
        id: 's1',
        question: 'Q1?',
        options: [
          { id: 'same', label: 'A', scoreWeight: 1 },
          { id: 'same', label: 'B', scoreWeight: 2 },
        ],
      },
      validSteps[1]!,
    ];
    const result = validateFlowSteps(dup);
    expect(result.valid).toBe(false);
    expect('error' in result && result.error).toContain('duplicate option IDs');
  });
});
