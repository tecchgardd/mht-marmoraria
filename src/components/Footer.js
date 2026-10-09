import Image from 'next/image';
import { ArrowUp, ArrowUpRight, Clock, Facebook, Instagram, Linkedin, Mail, MapPin, Music2, Phone, Youtube } from 'lucide-react';
import WhatsAppIcon from '@/components/WhatsAppIcon';
import { formatAddress, whatsappUrl } from '@/lib/company/profile';
import QuoteButton from '@/components/quote/QuoteButton';

const QUICK_LINKS = [
  ['Início', '#inicio'],
  ['Sobre nós', '#sobre'],
  ['Materiais', '#materiais'],
  ['Cases', '#projetos'],
  ['Diferenciais', '#diferenciais'],
  ['Contato', '#contato'],
];

const SOCIAL_ICONS = [
  { key: 'instagram', icon: Instagram, label: 'Instagram' },
  { key: 'facebook', icon: Facebook, label: 'Facebook' },
  { key: 'youtube', icon: Youtube, label: 'YouTube' },
  { key: 'tiktok', icon: Music2, label: 'TikTok' },
  { key: 'linkedin', icon: Linkedin, label: 'LinkedIn' },
];

export default function Footer({ company }) {
  const whatsapp = whatsappUrl(company);
  const address = formatAddress(company);
  const socials = SOCIAL_ICONS.filter(({ key }) => company.socials[key]);
  const contacts = [
    company.phone && { icon: Phone, label: 'Telefone', value: company.phone, href: `tel:${company.phone.replace(/[^\d+]/g, '')}` },
    company.whatsapp && { icon: WhatsAppIcon, label: 'WhatsApp', value: company.whatsapp, href: whatsapp },
    company.email && { icon: Mail, label: 'E-mail', value: company.email, href: `mailto:${company.email}` },
  ].filter(Boolean);
  const hours = [company.hoursWeekdays, company.hoursSaturday].filter(Boolean);

  return (
    <footer id="contato" className="relative overflow-hidden bg-[#050505] text-white">
      {/* Chamada final */}
      <section className="container-px relative pt-16 md:pt-24">
        <div className="relative overflow-hidden rounded-[32px] border border-white/10">
          <Image src="/assets/bg2.webp" alt="" fill sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/95 via-[#050505]/80 to-[#050505]/40" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-gold-400/20 blur-3xl" />

          <div className="relative flex flex-col gap-10 px-6 py-12 sm:px-10 md:py-16 lg:flex-row lg:items-center lg:justify-between lg:px-14">
            <div className="max-w-2xl">
              <p className="section-eyebrow">Vamos conversar</p>
              <h2 className="mt-3 font-display text-4xl font-semibold uppercase leading-[1.05] text-white md:text-5xl">
                Seu projeto merece um
                <br />
                acabamento <span className="bg-gradient-to-r from-gold-200 to-gold-400 bg-clip-text text-transparent">à altura</span>
              </h2>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-white/70">
                Conte sua ideia e receba uma proposta sem compromisso, com visita técnica e medição.
              </p>
            </div>

            <div className="glass flex w-full flex-col gap-3 rounded-3xl p-4 sm:w-auto sm:min-w-[320px]">
              <QuoteButton className="btn-gold w-full py-4">
                <WhatsAppIcon size={17} className="shrink-0" />
                Pedir orçamento
              </QuoteButton>
              <a href="/assistente-ia" className="btn-outline w-full py-4">
                Criar meu ambiente com IA
              </a>
              <p className="px-2 pt-1 text-center text-xs text-white/50">Três perguntas rápidas e seguimos pelo WhatsApp</p>
            </div>
          </div>
        </div>
      </section>

      {/* Conteúdo */}
      <section className="container-px relative">
        <div className="grid grid-cols-1 gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.3fr_0.7fr_1fr_1.1fr]">
          <div>
            <Image src="/assets/logo/mht-logo-creme-ouro.webp" alt={company.name} width={1200} height={670} className="h-16 w-auto" />
            {company.description && <p className="mt-6 max-w-sm text-sm leading-7 text-white/60">{company.description}</p>}
            {socials.length > 0 && (
              <div className="mt-6 flex gap-2.5">
                {socials.map(({ key, icon: Icon, label }) => (
                  <a
                    key={key}
                    href={company.socials[key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${company.name} no ${label}`}
                    className="glass flex h-10 w-10 items-center justify-center rounded-full text-gold-300 transition hover:-translate-y-0.5 hover:text-gold-100"
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            )}
          </div>

          <nav aria-label="Links rápidos">
            <h3 className="font-display text-xs uppercase tracking-widest2 text-gold-300">Navegação</h3>
            <ul className="mt-6 grid grid-cols-2 gap-3 text-sm md:grid-cols-1">
              {QUICK_LINKS.map(([label, href]) => (
                <li key={href}>
                  <a href={href} className="group inline-flex items-center gap-2 text-white/65 transition hover:text-white">
                    <span className="h-px w-3 bg-gold-400/50 transition-all group-hover:w-5 group-hover:bg-gold-300" />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="font-display text-xs uppercase tracking-widest2 text-gold-300">Atendimento</h3>
            <ul className="mt-6 space-y-3">
              {contacts.map(({ icon: Icon, label, value, href }) => {
                const content = (
                  <>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gold-400/25 bg-gold-400/[0.08] text-gold-300">
                      <Icon size={16} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[11px] uppercase tracking-wide text-white/40">{label}</span>
                      <span className="block truncate text-sm text-white/80">{value}</span>
                    </span>
                  </>
                );
                return (
                  <li key={label}>
                    {href ? (
                      <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="flex items-center gap-3 transition hover:opacity-80">
                        {content}
                      </a>
                    ) : (
                      <div className="flex items-center gap-3">{content}</div>
                    )}
                  </li>
                );
              })}
              {hours.length > 0 && (
                <li className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gold-400/25 bg-gold-400/[0.08] text-gold-300">
                    <Clock size={16} />
                  </span>
                  <span className="text-sm leading-6 text-white/80">
                    {hours.map((line) => (
                      <span key={line} className="block">{line}</span>
                    ))}
                  </span>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-xs uppercase tracking-widest2 text-gold-300">Onde estamos</h3>
            <div className="glass mt-6 overflow-hidden rounded-3xl">
              <iframe
                title={`Localização da ${company.name}`}
                src={`https://www.google.com/maps?q=${encodeURIComponent(address.query)}&output=embed`}
                className="h-40 w-full border-0 opacity-80 grayscale invert"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.query)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start justify-between gap-3 p-4 transition hover:bg-white/[0.03]"
              >
                <span className="flex gap-3 text-sm leading-6 text-white/75">
                  <MapPin size={16} className="mt-1 shrink-0 text-gold-300" />
                  <span>
                    {address.line1}
                    <br />
                    {[address.line2, address.zip].filter(Boolean).join(' · ')}
                  </span>
                </span>
                <ArrowUpRight size={16} className="mt-1 shrink-0 text-gold-300 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="relative border-t border-white/10 bg-[#050505]">
        <div className="container-px flex flex-col gap-4 py-6 text-sm text-white/45 lg:flex-row lg:items-center lg:justify-between">
          <p>© {new Date().getFullYear()} {company.name}. Todos os direitos reservados.</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 whitespace-nowrap">
            <a href="#inicio" className="transition hover:text-gold-300">Política de Privacidade</a>
            <a href="#inicio" className="transition hover:text-gold-300">Termos de Uso</a>
            <a href="#inicio" aria-label="Voltar ao topo" className="glass flex h-10 w-10 items-center justify-center rounded-full text-gold-300 transition hover:-translate-y-0.5">
              <ArrowUp size={16} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
