'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Gem, Layers3, Mountain, Sparkles, X } from 'lucide-react';

const MATERIALS = [
  {
    name: 'Quartzo',
    desc: 'Resistência, sofisticação e baixa manutenção.',
    details: 'Superfície elegante para bancadas, ilhas e projetos contemporâneos que pedem aparência limpa e alto desempenho.',
    features: ['Baixa manutenção', 'Visual uniforme', 'Acabamento sofisticado'],
    icon: Gem,
    images: [
      '/assets/quartzo/qa1.webp',
      '/assets/quartzo/qa2.webp',
      '/assets/quartzo/qa3.webp',
    ],
  },
  {
    name: 'Mármore',
    desc: 'Elegância natural para ambientes exclusivos.',
    details: 'Pedra nobre para projetos que valorizam veios naturais, sofisticação e presença arquitetônica.',
    features: ['Veios naturais únicos', 'Toque clássico', 'Alto valor estético'],
    icon: Sparkles,
    images: [
      '/assets/marmores/ma1.webp',
      '/assets/marmores/ma2.webp',
      '/assets/marmores/ma3.webp',
    ],
  },
  {
    name: 'Granito',
    desc: 'Durabilidade e excelente custo-benefício.',
    details: 'Versátil e resistente, funciona em bancadas, soleiras, escadas e áreas que exigem força mecânica.',
    features: ['Alta durabilidade', 'Ótimo custo-benefício', 'Uso interno e externo'],
    icon: Mountain,
    images: [
      '/assets/granitos/granito1.webp',
      '/assets/granitos/granito2.webp',
      '/assets/granitos/granito3.webp',
    ],
  },
  {
    name: 'Superfícies Industrializadas',
    desc: 'Tecnologia e acabamento premium.',
    details: 'Opções técnicas para projetos contemporâneos, com padrões controlados e chapas de alto desempenho.',
    features: ['Design consistente', 'Alto desempenho', 'Visual contemporâneo'],
    icon: Layers3,
    images: [
      '/assets/quartzo/qa2.webp',
      '/assets/quartzo/qa3.webp',
      '/assets/granitos/granito2.webp',
    ],
  },
];

export default function Materials() {
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [activeImage, setActiveImage] = useState(0);

  const closeModal = () => {
    setSelectedMaterial(null);
    setActiveImage(0);
  };

  const moveImage = useCallback((direction) => {
    if (!selectedMaterial) return;
    setActiveImage((current) => (current + direction + selectedMaterial.images.length) % selectedMaterial.images.length);
  }, [selectedMaterial]);

  useEffect(() => {
    if (!selectedMaterial) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') closeModal();
      if (event.key === 'ArrowLeft') moveImage(-1);
      if (event.key === 'ArrowRight') moveImage(1);
    };
    window.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [moveImage, selectedMaterial]);

  return (
    <section id="materiais" className="border-y border-white/5 bg-[#050505] py-14 md:py-16">
      <div className="container-px">
        <h2 className="text-center font-display text-3xl font-semibold uppercase text-stone-150 md:text-4xl">
          Nossos <span className="text-gold-300 underline decoration-gold-400/60 underline-offset-8">materiais</span>
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-4">
          {MATERIALS.map(({ name, desc, icon: Icon, images, details, features }) => (
            <button
              key={name}
              type="button"
              onClick={() => {
                setSelectedMaterial({ name, desc, icon: Icon, images, details, features });
                setActiveImage(0);
              }}
              className="group overflow-hidden rounded-lg border border-white/10 bg-[#101010] text-left transition duration-500 hover:-translate-y-1 hover:border-gold-400/45 hover:shadow-[0_22px_45px_rgba(0,0,0,0.35)]"
            >
              <div className="relative h-40 overflow-hidden">
                <Image src={images[0]} alt={name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
                <span className="absolute left-5 top-[calc(100%-24px)] flex h-12 w-12 items-center justify-center rounded-full border border-gold-400/70 bg-[#050505] text-gold-300 shadow-[0_10px_22px_rgba(0,0,0,0.45)]">
                  <Icon size={19} />
                </span>
              </div>
              <div className="p-6 pt-10">
                <h3 className="font-display text-base uppercase tracking-wide text-stone-150">{name}</h3>
                <p className="mt-3 min-h-[52px] text-base leading-relaxed text-stone-250">{desc}</p>
                <span className="mt-6 inline-flex items-center gap-2 font-display text-sm uppercase tracking-wide text-gold-300 group-hover:text-gold-200">
                  Saiba mais <ArrowRight size={14} />
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedMaterial && (
        <div className="fixed inset-0 z-[1000] flex items-start justify-center overflow-y-auto bg-black/80 px-3 py-4 backdrop-blur-sm sm:px-4 sm:py-6 lg:items-center" role="dialog" aria-modal="true" aria-label={`Detalhes de ${selectedMaterial.name}`} onClick={closeModal}>
          <div className="relative w-full max-w-5xl overflow-hidden rounded-lg border border-white/10 bg-ink-900 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <button type="button" onClick={closeModal} aria-label="Fechar detalhes" className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-ink-950/80 text-stone-150 shadow-lg transition hover:border-gold-300 hover:text-gold-300"><X size={18} /></button>
            <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="relative h-[42vh] min-h-[220px] max-h-[420px] bg-ink-950 sm:min-h-[300px] lg:h-auto lg:max-h-none lg:min-h-[600px]">
                <Image src={selectedMaterial.images[activeImage]} alt={`${selectedMaterial.name} ${activeImage + 1}`} fill className="object-cover" sizes="(min-width: 1024px) 62vw, 100vw" priority />
                <button type="button" onClick={() => moveImage(-1)} aria-label="Imagem anterior" className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-ink-950/75 text-stone-150 transition hover:bg-ink-800"><ChevronLeft size={20} /></button>
                <button type="button" onClick={() => moveImage(1)} aria-label="Próxima imagem" className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-ink-950/75 text-stone-150 transition hover:bg-ink-800"><ChevronRight size={20} /></button>
              </div>

              <div className="p-5 sm:p-6 lg:p-8 lg:pt-16">
                <button type="button" onClick={closeModal} aria-label="Fechar detalhes" className="ml-auto hidden h-9 w-9 items-center justify-center rounded-full border border-white/10 text-stone-150 transition hover:border-gold-300 hover:text-gold-300"><X size={18} /></button>
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gold-300 text-ink-950"><selectedMaterial.icon size={19} /></span>
                <h3 className="mt-5 font-display text-2xl uppercase text-stone-150">{selectedMaterial.name}</h3>
                <p className="mt-3 text-sm font-medium text-gold-300">{selectedMaterial.desc}</p>
                <p className="mt-4 text-sm leading-relaxed text-stone-250">{selectedMaterial.details}</p>
                <div className="mt-6 space-y-2">
                  {selectedMaterial.features.map((feature) => <p key={feature} className="border-l border-gold-300/60 pl-3 text-sm text-stone-250">{feature}</p>)}
                </div>
                <div className="mt-7 flex gap-2">
                  {selectedMaterial.images.map((image, index) => <button key={`${image}-${index}`} type="button" onClick={() => setActiveImage(index)} aria-label={`Ver imagem ${index + 1}`} className={`h-1.5 rounded-full transition-all ${activeImage === index ? 'w-8 bg-gold-300' : 'w-2 bg-white/20'}`} />)}
                </div>
                <a href="#contato" onClick={closeModal} className="btn-gold mt-8 w-full sm:w-auto">Solicitar orçamento <ArrowRight size={16} /></a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
