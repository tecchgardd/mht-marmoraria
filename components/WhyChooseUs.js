'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight, Star } from 'lucide-react';

const REASONS = [
  'Corte computadorizado de alta precisão',
  'Equipe própria e altamente qualificada',
  'Materiais de primeira linha',
  'Garantia em todos os serviços',
  'Prazos cumpridos e agilidade',
  'Projetos personalizados sob medida',
  'Atendimento consultivo e humanizado',
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

export default function WhyChooseUs() {
  const [active, setActive] = useState(0);

  const moveTestimonial = (direction) => {
    setActive((current) => (current + direction + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % TESTIMONIALS.length);
    }, 4200);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section id="diferenciais" className="bg-ink-900 py-20 border-y border-white/5">
      <div className="container-px grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <h2 className="font-display font-semibold uppercase text-2xl md:text-3xl leading-tight text-stone-150">
            Por que escolher
            <br />
            nossa <span className="text-gold-300">marmoraria</span>?
          </h2>

          <ul className="mt-8 space-y-4">
            {REASONS.map((reason) => (
              <li key={reason} className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-gold-300 mt-0.5 shrink-0" />
                <span className="text-sm text-stone-250">{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-display font-semibold uppercase text-2xl md:text-3xl text-stone-150">
            Avaliações do <span className="text-gold-300">Google</span>
          </h2>

          <div className="mt-8 overflow-hidden rounded-sm border border-white/5 bg-ink-800">
            <div className="border-b border-white/5 px-5 py-4 sm:px-6 flex items-center justify-between gap-4">
              <div>
                <p className="font-display text-sm uppercase tracking-wide text-stone-150">
                  Google Reviews
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-sm font-semibold text-gold-300">5.0</span>
                  <div className="flex gap-0.5 text-gold-300">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star key={idx} size={14} fill="currentColor" strokeWidth={0} />
                    ))}
                  </div>
                </div>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-150 text-lg font-semibold text-ink-950">
                G
              </span>
            </div>

            <div className="px-5 py-7 sm:px-6">
              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-700 ease-out"
                  style={{ transform: `translateX(-${active * 100}%)` }}
                >
                  {TESTIMONIALS.map((testimonial) => (
                    <article
                      key={testimonial.name}
                      className="flex min-h-[190px] w-full shrink-0 flex-col justify-between pr-1"
                    >
                      <div>
                        <div className="flex gap-1 text-gold-300">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <Star key={idx} size={16} fill="currentColor" strokeWidth={0} />
                          ))}
                        </div>
                        <p className="mt-5 text-base leading-relaxed text-stone-150">
                          &ldquo;{testimonial.text}&rdquo;
                        </p>
                      </div>
                      <div className="mt-7">
                        <p className="text-sm font-display uppercase tracking-wide text-stone-150">
                          {testimonial.name}
                        </p>
                        <p className="mt-1 text-xs text-stone-250">{testimonial.role}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <div className="mt-7 flex items-center justify-between gap-4">
                <div className="flex gap-2">
                  {TESTIMONIALS.map((item, index) => (
                    <button
                      key={item.name}
                      type="button"
                      aria-label={`Ver avaliação ${index + 1}`}
                      onClick={() => setActive(index)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        active === index ? 'w-8 bg-gold-300' : 'w-2 bg-white/20'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    aria-label="Avaliação anterior"
                    onClick={() => moveTestimonial(-1)}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-stone-150 transition hover:border-gold-300 hover:text-gold-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    aria-label="Próxima avaliação"
                    onClick={() => moveTestimonial(1)}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-stone-150 transition hover:border-gold-300 hover:text-gold-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
