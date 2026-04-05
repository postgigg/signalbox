import type {
  WidgetState,
  WidgetContext,
  WidgetConfig,
  WidgetAnswer,
  ContactInfo,
  BookingConfig,
  BookingResponse,
} from './types';

// ── Transition Map ─────────────────────────────────────────────────────────
type TransitionEvent =
  | 'INIT'
  | 'CONFIG_LOADED'
  | 'FETCH_FAILED'
  | 'WIDGET_DISABLED'
  | 'OPEN'
  | 'CLOSE'
  | 'SUBMIT'
  | 'SUBMIT_SUCCESS'
  | 'SUBMIT_FAILED'
  | 'BOOKING_AVAILABLE'
  | 'BOOKING_CONFIRMED'
  | 'BOOKING_SKIPPED'
  | 'BOOKING_FAILED'
  | 'RESET'
  | 'RETRY';

const TRANSITIONS: Record<WidgetState, Partial<Record<TransitionEvent, WidgetState>>> = {
  idle: {
    INIT: 'loading',
  },
  loading: {
    CONFIG_LOADED: 'ready',
    FETCH_FAILED: 'error',
    WIDGET_DISABLED: 'disabled',
  },
  ready: {
    OPEN: 'open',
  },
  open: {
    CLOSE: 'ready',
    SUBMIT: 'submitting',
  },
  submitting: {
    SUBMIT_SUCCESS: 'complete',
    SUBMIT_FAILED: 'error',
    BOOKING_AVAILABLE: 'booking',
  },
  booking: {
    BOOKING_CONFIRMED: 'complete',
    BOOKING_SKIPPED: 'complete',
    BOOKING_FAILED: 'complete',
    CLOSE: 'ready',
  },
  complete: {
    RESET: 'ready',
    CLOSE: 'ready',
  },
  error: {
    RETRY: 'ready',
    CLOSE: 'ready',
  },
  disabled: {},
};

// ── Change Listener ────────────────────────────────────────────────────────
export type StateChangeListener = (
  ctx: Readonly<WidgetContext>,
  prevState: WidgetState
) => void;

// ── State Machine ──────────────────────────────────────────────────────────
export class WidgetStateMachine {
  private ctx: WidgetContext;
  private listeners: StateChangeListener[] = [];

  constructor() {
    this.ctx = {
      state: 'idle',
      config: null,
      currentStepIndex: 0,
      answers: [],
      contact: { name: '', email: '' },
      errorMessage: '',
      loadedAt: 0,
      resultTier: null,
      submissionId: null,
      bookingConfig: null,
      bookingResult: null,
    };
  }

  // ── Getters ────────────────────────────────────────────────────────────
  getState(): WidgetState {
    return this.ctx.state;
  }

  getContext(): Readonly<WidgetContext> {
    return this.ctx;
  }

  // ── Subscribe ──────────────────────────────────────────────────────────
  onChange(listener: StateChangeListener): () => void {
    this.listeners.push(listener);
    return () => {
      const idx = this.listeners.indexOf(listener);
      if (idx !== -1) this.listeners.splice(idx, 1);
    };
  }

  private emit(prev: WidgetState): void {
    const snapshot = { ...this.ctx };
    for (const listener of this.listeners) {
      try {
        listener(snapshot, prev);
      } catch {
        // Listener errors must not break the state machine
      }
    }
  }

  // ── Transitions ────────────────────────────────────────────────────────
  private transition(event: TransitionEvent): boolean {
    const current = this.ctx.state;
    const allowed = TRANSITIONS[current];
    const next = allowed?.[event];
    if (!next) {
      return false;
    }
    const prev = current;
    this.ctx.state = next;
    this.emit(prev);
    return true;
  }

  // ── Actions ────────────────────────────────────────────────────────────
  init(): boolean {
    this.ctx.loadedAt = Date.now();
    return this.transition('INIT');
  }

