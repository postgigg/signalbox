import type {
  WidgetConfig,
  WidgetTheme,
  FlowStep,
  ContactInfo,
  ConfirmationConfig,
  ValidationErrors,
} from './types';
import { getStyles } from './styles';
import {
  animatePanelOpen,
  animatePanelClose,
  animateStepForward,
  animateStepBackward,
  animateOptionTap,
  animateTriggerEntrance,
  animateTriggerHide,
  animateConfirmation,
} from './animations';

// ── SVG Icon Builders (no innerHTML) ───────────────────────────────────────
function createSvg(
  viewBox: string,
  ...children: Array<(svg: SVGElement) => void>
): SVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', viewBox);
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  for (const child of children) {
    child(svg);
  }
  return svg;
}

function svgPath(d: string, extra?: Record<string, string>): (svg: SVGElement) => void {
  return (svg: SVGElement) => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    if (extra) {
      for (const [k, v] of Object.entries(extra)) {
        path.setAttribute(k, v);
      }
    }
    svg.appendChild(path);
  };
}

function svgLine(
  x1: string,
  y1: string,
  x2: string,
  y2: string
): (svg: SVGElement) => void {
  return (svg: SVGElement) => {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    svg.appendChild(line);
  };
}

function svgCircle(
  cx: string,
  cy: string,
  r: string
): (svg: SVGElement) => void {
  return (svg: SVGElement) => {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', cx);
    circle.setAttribute('cy', cy);
    circle.setAttribute('r', r);
    svg.appendChild(circle);
  };
}

function svgPolyline(points: string): (svg: SVGElement) => void {
  return (svg: SVGElement) => {
    const pl = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    pl.setAttribute('points', points);
    svg.appendChild(pl);
  };
}

function iconArrow(): SVGElement {
  return createSvg(
    '0 0 24 24',
    svgPath('M5 12h14'),
    svgPath('M12 5l7 7-7 7')
  );
}

function iconChat(): SVGElement {
  return createSvg(
    '0 0 24 24',
    svgPath(
      'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z',
      { fill: 'currentColor', stroke: 'none' }
    )
  );
}

function iconPlus(): SVGElement {
  return createSvg(
    '0 0 24 24',
    svgLine('12', '5', '12', '19'),
    svgLine('5', '12', '19', '12')
  );
}

function iconClose(): SVGElement {
  return createSvg(
    '0 0 24 24',
    svgLine('18', '6', '6', '18'),
    svgLine('6', '6', '18', '18')
  );
}

function iconBack(): SVGElement {
  return createSvg(
    '0 0 24 24',
    svgPolyline('15 18 9 12 15 6')
  );
}

function iconCheck(): SVGElement {
  return createSvg(
    '0 0 24 24',
    svgPath('M5 13l4 4L19 7')
  );
}

function iconError(): SVGElement {
  return createSvg(
    '0 0 24 24',
    svgCircle('12', '12', '10'),
    svgLine('12', '8', '12', '12'),
    svgLine('12', '16', '12.01', '16')
  );
}

function iconPeople(): SVGElement {
  return createSvg(
    '0 0 16 16',
    svgPath(
      'M8 8a3 3 0 100-6 3 3 0 000 6zM2 14s-1 0-1-1 1-4 7-4 7 3 7 4-1 1-1 1H2z',
      { fill: 'currentColor', stroke: 'none' }
    )
  );
}

function getTriggerIcon(type: WidgetTheme['triggerIcon']): SVGElement | null {
  switch (type) {
    case 'arrow':
      return iconArrow();
    case 'chat':
      return iconChat();
    case 'plus':
      return iconPlus();
    case 'none':
    default:
      return null;
  }
}

// ── Helper: Create Element ─────────────────────────────────────────────────
function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  attrs?: Record<string, string>
): HTMLElementTagNameMap[K] {
  const elem = document.createElement(tag);
  if (className) elem.className = className;
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      elem.setAttribute(k, v);
    }
  }
  return elem;
}

// ── Callbacks ──────────────────────────────────────────────────────────────
export interface RendererCallbacks {
  onTriggerClick: () => void;
  onClose: () => void;
  onOptionSelect: (stepId: string, optionId: string, label: string, scoreWeight: number) => void;
  onBack: () => void;
  onContactSubmit: (contact: ContactInfo, honeypot: string) => void;
  onRetry: () => void;
  onCtaClick: (url: string) => void;
}

