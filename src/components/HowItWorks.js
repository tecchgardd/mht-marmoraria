import { Camera, ClipboardList, Factory, Home, Ruler, Wrench } from 'lucide-react';

const STEPS = [
  { icon: ClipboardList, title: 'Solicite um\norçamento' },
  { icon: Home, title: 'Visita\ntécnica' },
  { icon: Ruler, title: 'Medição\ndigital' },
  { icon: Factory, title: 'Fabricação\nprecisa' },
  { icon: Wrench, title: 'Instalação\nespecializada' },
  { icon: Camera, title: 'Entrega\nfinal' },
];

export default function HowItWorks() {
  return (
    <section className="bg-[#050505] py-16 md:py-20">
      <div className="container-px">
        <h2 className="text-center font-display text-2xl font-semibold uppercase text-stone-150 md:text-3xl">
          Como funciona
        </h2>

        <div className="mt-12 grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6 lg:gap-4">
          {STEPS.map(({ icon: Icon, title }, index) => (
            <article key={title} className="relative text-center">
              {index < STEPS.length - 1 && (
                <span className="absolute left-[62%] top-8 hidden h-px w-[76%] border-t border-dashed border-white/35 lg:block" />
              )}
              <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-gold-400/80 bg-[#080808] text-gold-300">
                <Icon size={25} strokeWidth={1.7} />
              </div>
              <p className="mt-4 font-display text-sm font-semibold uppercase leading-tight text-gold-300">0{index + 1}</p>
              <h3 className="mt-1 whitespace-pre-line font-display text-sm uppercase leading-tight text-stone-150">{title}</h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
