import type { WidgetTheme } from './types';

// ── Font Stack Resolver ────────────────────────────────────────────────────
function fontStack(family: WidgetTheme['fontFamily']): string {
  switch (family) {
    case 'serif':
      return 'Georgia, "Times New Roman", Times, serif';
    case 'sans':
      return '"Helvetica Neue", Helvetica, Arial, sans-serif';
    case 'system':
    default:
      return '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
  }
}

// ── Position Resolver ──────────────────────────────────────────────────────
function triggerPosition(theme: WidgetTheme): string {
  const x = theme.triggerOffsetX;
  const y = theme.triggerOffsetY;
  switch (theme.position) {
    case 'bottom-left':
      return `bottom: ${y}px; left: ${x}px;`;
    case 'bottom-center':
      return `bottom: ${y}px; left: 50%; transform: translateX(-50%);`;
    case 'bottom-right':
    default:
      return `bottom: ${y}px; right: ${x}px;`;
  }
}

function panelPosition(theme: WidgetTheme): string {
  const x = theme.triggerOffsetX;
  const y = theme.triggerOffsetY + 60;
  switch (theme.position) {
    case 'bottom-left':
      return `bottom: ${y}px; left: ${x}px;`;
    case 'bottom-center':
      return `bottom: ${y}px; left: 50%; transform: translateX(-50%);`;
    case 'bottom-right':
    default:
      return `bottom: ${y}px; right: ${x}px;`;
  }
}