// ── Widget Renderer ────────────────────────────────────────────────────────
export class WidgetRenderer {
  private shadow: ShadowRoot;
  private host: HTMLElement;
  private config: WidgetConfig | null = null;
  private callbacks: RendererCallbacks;

  // DOM references
  private triggerEl: HTMLButtonElement | null = null;
  private panelEl: HTMLDivElement | null = null;
  private progressBar: HTMLDivElement | null = null;
  private stepCounter: HTMLSpanElement | null = null;
  private contentEl: HTMLDivElement | null = null;
  private backBtn: HTMLButtonElement | null = null;
  private ariaLiveRegion: HTMLDivElement | null = null;

  // Focus trap
  private previousActiveElement: Element | null = null;
  private boundKeyHandler: ((e: KeyboardEvent) => void) | null = null;

  constructor(host: HTMLElement, callbacks: RendererCallbacks) {
    this.host = host;
    this.callbacks = callbacks;
    this.shadow = host.attachShadow({ mode: 'open' });
  }

  // ── Initialize with Config ───────────────────────────────────────────
  init(config: WidgetConfig): void {
    this.config = config;
    this.injectStyles(config.theme);
    this.renderTrigger(config);
  }

  // ── Inject Styles ────────────────────────────────────────────────────
  private injectStyles(theme: WidgetTheme): void {
    const style = document.createElement('style');
    style.textContent = getStyles(theme);
    this.shadow.appendChild(style);
  }

  // ── Render Trigger ───────────────────────────────────────────────────
  private renderTrigger(config: WidgetConfig): void {
    const btn = el('button', 'sb-trigger sb-trigger--hidden', {
      type: 'button',
      'aria-label': config.theme.triggerText || 'Open widget',
    });

    if (config.theme.triggerType === 'tab') {
      btn.classList.add('sb-trigger--tab');
    }

    const icon = getTriggerIcon(config.theme.triggerIcon);
    if (icon) {
      const iconWrap = el('span', 'sb-trigger__icon');
      iconWrap.appendChild(icon);
      btn.appendChild(iconWrap);
    }

    const text = document.createTextNode(config.theme.triggerText || 'Get Started');
    btn.appendChild(text);

    btn.addEventListener('click', () => {
      this.callbacks.onTriggerClick();
    });

    this.shadow.appendChild(btn);
    this.triggerEl = btn;

    // Entrance animation
    requestAnimationFrame(() => {
      animateTriggerEntrance(btn);
    });
  }

  // ── Show/Hide Trigger ────────────────────────────────────────────────
  showTrigger(): void {
    if (this.triggerEl) {
      this.triggerEl.classList.remove('sb-trigger--hidden');
    }
  }

  hideTrigger(): void {
    if (this.triggerEl) {
      animateTriggerHide(this.triggerEl);
    }
  }

  // ── Open Panel ───────────────────────────────────────────────────────
  openPanel(stepIndex: number, totalSteps: number): void {
    if (!this.config) return;

    this.hideTrigger();

    if (!this.panelEl) {
      this.buildPanel();
    }

    if (this.panelEl) {
      animatePanelOpen(this.panelEl);
      this.updateProgress(stepIndex, totalSteps);
      this.enableFocusTrap();
    }
  }

  // ── Close Panel ──────────────────────────────────────────────────────
  closePanel(): void {
    if (this.panelEl) {
      animatePanelClose(this.panelEl, () => {
        this.showTrigger();
      });
      this.disableFocusTrap();
    }
  }

