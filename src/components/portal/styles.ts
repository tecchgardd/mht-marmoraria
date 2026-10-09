export const inputClass =
  'w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-stone-150 placeholder:text-white/30 outline-none transition focus:border-gold-400/70 focus:ring-1 focus:ring-gold-400/40';

export const labelClass = 'mb-1.5 block text-xs font-medium uppercase tracking-wide text-stone-250';

export const cardClass = 'rounded-2xl border border-white/[0.08] bg-[#0d0c0a]';

export const primaryButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-md bg-gold-400 px-4 py-2.5 text-sm font-semibold text-ink-950 transition hover:bg-gold-200 disabled:cursor-not-allowed disabled:opacity-60';

export const secondaryButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-md border border-white/15 px-4 py-2.5 text-sm text-stone-150 transition hover:border-gold-400/60 hover:text-white disabled:cursor-not-allowed disabled:opacity-60';

export const dangerButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-md border border-red-500/30 px-3 py-2 text-sm text-red-300 transition hover:border-red-400 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60';

export async function readError(response: Response, fallback: string) {
  const data = await response.json().catch(() => null);
  return (data && typeof data.error === 'string' && data.error) || fallback;
}
