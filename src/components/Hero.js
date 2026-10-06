import Image from 'next/image';
import { ArrowRight, Hammer, MapPin, Wrench } from 'lucide-react';

const FEATURES = [
  { icon: Hammer, label: 'Fabricação\nprópria' },
  { icon: Wrench, label: 'Instalação\nespecializada' },
  { icon: MapPin, label: 'Atendimento\nem toda região' },
];

export default function Hero() {
  return (
    <section id="inicio" className="relative flex min-h-[92vh] items-center overflow-hidden pt-20">
      <div className="absolute inset-0">
        <Image
          src="/assets/bg1.webp"
          alt="Ambiente premium com bancada de mármore"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/70 to-[#050505]/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/40" />
      </div>

      <div className="container-px relative w-full py-16 md:py-20">
        <div className="max-w-2xl">
          <h1 className="font-display text-5xl font-bold uppercase leading-[1.04] text-stone-150 sm:text-6xl md:text-[4.35rem] lg:text-[5rem]">
            Transformamos
            <br />
            pedra em
            <br />
            <span className="text-gold-300">exclusividade</span>
          </h1>

          <p className="mt-7 max-w-xl text-lg leading-8 text-stone-150/90 md:text-xl">
            Mármores, granitos e quartzitos para projetos residenciais e comerciais de alto padrão.
          </p>

          <div className="mt-9 flex flex-wrap gap-x-9 gap-y-4">
            {FEATURES.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <Icon size={24} className="text-gold-300" />
                <span className="whitespace-pre-line text-sm uppercase leading-tight tracking-wide text-stone-150">
                  {label}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-5">
            <a href="/assistente-ia" className="btn-gold px-9 py-4">
              Criar meu ambiente com IA
            </a>
            <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer" className="btn-outline px-9 py-4">
              Falar com especialista <ArrowRight size={17} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
