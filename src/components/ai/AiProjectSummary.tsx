'use client';

import { Bath, Boxes, ChefHat, CookingPot, Lamp, LayoutPanelTop, PenLine, Sofa } from 'lucide-react';
import type { Briefing } from '@/lib/ai/types';

type AiProjectSummaryProps = {
  briefing: Briefing;
};

export default function AiProjectSummary({ briefing }: AiProjectSummaryProps) {
  const rows = [
    { icon: CookingPot, label: 'Ambiente', value: briefing.ambiente },
    { icon: Sofa, label: 'Estilo', value: briefing.estilo },
    { icon: Boxes, label: 'Mármore', value: briefing.pedra },
    { icon: ChefHat, label: 'Armários', value: briefing.coresMoveis },
    { icon: Bath, label: 'Pia', value: briefing.pia },
    { icon: Lamp, label: 'Iluminação', value: briefing.iluminacao },
    { icon: LayoutPanelTop, label: 'Bancada', value: briefing.bancada },
    { icon: ChefHat, label: 'Cores dos móveis', value: briefing.coresMoveis },
  ];

  return (
    <section className="rounded-2xl border border-[#7A1230]/35 bg-[#12070B] p-5 shadow-[0_18px_44px_rgba(0,0,0,0.22)]">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">Resumo do projeto</h2>
        <button type="button" className="inline-flex items-center gap-1 text-xs text-[#F2D28A]">
          <PenLine size={13} />
          Editar
        </button>
      </div>

      <div className="mt-5 space-y-4">
        {rows.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#C9A257]/15 bg-[#7A1230]/35 text-[#F2D28A]">
              <Icon size={17} />
            </span>
            <span>
              <span className="block text-xs text-white/40">{label}</span>
              <span className="mt-0.5 block text-sm font-medium text-white">{value || 'A definir'}</span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
