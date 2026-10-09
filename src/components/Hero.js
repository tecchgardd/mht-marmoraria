import { ArrowRight, ArrowUpRight, ChevronDown, Hammer, MapPin, Sparkles, Star, Wrench } from 'lucide-react';
import HeroBackground from '@/components/HeroBackground';
import Media from '@/components/Media';
import QuoteButton from '@/components/quote/QuoteButton';

const FEATURES = [
  { icon: Hammer, label: 'Fabricação\nprópria' },
  { icon: Wrench, label: 'Instalação\nespecializada' },
  { icon: MapPin, label: 'Atendimento\nem toda região' },
];

export default function Hero({ media = [], featured, projects }) {
  return (
    <section id="inicio" className="relative flex min-h-[100svh] items-center overflow-hidden pt-20">
      <HeroBackground media={media} />

      <div className="container-px relative w-full py-16 md:py-20">
        <div className="grid grid-cols-[minmax(0,1fr)] items-end gap-12 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="max-w-2xl">
            <p className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs uppercase tracking-widest2 text-gold-100">
              <Sparkles size={13} className="text-gold-300" />
              Marmoraria de alto padrão
            </p>

            <h1 className="mt-6 break-words font-display text-[2.6rem] font-bold uppercase leading-[1.02] text-stone-150 min-[400px]:text-5xl sm:text-6xl md:text-[4.35rem] lg:text-[5.2rem]">
              Transformamos
              <br />
              pedra em
              <br />
              <span className="bg-gradient-to-r from-gold-200 via-gold-300 to-gold-500 bg-clip-text text-transparent">exclusividade</span>
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-8 text-stone-150/85 md:text-xl">
              Mármores, granitos e quartzitos para projetos residenciais e comerciais de alto padrão.
            </p>

            <div className="mt-9 flex flex-wrap gap-x-9 gap-y-4">
              {FEATURES.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gold-400/40 bg-black/30 text-gold-300 backdrop-blur">
                    <Icon size={18} />
                  </span>
                  <span className="whitespace-pre-line text-xs uppercase leading-tight tracking-wide text-stone-150">{label}</span>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap gap-4">
              <a href="/assistente-ia" className="btn-gold px-9 py-4">
                Criar meu ambiente com IA
              </a>
              <QuoteButton className="btn-outline bg-black/20 px-9 py-4 backdrop-blur">
                Pedir orçamento <ArrowRight size={17} />
              </QuoteButton>
            </div>
          </div>

          {featured && (
            <a href="#projetos" className="gold-ring glass group hidden overflow-hidden rounded-3xl p-3 lg:block">
              <div className="relative h-52 overflow-hidden rounded-2xl">
                <div className="absolute inset-0 transition-transform duration-[1200ms] group-hover:scale-110">
                  <Media media={featured.image} alt={featured.title} sizes="340px" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <span className="glass absolute left-3 top-3 rounded-full px-3 py-1 text-[11px] uppercase tracking-wide text-stone-150">
                  Case em destaque
                </span>
              </div>
              <div className="flex items-end justify-between gap-3 px-2 pb-1 pt-4">
                <div className="min-w-0">
                  <p className="font-display text-[11px] uppercase tracking-widest2 text-gold-300">{featured.eyebrow}</p>
                  <p className="mt-1 truncate font-display text-lg uppercase text-stone-150">{featured.title}</p>
                </div>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold-400/40 text-gold-200 transition group-hover:bg-gold-400 group-hover:text-ink-950">
                  <ArrowUpRight size={16} />
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-white/10 px-2 pt-3 text-xs text-stone-250">
                <span className="flex items-center gap-1.5">
                  <Star size={13} className="text-gold-300" fill="currentColor" strokeWidth={0} />
                  5.0 no Google
                </span>
                {projects && <span>+{projects} projetos entregues</span>}
              </div>
            </a>
          )}
        </div>
      </div>

      <a href="#sobre" aria-label="Rolar para baixo" className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[11px] uppercase tracking-widest2 text-stone-250 transition hover:text-gold-300 md:flex">
        Role
        <ChevronDown size={16} className="animate-bounce" />
      </a>
    </section>
  );
}
