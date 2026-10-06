import Image from 'next/image';
import { ClipboardCheck, Globe2, Handshake, UsersRound } from 'lucide-react';

const METRICS = [
  { icon: ClipboardCheck, value: '+500', label: 'Projetos\nentregues' },
  { icon: UsersRound, value: '+200', label: 'Clientes\nsatisfeitos' },
  { icon: Handshake, value: '', label: 'Atendimento\npersonalizado' },
  { icon: Globe2, value: '', label: 'Materiais nacionais e\nimportados' },
];

export default function StatsBar() {
  return (
    <section id="sobre" className="relative overflow-hidden border-y border-white/10 bg-[#050505] text-white">
      <Image
        src="/assets/bg3.webp"
        alt="Ambiente premium com pedra natural"
        fill
        className="object-cover opacity-100"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_50%,rgba(201,162,87,0.10),transparent_34%),linear-gradient(90deg,rgba(5,5,5,0.72),rgba(5,5,5,0.56),rgba(5,5,5,0.76))]" />

      <div className="container-px relative mx-auto grid min-h-[230px] items-center gap-8 py-10 lg:grid-cols-[30%_1px_1fr]">
        <div>
          <p className="font-display text-sm font-semibold uppercase tracking-[0.32em] text-[#C9A257]">
            Mais de 15 anos
          </p>
          <h2 className="mt-3 font-display text-2xl font-bold uppercase leading-tight text-white md:text-3xl">
            Criando ambientes únicos
          </h2>
          <p className="mt-4 max-w-md text-sm leading-6 text-white/65">
            Excelência em cada detalhe, do projeto à instalação. Qualidade que se vê e resistência que o tempo comprova.
          </p>
        </div>

        <div className="hidden h-36 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent lg:block" />

        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {METRICS.map(({ icon: Icon, value, label }) => (
            <div key={label} className="text-center">
              <Icon className="mx-auto text-[#C9A257]" size={34} strokeWidth={1.6} />
              {value && <p className="mt-4 font-display text-3xl font-bold text-[#C9A257]">{value}</p>}
              <p className={`${value ? 'mt-1' : 'mt-4'} whitespace-pre-line font-display text-sm font-semibold uppercase leading-tight text-white/80`}>
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
