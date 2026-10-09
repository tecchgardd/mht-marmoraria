import { ArrowRight, Globe2, Handshake, ShieldCheck } from 'lucide-react';
import Media from '@/components/Media';
import WhatsAppIcon from '@/components/WhatsAppIcon';
import QuoteButton from '@/components/quote/QuoteButton';

const HIGHLIGHTS = [
  { icon: Handshake, label: 'Atendimento personalizado' },
  { icon: Globe2, label: 'Materiais nacionais e importados' },
  { icon: ShieldCheck, label: 'Garantia em todos os serviços' },
];

export default function About({ company }) {
  const { about } = company;
  const paragraphs = about.text.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean);
  const stats = [
    { value: about.years, suffix: 'anos', label: 'de experiência' },
    { value: about.projects, suffix: '+', label: 'projetos entregues' },
    { value: about.clients, suffix: '+', label: 'clientes atendidos' },
  ].filter((stat) => stat.value);

  return (
    <section id="sobre" className="relative overflow-hidden bg-[#050505] py-16 md:py-24">
      <div className="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-gold-400/[0.07] blur-3xl" aria-hidden="true" />

      <div className="container-px relative grid grid-cols-[minmax(0,1fr)] items-center gap-12 md:grid-cols-[0.9fr_1.1fr] md:gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
        {/* Imagem */}
        <div className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[32px] border border-white/10 sm:aspect-[4/3] md:aspect-[4/5] lg:aspect-[5/6]">
            {about.image && <Media media={about.image} alt={`Projeto da ${company.name}`} sizes="(min-width: 1024px) 45vw, 100vw" />}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          </div>
          <div className="pointer-events-none absolute -inset-3 -z-10 rounded-[40px] border border-gold-400/20" aria-hidden="true" />

          {about.years && (
            <div className="glass absolute -bottom-6 right-4 rounded-3xl px-6 py-5 sm:right-8">
              <p className="font-display text-5xl leading-none text-gold-200">
                {about.years}
                <span className="ml-1 text-2xl text-gold-300">anos</span>
              </p>
              <p className="mt-1 text-xs uppercase tracking-widest2 text-stone-250">transformando pedra</p>
            </div>
          )}
        </div>

        {/* Texto */}
        <div className="pt-6 lg:pt-0">
          <p className="section-eyebrow">Sobre a {company.name}</p>
          <h2 className="mt-3 font-display text-3xl font-semibold uppercase leading-tight text-stone-150 md:text-5xl">
            {about.title || 'Criando ambientes únicos'}
          </h2>
          <div className="mt-6 space-y-4 text-base leading-relaxed text-stone-250 md:text-lg">
            {paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          {stats.length > 0 && (
            <dl className="mt-10 grid grid-cols-3 gap-4 border-y border-white/10 py-6">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="sr-only">{stat.label}</dt>
                  <dd className="font-display text-3xl text-stone-150 md:text-4xl">
                    {stat.suffix === '+' && <span className="text-gold-300">+</span>}
                    {stat.value}
                    {stat.suffix !== '+' && <span className="ml-1 text-lg text-gold-300">{stat.suffix}</span>}
                  </dd>
                  <dd className="mt-1 text-xs uppercase tracking-wide text-stone-250">{stat.label}</dd>
                </div>
              ))}
            </dl>
          )}

          <ul className="mt-6 flex flex-wrap gap-2">
            {HIGHLIGHTS.map(({ icon: Icon, label }) => (
              <li key={label} className="glass flex items-center gap-2 rounded-full px-4 py-2 text-sm text-stone-150/90">
                <Icon size={15} className="text-gold-300" />
                {label}
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-wrap gap-4">
            <QuoteButton className="btn-gold px-8 py-4">
              <WhatsAppIcon size={16} className="shrink-0" />
              Pedir orçamento
            </QuoteButton>
            <a href="#projetos" className="btn-outline px-8 py-4">
              Ver cases <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
