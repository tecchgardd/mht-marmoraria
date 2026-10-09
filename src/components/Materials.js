'use client';

import Media from '@/components/Media';
import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Gem, Layers3, Mountain, Sparkles, X } from 'lucide-react';
import QuoteButton from '@/components/quote/QuoteButton';

function materialIcon(name) {
  const normalized = name.toLowerCase();
  if (normalized.includes('quartzo')) return Gem;
  if (normalized.includes('mármore') || normalized.includes('marmore')) return Sparkles;
  if (normalized.includes('granito')) return Mountain;
  return Layers3;
}

export default function Materials({ materials = [] }) {
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

  if (!materials.length) return null;

  return (
    <section id="materiais" className="relative overflow-hidden border-y border-white/5 bg-[#050505] py-16 md:py-24">
      <div className="pointer-events-none absolute -left-40 top-1/3 h-96 w-96 rounded-full bg-gold-400/[0.06] blur-3xl" aria-hidden="true" />
      <div className="container-px relative">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="section-eyebrow">Nossos materiais</p>
            <h2 className="mt-3 font-display text-3xl font-semibold uppercase text-stone-150 md:text-4xl">
              A pedra certa para <span className="text-gold-300">cada projeto</span>
            </h2>
            <p className="mt-3 text-base leading-relaxed text-stone-250">
              Trabalhamos com pedras naturais e superfícies industrializadas selecionadas. Toque em um material para ver detalhes.
            </p>
            <p className="mt-2 text-xs uppercase tracking-widest2 text-gold-300/80 sm:hidden">Deslize para ver todos →</p>
          </div>
        </div>

        <div className="-mx-6 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-6 px-6 pb-4 [scrollbar-width:none] sm:mx-0 sm:mt-12 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4 [&::-webkit-scrollbar]:hidden">
          {materials.map(({ id, name, desc, images, details, features }, index) => {
            const Icon = materialIcon(name);
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setSelectedMaterial({ name, desc, icon: Icon, images, details, features });
                  setActiveImage(0);
                }}
                className="gold-ring group relative h-[420px] w-[78vw] max-w-[320px] shrink-0 snap-start overflow-hidden rounded-3xl sm:h-[440px] sm:w-auto sm:max-w-none border border-white/10 bg-ink-900 text-left shadow-[0_24px_60px_rgba(0,0,0,0.35)] transition duration-500 hover:-translate-y-1.5"
              >
                <div className="absolute inset-0 transition-transform duration-[1200ms] ease-out group-hover:scale-110">
                  <Media media={images[0]} alt={name} sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10" />

                <span className="absolute left-5 top-5 font-display text-5xl leading-none text-outline-gold" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="glass absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full text-gold-200">
                  <Icon size={18} />
                </span>

                <div className="glass-strong absolute inset-x-3 bottom-3 rounded-2xl p-5 transition-all duration-500">
                  <h3 className="font-display text-xl uppercase tracking-wide text-stone-150">{name}</h3>
                  {desc && <p className="mt-2 text-sm leading-relaxed text-stone-150/70">{desc}</p>}
                  {features?.length > 0 && (
                    <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-out group-hover:grid-rows-[1fr] group-focus-visible:grid-rows-[1fr]">
                      <ul className="flex flex-wrap gap-1.5 overflow-hidden">
                        {features.slice(0, 3).map((feature) => (
                          <li key={feature} className="mt-3 rounded-full border border-gold-400/30 bg-gold-400/10 px-2.5 py-1 text-[11px] text-gold-100">
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <span className="mt-4 inline-flex items-center gap-2 font-display text-xs uppercase tracking-widest2 text-gold-300">
                    Ver detalhes <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selectedMaterial && typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-[1000] flex items-start justify-center overflow-y-auto bg-black/80 px-3 py-4 backdrop-blur-sm sm:px-4 sm:py-6 lg:items-center" role="dialog" aria-modal="true" aria-label={`Detalhes de ${selectedMaterial.name}`} onClick={closeModal}>
            <div className="relative w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-ink-900 shadow-2xl" onClick={(event) => event.stopPropagation()}>
              <button type="button" onClick={closeModal} aria-label="Fechar detalhes" className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-ink-950/80 text-stone-150 shadow-lg transition hover:border-gold-300 hover:text-gold-300"><X size={18} /></button>
              <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="relative h-[42vh] min-h-[220px] max-h-[420px] bg-ink-950 sm:min-h-[300px] lg:h-auto lg:max-h-none lg:min-h-[600px]">
                  <Media key={selectedMaterial.images[activeImage].url} media={selectedMaterial.images[activeImage]} alt={`${selectedMaterial.name} ${activeImage + 1}`} sizes="(min-width: 1024px) 62vw, 100vw" videoMode="player" priority />
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
                    {selectedMaterial.features?.map((feature) => <p key={feature} className="border-l border-gold-300/60 pl-3 text-sm text-stone-250">{feature}</p>)}
                  </div>
                  <div className="mt-7 flex gap-2">
                    {selectedMaterial.images.map((image, index) => <button key={`${image.url}-${index}`} type="button" onClick={() => setActiveImage(index)} aria-label={`Ver imagem ${index + 1}`} className={`h-1.5 rounded-full transition-all ${activeImage === index ? 'w-8 bg-gold-300' : 'w-2 bg-white/20'}`} />)}
                  </div>
                  <QuoteButton topic={selectedMaterial.name} onClick={closeModal} className="btn-gold mt-8 w-full sm:w-auto">Solicitar orçamento <ArrowRight size={16} /></QuoteButton>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </section>
  );
}