  // ── Build Panel Structure ────────────────────────────────────────────
  private buildPanel(): void {
    const panel = el('div', 'sb-panel sb-panel--hidden', {
      role: 'dialog',
      'aria-label': 'SignalBox Widget',
      'aria-modal': 'true',
    });

    // Header
    const header = el('div', 'sb-header');

    const headerLeft = el('div', 'sb-header__left');

    // Back button
    const back = el('button', 'sb-header__back', {
      type: 'button',
      'aria-label': 'Go back',
      style: 'visibility: hidden;',
    });
    back.appendChild(iconBack());
    back.addEventListener('click', () => this.callbacks.onBack());
    this.backBtn = back;
    headerLeft.appendChild(back);

    // Step counter
    const stepLabel = el('span', 'sb-header__step');
    stepLabel.textContent = '';
    this.stepCounter = stepLabel;
    headerLeft.appendChild(stepLabel);

    header.appendChild(headerLeft);

    // Close button
    const close = el('button', 'sb-header__close', {
      type: 'button',
      'aria-label': 'Close widget',
    });
    close.appendChild(iconClose());
    close.addEventListener('click', () => this.callbacks.onClose());
    header.appendChild(close);

    panel.appendChild(header);

    // Progress bar
    const progress = el('div', 'sb-progress', {
      role: 'progressbar',
      'aria-valuemin': '0',
      'aria-valuemax': '100',
      'aria-valuenow': '0',
    });
    const bar = el('div', 'sb-progress__bar');
    bar.style.width = '0%';
    progress.appendChild(bar);
    panel.appendChild(progress);
    this.progressBar = bar;

    // Content area
    const content = el('div', 'sb-content');
    panel.appendChild(content);
    this.contentEl = content;

    // Footer
    if (this.config?.theme.showBranding) {
      const footer = el('div', 'sb-footer');
      const link = el('a', 'sb-footer__link', {
        href: 'https://signalbox.io?ref=widget',
        target: '_blank',
        rel: 'noopener noreferrer',
      });
      link.textContent = 'Powered by SignalBox';
      footer.appendChild(link);
      panel.appendChild(footer);
    }

    // Aria-live region for screen reader announcements
    const liveRegion = el('div', 'sb-sr-only', {
      'aria-live': 'polite',
      'aria-atomic': 'true',
    });
    panel.appendChild(liveRegion);
    this.ariaLiveRegion = liveRegion;

    // Number key shortcuts: press 1-9 to select option
    panel.addEventListener('keydown', (e: KeyboardEvent) => {
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= 9) {
        const opts = panel.querySelectorAll('.sb-option');
        const target = opts[num - 1] as HTMLButtonElement | undefined;
        if (target) {
          e.preventDefault();
          target.click();
        }
      }
    });

