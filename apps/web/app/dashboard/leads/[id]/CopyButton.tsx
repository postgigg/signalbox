'use client';

import { useState } from 'react';

interface CopyButtonProps {
  readonly text: string;
}

export function CopyButton({ text }: CopyButtonProps): React.ReactElement {
  const [copied, setCopied] = useState(false);

  async function handleCopy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  }

  return (
    <button
      type="button"
      className="mt-3 btn-ghost text-xs h-8"
      onClick={() => void handleCopy()}
    >
      {copied ? 'Copied' : 'Copy to clipboard'}
    </button>
  );
}
