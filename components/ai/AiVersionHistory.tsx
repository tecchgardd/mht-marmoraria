'use client';

import { History, Lock } from 'lucide-react';
import type { ProjectVersion } from '@/lib/ai/types';

type AiVersionHistoryProps = {
  versions: ProjectVersion[];
};

export default function AiVersionHistory({ versions }: AiVersionHistoryProps) {
  return (
    <section className="rounded-2xl border border-[#7A1230]/35 bg-[#12070B] p-5 shadow-[0_18px_44px_rgba(0,0,0,0.22)]">
      <h2 className="text-sm font-semibold text-white">Histórico de versões</h2>

      <div className="mt-4 space-y-3">
        {versions.length === 0 && (
          <p className="rounded-lg border border-[#7A1230]/25 bg-black/20 px-3 py-3 text-xs leading-5 text-white/50">
            As versões do projeto aparecerão aqui depois da primeira prévia.
          </p>
        )}

        {versions.slice(-3).map((version, index) => (
          <div key={version.id} className="flex items-center justify-between gap-3 text-xs text-white/55">
            <span className="flex min-w-0 items-center gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#C9A257]/15 bg-[#7A1230]/35 text-[#F2D28A]">
                {index === 0 ? <Lock size={13} /> : <History size={13} />}
              </span>
              <span className="truncate">{version.userRequest || `Versão ${version.versionNumber}`}</span>
            </span>
            <span className="text-white/35">10:{33 + index * 5}</span>
          </div>
        ))}
      </div>

      <button type="button" className="mt-4 w-full rounded-lg border border-[#7A1230]/35 px-4 py-2.5 text-xs text-white/70 transition hover:border-[#C9A257]/60 hover:text-white">
        Ver todas as versões
      </button>
    </section>
  );
}
