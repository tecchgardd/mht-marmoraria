'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ChevronLeft, ChevronRight, Images, Maximize2, Pause, Play } from 'lucide-react';
import Media from '@/components/Media';

const AUTOPLAY_MS = 6000;
const spring = { type: 'spring', stiffness: 170, damping: 26, mass: 0.9 };

function countMedia(media) {
  const videos = media.filter((item) => item.type === 'video').length;
  return { videos, photos: media.length - videos };
}

/**
 * 3D "glassy" carousel: the active card faces the viewer, neighbours tilt away in perspective.
 * items: [{ id, title, eyebrow, desc, images: [{ url, type }] }]
 */
export default function GlassCarousel({ items, onOpen, label }) {
  const total = items.length;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [width, setWidth] = useState(1200);
  const stageRef = useRef(null);
  const dragged = useRef(false);
  const reduceMotion = useReducedMotion();

  const go = useCallback((direction) => setActive((current) => (current + direction + total) % total), [total]);

  useEffect(() => {
    const node = stageRef.current;
    if (!node) return undefined;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (paused || hovering || reduceMotion || total < 2) return undefined;
    const timer = window.setTimeout(() => go(1), AUTOPLAY_MS);
    return () => window.clearTimeout(timer);
  }, [active, paused, hovering, reduceMotion, total, go]);

  if (!total) return null;

  const isMobile = width < 640;
  const cardWidth = Math.min(380, width * (isMobile ? 0.8 : 0.34));
  const spacing = isMobile ? cardWidth * 0.9 : cardWidth * 0.72;
  const maxVisible = isMobile ? 1 : 2;
  const current = items[active];
  const currentCount = countMedia(current.images);

  function offsetOf(index) {
    let offset = index - active;
    if (offset > total / 2) offset -= total;
    if (offset < -total / 2) offset += total;
    return offset;
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocus={() => setHovering(true)}
      onBlur={() => setHovering(false)}
    >
      {/* Brilho ambiente com a mídia ativa */}
      <div
        className="pointer-events-none absolute inset-x-0 -top-10 h-[620px] opacity-50"
        style={{ maskImage: 'radial-gradient(ellipse 45% 50% at 50% 50%, #000 30%, transparent 75%)', WebkitMaskImage: 'radial-gradient(ellipse 45% 50% at 50% 50%, #000 30%, transparent 75%)' }}
        aria-hidden="true"
      >
        <AnimatePresence mode="popLayout">
          <motion.div
            key={current.id}
            className="absolute left-1/2 top-0 h-full w-[60%] -translate-x-1/2 blur-[100px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <Media media={current.images[0]} alt="" sizes="50vw" videoMode="still" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Palco 3D */}
      <motion.div
        ref={stageRef}
        role="region"
        aria-roledescription="carrossel"
        aria-label={label}
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft') go(-1);
          if (event.key === 'ArrowRight') go(1);
        }}
        drag={total > 1 ? 'x' : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.12}
        onDragStart={() => {
          dragged.current = true;
        }}
        onDragEnd={(_, info) => {
          if (info.offset.x < -60 || info.velocity.x < -400) go(1);
          else if (info.offset.x > 60 || info.velocity.x > 400) go(-1);
          window.setTimeout(() => {
            dragged.current = false;
          }, 50);
        }}
        className="relative h-[540px] cursor-grab touch-pan-y select-none outline-none active:cursor-grabbing sm:h-[560px]"
        style={{ perspective: 1100 }}
      >
        {items.map((item, index) => {
          const offset = offsetOf(index);
          const distance = Math.abs(offset);
          const visible = distance <= maxVisible;
          const isActive = offset === 0;
          const count = countMedia(item.images);

          return (
            <motion.article
              key={item.id}
              aria-hidden={!isActive}
              className="absolute left-1/2 top-4 h-[500px] overflow-hidden rounded-[28px] border border-white/10 bg-ink-900 sm:h-[520px]"
              style={{ width: cardWidth, marginLeft: -cardWidth / 2, transformStyle: 'preserve-3d', zIndex: 20 - distance }}
              initial={false}
              animate={{
                x: offset * spacing,
                rotateY: Math.max(-55, Math.min(55, -offset * 40)),
                z: -distance * 180,
                scale: isActive ? 1 : 0.9,
                opacity: visible ? (isActive ? 1 : 0.9 - (distance - 1) * 0.35) : 0,
                filter: isActive ? 'blur(0px) brightness(1)' : `blur(${(distance - 1) * 1.5}px) brightness(${0.75 - (distance - 1) * 0.15})`,
              }}
              transition={reduceMotion ? { duration: 0 } : spring}
              onClick={() => {
                if (dragged.current || !visible) return;
                if (isActive) onOpen(index);
                else setActive(index);
              }}
            >
              <div className="pointer-events-none absolute inset-0">
                <Media
                  media={item.images[0]}
                  alt={item.title}
                  sizes="380px"
                  videoMode={isActive ? 'loop' : 'still'}
                  priority={index === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-black/30" />
              </div>

              {/* Topo do card */}
              <div className="absolute inset-x-4 top-4 flex items-center justify-between">
                <span className="glass flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] uppercase tracking-wide text-stone-150">
                  <Maximize2 size={12} />
                  Ver projeto
                </span>
                <span className="glass rounded-full px-3 py-1.5 font-display text-xs tracking-wide text-stone-150">
                  {index + 1}/{total}
                </span>
              </div>

              {/* Painel de vidro */}
              <div className="glass-strong absolute inset-x-3 bottom-3 rounded-2xl p-5">
                {item.eyebrow && <p className="font-display text-[11px] uppercase tracking-widest2 text-gold-300">{item.eyebrow}</p>}
                <h3 className="mt-1.5 font-display text-2xl uppercase leading-tight text-stone-150">{item.title}</h3>
                {item.desc && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-stone-150/70">{item.desc}</p>}
                <div className="mt-4 flex items-center gap-4 border-t border-white/10 pt-3 text-xs text-stone-250">
                  {count.photos > 0 && (
                    <span className="flex items-center gap-1.5">
                      <Images size={13} className="text-gold-300" />
                      {count.photos} {count.photos === 1 ? 'foto' : 'fotos'}
                    </span>
                  )}
                  {count.videos > 0 && (
                    <span className="flex items-center gap-1.5">
                      <Play size={12} className="text-gold-300" fill="currentColor" />
                      {count.videos} {count.videos === 1 ? 'vídeo' : 'vídeos'}
                    </span>
                  )}
                </div>
              </div>
            </motion.article>
          );
        })}
      </motion.div>

      {/* Barra de controle */}
      {total > 1 && (
        <div className="relative z-30 mt-2 flex justify-center">
          <div className="glass flex items-center gap-1.5 rounded-full p-1.5 pr-2">
            <button type="button" onClick={() => go(-1)} aria-label="Projeto anterior" className="flex h-10 w-10 items-center justify-center rounded-full text-stone-150 transition hover:bg-white/10">
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => setPaused((value) => !value)}
              aria-label={paused ? 'Retomar rotação automática' : 'Pausar rotação automática'}
              className="flex h-10 w-10 items-center justify-center rounded-full text-stone-150 transition hover:bg-white/10"
            >
              {paused ? <Play size={15} fill="currentColor" /> : <Pause size={15} fill="currentColor" />}
            </button>

            <button type="button" onClick={() => onOpen(active)} className="flex min-w-0 items-center gap-3 rounded-full bg-white/[0.04] py-1 pl-1 pr-4 text-left transition hover:bg-white/[0.08]">
              <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-gold-400/50">
                <Media media={current.images[0]} alt="" sizes="32px" videoMode="still" />
              </span>
              <span className="min-w-0">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={current.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="block max-w-[150px] truncate text-sm text-stone-150 sm:max-w-[220px]"
                  >
                    {current.title}
                  </motion.span>
                </AnimatePresence>
                <span className="block text-[11px] text-stone-250">
                  {[current.eyebrow, currentCount.videos ? 'com vídeo' : null].filter(Boolean).join(' · ') || 'Toque para ver'}
                </span>
              </span>
            </button>

            <button type="button" onClick={() => go(1)} aria-label="Próximo projeto" className="flex h-10 w-10 items-center justify-center rounded-full text-stone-150 transition hover:bg-white/10">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