    this.shadow.appendChild(panel);
    this.panelEl = panel;
  }

  // ── Update Progress ──────────────────────────────────────────────────
  updateProgress(stepIndex: number, totalSteps: number): void {
    // totalSteps includes the contact form step
    const total = totalSteps + 1; // +1 for contact form
    const current = stepIndex + 1;
    const pct = Math.round((current / total) * 100);

    if (this.progressBar) {
      this.progressBar.style.width = `${pct}%`;
      const progressEl = this.progressBar.parentElement;
      if (progressEl) {
        progressEl.setAttribute('aria-valuenow', String(pct));
      }
    }

    if (this.stepCounter) {
      this.stepCounter.textContent = `Step ${current} of ${total}`;
    }

    // Show/hide back button
    if (this.backBtn) {
      this.backBtn.style.visibility = stepIndex > 0 ? 'visible' : 'hidden';
    }

    // Announce step change to screen readers
    if (this.ariaLiveRegion) {
      this.ariaLiveRegion.textContent = `Step ${current} of ${total}`;
    }
  }

  // ── Render Question Step ─────────────────────────────────────────────
  renderStep(step: FlowStep, stepIndex: number, totalSteps: number, direction: 'forward' | 'backward' = 'forward'): void {
    if (!this.contentEl) return;

    this.updateProgress(stepIndex, totalSteps);

    const buildStep = () => {
      const wrapper = el('div', 'sb-step');

      const question = el('h2', 'sb-question');
      question.textContent = step.question;
      wrapper.appendChild(question);

      if (step.description) {
        const desc = el('p', 'sb-description');
        desc.textContent = step.description;
        wrapper.appendChild(desc);
      }

      const options = el('div', 'sb-options', {
        role: 'radiogroup',
        'aria-label': step.question,
      });

      for (let i = 0; i < step.options.length; i++) {
        const opt = step.options[i];
        const btn = el('button', 'sb-option', {
          type: 'button',
          role: 'radio',
          'aria-checked': 'false',
          'data-option-id': opt.id,
        });

        // Number key hint
        const numHint = el('span', 'sb-option__num');
        numHint.textContent = String(i + 1);
        btn.appendChild(numHint);

        if (opt.icon) {
          const iconSpan = el('span', 'sb-option__icon');
          iconSpan.textContent = opt.icon;
          btn.appendChild(iconSpan);
        }

        const label = el('span', 'sb-option__label');
        label.textContent = opt.label;
        btn.appendChild(label);

        btn.addEventListener('click', () => {
          animateOptionTap(btn);
          // Brief delay to let the tap animation be visible
          setTimeout(() => {
            this.callbacks.onOptionSelect(
              step.id,
              opt.id,
              opt.label,
              opt.scoreWeight
            );
          }, 120);
        });

        // Keyboard support
        btn.addEventListener('keydown', (e: KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            btn.click();
          }
        });

        options.appendChild(btn);
      }

      wrapper.appendChild(options);

      // Social proof
      if (
        this.config?.theme.showSocialProof &&
        stepIndex === 0 &&
        this.config.submissionCount >= this.config.socialProofMin
      ) {
        const sp = el('div', 'sb-social-proof');
        const spIcon = el('span', 'sb-social-proof__icon');
        spIcon.appendChild(iconPeople());
        sp.appendChild(spIcon);
        const spText = document.createTextNode(
          this.config.socialProofText.replace(
            '{count}',
            String(this.config.submissionCount)
          )
        );
        sp.appendChild(spText);
        wrapper.appendChild(sp);
      }

      return wrapper;
    };

    if (direction === 'backward') {
      animateStepBackward(this.contentEl, buildStep);
    } else {
      animateStepForward(this.contentEl, buildStep);
    }
  }

  // ── Render Contact Form ──────────────────────────────────────────────
  renderContactForm(
    totalSteps: number,
    errors: ValidationErrors = {},
    submitting: boolean = false,
    previousContact?: ContactInfo
  ): void {
    if (!this.contentEl || !this.config) return;

    this.updateProgress(totalSteps, totalSteps);

    const buildForm = () => {
      const wrapper = el('div', 'sb-contact');

      const title = el('h2', 'sb-contact__title');
      title.textContent = 'Almost done!';
      wrapper.appendChild(title);

      const subtitle = el('p', 'sb-contact__subtitle');
      subtitle.textContent = 'Enter your details to see your results.';
      wrapper.appendChild(subtitle);

      const form = el('form', '', {
        novalidate: 'true',
        autocomplete: 'on',
      });

      // Name field
      const nameField = this.createField(
        'name',
        'Name',
        'text',
        true,
        'Your name',
        errors.name,
        previousContact?.name
      );
      form.appendChild(nameField);

      // Email field
      const emailField = this.createField(
        'email',
        'Email',
        'email',
        true,
        'you@example.com',
        errors.email,
        previousContact?.email
      );
      form.appendChild(emailField);

      // Phone field (conditional)
      if (this.config!.contactShowPhone) {
        const phoneField = this.createField(
          'phone',
          'Phone',
          'tel',
          this.config!.contactPhoneRequired,
          '(555) 123-4567',
          errors.phone,
          previousContact?.phone
        );
        form.appendChild(phoneField);
      }

      // Message field (conditional)
      if (this.config!.contactShowMessage) {
        const msgField = this.createTextareaField(
          'message',
          'Message',
          this.config!.contactMessageRequired,
          this.config!.contactMessagePlaceholder || 'Tell us more...',
          errors.message,
          previousContact?.message
        );
        form.appendChild(msgField);
      }

      // Honeypot
      const hpField = el('div', 'sb-hp');
      const hpLabel = el('label');
      hpLabel.textContent = 'Leave this empty';
      const hpInput = el('input', '', {
        type: 'text',
        name: 'website',
        tabindex: '-1',
        autocomplete: 'off',
        'aria-hidden': 'true',
      });
      hpField.appendChild(hpLabel);
      hpField.appendChild(hpInput);
      form.appendChild(hpField);

      // Consent checkbox
      const consentField = el('div', 'sb-consent');
      const consentLabel = el('label', 'sb-consent__label');
      const consentCheckbox = el('input', 'sb-consent__check', {
        type: 'checkbox',
        name: 'consent',
        required: 'true',
      }) as HTMLInputElement;
      consentLabel.appendChild(consentCheckbox);
      const consentText = el('span', 'sb-consent__text');
      consentText.textContent = 'I agree to the processing of my data and acknowledge the ';
      const privacyLink = el('a', 'sb-consent__link', {
        href: '/privacy',
        target: '_blank',
        rel: 'noopener noreferrer',
      });
      privacyLink.textContent = 'Privacy Policy';
      consentText.appendChild(privacyLink);
      consentLabel.appendChild(consentText);
      consentField.appendChild(consentLabel);

      const consentError = el('p', 'sb-field__error sb-consent__error');
      consentError.style.display = 'none';
      consentError.textContent = 'You must agree before submitting.';
      consentField.appendChild(consentError);
      form.appendChild(consentField);

      // Submit button
      const submitBtn = el('button', 'sb-submit', {
        type: 'submit',
      });
      if (submitting) {
        submitBtn.setAttribute('disabled', 'true');
        const spinner = el('span', 'sb-submit__spinner');
        submitBtn.appendChild(spinner);
        const txt = document.createTextNode('Submitting...');
        submitBtn.appendChild(txt);
      } else {
        submitBtn.textContent =
          this.config!.contactSubmitText || 'See My Results';
      }
      form.appendChild(submitBtn);

      form.addEventListener('submit', (e: Event) => {
        e.preventDefault();

        // Validate consent
        if (!consentCheckbox.checked) {
          consentError.style.display = 'block';
          consentCheckbox.focus();
          return;
        }
        consentError.style.display = 'none';

        const formData = new FormData(form);

        // Sanitize inputs: strip HTML tags
        const sanitize = (val: string): string =>
          val.replace(/<[^>]*>?/g, '').trim();

        const contact: ContactInfo = {
          name: sanitize((formData.get('name') as string) || ''),
          email: sanitize((formData.get('email') as string) || '').toLowerCase(),
        };
        if (this.config!.contactShowPhone) {
          const rawPhone = sanitize((formData.get('phone') as string) || '');
          contact.phone = rawPhone.replace(/[^+\d\s().-]/g, '');
        }
        if (this.config!.contactShowMessage) {
          contact.message = sanitize((formData.get('message') as string) || '');
        }
        const honeypot = (formData.get('website') as string) || '';
        this.callbacks.onContactSubmit(contact, honeypot);
      });

      wrapper.appendChild(form);
      return wrapper;
    };

    animateStepForward(this.contentEl, buildForm);
  }

  // ── Create Input Field ───────────────────────────────────────────────
  private createField(
    name: string,
    labelText: string,
    type: string,
    required: boolean,
    placeholder: string,
    error?: string,
    value?: string
  ): HTMLDivElement {
    const field = el('div', 'sb-field');

    const label = el('label', 'sb-field__label', { for: `sb-${name}` });
    label.textContent = labelText;
    if (required) {
      const req = el('span', 'sb-field__required');
      req.textContent = '*';
      label.appendChild(req);
    }
    field.appendChild(label);

    const input = el('input', 'sb-field__input', {
      type,
      name,
      id: `sb-${name}`,
      placeholder,
      autocomplete: name,
    });
    if (required) input.setAttribute('required', 'true');
    if (value) input.value = value;
    if (error) {
      input.classList.add('sb-field__input--error');
      input.setAttribute('aria-invalid', 'true');
      input.setAttribute('aria-describedby', `sb-${name}-error`);
    }
    field.appendChild(input);

    if (error) {
      const errEl = el('div', 'sb-field__error', { id: `sb-${name}-error`, role: 'alert' });
      errEl.textContent = error;
      field.appendChild(errEl);
    }

    return field;
  }

  // ── Create Textarea Field ────────────────────────────────────────────
  private createTextareaField(
    name: string,
    labelText: string,
    required: boolean,
    placeholder: string,
    error?: string,
    value?: string
  ): HTMLDivElement {
    const field = el('div', 'sb-field');

    const label = el('label', 'sb-field__label', { for: `sb-${name}` });
    label.textContent = labelText;
    if (required) {
      const req = el('span', 'sb-field__required');
      req.textContent = '*';
      label.appendChild(req);
    }
    field.appendChild(label);

    const textarea = el('textarea', 'sb-field__input sb-field__textarea', {
      name,
      id: `sb-${name}`,
      placeholder,
      rows: '3',
    });
    if (required) textarea.setAttribute('required', 'true');
    if (value) textarea.value = value;
    if (error) {
      textarea.classList.add('sb-field__input--error');
      textarea.setAttribute('aria-invalid', 'true');
      textarea.setAttribute('aria-describedby', `sb-${name}-error`);
    }
    field.appendChild(textarea);

    if (error) {
      const errEl = el('div', 'sb-field__error', { id: `sb-${name}-error`, role: 'alert' });
      errEl.textContent = error;
      field.appendChild(errEl);
    }

    return field;
  }

  // ── Render Confirmation ──────────────────────────────────────────────
  renderConfirmation(confirmConfig: ConfirmationConfig): void {
    if (!this.contentEl) return;

    // Hide back button, update progress to 100%
    if (this.backBtn) this.backBtn.style.visibility = 'hidden';
    if (this.progressBar) {
      this.progressBar.style.width = '100%';
      const progressEl = this.progressBar.parentElement;
      if (progressEl) progressEl.setAttribute('aria-valuenow', '100');
    }
    if (this.stepCounter) this.stepCounter.textContent = 'Complete';

    this.contentEl.textContent = '';

    const wrapper = el('div', 'sb-confirmation');

    // Checkmark circle
    const checkCircle = el('div', 'sb-confirmation__check');
    checkCircle.appendChild(iconCheck());
    wrapper.appendChild(checkCircle);

    // Headline
    const headline = el('h2', 'sb-confirmation__headline');
    headline.textContent = confirmConfig.headline;
    wrapper.appendChild(headline);

    // Body
    const body = el('p', 'sb-confirmation__body');
    body.textContent = confirmConfig.body;
    wrapper.appendChild(body);

    // CTA
    if (confirmConfig.ctaText && confirmConfig.ctaUrl) {
      const cta = el('a', 'sb-confirmation__cta', {
        href: confirmConfig.ctaUrl,
        target: '_blank',
        rel: 'noopener noreferrer',
        role: 'button',
      });
      cta.textContent = confirmConfig.ctaText;
      cta.addEventListener('click', (e: MouseEvent) => {
        e.preventDefault();
        this.callbacks.onCtaClick(confirmConfig.ctaUrl!);
      });
      wrapper.appendChild(cta);
    }

    this.contentEl.appendChild(wrapper);
    animateConfirmation(wrapper);
  }

  // ── Render Error ─────────────────────────────────────────────────────
  renderError(message: string): void {
    if (!this.contentEl) return;

    this.contentEl.textContent = '';

    const wrapper = el('div', 'sb-error');

    const errorIcon = el('div', 'sb-error__icon');
    errorIcon.appendChild(iconError());
    wrapper.appendChild(errorIcon);

    const msg = el('p', 'sb-error__message');
    msg.textContent = message || 'Something went wrong. Please try again.';
    wrapper.appendChild(msg);

    const retryBtn = el('button', 'sb-error__retry', {
      type: 'button',
    });
    retryBtn.textContent = 'Try Again';
    retryBtn.addEventListener('click', () => this.callbacks.onRetry());
    wrapper.appendChild(retryBtn);

    this.contentEl.appendChild(wrapper);
  }

  // ── Render Loading ───────────────────────────────────────────────────
  renderLoading(): void {
    if (!this.contentEl) return;

    this.contentEl.textContent = '';

    const wrapper = el('div', 'sb-loading');
    const spinner = el('div', 'sb-loading__spinner');
    const srText = el('span', 'sb-sr-only');
    srText.textContent = 'Loading...';
    wrapper.appendChild(spinner);
    wrapper.appendChild(srText);
    this.contentEl.appendChild(wrapper);
  }

  // ── Render Disabled (hidden) ─────────────────────────────────────────
  renderDisabled(): void {
    // Remove all widget DOM
    while (this.shadow.firstChild) {
      this.shadow.removeChild(this.shadow.firstChild);
    }
  }

  // ── Render Expired Fallback ─────────────────────────────────────────
  renderExpiredFallback(): void {
    // Clear existing content but keep styles
    const styleEl = this.shadow.querySelector('style');
    while (this.shadow.firstChild) {
      this.shadow.removeChild(this.shadow.firstChild);
    }
    if (styleEl) {
      this.shadow.appendChild(styleEl);
    }

    const wrapper = el('div', 'sb-panel', {
      role: 'status',
      style: 'position: fixed; bottom: 24px; right: 24px; z-index: 2147483647; padding: 20px; max-width: 320px;',
    });

    const msg = el('p', '', {
      style: 'font-size: 14px; opacity: 0.7; line-height: 1.5; text-align: center; margin: 0;',
    });
    msg.textContent = 'Please contact us directly';
    wrapper.appendChild(msg);

    this.shadow.appendChild(wrapper);
  }

  // ── Focus Trapping ───────────────────────────────────────────────────
  private enableFocusTrap(): void {
    this.previousActiveElement = document.activeElement;

    this.boundKeyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        this.callbacks.onClose();
        return;
      }

      if (e.key === 'Tab' && this.panelEl) {
        const focusable = this.getFocusableElements();
        if (focusable.length === 0) return;

        const first = focusable[0]!;
        const last = focusable[focusable.length - 1]!;

        if (e.shiftKey) {
          if (this.shadow.activeElement === first || !this.panelEl.contains(this.shadow.activeElement as Node)) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (this.shadow.activeElement === last || !this.panelEl.contains(this.shadow.activeElement as Node)) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    // Attach to shadow root's host to capture events
    document.addEventListener('keydown', this.boundKeyHandler, true);

    // Focus first focusable element in panel
    requestAnimationFrame(() => {
      const focusable = this.getFocusableElements();
      const firstEl = focusable[0];
      if (firstEl) {
        firstEl.focus();
      }
    });
  }

  private disableFocusTrap(): void {
    if (this.boundKeyHandler) {
      document.removeEventListener('keydown', this.boundKeyHandler, true);
      this.boundKeyHandler = null;
    }

    // Restore focus
    if (
      this.previousActiveElement &&
      this.previousActiveElement instanceof HTMLElement
    ) {
      this.previousActiveElement.focus();
      this.previousActiveElement = null;
    }
  }

  private getFocusableElements(): HTMLElement[] {
    if (!this.panelEl) return [];
    const selectors =
      'button:not([disabled]), [href], input:not([disabled]):not([type="hidden"]):not([tabindex="-1"]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const elements = this.panelEl.querySelectorAll(selectors);
    return Array.from(elements) as HTMLElement[];
  }

  // ── Attention Grabbers ──────────────────────────────────────────────
  showTeaser(message: string): void {
    if (!this.triggerEl) return;

    // Remove existing teaser if any
    const existing = this.shadow.querySelector('.sb-teaser');
    if (existing) existing.remove();

    const teaser = document.createElement('div');
    teaser.className = 'sb-teaser';
    teaser.setAttribute('role', 'status');
    teaser.style.cssText = `
      position: fixed; bottom: 90px; right: 20px; z-index: 2147483646;
      background: #fff; color: #1E293B; font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 14px; font-weight: 500; padding: 10px 16px; border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15); max-width: 240px;
      opacity: 0; transform: translateY(8px) scale(0.95);
      transition: opacity 200ms ease, transform 200ms ease;
      cursor: pointer; pointer-events: auto;
    `;
    teaser.textContent = message;

    // Small arrow pointing down
    const arrow = document.createElement('div');
    arrow.style.cssText = `
      position: absolute; bottom: -6px; right: 24px;
      width: 12px; height: 12px; background: #fff;
      transform: rotate(45deg); border-radius: 2px;
      box-shadow: 2px 2px 4px rgba(0,0,0,0.08);
    `;
    teaser.appendChild(arrow);

    teaser.addEventListener('click', () => {
      teaser.remove();
      this.callbacks.onTriggerClick();
    });

    this.shadow.appendChild(teaser);

    // Animate in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        teaser.style.opacity = '1';
        teaser.style.transform = 'translateY(0) scale(1)';
      });
    });

    // Auto dismiss after 6 seconds
    setTimeout(() => {
      teaser.style.opacity = '0';
      teaser.style.transform = 'translateY(8px) scale(0.95)';
      setTimeout(() => teaser.remove(), 200);
    }, 6000);
  }

  pulseTrigger(): void {
    if (!this.triggerEl) return;
    const btn = this.triggerEl;
    const origTransform = btn.style.transform;

    // Pulse animation: scale up then back
    btn.style.transition = 'transform 300ms cubic-bezier(0.68, -0.55, 0.265, 1.55)';
    btn.style.transform = 'scale(1.15)';
    setTimeout(() => {
      btn.style.transform = 'scale(1)';
      setTimeout(() => {
        btn.style.transform = 'scale(1.1)';
        setTimeout(() => {
          btn.style.transform = origTransform || 'scale(1)';
          btn.style.transition = '';
        }, 300);
      }, 300);
    }, 300);
  }

  // ── Destroy ──────────────────────────────────────────────────────────
  destroy(): void {
    this.disableFocusTrap();
    while (this.shadow.firstChild) {
      this.shadow.removeChild(this.shadow.firstChild);
    }
    this.triggerEl = null;
    this.panelEl = null;
    this.progressBar = null;
    this.stepCounter = null;
    this.contentEl = null;
    this.backBtn = null;
    this.ariaLiveRegion = null;
  }
}
