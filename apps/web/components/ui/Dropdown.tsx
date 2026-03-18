'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

export interface DropdownItem {
  label: string;
  onClick: () => void;
  danger?: boolean;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  className?: string;
}

export function Dropdown({ trigger, items, align = 'left', className = '' }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setIsOpen(false), []);

  /* Close on outside click */
  useEffect(() => {
    if (!isOpen) return;

    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    };

    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, close]);

  /* Close on Escape */
  useEffect(() => {
    if (!isOpen) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, close]);

  /* Keyboard navigation */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isOpen) return;

    const menu = menuRef.current;
    if (!menu) return;

    const buttons = menu.querySelectorAll<HTMLButtonElement>('button');
    const currentIndex = Array.from(buttons).findIndex(
      (btn) => btn === document.activeElement,
    );

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = currentIndex < buttons.length - 1 ? currentIndex + 1 : 0;
      buttons[next]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = currentIndex > 0 ? currentIndex - 1 : buttons.length - 1;
      buttons[prev]?.focus();
    }
  };

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`} onKeyDown={handleKeyDown}>
      {/* Trigger */}
      <div
        onClick={() => setIsOpen((prev) => !prev)}
        role="button"
        tabIndex={0}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen((prev) => !prev);
          }
        }}
      >
        {trigger}
      </div>

      {/* Menu */}
      {isOpen && (
        <div
          ref={menuRef}
          role="menu"
          className={[
            'absolute z-50 mt-1 min-w-[180px] py-1',
            'bg-surface border border-border rounded-md shadow-md',
            align === 'right' ? 'right-0' : 'left-0',
          ].join(' ')}
        >
          {items.map((item, index) => (
            <button
              key={index}
              type="button"
              role="menuitem"
              onClick={() => {
                item.onClick();
                close();
              }}
              className={[
                'w-full text-left px-3 py-2 text-sm font-body transition-colors duration-fast',
                'focus:outline-none focus:bg-surface-alt',
                item.danger
                  ? 'text-danger hover:bg-danger-light'
                  : 'text-ink hover:bg-surface-alt',
              ].join(' ')}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
