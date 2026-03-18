import { useEffect, useRef } from 'react';

/**
 * Adds `is-visible` class to elements with entrance animation classes
 * when they enter the viewport. Uses IntersectionObserver for
 * paint-time triggering (fires after compositor paint, not on scroll tick).
 */
export function useInViewAnimations(): void {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const ANIMATION_SELECTORS = '.animate-on-enter, .animate-slide-right, .animate-fade';

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        }
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px',
      },
    );

    observerRef.current = observer;

    const targets = document.querySelectorAll(ANIMATION_SELECTORS);
    targets.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, []);
}
