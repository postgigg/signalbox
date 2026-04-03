'use client';

import { useEffect, useRef } from 'react';

const TRUST_ITEMS = [
  'Home Services',
  'Legal Firms',
  'Real Estate',
  'Agencies',
  'Consulting',
  'Financial Services',
  'Hospitality',
  'Fitness',
  'Education',
  'Healthcare',
] as const;

export function TrustBar(): React.ReactElement {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reducedMotion.matches) return;

    let position = 0;
    let frameId: number | undefined;

    function step(): void {
      position -= 0.4;
      if (track) {
        const halfWidth = track.scrollWidth / 2;
        if (Math.abs(position) >= halfWidth) {
          position = 0;
        }
        track.style.transform = `translateX(${String(position)}px)`;
      }
      frameId = requestAnimationFrame(step);
    }

    frameId = requestAnimationFrame(step);
    return () => {
      if (frameId !== undefined) cancelAnimationFrame(frameId);
    };
  }, []);

  const items = [...TRUST_ITEMS, ...TRUST_ITEMS];

  return (
    <div className="py-10 overflow-hidden relative">
      {/* Gradient fade edges */}
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-ink to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-ink to-transparent z-10 pointer-events-none" />

      <p className="text-center text-xs font-body font-semibold uppercase tracking-widest text-white/40 mb-6">
        Built for service businesses that close on the phone
      </p>

      <div ref={trackRef} className="flex items-center gap-8 whitespace-nowrap will-change-transform">
        {items.map((item, i) => (
          <span
            key={`${item}-${String(i)}`}
            className="inline-flex items-center gap-2 text-sm font-body text-white/30"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white/20 flex-shrink-0" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export function TrustSignals(): React.ReactElement {
  return <TrustBar />;
}