// ── Hex to RGBA ────────────────────────────────────────────────────────────
function hexToRgba(hex: string, alpha: number): string {
  const cleaned = hex.replace('#', '');
  const r = parseInt(cleaned.substring(0, 2), 16);
  const g = parseInt(cleaned.substring(2, 4), 16);
  const b = parseInt(cleaned.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return hex;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ── Main Style Generator ──────────────────────────────────────────────────
export function getStyles(theme: WidgetTheme): string {
  const font = fontStack(theme.fontFamily);
  const radius = theme.borderRadius;
  const pw = theme.panelWidth || 400;
  const borderColor =
    theme.mode === 'dark'
      ? 'rgba(255,255,255,0.10)'
      : 'rgba(0,0,0,0.08)';
  const inputBg =
    theme.mode === 'dark'
      ? 'rgba(255,255,255,0.06)'
      : 'rgba(0,0,0,0.03)';
  const inputBorder =
    theme.mode === 'dark'
      ? 'rgba(255,255,255,0.12)'
      : 'rgba(0,0,0,0.12)';
  const hoverBg =
    theme.mode === 'dark'
      ? 'rgba(255,255,255,0.04)'
      : 'rgba(0,0,0,0.02)';

  return `
/* ── CSS Custom Properties ──────────────────────────────────────────────── */
:host {
  --sb-primary: ${theme.primaryColor};
  --sb-accent: ${theme.accentColor};
  --sb-bg: ${theme.backgroundColor};
  --sb-text: ${theme.textColor};
  --sb-radius: ${radius}px;
  --sb-font: ${font};
  --sb-panel-width: ${pw}px;
  --sb-border: ${borderColor};
  --sb-input-bg: ${inputBg};
  --sb-input-border: ${inputBorder};
  --sb-hover-bg: ${hoverBg};
  --sb-accent-10: ${hexToRgba(theme.accentColor, 0.1)};
  --sb-accent-20: ${hexToRgba(theme.accentColor, 0.2)};

  all: initial;
  font-family: var(--sb-font);
  color: var(--sb-text);
  line-height: 1.5;
  box-sizing: border-box;
}

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* ── Animations ─────────────────────────────────────────────────────────── */
@keyframes sb-fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes sb-slideUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes sb-slideInRight {
  from { opacity: 0; transform: translateX(24px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes sb-slideOutLeft {
  from { opacity: 1; transform: translateX(0); }
  to { opacity: 0; transform: translateX(-24px); }
}

@keyframes sb-scaleTap {
  0% { transform: scale(1); }
  50% { transform: scale(0.97); }
  100% { transform: scale(1); }
}

@keyframes sb-scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes sb-spin {
  to { transform: rotate(360deg); }
}

@keyframes sb-checkmark {
  from { stroke-dashoffset: 24; }
  to { stroke-dashoffset: 0; }
}

@keyframes sb-panelIn {
  from { opacity: 0; transform: translateY(100%) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes sb-panelOut {
  from { opacity: 1; transform: translateY(0) scale(1); }
  to { opacity: 0; transform: translateY(20px) scale(0.96); }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* ── Trigger Button ─────────────────────────────────────────────────────── */
.sb-trigger {
  position: fixed;
  ${triggerPosition(theme)}
  z-index: 2147483647;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 48px;
  padding: 0 20px;
  border: none;
  border-radius: ${Math.min(theme.borderRadius, 12)}px;
  background: var(--sb-primary);
  color: #fff;
  font-family: var(--sb-font);
  font-size: 15px;
  font-weight: 500;
  letter-spacing: 0.01em;
  cursor: pointer;
  pointer-events: auto;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
  animation: sb-fadeIn 0.4s ease 1s both;
  outline: none;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

.sb-trigger:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.2), 0 2px 6px rgba(0,0,0,0.1);
}

.sb-trigger:active {
  transform: translateY(0);
}

.sb-trigger:focus-visible {
  outline: 2px solid var(--sb-accent);
  outline-offset: 2px;
}

.sb-trigger--hidden {
  opacity: 0;
  pointer-events: none;
  transform: translateY(8px);
}

.sb-trigger__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.sb-trigger__icon svg {
  width: 18px;
  height: 18px;
  fill: currentColor;
}

/* ── Tab-style Trigger ──────────────────────────────────────────────────── */
.sb-trigger--tab {
  border-radius: ${radius}px ${radius}px 0 0;
  padding: 0 24px;
  height: 40px;
}

/* ── Panel ──────────────────────────────────────────────────────────────── */
.sb-panel {
  position: fixed;
  ${panelPosition(theme)}
  z-index: 2147483647;
  width: var(--sb-panel-width);
  max-height: 640px;
  display: flex;
  flex-direction: column;
  background: var(--sb-bg);
  border-radius: 12px;
  border: 1px solid var(--sb-border);
  box-shadow: 0 20px 60px rgba(0,0,0,0.15), 0 8px 20px rgba(0,0,0,0.08);
  overflow: hidden;
  font-family: var(--sb-font);
  pointer-events: auto;
  animation: sb-panelIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.sb-panel--closing {
  animation: sb-panelOut 0.25s ease both;
}

.sb-panel--hidden {
  display: none;
}

/* ── Header ─────────────────────────────────────────────────────────────── */
.sb-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px 8px;
  position: relative;
}

.sb-header__left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sb-header__back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 8px;
  color: var(--sb-text);
  opacity: 0.5;
  transition: opacity 0.15s, background 0.15s;
  padding: 0;
}

.sb-header__back:hover {
  opacity: 1;
  background: var(--sb-hover-bg);
}

.sb-header__back svg {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.sb-header__step {
  font-size: 12px;
  opacity: 0.5;
  font-weight: 500;
}

.sb-header__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 8px;
  color: var(--sb-text);
  opacity: 0.5;
  transition: opacity 0.15s, background 0.15s;
  padding: 0;
}

.sb-header__close:hover {
  opacity: 1;
  background: var(--sb-hover-bg);
}

.sb-header__close:focus-visible {
  outline: 2px solid var(--sb-accent);
  outline-offset: -2px;
}

.sb-header__close svg {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* ── Progress Bar ───────────────────────────────────────────────────────── */
.sb-progress {
  height: 4px;
  background: var(--sb-border);
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
}

.sb-progress__bar {
  height: 100%;
  background: var(--sb-accent);
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 0 2px 2px 0;
}

/* ── Content Area ───────────────────────────────────────────────────────── */
.sb-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px 20px 16px;
  min-height: 0;
}

.sb-content::-webkit-scrollbar {
  width: 4px;
}

.sb-content::-webkit-scrollbar-track {
  background: transparent;
}

.sb-content::-webkit-scrollbar-thumb {
  background: var(--sb-border);
  border-radius: 2px;
}

/* ── Step View ──────────────────────────────────────────────────────────── */
.sb-step {
  animation: sb-slideInRight 0.3s ease both;
}

.sb-step--exit {
  animation: sb-slideOutLeft 0.2s ease both;
}

.sb-step--back {
  animation: sb-slideInRight 0.3s ease both;
  animation-direction: reverse;
}

.sb-question {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 4px;
  line-height: 1.3;
  color: var(--sb-text);
}

.sb-description {
  font-size: 14px;
  opacity: 0.6;
  margin-bottom: 16px;
  line-height: 1.5;
}

/* ── Option Cards ───────────────────────────────────────────────────────── */
.sb-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
}

.sb-option {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: 52px;
  padding: 12px 16px;
  border: 1.5px solid var(--sb-border);
  border-radius: var(--sb-radius);
  background: transparent;
  color: var(--sb-text);
  font-family: var(--sb-font);
  font-size: 15px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, transform 0.15s;
  outline: none;
  -webkit-tap-highlight-color: transparent;
}

.sb-option:hover {
  border-color: var(--sb-accent);
  background: var(--sb-accent-10);
}

.sb-option:active {
  animation: sb-scaleTap 0.15s ease;
}

.sb-option:focus-visible {
  outline: 2px solid var(--sb-accent);
  outline-offset: -2px;
}

.sb-option__icon {
  font-size: 20px;
  flex-shrink: 0;
  line-height: 1;
}

.sb-option__num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 4px;
  background: var(--sb-border);
  color: var(--sb-text);
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
  opacity: 0.5;
  transition: opacity 0.15s ease;
}

.sb-option:hover .sb-option__num {
  opacity: 0.8;
}

.sb-option__label {
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ── Social Proof ───────────────────────────────────────────────────────── */
.sb-social-proof {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 20px;
  padding: 8px 12px;
  background: var(--sb-accent-10);
  border-radius: 8px;
  font-size: 12px;
  color: var(--sb-text);
  opacity: 0.7;
}

.sb-social-proof__icon {
  flex-shrink: 0;
  display: flex;
}

.sb-social-proof__icon svg {
  width: 14px;
  height: 14px;
  fill: var(--sb-accent);
}

/* ── Contact Form ───────────────────────────────────────────────────────── */
.sb-contact {
  animation: sb-slideInRight 0.3s ease both;
}

.sb-contact__title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 4px;
  color: var(--sb-text);
}

.sb-contact__subtitle {
  font-size: 14px;
  opacity: 0.6;
  margin-bottom: 20px;
}

.sb-field {
  margin-bottom: 14px;
}

.sb-field__label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 4px;
  color: var(--sb-text);
  opacity: 0.8;
}

.sb-field__required {
  color: #ef4444;
  margin-left: 2px;
}

.sb-field__input {
  display: block;
  width: 100%;
  height: 48px;
  padding: 0 14px;
  border: 1.5px solid var(--sb-input-border);
  border-radius: var(--sb-radius);
  background: var(--sb-input-bg);
  color: var(--sb-text);
  font-family: var(--sb-font);
  font-size: 15px;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.sb-field__input:focus {
  border-color: var(--sb-accent);
  box-shadow: 0 0 0 3px var(--sb-accent-20);
}

.sb-field__input--error {
  border-color: #ef4444;
}

.sb-field__input--error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
}

.sb-field__textarea {
  height: 80px;
  padding: 10px 14px;
  resize: vertical;
  min-height: 60px;
  max-height: 160px;
}

.sb-field__error {
  font-size: 12px;
  color: #ef4444;
  margin-top: 4px;
}

/* ── Honeypot ───────────────────────────────────────────────────────────── */
.sb-hp {
  display: none !important;
  position: absolute;
  left: -9999px;
  opacity: 0;
  height: 0;
  width: 0;
  overflow: hidden;
  tab-index: -1;
}

/* ── Submit Button ──────────────────────────────────────────────────────── */
.sb-submit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 52px;
  margin-top: 20px;
  border: none;
  border-radius: var(--sb-radius);
  background: var(--sb-primary);
  color: #fff;
  font-family: var(--sb-font);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s, transform 0.15s;
  outline: none;
  -webkit-tap-highlight-color: transparent;
}

.sb-submit:hover {
  opacity: 0.9;
}

.sb-submit:active {
  transform: scale(0.98);
}

.sb-submit:focus-visible {
  outline: 2px solid var(--sb-accent);
  outline-offset: 2px;
}

.sb-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.sb-submit__spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: sb-spin 0.7s linear infinite;
}

/* ── Confirmation ───────────────────────────────────────────────────────── */
.sb-confirmation {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 24px 8px 8px;
  animation: sb-scaleIn 0.35s ease both;
}

.sb-confirmation__check {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--sb-accent-10);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.sb-confirmation__check svg {
  width: 28px;
  height: 28px;
  fill: none;
  stroke: var(--sb-accent);
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.sb-confirmation__check svg path {
  stroke-dasharray: 24;
  animation: sb-checkmark 0.5s ease 0.2s both;
}

.sb-confirmation__headline {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--sb-text);
}

.sb-confirmation__body {
  font-size: 14px;
  opacity: 0.7;
  line-height: 1.6;
  margin-bottom: 20px;
  max-width: 300px;
}

.sb-confirmation__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 44px;
  padding: 0 24px;
  border: none;
  border-radius: var(--sb-radius);
  background: var(--sb-primary);
  color: #fff;
  font-family: var(--sb-font);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: opacity 0.15s;
}

.sb-confirmation__cta:hover {
  opacity: 0.9;
}

/* ── Error State ────────────────────────────────────────────────────────── */
.sb-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 32px 16px 16px;
  animation: sb-fadeIn 0.3s ease both;
}

.sb-error__icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.sb-error__icon svg {
  width: 24px;
  height: 24px;
  fill: none;
  stroke: #ef4444;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.sb-error__message {
  font-size: 14px;
  opacity: 0.7;
  margin-bottom: 16px;
  max-width: 280px;
  line-height: 1.5;
}

.sb-error__retry {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  padding: 0 24px;
  border: 1.5px solid var(--sb-border);
  border-radius: var(--sb-radius);
  background: transparent;
  color: var(--sb-text);
  font-family: var(--sb-font);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}

.sb-error__retry:hover {
  border-color: var(--sb-accent);
  background: var(--sb-accent-10);
}

/* ── Loading Spinner ────────────────────────────────────────────────────── */
.sb-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 16px;
}

.sb-loading__spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--sb-border);
  border-top-color: var(--sb-accent);
  border-radius: 50%;
  animation: sb-spin 0.7s linear infinite;
}

/* ── Footer ─────────────────────────────────────────────────────────────── */
.sb-footer {
  padding: 8px 16px 10px;
  text-align: center;
  flex-shrink: 0;
}

.sb-footer__link {
  font-size: 11px;
  opacity: 0.3;
  color: var(--sb-text);
  text-decoration: none;
  font-weight: 400;
  transition: opacity 0.15s;
}

.sb-footer__link:hover {
  opacity: 0.6;
}

/* ── Disabled State ─────────────────────────────────────────────────────── */
.sb-disabled {
  display: none;
}

/* ── Screen Reader Only ─────────────────────────────────────────────────── */
.sb-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* ── Mobile Responsive ──────────────────────────────────────────────────── */
@media (max-width: 640px) {
  .sb-panel {
    width: 100% !important;
    max-width: 100%;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    top: auto !important;
    transform: none !important;
    border-radius: 16px 16px 0 0;
    max-height: 85vh;
    border-bottom: none;
  }

  .sb-panel--closing {
    animation-name: sb-panelOut;
  }

  .sb-content {
    padding: 8px 16px 16px;
  }
}
`;
}
