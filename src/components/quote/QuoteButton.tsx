'use client';

import type { ReactNode } from 'react';
import { useQuote } from './QuoteProvider';

/** Any "talk to us" button on the site: opens the quote form, which then forwards to WhatsApp. */
export default function QuoteButton({
  children,
  className,
  topic,
  ariaLabel,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  topic?: string;
  ariaLabel?: string;
  onClick?: () => void;
}) {
  const { open } = useQuote();
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className={className}
      onClick={() => {
        onClick?.();
        open(topic);
      }}
    >
      {children}
    </button>
  );
}
