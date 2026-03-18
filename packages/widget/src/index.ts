import type {
  WidgetAnswer,
  ContactInfo,
  SubmitPayload,
  ConfirmationConfig,
  ValidationErrors,
} from './types';
import { WidgetStateMachine } from './state';
import { fetchConfig, submitForm, WidgetApiError } from './api';
import { WidgetRenderer } from './renderer';
import { validateContact, hasErrors } from './validators';

// ── Constants ──────────────────────────────────────────────────────────────
const DEFAULT_API_URL = 'https://signalbox.io';

// ── Challenge Token Generator ──────────────────────────────────────────────
// Simple hash-based challenge: SHA-256 of key + timestamp + salt
async function generateToken(
  key: string,
  timestamp: number
): Promise<string> {
  const salt = 'sb_' + Math.random().toString(36).substring(2, 10);
  const data = `${key}:${timestamp}:${salt}`;
  const encoder = new TextEncoder();
  const buffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
  const hashArray = Array.from(new Uint8Array(buffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return `${hashHex}:${salt}`;
}

// ── UTM Param Extractor ───────────────────────────────────────────────────
function getUtmParams(): {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
} {
  try {
    const params = new URLSearchParams(window.location.search);
    const result: Record<string, string> = {};
    const src = params.get('utm_source');
    const med = params.get('utm_medium');
    const camp = params.get('utm_campaign');
    if (src) result.utmSource = src;
    if (med) result.utmMedium = med;
    if (camp) result.utmCampaign = camp;
    return result;
  } catch {
    return {};
  }
}

// ── Main Widget Controller ─────────────────────────────────────────────────
class SignalBoxWidget {
  private machine: WidgetStateMachine;
  private renderer!: WidgetRenderer;
  private apiUrl: string;
  private widgetKey: string;
  private stepDirection: 'forward' | 'backward' = 'forward';
  private validationErrors: ValidationErrors = {};

  constructor(key: string, apiUrl: string) {
    this.widgetKey = key;
    this.apiUrl = apiUrl;
    this.machine = new WidgetStateMachine();
  }

  // ── Bootstrap ──────────────────────────────────────────────────────
  async start(): Promise<void> {
    const rootId = `sb-root-${this.widgetKey}`;

    // Prevent duplicate initialization of the same widget
    if (document.getElementById(rootId)) {
      return;
    }

    // Create host element
    const host = document.createElement('div');
    host.id = rootId;
    // The host element should not interfere with page layout
    host.style.position = 'fixed';
    host.style.zIndex = '2147483647';
    host.style.top = '0';
    host.style.left = '0';
    host.style.width = '0';
    host.style.height = '0';
    host.style.overflow = 'visible';
    host.style.pointerEvents = 'none';
    document.body.appendChild(host);

    // Initialize renderer
    this.renderer = new WidgetRenderer(host, {
      onTriggerClick: () => this.handleTriggerClick(),
      onClose: () => this.handleClose(),
      onOptionSelect: (stepId, optionId, label, scoreWeight) =>
        this.handleOptionSelect(stepId, optionId, label, scoreWeight),
      onBack: () => this.handleBack(),
      onContactSubmit: (contact, honeypot) =>
        this.handleContactSubmit(contact, honeypot),
      onRetry: () => this.handleRetry(),
      onCtaClick: (url) => this.handleCtaClick(url),
    });

    // Start the state machine
    this.machine.init();

    // Fetch configuration
    try {
      const config = await fetchConfig(this.widgetKey, this.apiUrl);
      this.machine.configLoaded(config);
      this.renderer.init(config);
    } catch (err) {
      if (err instanceof WidgetApiError) {
        if (err.code === 'INACTIVE') {
          this.machine.widgetDisabled();
          this.renderer.renderDisabled();
          return;
        }
        if (err.code === 'EXPIRED') {
          this.machine.widgetDisabled();
          this.renderer.renderExpiredFallback();
          return;
        }
        this.machine.fetchFailed(err.message);
      } else {
        this.machine.fetchFailed('Failed to load widget configuration.');
      }
    }
  }

  // ── Event Handlers ────────────────────────────────────────────────────
  private handleTriggerClick(): void {
    const ctx = this.machine.getContext();
    if (ctx.state !== 'ready') return;

    this.machine.open();
    const config = ctx.config;
    if (!config || config.steps.length === 0) return;

    const totalSteps = config.steps.length;
    this.renderer.openPanel(0, totalSteps);
    this.stepDirection = 'forward';
    this.renderCurrentView();
  }

  private handleClose(): void {
    const state = this.machine.getState();
    if (state === 'open' || state === 'complete' || state === 'error') {
      this.renderer.closePanel();
      if (state === 'complete') {
        this.machine.reset();
      } else if (state === 'error') {
        this.machine.retry();
      } else {
        this.machine.close();
      }
    }
  }

  private handleOptionSelect(
    stepId: string,
    optionId: string,
    label: string,
    scoreWeight: number
  ): void {
    const ctx = this.machine.getContext();
    if (ctx.state !== 'open' || !ctx.config) return;

    const step = ctx.config.steps.find((s) => s.id === stepId);
    if (!step) return;

    const answer: WidgetAnswer = {
      stepId,
      optionId,
      question: step.question,
      label,
      scoreWeight,
    };

    this.stepDirection = 'forward';
    this.machine.selectOption(answer);
    this.renderCurrentView();
  }

  private handleBack(): void {
    const ctx = this.machine.getContext();
    if (ctx.state !== 'open') return;

    this.stepDirection = 'backward';

    // If on contact form, step back to last question
    if (this.machine.isOnContactStep()) {
      if (ctx.answers.length > 0) {
        this.machine.goBack();
      }
    } else {
      this.machine.goBack();
    }
    this.renderCurrentView();
  }

  private async handleContactSubmit(
    contact: ContactInfo,
    honeypot: string
  ): Promise<void> {
    const ctx = this.machine.getContext();
    if (ctx.state !== 'open' || !ctx.config) return;

    // Store contact info on machine
    this.machine.setContact(contact);

    // Validate
    const errors = validateContact(contact, ctx.config);
    this.validationErrors = errors;

    if (hasErrors(errors)) {
      // Re-render form with errors
      this.renderer.renderContactForm(
        ctx.config.steps.length,
        errors,
        false,
        contact
      );
      return;
    }

    // Transition to submitting
    this.machine.submit();

    // Re-render contact form in submitting state
    this.renderer.renderContactForm(
      ctx.config.steps.length,
      {},
      true,
      contact
    );

    try {
      // Generate challenge token
      const token = await generateToken(this.widgetKey, ctx.loadedAt);

      // Build payload
      const utmParams = getUtmParams();
      const payload: SubmitPayload = {
        widgetKey: this.widgetKey,
        answers: ctx.answers.map((a) => ({
          stepId: a.stepId,
          optionId: a.optionId,
        })),
        name: contact.name.trim(),
        email: contact.email.trim(),
        token,
        loadedAt: ctx.loadedAt,
        sourceUrl: window.location.href,
        referrer: document.referrer || '',
        ...utmParams,
      };

      if (contact.phone?.trim()) {
        payload.phone = contact.phone.trim();
      }
      if (contact.message?.trim()) {
        payload.message = contact.message.trim();
      }
      if (honeypot) {
        payload.honeypot = honeypot;
      }

      const result = await submitForm(payload, this.apiUrl);

      this.machine.submitSuccess(result.tier);

      // Show confirmation based on tier
      const confirmConfig: ConfirmationConfig =
        ctx.config.confirmation[result.tier];
      this.renderer.renderConfirmation(confirmConfig);
    } catch (err) {
      // On 409 duplicate, treat as success with 'warm' tier default
      if (err instanceof WidgetApiError && err.code === 'DUPLICATE') {
        const tier = 'warm';
        this.machine.submitSuccess(tier);
        const confirmConfig: ConfirmationConfig =
          ctx.config.confirmation[tier];
        this.renderer.renderConfirmation(confirmConfig);
        return;
      }

      let message = 'Something went wrong. Please try again.';
      if (err instanceof WidgetApiError) {
        message = err.message;
      }
      this.machine.submitFailed(message);
      this.renderer.renderError(message);
    }
  }

  private handleRetry(): void {
    const ctx = this.machine.getContext();
    if (ctx.state !== 'error') return;

    this.machine.retry();

    // If we have config, re-open and re-render
    if (ctx.config) {
      this.machine.open();
      const totalSteps = ctx.config.steps.length;
      this.renderer.openPanel(0, totalSteps);
      this.stepDirection = 'forward';
      // Reset step index and answers
      this.renderCurrentView();
    } else {
      // Retry fetching config
      void this.retryFetchConfig();
    }
  }

  private async retryFetchConfig(): Promise<void> {
    this.machine.init();

    try {
      const config = await fetchConfig(this.widgetKey, this.apiUrl);
      this.machine.configLoaded(config);
      this.renderer.init(config);
    } catch (err) {
      if (err instanceof WidgetApiError) {
        if (err.code === 'INACTIVE') {
          this.machine.widgetDisabled();
          this.renderer.renderDisabled();
          return;
        }
        if (err.code === 'EXPIRED') {
          this.machine.widgetDisabled();
          this.renderer.renderExpiredFallback();
          return;
        }
        this.machine.fetchFailed(err.message);
      } else {
        this.machine.fetchFailed('Failed to load widget configuration.');
      }
    }
  }

  private handleCtaClick(url: string): void {
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  // ── Render Current View ──────────────────────────────────────────────
  private renderCurrentView(): void {
    const ctx = this.machine.getContext();
    if (!ctx.config) return;

    const totalSteps = ctx.config.steps.length;
    const stepIndex = ctx.currentStepIndex;

    // Check if we're past all questions -> show contact form
    if (this.machine.isOnContactStep()) {
      this.renderer.updateProgress(totalSteps, totalSteps);
      this.renderer.renderContactForm(
        totalSteps,
        this.validationErrors,
        false,
        ctx.contact
      );
      return;
    }

    // Show question step
    const step = ctx.config.steps[stepIndex];
    if (step) {
      this.renderer.renderStep(step, stepIndex, totalSteps, this.stepDirection);
    }
  }
}

// ── IIFE Bootstrap ─────────────────────────────────────────────────────────
(function () {
  // Wait for DOM to be ready
  function boot(): void {
    const config = window.SignalBoxConfig;
    if (!config || !config.key) {
      return;
    }

    const apiUrl = config.apiUrl || DEFAULT_API_URL;
    const widget = new SignalBoxWidget(config.key, apiUrl);
    widget.start();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
