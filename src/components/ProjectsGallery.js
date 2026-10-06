'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Images, X } from 'lucide-react';

const PROJECTS = [
  {
    label: 'Cozinhas',
    desc: 'Bancadas, ilhas e frontões planejados para unir resistência, precisão e acabamento premium.',
    images: [
      '/assets/cozinha/cozinha1.webp',
    ],
  },
  {
    label: 'Banheiros',
    desc: 'Cubas esculpidas, nichos e bancadas sob medida para banheiros sofisticados e funcionais.',
    images: [
      '/assets/banheiro/banheiro1.webp',
    ],
  },
  {
    label: 'Áreas Gourmet',
    desc: 'Superfícies resistentes para churrasqueiras, balcões e espaços de convivência com presença marcante.',
    images: [
      '/assets/areagourmet/area1.webp',
    ],
  },
  {
    label: 'Escadas',
    desc: 'Degraus, patamares e revestimentos com cortes precisos para valorizar a arquitetura do ambiente.',
    images: [
      '/assets/escadas/escadas1.webp',
    ],
  },
  {
    label: 'Lareiras',
    desc: 'Revestimentos em pedra natural e superfícies nobres para compor ambientes acolhedores.',
    images: [
      '/assets/lareira/lareira1.webp',
    ],
  },
  {
    label: 'Fachadas',
    desc: 'Revestimentos externos com impacto visual, durabilidade e acabamento alinhado ao projeto.',
    images: [
      '/assets/fachada/fachada1.webp',
    ],
  },
];

export default function ProjectsGallery() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeImage, setActiveImage] = useState(0);

  const closeModal = () => {
    setSelectedProject(null);
    setActiveImage(0);
  };

  const moveImage = useCallback((direction) => {
    if (!selectedProject) return;
    setActiveImage((current) => (current + direction + selectedProject.images.length) % selectedProject.images.length);
  }, [selectedProject]);

  useEffect(() => {
    if (!selectedProject) return undefined;
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
  }, [moveImage, selectedProject]);

  return (
    <section id="projetos" className="bg-[#050505] py-14 md:py-16">
      <div className="container-px">
        <h2 className="text-center font-display text-3xl font-semibold uppercase text-stone-150 md:text-4xl">
          Projetos que <span className="text-gold-300">impressionam</span> nos detalhes
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {PROJECTS.map((project) => (
            <button
              key={project.label}
              type="button"
              onClick={() => {
                setSelectedProject(project);
                setActiveImage(0);
              }}
              className="group relative h-[260px] overflow-hidden rounded-lg border border-white/10 text-left transition duration-500 hover:-translate-y-1 hover:border-gold-400/50 hover:shadow-[0_24px_55px_rgba(0,0,0,0.45)] xl:h-[210px] 2xl:h-[240px]"
            >
              <Image
                src={project.images[0]}
                alt={project.label}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(min-width: 1280px) 16vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
              <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/55 text-stone-150 opacity-0 transition-opacity group-hover:opacity-100">
                <Images size={16} />
              </span>
              <span className="absolute bottom-4 left-0 right-0 text-center font-display text-base uppercase tracking-wide text-stone-150">
                {project.label}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <a href="#contato" className="btn-outline px-10 py-4">
            Ver todos os projetos <ArrowRight size={16} />
          </a>
        </div>
      </div>

      {selectedProject && (
        <div
          className="fixed inset-0 z-[1000] flex items-start justify-center overflow-y-auto bg-black/80 px-3 py-4 backdrop-blur-sm sm:px-4 sm:py-6 lg:items-center"
          role="dialog"
          aria-modal="true"
          aria-label={`Galeria de ${selectedProject.label}`}
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-5xl overflow-hidden rounded-lg border border-white/10 bg-ink-900 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button type="button" onClick={closeModal} aria-label="Fechar galeria" className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-ink-950/80 text-stone-150 shadow-lg transition hover:border-gold-300 hover:text-gold-300">
              <X size={18} />
            </button>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px]">
              <div className="relative h-[42vh] min-h-[220px] max-h-[420px] bg-ink-950 sm:min-h-[300px] lg:h-auto lg:max-h-none lg:min-h-[620px]">
                <Image
                  src={selectedProject.images[activeImage]}
                  alt={`${selectedProject.label} ${activeImage + 1}`}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 70vw, 100vw"
                  priority
                />
                <button type="button" onClick={() => moveImage(-1)} aria-label="Imagem anterior" className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-ink-950/75 text-stone-150 transition hover:bg-ink-800">
                  <ChevronLeft size={20} />
                </button>
                <button type="button" onClick={() => moveImage(1)} aria-label="Próxima imagem" className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-ink-950/75 text-stone-150 transition hover:bg-ink-800">
                  <ChevronRight size={20} />
                </button>
              </div>

              <div className="p-5 sm:p-6 lg:p-7 lg:pt-16">
                <button type="button" onClick={closeModal} aria-label="Fechar galeria" className="ml-auto hidden h-9 w-9 items-center justify-center rounded-full border border-white/10 text-stone-150 transition hover:border-gold-300 hover:text-gold-300">
                  <X size={18} />
                </button>
                <p className="font-display text-xs uppercase tracking-widest text-gold-300">Projeto em destaque</p>
                <h3 className="mt-3 font-display text-2xl uppercase text-stone-150">{selectedProject.label}</h3>
                <p className="mt-4 text-sm leading-relaxed text-stone-250">{selectedProject.desc}</p>
                <div className="mt-7 flex gap-2">
                  {selectedProject.images.map((image, index) => (
                    <button key={`${image}-${index}`} type="button" onClick={() => setActiveImage(index)} aria-label={`Ver imagem ${index + 1}`} className={`h-1.5 rounded-full transition-all ${activeImage === index ? 'w-8 bg-gold-300' : 'w-2 bg-white/20'}`} />
                  ))}
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
