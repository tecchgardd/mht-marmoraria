'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Gem,
  HeartHandshake,
  Quote,
  Ruler,
  ScanLine,
  ShieldCheck,
  Star,
  UsersRound,
} from 'lucide-react';

const REASONS = [
  { icon: ScanLine, text: 'Corte computadorizado de alta precisão' },
  { icon: UsersRound, text: 'Equipe própria e altamente qualificada' },
  { icon: Gem, text: 'Materiais de primeira linha' },
  { icon: ShieldCheck, text: 'Garantia em todos os serviços' },
  { icon: Clock, text: 'Prazos cumpridos e agilidade' },
  { icon: Ruler, text: 'Projetos personalizados sob medida' },
  { icon: HeartHandshake, text: 'Atendimento consultivo e humanizado' },
];

const TESTIMONIALS = [
  {
    text: 'O acabamento é impecável e o atendimento foi excelente do início ao fim.',
    name: 'Carla A.',
    role: 'Arquiteta',
  },
  {
    text: 'Cumpriram o prazo e o resultado superou todas as expectativas.',
    name: 'Ricardo M.',
    role: 'Cliente',
  },
  {
    text: 'Profissionais competentes e materiais de altíssima qualidade.',
    name: 'Juliana P.',
    role: 'Cliente',
  },
];

const ROTATE_MS = 6000;

function Stars({ size = 14 }) {
  return (
    <div className="flex gap-0.5 text-gold-300" aria-label="5 de 5 estrelas">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star key={index} size={size} fill="currentColor" strokeWidth={0} />
      ))}
    </div>
  );
}

function initials(name) {
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2);
}

export default function WhyChooseUs() {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();

  const go = (step) => {
    setDirection(step);
    setActive((current) => (current + step + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  useEffect(() => {
    if (paused || reduceMotion) return undefined;
    const timer = window.setTimeout(() => go(1), ROTATE_MS);
    return () => window.clearTimeout(timer);
  }, [active, paused, reduceMotion]);

  const testimonial = TESTIMONIALS[active];

  return (
    <section id="diferenciais" className="relative overflow-hidden border-y border-white/5 bg-ink-900 py-16 md:py-24">
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-gold-400/40 to-transparent" aria-hidden="true" />
      <div className="container-px grid grid-cols-1 gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        {/* Diferenciais */}
        <div>
          <p className="section-eyebrow">Diferenciais</p>
          <h2 className="mt-3 font-display text-3xl font-semibold uppercase leading-tight text-stone-150 md:text-4xl">
            Por que escolher a <span className="text-gold-300">MHT</span>?
          </h2>
          <p className="mt-3 max-w-lg text-base leading-relaxed text-stone-250">
            Precisão de fábrica e cuidado artesanal em cada etapa, do primeiro contato à entrega.
          </p>

          <ul className="mt-8 grid grid-cols-2 gap-2.5 sm:gap-3">
            {REASONS.map(({ icon: Icon, text }, index) => (
              <li
                key={text}
                className={`gold-ring glass group flex flex-col items-start gap-3 rounded-2xl p-3.5 transition duration-300 hover:-translate-y-0.5 sm:flex-row sm:items-center sm:gap-4 sm:px-4 sm:py-4 ${
                  index === REASONS.length - 1 ? 'col-span-2' : ''
                }`}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gold-400/30 bg-gold-400/10 text-gold-300 transition group-hover:bg-gold-400 group-hover:text-ink-950">
                  <Icon size={18} strokeWidth={1.8} />
                </span>
                <span className="text-[13px] leading-snug text-stone-150/90 sm:text-sm">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Avaliações */}
        <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
          <p className="section-eyebrow">Avaliações</p>
          <h2 className="mt-3 font-display text-3xl font-semibold uppercase leading-tight text-stone-150 md:text-4xl">
            Quem fez, <span className="text-gold-300">recomenda</span>
          </h2>

          <div className="glass mt-8 flex items-center justify-between gap-4 rounded-2xl px-5 py-4">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-150 font-display text-xl text-ink-950">G</span>
              <div>
                <p className="text-xs uppercase tracking-widest2 text-stone-250">Google Reviews</p>
                <Stars />
              </div>
            </div>
            <p className="font-display text-4xl text-gold-200">
              5.0<span className="text-base text-stone-250">/5</span>
            </p>
          </div>

          <div className="glass relative mt-4 overflow-hidden rounded-3xl p-7 sm:p-8">
            <Quote size={64} className="pointer-events-none absolute -right-2 -top-2 rotate-180 text-gold-400/10" strokeWidth={1} aria-hidden="true" />

            <div className="relative min-h-[170px]" aria-live="polite">
              <AnimatePresence mode="wait" custom={direction} initial={false}>
                <motion.figure
                  key={testimonial.name}
                  custom={direction}
                  initial={{ opacity: 0, x: direction * 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction * -40 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Stars size={16} />
                  <blockquote className="mt-5 text-lg leading-relaxed text-stone-150 md:text-xl">&ldquo;{testimonial.text}&rdquo;</blockquote>
                  <figcaption className="mt-6 flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full border border-gold-400/50 bg-gradient-to-br from-gold-400/30 to-transparent font-display text-sm text-gold-100">
                      {initials(testimonial.name)}
                    </span>
                    <span>
                      <span className="block font-display text-sm uppercase tracking-wide text-stone-150">{testimonial.name}</span>
                      <span className="block text-xs text-stone-250">{testimonial.role}</span>
                    </span>
                  </figcaption>
                </motion.figure>
              </AnimatePresence>
            </div>

            <div className="mt-8 flex items-center justify-between gap-4 border-t border-white/10 pt-5">
              <div className="flex gap-2">
                {TESTIMONIALS.map((item, index) => (
                  <button
                    key={item.name}
                    type="button"
                    aria-label={`Ver avaliação de ${item.name}`}
                    aria-current={active === index}
                    onClick={() => {
                      setDirection(index > active ? 1 : -1);
                      setActive(index);
                    }}
                    className="relative h-1.5 w-10 overflow-hidden rounded-full bg-white/15"
                  >
                    {active === index && (
                      <motion.span
                        key={`${item.name}-${active}`}
                        className="absolute inset-y-0 left-0 rounded-full bg-gold-300"
                        initial={{ width: reduceMotion || paused ? '100%' : '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: reduceMotion || paused ? 0 : ROTATE_MS / 1000, ease: 'linear' }}
                      />
                    )}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button type="button" aria-label="Avaliação anterior" onClick={() => go(-1)} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-stone-150 transition hover:border-gold-300 hover:text-gold-300">
                  <ChevronLeft size={18} />
                </button>
                <button type="button" aria-label="Próxima avaliação" onClick={() => go(1)} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-stone-150 transition hover:border-gold-300 hover:text-gold-300">
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