  configLoaded(config: WidgetConfig): boolean {
    this.ctx.config = config;
    this.ctx.currentStepIndex = 0;
    this.ctx.answers = [];
    this.ctx.contact = { name: '', email: '' };
    this.ctx.errorMessage = '';
    this.ctx.resultTier = null;
    this.ctx.submissionId = null;
    this.ctx.bookingConfig = null;
    this.ctx.bookingResult = null;
    return this.transition('CONFIG_LOADED');
  }

  fetchFailed(message: string): boolean {
    this.ctx.errorMessage = message;
    return this.transition('FETCH_FAILED');
  }

  widgetDisabled(): boolean {
    return this.transition('WIDGET_DISABLED');
  }

  open(): boolean {
    // Reset step and answers when opening fresh
    if (this.ctx.resultTier !== null) {
      this.ctx.currentStepIndex = 0;
      this.ctx.answers = [];
      this.ctx.contact = { name: '', email: '' };
      this.ctx.resultTier = null;
      this.ctx.errorMessage = '';
      this.ctx.submissionId = null;
      this.ctx.bookingConfig = null;
      this.ctx.bookingResult = null;
    }
    return this.transition('OPEN');
  }

  close(): boolean {
    return this.transition('CLOSE');
  }

  // ── Step Navigation (within "open" state) ──────────────────────────────
  selectOption(answer: WidgetAnswer): void {
    if (this.ctx.state !== 'open') return;

    // Replace existing answer for this step or push new
    const existing = this.ctx.answers.findIndex(
      (a) => a.stepId === answer.stepId
    );
    if (existing !== -1) {
      this.ctx.answers[existing] = answer;
    } else {
      this.ctx.answers.push(answer);
    }

    const totalSteps = this.ctx.config?.steps.length ?? 0;
    if (this.ctx.currentStepIndex < totalSteps - 1) {
      this.ctx.currentStepIndex++;
    }
    // When at the last step, the renderer shows the contact form
    // We re-emit so the renderer updates
    this.emit(this.ctx.state);
  }

  goBack(): void {
    if (this.ctx.state !== 'open') return;
    if (this.ctx.currentStepIndex > 0) {
      this.ctx.currentStepIndex--;
      this.emit(this.ctx.state);
    }
  }

  isOnContactStep(): boolean {
    if (!this.ctx.config) return false;
    return this.ctx.answers.length >= this.ctx.config.steps.length;
  }

  setContact(contact: ContactInfo): void {
    this.ctx.contact = contact;
  }

  submit(): boolean {
    return this.transition('SUBMIT');
  }

  submitSuccess(tier: 'hot' | 'warm' | 'cold'): boolean {
    this.ctx.resultTier = tier;
    return this.transition('SUBMIT_SUCCESS');
  }

  submitFailed(message: string): boolean {
    this.ctx.errorMessage = message;
    return this.transition('SUBMIT_FAILED');
  }

  bookingAvailable(
    tier: 'hot' | 'warm' | 'cold',
    submissionId: string,
    bookingConfig: BookingConfig
  ): boolean {
    this.ctx.resultTier = tier;
    this.ctx.submissionId = submissionId;
    this.ctx.bookingConfig = bookingConfig;
    return this.transition('BOOKING_AVAILABLE');
  }

  bookingConfirmed(result: BookingResponse): boolean {
    this.ctx.bookingResult = result;
    return this.transition('BOOKING_CONFIRMED');
  }

  bookingSkipped(): boolean {
    return this.transition('BOOKING_SKIPPED');
  }

  bookingFailed(): boolean {
    return this.transition('BOOKING_FAILED');
  }

  retry(): boolean {
    this.ctx.errorMessage = '';
    return this.transition('RETRY');
  }

  reset(): boolean {
    this.ctx.currentStepIndex = 0;
    this.ctx.answers = [];
    this.ctx.contact = { name: '', email: '' };
    this.ctx.errorMessage = '';
    this.ctx.resultTier = null;
    this.ctx.submissionId = null;
    this.ctx.bookingConfig = null;
    this.ctx.bookingResult = null;
    return this.transition('RESET');
  }
}
