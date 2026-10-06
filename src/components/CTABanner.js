import { ArrowRight } from 'lucide-react';

export default function CTABanner() {
  return (
    <section className="bg-ink-950 py-20">
      <div className="container-px">
        <div className="border border-gold-400/30 bg-[linear-gradient(135deg,#15130f,#0a0908)] px-6 py-12 md:px-12 md:py-14 text-center">
          <p className="section-eyebrow">Pronto para começar?</p>
          <h2 className="mx-auto mt-3 max-w-3xl font-display text-2xl md:text-4xl uppercase leading-tight text-stone-150">
            Solicite um orçamento para seu projeto em mármore, granito ou quartzo.
          </h2>
          <div className="mt-8 flex justify-center">
            <a
              href="https://wa.me/5511999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold"
            >
              Falar com especialista <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
