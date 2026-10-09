import { ArrowUpRight } from 'lucide-react';
import Media from '@/components/Media';
import WhatsAppIcon from '@/components/WhatsAppIcon';
import QuoteButton from '@/components/quote/QuoteButton';

export default function Services({ services = [] }) {
  if (!services.length) return null;

  return (
    <section id="servicos" className="relative overflow-hidden bg-[#050505] py-16 md:py-24">
      <div className="pointer-events-none absolute -right-40 top-10 h-96 w-96 rounded-full bg-gold-400/[0.06] blur-3xl" aria-hidden="true" />
      <div className="container-px relative">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="section-eyebrow">O que fazemos</p>
            <h2 className="mt-3 font-display text-3xl font-semibold uppercase text-stone-150 md:text-4xl">
              Serviços sob <span className="text-gold-300">medida</span>
            </h2>
            <p className="mt-3 text-base leading-relaxed text-stone-250">
              Do projeto à instalação, com equipe própria e acabamento de alto padrão.
            </p>
          </div>
          <QuoteButton className="btn-outline px-8 py-3.5">
            <WhatsAppIcon size={16} className="shrink-0" />
            Falar sobre meu projeto
          </QuoteButton>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <article
              key={service.id}
              className="gold-ring group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(160deg,#14120f,#0a0908)] shadow-[0_24px_60px_rgba(0,0,0,0.35)] transition duration-500 hover:-translate-y-1.5"
            >
              <div className="relative h-56 overflow-hidden">
                <div className="absolute inset-0 transition-transform duration-[1200ms] ease-out group-hover:scale-110">
                  <Media media={service.images[0]} alt={service.name} sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f0e0c] via-transparent to-black/20" />
                <span className="glass absolute left-4 top-4 rounded-full px-3 py-1 font-display text-xs tracking-widest2 text-gold-200">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>

              <div className="relative flex flex-1 flex-col px-6 pb-6">
                <h3 className="font-display text-xl uppercase tracking-wide text-stone-150">{service.name}</h3>
                {service.desc && <p className="mt-3 text-sm leading-relaxed text-stone-150/80">{service.desc}</p>}
                {service.details && <p className="mt-3 line-clamp-4 whitespace-pre-line text-sm leading-relaxed text-stone-250">{service.details}</p>}
                <div className="mt-auto pt-6">
                  <QuoteButton
                    topic={service.name}
                    className="flex w-full items-center justify-between border-t border-white/10 pt-4 font-display text-xs uppercase tracking-widest2 text-gold-300 transition hover:text-gold-200"
                  >
                    Solicitar orçamento
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gold-400/40 transition group-hover:bg-gold-400 group-hover:text-ink-950">
                      <ArrowUpRight size={15} />
                    </span>
                  </QuoteButton>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
