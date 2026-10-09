'use client';

import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Play, X } from 'lucide-react';
import GlassCarousel from '@/components/GlassCarousel';
import Media from '@/components/Media';
import QuoteButton from '@/components/quote/QuoteButton';

function mediaSummary(media) {
  const videos = media.filter((item) => item.type === 'video').length;
  const photos = media.length - videos;
  return [photos && `${photos} ${photos === 1 ? 'foto' : 'fotos'}`, videos && `${videos} ${videos === 1 ? 'vídeo' : 'vídeos'}`]
    .filter(Boolean)
    .join(' · ');
}

export default function ProjectsGallery({ projects = [] }) {
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeMedia, setActiveMedia] = useState(0);

  const closeModal = () => {
    setSelectedProject(null);
    setActiveMedia(0);
  };

  const moveMedia = useCallback((direction) => {
    if (!selectedProject) return;
    setActiveMedia((current) => (current + direction + selectedProject.images.length) % selectedProject.images.length);
  }, [selectedProject]);

  useEffect(() => {
    if (!selectedProject) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') closeModal();
      if (event.key === 'ArrowLeft') moveMedia(-1);
      if (event.key === 'ArrowRight') moveMedia(1);
    };
    window.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [moveMedia, selectedProject]);

  if (!projects.length) return null;

  const current = selectedProject?.images[activeMedia];

  return (
    <section id="projetos" className="relative overflow-hidden bg-[#050505] py-16 md:py-24">
      <div className="container-px">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="section-eyebrow">Cases de sucesso</p>
            <h2 className="mt-3 font-display text-3xl font-semibold uppercase text-stone-150 md:text-4xl">
              Projetos que <span className="text-gold-300">impressionam</span> nos detalhes
            </h2>
            <p className="mt-3 text-base leading-relaxed text-stone-250">
              Obras reais executadas pela MHT, do corte à instalação. Arraste para navegar e toque no projeto em destaque para ver todas as fotos e vídeos.
            </p>
          </div>
          <QuoteButton className="btn-outline px-8 py-3.5">
            Quero um projeto assim <ArrowRight size={16} />
          </QuoteButton>
        </div>

        <div className="mt-6">
          <GlassCarousel
            label="Cases de sucesso"
            items={projects.map((project) => ({
              id: project.id,
              title: project.label,
              eyebrow: project.category || 'Case de sucesso',
              desc: project.desc,
              images: project.images,
            }))}
            onOpen={(index) => {
              setSelectedProject(projects[index]);
              setActiveMedia(0);
            }}
          />
        </div>
      </div>

      {selectedProject && current && typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[1000] flex items-start justify-center overflow-y-auto bg-black/85 px-3 py-4 backdrop-blur-sm sm:px-4 sm:py-6 lg:items-center"
            role="dialog"
            aria-modal="true"
            aria-label={`Galeria de ${selectedProject.label}`}
            onClick={closeModal}
          >
            <div className="relative w-full max-w-6xl overflow-hidden rounded-2xl border border-white/10 bg-ink-900 shadow-2xl" onClick={(event) => event.stopPropagation()}>
              <button type="button" onClick={closeModal} aria-label="Fechar galeria" className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-ink-950/80 text-stone-150 shadow-lg transition hover:border-gold-300 hover:text-gold-300">
                <X size={18} />
              </button>
  
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px]">
                <div className="flex flex-col bg-black">
                  <div className="relative h-[46vh] min-h-[260px] sm:min-h-[340px] lg:h-[560px]">
                    <Media
                      key={current.url}
                      media={current}
                      alt={`${selectedProject.label} ${activeMedia + 1}`}
                      sizes="(min-width: 1024px) 70vw, 100vw"
                      className="object-contain"
                      videoMode="player"
                      priority
                    />
                    {selectedProject.images.length > 1 && (
                      <>
                        <button type="button" onClick={() => moveMedia(-1)} aria-label="Anterior" className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-ink-950/75 text-stone-150 transition hover:bg-ink-800">
                          <ChevronLeft size={20} />
                        </button>
                        <button type="button" onClick={() => moveMedia(1)} aria-label="Próximo" className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-ink-950/75 text-stone-150 transition hover:bg-ink-800">
                          <ChevronRight size={20} />
                        </button>
                      </>
                    )}
                  </div>
  
                  {selectedProject.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto border-t border-white/10 bg-ink-950 p-3">
                      {selectedProject.images.map((item, index) => (
                        <button
                          key={`${item.url}-${index}`}
                          type="button"
                          onClick={() => setActiveMedia(index)}
                          aria-label={`Ver ${item.type === 'video' ? 'vídeo' : 'foto'} ${index + 1}`}
                          className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-md border-2 transition ${
                            activeMedia === index ? 'border-gold-400' : 'border-transparent opacity-60 hover:opacity-100'
                          }`}
                        >
                          <Media media={item} alt="" sizes="80px" videoMode="still" />
                          {item.type === 'video' && (
                            <span className="absolute inset-0 flex items-center justify-center bg-black/30 text-white">
                              <Play size={14} fill="currentColor" />
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
  
                <div className="flex flex-col p-6 lg:p-8 lg:pt-16">
                  <p className="font-display text-xs uppercase tracking-widest2 text-gold-300">{selectedProject.category || 'Case de sucesso'}</p>
                  <h3 className="mt-3 font-display text-2xl uppercase leading-tight text-stone-150">{selectedProject.label}</h3>
                  {selectedProject.desc && <p className="mt-4 text-sm leading-relaxed text-stone-150/85">{selectedProject.desc}</p>}
                  {selectedProject.details && <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-stone-250">{selectedProject.details}</p>}
                  <p className="mt-5 text-xs text-stone-250">{mediaSummary(selectedProject.images)}</p>
                  <QuoteButton topic={selectedProject.label} onClick={closeModal} className="btn-gold mt-8 w-full lg:mt-auto">
                    Solicitar orçamento <ArrowRight size={16} />
                  </QuoteButton>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </section>
  );
}
