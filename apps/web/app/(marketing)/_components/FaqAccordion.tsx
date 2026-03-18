'use client';

import { useState } from 'react';

import { FAQ_ITEMS } from '../_constants';

export function FaqAccordion(): React.ReactElement {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function toggle(index: number): void {
    setOpenIndex(openIndex === index ? null : index);
  }

  return (
    <div className="divide-y divide-border">
      {FAQ_ITEMS.map((item, index) => (
        <div key={item.question} className="py-5">
          <button
            type="button"
            onClick={() => toggle(index)}
            className="w-full flex items-center justify-between text-left"
            aria-expanded={openIndex === index}
          >
            <span className="font-body text-base font-medium text-ink pr-4">
              {item.question}
            </span>
            <svg
              className={`w-5 h-5 text-stone flex-shrink-0 transition-transform duration-fast ${
                openIndex === index ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {openIndex === index && (
            <p className="mt-3 text-sm text-stone leading-relaxed max-w-prose">
              {item.answer}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
