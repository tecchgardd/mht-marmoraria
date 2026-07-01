import Image from 'next/image';
import { Clock, Facebook, Instagram, Mail, MapPin, Phone, Sparkles, Youtube } from 'lucide-react';
import LogoMHT from '@/components/LogoMHT';
import WhatsAppIcon from '@/components/WhatsAppIcon';

const QUICK_LINKS = [
  ['Início', '#inicio'],
  ['Sobre Nós', '#sobre'],
  ['Materiais', '#materiais'],
  ['Projetos', '#projetos'],
  ['Diferenciais', '#diferenciais'],
  ['Contato', '#contato'],
];

export default function Footer() {
  return (
    <footer id="contato" className="overflow-hidden bg-[#050505] text-white">
      <section className="relative border-y border-white/10">
        <Image
          src="/assets/bg2.webp"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/94 via-[#050505]/90 to-[#050505]/86" />

        <div className="container-px relative mx-auto flex flex-col gap-8 py-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex max-w-3xl flex-col gap-5 sm:flex-row sm:items-center">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-[#C9A257]/35 bg-[#C9A257] text-[#050505]">
              <Sparkles size={30} />
            </span>
            <div>
              <h2 className="font-display text-3xl font-semibold uppercase leading-tight text-white md:text-4xl">
                Seu projeto merece um
                <br />
                acabamento <span className="text-[#C9A257]">à altura.</span>
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/65">
                Solicite agora um orçamento sem compromisso e transforme seu ambiente.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-sm bg-[#C9A257] px-6 py-3.5 font-display text-sm uppercase tracking-wide text-[#050505] transition hover:bg-[#d9b26b]">
              <WhatsAppIcon size={16} className="shrink-0" />
              Chamar no WhatsApp
            </a>
            <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-sm border border-[#C9A257]/60 px-6 py-3.5 font-display text-sm uppercase tracking-wide text-white transition hover:border-[#C9A257] hover:bg-white/5">
              Solicitar orçamento
            </a>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#050505]">
        <div className="container-px mx-auto grid grid-cols-1 gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <LogoMHT />
            <p className="mt-5 text-sm leading-6 text-white/65">
              Excelência em mármores, granitos e quartzitos para projetos de alto padrão.
              Beleza, resistência e durabilidade que transformam ambientes.
            </p>
            <div className="mt-6 flex gap-3">
              {[Instagram, Facebook, Youtube, WhatsAppIcon].map((Icon, index) => (
                <a key={index} href="#inicio" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-[#C9A257] transition hover:border-[#C9A257]/70 hover:bg-[#C9A257]/10">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-white">Links rápidos</h3>
            <ul className="mt-5 grid grid-cols-2 gap-3 text-sm text-white/65 md:grid-cols-1">
              {QUICK_LINKS.map(([label, href]) => (
                <li key={href}><a href={href} className="transition hover:text-[#C9A257]">{label}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-white">Atendimento</h3>
            <ul className="mt-5 space-y-4 text-sm text-white/65">
              <li className="flex items-start gap-3"><Phone size={16} className="mt-0.5 shrink-0 text-[#C9A257]" />(11) 99999-9999</li>
              <li className="flex items-start gap-3"><WhatsAppIcon size={16} className="mt-0.5 shrink-0 text-[#C9A257]" />(11) 99999-9999</li>
              <li className="flex items-start gap-3"><Mail size={16} className="mt-0.5 shrink-0 text-[#C9A257]" />contato@marmorariamht.com.br</li>
              <li className="flex items-start gap-3"><Clock size={16} className="mt-0.5 shrink-0 text-[#C9A257]" /><span>Segunda a Sexta: 08h às 18h<br />Sábado: 08h às 12h</span></li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-white">Onde estamos</h3>
            <div className="mt-5 space-y-3 text-sm text-white/65">
              <p className="flex items-start gap-3">
                <MapPin size={16} className="mt-0.5 shrink-0 text-[#C9A257]" />
                Rua Trinta e Um de Julho, 184
              </p>
              <p>Caminho Novo, Palhoça/SC</p>
              <p>CEP 88132-380</p>
            </div>
            <div className="mt-5 overflow-hidden rounded-xl border border-white/10 bg-[#101010]">
              <iframe
                title="Localização da Marmoraria MHT"
                src="https://www.google.com/maps?q=Rua%20Trinta%20e%20Um%20de%20Julho%20184%20Caminho%20Novo%20Palho%C3%A7a%20SC%2088132-380&output=embed"
                className="h-36 w-full border-0 grayscale invert"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="bg-[#050505]">
        <div className="container-px mx-auto flex flex-col gap-4 py-6 text-sm text-white/50 md:flex-row md:items-center md:justify-between">
          <p>© 2024 MHT Marmoraria. Todos os direitos reservados.</p>
          <div className="flex gap-5">
            <a href="#inicio" className="transition hover:text-[#C9A257]">Política de Privacidade</a>
            <a href="#inicio" className="transition hover:text-[#C9A257]">Termos de Uso</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
