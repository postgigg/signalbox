// ── Animation Helpers ──────────────────────────────────────────────────────
// All helpers respect prefers-reduced-motion via CSS.
// These functions add/remove CSS class names to trigger keyframe animations.

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia(REDUCED_MOTION_QUERY).matches
  );
}

// ── Class Toggle with Auto-Cleanup ─────────────────────────────────────────
function addClassTemporarily(
  el: HTMLElement,
  className: string,
  durationMs: number
): void {
  el.classList.add(className);
  if (prefersReducedMotion()) {
    // Immediately remove if motion is reduced
    el.classList.remove(className);
    return;
  }
  setTimeout(() => {
    el.classList.remove(className);
  }, durationMs);
}

// ── Panel Open ─────────────────────────────────────────────────────────────
export function animatePanelOpen(panel: HTMLElement): void {
  panel.classList.remove('sb-panel--hidden', 'sb-panel--closing');
  // The .sb-panel class already has the sb-panelIn animation applied
  // Re-trigger by briefly removing and re-adding the element's animation
  panel.style.animation = 'none';
  // Force reflow
  void panel.offsetHeight;
  panel.style.animation = '';
}

// ── Panel Close ────────────────────────────────────────────────────────────
export function animatePanelClose(
  panel: HTMLElement,
  onComplete: () => void
): void {
  if (prefersReducedMotion()) {
    panel.classList.add('sb-panel--hidden');
    onComplete();
    return;
  }

  panel.classList.add('sb-panel--closing');

  const handler = () => {
    panel.removeEventListener('animationend', handler);
    panel.classList.add('sb-panel--hidden');
    panel.classList.remove('sb-panel--closing');
    onComplete();
  };
  panel.addEventListener('animationend', handler, { once: true });

  // Fallback if animationend doesn't fire
  setTimeout(() => {
    if (!panel.classList.contains('sb-panel--hidden')) {
      panel.removeEventListener('animationend', handler);
      panel.classList.add('sb-panel--hidden');
      panel.classList.remove('sb-panel--closing');
      onComplete();
    }
  }, 300);
}

// ── Step Transition Forward ────────────────────────────────────────────────
export function animateStepForward(
  container: HTMLElement,
  buildNext: () => HTMLElement
): void {
  const current = container.firstElementChild as HTMLElement | null;

  if (!current || prefersReducedMotion()) {
    container.textContent = '';
    const next = buildNext();
    container.appendChild(next);
    return;
  }

  current.classList.add('sb-step--exit');

  const handler = () => {
    current.removeEventListener('animationend', handler);
    container.textContent = '';
    const next = buildNext();
    container.appendChild(next);
  };

  current.addEventListener('animationend', handler, { once: true });

  // Fallback
  setTimeout(() => {
    if (container.contains(current)) {
      current.removeEventListener('animationend', handler);
      container.textContent = '';
      const next = buildNext();
      container.appendChild(next);
    }
  }, 250);
}

// ── Step Transition Backward ───────────────────────────────────────────────
export function animateStepBackward(
  container: HTMLElement,
  buildPrev: () => HTMLElement
): void {
  if (prefersReducedMotion()) {
    container.textContent = '';
    const prev = buildPrev();
    container.appendChild(prev);
    return;
  }

  container.textContent = '';
  const prev = buildPrev();
  prev.classList.add('sb-step--back');
  container.appendChild(prev);

  // Remove animation class after it plays
  setTimeout(() => {
    prev.classList.remove('sb-step--back');
  }, 350);
}

// ── Option Tap Feedback ────────────────────────────────────────────────────
export function animateOptionTap(option: HTMLElement): void {
  addClassTemporarily(option, 'sb-option--tapped', 200);
}

// ── Trigger Entrance ───────────────────────────────────────────────────────
export function animateTriggerEntrance(trigger: HTMLElement): void {
  // The CSS handles the delayed fadeIn animation on .sb-trigger
  trigger.classList.remove('sb-trigger--hidden');
}

// ── Trigger Hide ───────────────────────────────────────────────────────────
export function animateTriggerHide(trigger: HTMLElement): void {
  trigger.classList.add('sb-trigger--hidden');
}

// ── Confirmation Reveal ────────────────────────────────────────────────────
export function animateConfirmation(el: HTMLElement): void {
  // The .sb-confirmation class handles the scaleIn animation via CSS
  // This function ensures the element is visible and triggers a reflow
  el.style.animation = 'none';
  void el.offsetHeight;
  el.style.animation = '';
}
