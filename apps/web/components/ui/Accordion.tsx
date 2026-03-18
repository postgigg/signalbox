'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

export interface AccordionItem {
  question: string;
  answer: string;
}

export interface AccordionProps {
  items: AccordionItem[];
  className?: string;
}

interface AccordionPanelProps {
  item: AccordionItem;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}

function AccordionPanel({ item, index, isOpen, onToggle }: AccordionPanelProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  const measure = useCallback(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure]);

  const panelId = `accordion-panel-${index}`;
  const headerId = `accordion-header-${index}`;

  return (
    <div className="border-b border-border">
      <h3>
        <button
          type="button"
          id={headerId}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
          className={[
            'flex w-full items-center justify-between py-4 text-left',
            'font-body text-sm font-medium text-ink',
            'hover:text-signal transition-colors duration-fast',
            'focus:outline-none focus:ring-2 focus:ring-signal focus:ring-inset',
          ].join(' ')}
        >
          <span>{item.question}</span>
          <svg
            className={[
              'h-4 w-4 shrink-0 text-stone transition-transform duration-fast',
              isOpen ? 'rotate-180' : '',
            ].join(' ')}
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M4 6l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </h3>

      <div
        id={panelId}
        role="region"
        aria-labelledby={headerId}
        style={{ height: isOpen ? height : 0 }}
        className="overflow-hidden transition-[height] duration-normal ease-out"
      >
        <div ref={contentRef} className="pb-4 text-sm font-body text-stone leading-relaxed">
          {item.answer}
        </div>
      </div>
    </div>
  );
}

export function Accordion({ items, className = '' }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className={`divide-y-0 ${className}`}>
      {items.map((item, index) => (
        <AccordionPanel
          key={index}
          item={item}
          index={index}
          isOpen={openIndex === index}
          onToggle={() => setOpenIndex(openIndex === index ? null : index)}
        />
      ))}
    </div>
  );
}
