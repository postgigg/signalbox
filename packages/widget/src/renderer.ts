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

// ── Contrast Detection Helpers ─────────────────────────────────────────────
function parseColor(color: string): [number, number, number] | null {
  // Parse hex: #RGB, #RRGGBB
  const hexMatch = /^#([0-9a-f]{3,8})$/i.exec(color.trim());
  if (hexMatch) {
    const hex = hexMatch[1];
    if (!hex) return null;
    if (hex.length === 3) {
      const c0 = hex.charAt(0);
      const c1 = hex.charAt(1);
      const c2 = hex.charAt(2);
      const r = parseInt(c0 + c0, 16);
      const g = parseInt(c1 + c1, 16);
      const b = parseInt(c2 + c2, 16);
      if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
      return [r, g, b];
    }
    if (hex.length >= 6) {
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
      return [r, g, b];
    }
    return null;
  }

  // Parse rgb(r, g, b) or rgba(r, g, b, a)
  const rgbMatch = /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/i.exec(color);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1] ?? '0', 10);
    const g = parseInt(rgbMatch[2] ?? '0', 10);
    const b = parseInt(rgbMatch[3] ?? '0', 10);
    if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
    return [r, g, b];
  }

  return null;
}

function parseAlpha(color: string): number {
  const rgbaMatch = /^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*([\d.]+)\s*\)/i.exec(color);
  if (rgbaMatch && rgbaMatch[1] !== undefined) {
    const a = parseFloat(rgbaMatch[1]);
    return isNaN(a) ? 1 : a;
  }
  // If it's "transparent", alpha is 0
  if (color.trim().toLowerCase() === 'transparent') return 0;
  return 1;
}

function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * (rs ?? 0) + 0.7152 * (gs ?? 0) + 0.0722 * (bs ?? 0);
}

function contrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Walk up from an element to find the first non-transparent background color. */
function sampleBackgroundAt(x: number, y: number): [number, number, number] | null {
  try {
    const target = document.elementFromPoint(x, y);
    if (!target) return null;

    let current: Element | null = target;
    while (current && current !== document.documentElement) {
      const style = getComputedStyle(current);
      const bg = style.backgroundColor;
      if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') {
        const alpha = parseAlpha(bg);
        if (alpha > 0.3) {
          return parseColor(bg);
        }
      }
      current = current.parentElement;
    }

    // If we reached the root, sample the documentElement / body
    const bodyBg = getComputedStyle(document.body).backgroundColor;
    if (bodyBg && bodyBg !== 'transparent' && bodyBg !== 'rgba(0, 0, 0, 0)') {
      return parseColor(bodyBg);
    }

    // Default: assume white page background
    return [255, 255, 255];
  } catch {
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
  private overlayEl: HTMLDivElement | null = null;

  // Focus trap
  private previousActiveElement: Element | null = null;
  private boundKeyHandler: ((e: KeyboardEvent) => void) | null = null;

  // Contrast adaptation
  private contrastAdapted = false;
  private resizeHandler: (() => void) | null = null;

  constructor(host: HTMLElement, callbacks: RendererCallbacks) {
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

    // Detect background contrast after button is positioned
    this.scheduleContrastDetection();
    this.attachResizeListener();

    // Gentle nudge after 4 seconds to catch attention
    this.scheduleNudge();
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

  // ── Contrast Detection ──────────────────────────────────────────────
  private detectAndAdaptContrast(): void {
    if (!this.triggerEl || !this.config) return;

    try {
      const btn = this.triggerEl;
      const rect = btn.getBoundingClientRect();

      // If button is not yet laid out, skip
      if (rect.width === 0 || rect.height === 0) return;

      // Sample the center of where the trigger sits
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Temporarily hide the widget host so elementFromPoint hits the page behind it
      const host = this.shadow.host as HTMLElement;
      const origPointerEvents = host.style.pointerEvents;
      const origVisibility = host.style.visibility;
      host.style.visibility = 'hidden';
      host.style.pointerEvents = 'none';

      const pageBg = sampleBackgroundAt(centerX, centerY);

      // Restore host visibility
      host.style.visibility = origVisibility;
      host.style.pointerEvents = origPointerEvents;

      if (!pageBg) return;

      const buttonColor = parseColor(this.config.theme.primaryColor);
      if (!buttonColor) return;

      const pageLum = relativeLuminance(pageBg[0], pageBg[1], pageBg[2]);
      const buttonLum = relativeLuminance(buttonColor[0], buttonColor[1], buttonColor[2]);

      const ratio = contrastRatio(pageLum, buttonLum);

      // If contrast is adequate (3:1 or better), no adaptation needed
      if (ratio >= 3) {
        // If we previously adapted but no longer need to, revert
        if (this.contrastAdapted) {
          btn.style.backgroundColor = '';
          btn.style.color = '';
          this.contrastAdapted = false;
        }
        return;
      }

      // Low contrast detected: adapt the button
      const pageIsDark = pageLum < 0.5;

      if (pageIsDark) {
        // Dark background + dark button: switch to white bg, dark text
        btn.style.backgroundColor = '#FFFFFF';
        btn.style.color = '#0F172A';
      } else {
        // Light background + light button: switch to dark bg, white text
        btn.style.backgroundColor = '#0F172A';
        btn.style.color = '#FFFFFF';
      }

      this.contrastAdapted = true;
    } catch {
      // Contrast detection is non-blocking; fail silently
    }
  }

  private scheduleContrastDetection(): void {
    // Use two rAF to ensure the trigger is fully rendered and positioned
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.detectAndAdaptContrast();
      });
    });
  }

  private attachResizeListener(): void {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    this.resizeHandler = () => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        this.detectAndAdaptContrast();
      }, 300);
    };
    window.addEventListener('resize', this.resizeHandler, { passive: true });
  }

  private nudgeTimer: ReturnType<typeof setTimeout> | null = null;

  private scheduleNudge(): void {
    if (!this.triggerEl) return;
    const btn = this.triggerEl;

    this.nudgeTimer = setTimeout(() => {
      // Only nudge if widget is still in ready state (not open)
      if (!btn.classList.contains('sb-trigger--hidden') && !this.panelEl) {
        btn.classList.add('sb-trigger--nudge');
        this.spawnConfetti(btn);
        // Remove class after animation so hover/click transitions work normally
        setTimeout(() => {
          btn.classList.remove('sb-trigger--nudge');
        }, 1500);
      }
    }, 4000);
  }

  private spawnConfetti(anchor: HTMLElement): void {
    const rect = anchor.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const wrap = document.createElement('div');
    wrap.className = 'sb-confetti-wrap';
    wrap.style.left = `${String(cx)}px`;
    wrap.style.top = `${String(cy)}px`;

    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
    const count = 8;

    for (let i = 0; i < count; i++) {
      const dot = document.createElement('div');
      dot.className = 'sb-confetti-dot';
      const angle = (i / count) * Math.PI * 2;
      const dist = 28 + Math.random() * 20;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist - 10; // bias upward
      dot.style.setProperty('--sb-cx', `${String(dx)}px`);
      dot.style.setProperty('--sb-cy', `${String(dy)}px`);
      dot.style.setProperty('--sb-cd', `${String(i * 30)}ms`);
      dot.style.backgroundColor = colors[i % colors.length] ?? '#3B82F6';
      wrap.appendChild(dot);
    }

    this.shadow.appendChild(wrap);

    // Clean up after animation
    setTimeout(() => {
      wrap.remove();
    }, 1200);
  }

  // Flag for return visitor welcome
  private returnVisitor = false;

  // ── Open Panel ───────────────────────────────────────────────────────
  openPanel(stepIndex: number, totalSteps: number, returnVisitor?: boolean): void {
    if (!this.config) return;

    if (returnVisitor !== undefined) {
      this.returnVisitor = returnVisitor;
    }

    this.hideTrigger();
    this.showOverlay();

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
        this.hideOverlay();
      });
      this.disableFocusTrap();
    }
  }

  // ── Build Panel Structure ────────────────────────────────────────────
  private buildPanel(): void {
    const panel = el('div', 'sb-panel sb-panel--hidden', {
      role: 'dialog',
      'aria-label': 'HawkLeads Widget',
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
        href: 'https://hawkleads.io?ref=widget',
        target: '_blank',
        rel: 'noopener noreferrer',
      });
      link.textContent = 'Powered by HawkLeads';
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

      // Show welcome back message for return visitors on first step
      if (stepIndex === 0 && this.returnVisitor) {
        const welcomeBack = el('p', 'sb-welcome-back');
        welcomeBack.textContent = 'Welcome back!';
        welcomeBack.style.cssText = 'font-size: 13px; color: #3B82F6; font-weight: 600; margin: 0 0 8px; padding: 0;';
        wrapper.appendChild(welcomeBack);
      }

      // Show offline message if outside business hours
      if (stepIndex === 0 && this.config && !this.config.isOpen && this.config.offlineMessage) {
        const offline = el('div', 'sb-offline-msg');
        offline.style.cssText = 'font-size: 13px; color: #92400E; background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 6px; padding: 8px 12px; margin: 0 0 12px; line-height: 1.4;';
        offline.textContent = this.config.offlineMessage;
        wrapper.appendChild(offline);
      }

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
        if (!opt) continue;

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

        const optionId = opt.id;
        const optionLabel = opt.label;
        const optionScore = opt.scoreWeight;
        btn.addEventListener('click', () => {
          animateOptionTap(btn);
          // Brief delay to let the tap animation be visible
          setTimeout(() => {
            this.callbacks.onOptionSelect(
              step.id,
              optionId,
              optionLabel,
              optionScore
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

    // Auto-format phone numbers as (XXX) XXX-XXXX
    if (type === 'tel') {
      input.setAttribute('inputmode', 'tel');
      input.addEventListener('input', () => {
        const digits = input.value.replace(/\D/g, '').slice(0, 10);
        if (digits.length === 0) {
          input.value = '';
        } else if (digits.length <= 3) {
          input.value = `(${digits}`;
        } else if (digits.length <= 6) {
          input.value = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
        } else {
          input.value = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
        }
      });
    }
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

  // ── Render Booking Calendar ──────────────────────────────────────────
  renderBooking(
    headingText: string,
    timezone: string,
    days: Array<{ date: string; dayLabel: string; slots: Array<{ start: string; startsAt: string }> }>,
    onSlotConfirmed: (startsAt: string) => void,
    onSkip: () => void,
    errorMessage?: string,
    isConfirming?: boolean
  ): void {
    if (!this.contentEl) return;

    // Hide back button, update progress
    if (this.backBtn) this.backBtn.style.visibility = 'hidden';
    if (this.stepCounter) this.stepCounter.textContent = 'Book';
    if (this.progressBar) {
      this.progressBar.style.width = '100%';
    }

    this.contentEl.textContent = '';

    const wrapper = el('div', 'sb-booking');

    // Heading
    const heading = el('h2', 'sb-booking__heading');
    heading.textContent = headingText;
    wrapper.appendChild(heading);

    if (days.length === 0) {
      const empty = el('div', 'sb-booking__empty');
      empty.textContent = 'No times available right now.';
      wrapper.appendChild(empty);
      const skipBtn = el('button', 'sb-booking__skip');
      skipBtn.textContent = 'Skip booking';
      skipBtn.addEventListener('click', onSkip);
      wrapper.appendChild(skipBtn);
      this.contentEl.appendChild(wrapper);
      return;
    }

    let selectedDateIndex = 0;
    let selectedSlotStartsAt: string | null = null;

    // Find first day with available slots
    for (let i = 0; i < days.length; i++) {
      const day = days[i];
      if (day && day.slots.length > 0) {
        selectedDateIndex = i;
        break;
      }
    }

    // Date strip
    const dateStrip = el('div', 'sb-date-strip');

    const prevBtn = el('button', 'sb-date-nav', { 'aria-label': 'Previous dates' });
    const prevSvg = createSvg('0 0 24 24', svgPath('M15 18l-6-6 6-6'));
    prevBtn.appendChild(prevSvg);
    dateStrip.appendChild(prevBtn);

    const scrollContainer = el('div', 'sb-date-strip__scroll');
    dateStrip.appendChild(scrollContainer);

    const nextBtn = el('button', 'sb-date-nav', { 'aria-label': 'Next dates' });
    const nextSvg = createSvg('0 0 24 24', svgPath('M9 18l6-6-6-6'));
    nextBtn.appendChild(nextSvg);
    dateStrip.appendChild(nextBtn);

    wrapper.appendChild(dateStrip);

    // Time list container
    const timeList = el('div', 'sb-time-list');
    wrapper.appendChild(timeList);

    // Error message area
    const errorEl = el('div', 'sb-booking__error');
    if (errorMessage) {
      errorEl.textContent = errorMessage;
    }
    errorEl.style.display = errorMessage ? 'block' : 'none';
    wrapper.appendChild(errorEl);

    // Confirm button
    const confirmBtn = el('button', 'sb-booking__confirm');
    confirmBtn.textContent = 'Confirm booking';
    confirmBtn.disabled = true;
    confirmBtn.style.display = 'none';
    wrapper.appendChild(confirmBtn);

    // Skip button
    const skipBtn = el('button', 'sb-booking__skip');
    skipBtn.textContent = 'Skip booking';
    skipBtn.addEventListener('click', onSkip);
    wrapper.appendChild(skipBtn);

    this.contentEl.appendChild(wrapper);

    // Render functions
    const renderDateButtons = (): void => {
      scrollContainer.textContent = '';
      for (let i = 0; i < days.length; i++) {
        const day = days[i];
        if (!day) continue;
        const btn = el('button', `sb-date-btn${i === selectedDateIndex ? ' sb-date-btn--active' : ''}`);

        // Parse dayLabel like "Mon, Apr 7"
        const parts = day.dayLabel.split(',');
        const dayName = el('span', 'sb-date-btn__day');
        dayName.textContent = (parts[0] ?? '').trim();
        btn.appendChild(dayName);

        const dateNum = el('span', 'sb-date-btn__num');
        dateNum.textContent = (parts[1] ?? '').trim();
        btn.appendChild(dateNum);

        if (day.slots.length === 0) {
          btn.style.opacity = '0.4';
          btn.style.cursor = 'default';
        }

        btn.addEventListener('click', () => {
          if (day.slots.length === 0) return;
          selectedDateIndex = i;
          selectedSlotStartsAt = null;
          confirmBtn.disabled = true;
          confirmBtn.style.display = 'none';
          renderDateButtons();
          renderTimeSlots();
        });
        scrollContainer.appendChild(btn);
      }
    };

    const renderTimeSlots = (): void => {
      timeList.textContent = '';
      const day = days[selectedDateIndex];
      if (!day || day.slots.length === 0) {
        const empty = el('div', 'sb-booking__empty');
        empty.textContent = 'No times available for this date.';
        timeList.appendChild(empty);
        return;
      }

      for (const slot of day.slots) {
        const btn = el('button', `sb-time-btn${selectedSlotStartsAt === slot.startsAt ? ' sb-time-btn--selected' : ''}`);
        btn.textContent = slot.start;
        btn.addEventListener('click', () => {
          selectedSlotStartsAt = slot.startsAt;
          confirmBtn.disabled = false;
          confirmBtn.style.display = 'block';

          // Format confirm button text
          const startDate = new Date(slot.startsAt);
          const label = new Intl.DateTimeFormat('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            timeZone: timezone,
          }).format(startDate);
          confirmBtn.textContent = `Confirm: ${label}`;

          renderTimeSlots();
        });
        timeList.appendChild(btn);
      }
    };

    // Scroll navigation
    prevBtn.addEventListener('click', () => {
      scrollContainer.scrollBy({ left: -120, behavior: 'smooth' });
    });
    nextBtn.addEventListener('click', () => {
      scrollContainer.scrollBy({ left: 120, behavior: 'smooth' });
    });

    // Confirm handler
    confirmBtn.addEventListener('click', () => {
      if (!selectedSlotStartsAt || isConfirming) return;
      confirmBtn.disabled = true;
      confirmBtn.textContent = 'Booking...';
      onSlotConfirmed(selectedSlotStartsAt);
    });

    renderDateButtons();
    renderTimeSlots();
  }

  renderBookingLoading(headingText: string): void {
    if (!this.contentEl) return;
    if (this.backBtn) this.backBtn.style.visibility = 'hidden';
    if (this.stepCounter) this.stepCounter.textContent = 'Book';

    this.contentEl.textContent = '';
    const wrapper = el('div', 'sb-booking');

    const heading = el('h2', 'sb-booking__heading');
    heading.textContent = headingText;
    wrapper.appendChild(heading);

    const loading = el('div', 'sb-booking__loading');
    const spinner = el('div', 'sb-booking__loading-spinner');
    loading.appendChild(spinner);
    wrapper.appendChild(loading);

    this.contentEl.appendChild(wrapper);
  }

  renderBookingConfirmation(
    confirmText: string,
    startsAt: string,
    timezone: string,
    _durationMinutes: number
  ): void {
    if (!this.contentEl) return;

    if (this.backBtn) this.backBtn.style.visibility = 'hidden';
    if (this.progressBar) {
      this.progressBar.style.width = '100%';
    }
    if (this.stepCounter) this.stepCounter.textContent = 'Complete';

    this.contentEl.textContent = '';

    const wrapper = el('div', 'sb-confirmation');

    const checkCircle = el('div', 'sb-confirmation__check');
    checkCircle.appendChild(iconCheck());
    wrapper.appendChild(checkCircle);

    const headline = el('h2', 'sb-confirmation__headline');
    headline.textContent = confirmText;
    wrapper.appendChild(headline);

    // Format booking details
    const start = new Date(startsAt);
    const dateLabel = new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      timeZone: timezone,
    }).format(start);
    const timeLabel = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: timezone,
    }).format(start);
    const tzAbbr = new Intl.DateTimeFormat('en-US', {
      timeZoneName: 'short',
      timeZone: timezone,
    }).formatToParts(start).find((p) => p.type === 'timeZoneName')?.value ?? timezone;

    const body = el('p', 'sb-confirmation__body');
    body.textContent = `${dateLabel} at ${timeLabel} (${tzAbbr})`;
    wrapper.appendChild(body);

    this.contentEl.appendChild(wrapper);
    animateConfirmation(wrapper);
    this.launchConfetti();
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

    // Full-page confetti burst
    this.launchConfetti();
  }

  private launchConfetti(): void {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;inset:0;z-index:2147483647;pointer-events:none;width:100vw;height:100vh;';
    document.body.appendChild(canvas);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) { canvas.remove(); return; }

    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'];

    interface Piece {
      x: number; y: number; w: number; h: number;
      vx: number; vy: number; rot: number; vr: number;
      color: string; life: number; shape: number; sway: number;
      swaySpeed: number; delay: number;
    }

    const pieces: Piece[] = [];
    const w = canvas.width;
    const h = canvas.height;

    // Wave 1: Center burst
    for (let i = 0; i < 40; i++) {
      const angle = (Math.random() * Math.PI * 2);
      const speed = 2 + Math.random() * 5;
      pieces.push({
        x: w / 2 + (Math.random() - 0.5) * 200,
        y: h / 2 + (Math.random() - 0.5) * 100,
        w: 8 + Math.random() * 10,
        h: 5 + Math.random() * 10,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.15,
        color: colors[Math.floor(Math.random() * colors.length)] ?? '#3B82F6',
        life: 1,
        shape: Math.floor(Math.random() * 3),
        sway: Math.random() * Math.PI * 2,
        swaySpeed: 0.02 + Math.random() * 0.03,
        delay: 0,
      });
    }

    // Wave 2: Side cannons (delayed)
    for (let i = 0; i < 30; i++) {
      const fromLeft = i % 2 === 0;
      pieces.push({
        x: fromLeft ? -10 : w + 10,
        y: h * 0.7 + Math.random() * h * 0.3,
        w: 6 + Math.random() * 8,
        h: 4 + Math.random() * 8,
        vx: (fromLeft ? 1 : -1) * (3 + Math.random() * 5),
        vy: -(4 + Math.random() * 6),
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.2,
        color: colors[Math.floor(Math.random() * colors.length)] ?? '#10B981',
        life: 1,
        shape: Math.floor(Math.random() * 3),
        sway: Math.random() * Math.PI * 2,
        swaySpeed: 0.015 + Math.random() * 0.02,
        delay: 30 + Math.floor(Math.random() * 20),
      });
    }

    // Wave 3: Gentle rain from top (delayed more)
    for (let i = 0; i < 40; i++) {
      pieces.push({
        x: Math.random() * w,
        y: -20 - Math.random() * 200,
        w: 5 + Math.random() * 7,
        h: 3 + Math.random() * 6,
        vx: (Math.random() - 0.5) * 1.5,
        vy: 0.5 + Math.random() * 1.5,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.1,
        color: colors[Math.floor(Math.random() * colors.length)] ?? '#F59E0B',
        life: 1,
        shape: Math.floor(Math.random() * 3),
        sway: Math.random() * Math.PI * 2,
        swaySpeed: 0.01 + Math.random() * 0.02,
        delay: 60 + Math.floor(Math.random() * 60),
      });
    }

    // Straggler waves: a few pieces float up then fall, repeating 3x at 4s intervals
    const addStragglers = (delayFrames: number): void => {
      for (let i = 0; i < 5; i++) {
        pieces.push({
          x: Math.random() * w,
          y: h + 20,
          w: 7 + Math.random() * 9,
          h: 5 + Math.random() * 7,
          vx: (Math.random() - 0.5) * 2,
          vy: -(3 + Math.random() * 4),
          rot: Math.random() * Math.PI * 2,
          vr: (Math.random() - 0.5) * 0.12,
          color: colors[Math.floor(Math.random() * colors.length)] ?? '#8B5CF6',
          life: 1,
          shape: Math.floor(Math.random() * 3),
          sway: Math.random() * Math.PI * 2,
          swaySpeed: 0.01 + Math.random() * 0.015,
          delay: delayFrames + Math.floor(Math.random() * 30),
        });
      }
    };

    addStragglers(240);  // ~4s
    addStragglers(480);  // ~8s
    addStragglers(720);  // ~12s

    let frame = 0;
    const maxFrames = 900;

    const animate = (): void => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of pieces) {
        if (frame < p.delay) continue;

        p.sway += p.swaySpeed;
        p.x += p.vx + Math.sin(p.sway) * 0.5;
        p.vy += 0.04;
        p.y += p.vy;
        p.rot += p.vr;
        p.vx *= 0.995;
        p.vr *= 0.998;

        if (frame > maxFrames - 80) {
          p.life -= 0.0125;
        }

        if (p.life <= 0 || p.y > canvas.height + 20) continue;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;

        if (p.shape === 0) {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        } else if (p.shape === 1) {
          ctx.beginPath();
          ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.moveTo(0, -p.h / 2);
          ctx.lineTo(p.w / 2, p.h / 2);
          ctx.lineTo(-p.w / 2, p.h / 2);
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();
      }

      if (frame < maxFrames) {
        requestAnimationFrame(animate);
      } else {
        canvas.remove();
      }
    };

    requestAnimationFrame(animate);
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

    const wrapper = el('div', '', {
      role: 'status',
      style: [
        'position: fixed',
        'bottom: 24px',
        'right: 24px',
        'z-index: 2147483647',
        'width: 300px',
        'background: #ffffff',
        'border: 1px solid #E2E8F0',
        'border-radius: 12px',
        'box-shadow: 0 4px 12px rgba(0,0,0,0.08)',
        'padding: 24px',
        'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        'text-align: center',
        'pointer-events: auto',
      ].join('; '),
    });

    const icon = el('div', '', {
      style: [
        'width: 40px',
        'height: 40px',
        'margin: 0 auto 12px',
        'background: #F1F5F9',
        'border-radius: 50%',
        'display: flex',
        'align-items: center',
        'justify-content: center',
      ].join('; '),
    });
    const iconSvg = createSvg(
      '0 0 24 24',
      svgPath(
        'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z',
        { fill: 'none', stroke: '#64748B', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }
      )
    );
    iconSvg.setAttribute('width', '20');
    iconSvg.setAttribute('height', '20');
    icon.appendChild(iconSvg);
    wrapper.appendChild(icon);

    const heading = el('p', '', {
      style: 'font-size: 15px; font-weight: 600; color: #1E293B; margin: 0 0 4px; line-height: 1.4;',
    });
    heading.textContent = 'Widget temporarily unavailable';
    wrapper.appendChild(heading);

    const msg = el('p', '', {
      style: 'font-size: 13px; color: #64748B; margin: 0; line-height: 1.5;',
    });
    msg.textContent = 'Please contact us directly for assistance.';
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

  // ── Mobile Overlay ─────────────────────────────────────────────────
  private showOverlay(): void {
    if (this.overlayEl) return;
    const overlay = el('div', 'sb-overlay');
    overlay.addEventListener('click', () => {
      this.callbacks.onClose();
    });
    this.shadow.appendChild(overlay);
    this.overlayEl = overlay;
  }

  private hideOverlay(): void {
    if (this.overlayEl) {
      this.overlayEl.remove();
      this.overlayEl = null;
    }
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
    if (this.nudgeTimer) {
      clearTimeout(this.nudgeTimer);
      this.nudgeTimer = null;
    }
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
      this.resizeHandler = null;
    }
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
    this.contrastAdapted = false;
  }
}
