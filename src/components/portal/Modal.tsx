'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
};

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

export default function Modal({ open, onClose, title, description, children, footer, size = 'md' }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return undefined;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    // Focus the first field (or the panel) so keyboard users land inside the dialog.
    const first = panel?.querySelector<HTMLElement>('input, textarea, select') || panel;
    first?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onCloseRef.current();
      if (event.key !== 'Tab' || !panel) return;
      // Keeps Tab navigation inside the dialog.
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (!items.length) return;
      const [firstItem, lastItem] = [items[0], items[items.length - 1]];
      if (event.shiftKey && document.activeElement === firstItem) {
        event.preventDefault();
        lastItem.focus();
      } else if (!event.shiftKey && document.activeElement === lastItem) {
        event.preventDefault();
        firstItem.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
      previouslyFocused?.focus();
    };
  }, [open]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center">
      <div className="portal-overlay absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={`portal-dialog relative flex max-h-[calc(100dvh-2rem)] w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0f0e0c] shadow-[0_30px_80px_rgba(0,0,0,0.6)] outline-none ${
          size === 'sm' ? 'max-w-md' : size === 'lg' ? 'max-w-3xl' : 'max-w-lg'
        }`}
      >
        <div className="h-px shrink-0 bg-gold-line opacity-70" />
        <div className="flex shrink-0 items-start justify-between gap-4 px-6 pb-2 pt-6">
          <div>
            <h2 id={titleId} className="font-display text-lg uppercase tracking-wide text-stone-150">{title}</h2>
            {description && <p id={descriptionId} className="mt-1.5 text-sm leading-relaxed text-stone-250">{description}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar" className="-mr-2 -mt-1 rounded-full p-2 text-stone-250 transition hover:bg-white/5 hover:text-stone-150">
            <X size={18} />
          </button>
        </div>
        {/* Only the content scrolls; title and actions stay visible on short screens. */}
        {children && <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-4">{children}</div>}
        {footer && <div className="flex shrink-0 flex-wrap justify-end gap-3 border-t border-white/5 bg-black/20 px-6 py-4">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

type ConfirmDialogProps = {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  isLoading?: boolean;
};

export function ConfirmDialog({ open, onCancel, onConfirm, title, description, confirmLabel = 'Excluir', isLoading }: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={isLoading ? () => undefined : onCancel}
      title={title}
      size="sm"
      footer={
        <>
          <button type="button" onClick={onCancel} disabled={isLoading} className="rounded-md px-4 py-2.5 text-sm text-stone-250 transition hover:bg-white/5 hover:text-stone-150 disabled:opacity-50">
            Cancelar
          </button>
          <button type="button" onClick={onConfirm} disabled={isLoading} className="rounded-md bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-60">
            {isLoading ? 'Excluindo...' : confirmLabel}
          </button>
        </>
      }
    >
      <div className="flex gap-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-300">
          <AlertTriangle size={18} />
        </span>
        <p className="text-sm leading-relaxed text-stone-250">{description}</p>
      </div>
    </Modal>
  );
}
