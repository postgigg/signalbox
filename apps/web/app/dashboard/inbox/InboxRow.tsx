'use client';

import { formatRelativeTime, truncate } from '@/lib/utils';

interface InboxEmail {
  readonly id: string;
  readonly from_email: string;
  readonly from_name: string;
  readonly subject: string;
  readonly body_text: string;
  readonly is_read: boolean;
  readonly is_archived: boolean;
  readonly is_starred: boolean;
  readonly received_at: string;
}

export function StarIcon({ filled }: { readonly filled: boolean }): React.ReactElement {
  return (
    <svg
      className={`w-4 h-4 ${filled ? 'text-warning fill-warning' : 'text-stone-light'}`}
      fill={filled ? 'currentColor' : 'none'}
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
      />
    </svg>
  );
}

interface InboxRowProps {
  readonly email: InboxEmail;
  readonly isSelected: boolean;
  readonly onSelect: (id: string) => void;
  readonly onToggleStar: (e: React.MouseEvent, id: string, starred: boolean) => void;
  readonly onNavigate: (id: string) => void;
}

export function InboxRow({
  email,
  isSelected,
  onSelect,
  onToggleStar,
  onNavigate,
}: InboxRowProps): React.ReactElement {
  return (
    <div
      className={`px-5 py-3.5 border-b border-border last:border-0 flex items-center gap-4 cursor-pointer transition-colors duration-fast hover:bg-surface-alt ${
        !email.is_read ? 'bg-surface' : 'bg-paper'
      }`}
      onClick={() => onNavigate(email.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          onNavigate(email.id);
        }
      }}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onSelect(email.id)}
        onClick={(e) => e.stopPropagation()}
        className="w-4 h-4 rounded-sm border-border flex-shrink-0"
        aria-label={`Select email from ${email.from_name}`}
      />
      <button
        type="button"
        onClick={(e) => onToggleStar(e, email.id, email.is_starred)}
        className="flex-shrink-0"
        aria-label={email.is_starred ? 'Remove star' : 'Add star'}
      >
        <StarIcon filled={email.is_starred} />
      </button>
      <div className="flex-shrink-0 w-44 truncate">
        <span
          className={`text-sm ${
            !email.is_read ? 'font-semibold text-ink' : 'text-stone'
          }`}
        >
          {email.from_name}
        </span>
        <span className="text-xs text-stone-light ml-1 hidden sm:inline">
          {email.from_email}
        </span>
      </div>
      <div className="flex-1 min-w-0 truncate">
        <span
          className={`text-sm ${
            !email.is_read ? 'font-semibold text-ink' : 'text-ink'
          }`}
        >
          {email.subject}
        </span>
        <span className="text-sm text-stone-light ml-2">
          {truncate(email.body_text, 80)}
        </span>
      </div>
      <span className="text-xs text-stone flex-shrink-0 w-24 text-right whitespace-nowrap">
        {formatRelativeTime(email.received_at)}
      </span>
    </div>
  );
}
