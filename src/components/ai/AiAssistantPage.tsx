'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import {
  ArrowLeft,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  History,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  SquarePen,
  UserRoundCheck,
  Wand2,
  X,
} from 'lucide-react';
import Modal from '@/components/portal/Modal';
import WhatsAppIcon from '@/components/WhatsAppIcon';
import type { Briefing, ProjectImage, ProjectVersion } from '@/lib/ai/types';

type ChatMessage = {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  version?: ProjectVersion;
};

const emptyBriefing: Briefing = {
  ambiente: '',
  estilo: '',
  pedra: '',
  coresMoveis: '',
  bancada: '',
  pia: '',
  iluminacao: '',
  medidasAproximadas: '',
  referencias: '',
  observacoes: '',
};

const BRIEFING_FIELDS: Array<[keyof Briefing, string]> = [
  ['ambiente', 'Ambiente'],
  ['pedra', 'Pedra'],
  ['estilo', 'Estilo'],
  ['coresMoveis', 'Cores dos móveis'],
  ['bancada', 'Bancada'],
  ['pia', 'Pia / cuba'],
  ['iluminacao', 'Iluminação'],
];

const imageLabels: Record<ProjectImage['type'], string> = {
  FRONT: 'Vista frontal',
  LEFT: 'Lateral esquerda',
  RIGHT: 'Lateral direita',
  TOP: 'Vista superior',
  COUNTERTOP_DETAIL: 'Detalhe da bancada',
  SINK_DETAIL: 'Detalhe da pia',
  FINISH_DETAIL: 'Close do acabamento',
};

const SUGGESTIONS = [
  { title: 'Cozinha com ilha', text: 'Cozinha moderna com ilha central em quartzo branco e armários pretos.' },
  { title: 'Banheiro premium', text: 'Banheiro com cuba esculpida em mármore claro e iluminação quente.' },
  { title: 'Área gourmet', text: 'Área gourmet com bancada em granito escuro e churrasqueira.' },
  { title: 'Escada em pedra', text: 'Escada revestida em mármore travertino com iluminação nos degraus.' },
];

const INTRO = 'Olá! Vou montar uma prévia do seu projeto. Qual ambiente você quer projetar: cozinha, banheiro, área gourmet ou escada?';

function createMessage(role: ChatMessage['role'], content: string, version?: ProjectVersion): ChatMessage {
  return { id: `${role}-${Date.now()}-${Math.random().toString(16).slice(2)}`, role, content, version };
}

// Fills gaps so a preview can be generated before the briefing is complete.
function completeBriefing(briefing: Briefing): Briefing {
  return {
    ambiente: briefing.ambiente || 'Cozinha',
    estilo: briefing.estilo || 'Moderno',
    pedra: briefing.pedra || 'Mármore branco',
    coresMoveis: briefing.coresMoveis || 'Armários em tons neutros',
    bancada: briefing.bancada || 'Bancada reta',
    pia: briefing.pia || 'Cuba embutida',
    iluminacao: briefing.iluminacao || 'LED quente',
    medidasAproximadas: briefing.medidasAproximadas || 'A confirmar',
    referencias: briefing.referencias || '',
    observacoes: briefing.observacoes || '',
  };
}

function AssistantAvatar() {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold-400/40 bg-[#14120f]">
      <Image src="/assets/logo/mht-monograma.webp" alt="" width={320} height={123} className="h-auto w-5" />
    </span>
  );
}

function PreviewGrid({ version, onOpen }: { version: ProjectVersion; onOpen: (images: ProjectImage[], index: number) => void }) {
  const images = version.imagesJson;
  return (
    <div className="mt-3">
      <p className="mb-2 text-xs uppercase tracking-widest2 text-gold-300">Versão {version.versionNumber}</p>
      <div className="grid grid-cols-3 gap-2">
        {images.map((image, index) => (
          <button
            key={image.id}
            type="button"
            onClick={() => onOpen(images, index)}
            className={`group relative overflow-hidden rounded-xl border border-white/10 bg-black ${index === 0 ? 'col-span-3 aspect-[16/9]' : 'aspect-[4/3]'}`}
          >
            <Image src={image.imageUrl} alt={imageLabels[image.type]} fill unoptimized className="object-cover transition duration-500 group-hover:scale-105" />
            <span className="absolute bottom-2 left-2 rounded-md bg-black/65 px-2 py-1 text-[11px] text-white backdrop-blur">{imageLabels[image.type]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function AiAssistantPage({ whatsappHref }: { whatsappHref: string }) {
  const [projectId, setProjectId] = useState<string>();
  const [briefing, setBriefing] = useState<Briefing>(emptyBriefing);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [versions, setVersions] = useState<ProjectVersion[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [briefingOpen, setBriefingOpen] = useState(false);
  const [specialistOpen, setSpecialistOpen] = useState(false);
  const [lightbox, setLightbox] = useState<{ images: ProjectImage[]; index: number } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const hasPreview = versions.length > 0;
  const busy = isLoading || isGenerating;
  const filled = BRIEFING_FIELDS.filter(([field]) => briefing[field]).length;
  const started = messages.length > 0;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  }, [input]);

  function addMessage(message: ChatMessage) {
    setMessages((current) => [...current, message]);
  }

  async function generatePreview(nextProjectId: string | undefined, nextBriefing: Briefing, userRequest: string) {
    setIsGenerating(true);
    const response = await fetch('/api/ai/generate-preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId: nextProjectId, briefing: nextBriefing, userRequest }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Não foi possível gerar as prévias.');

    setProjectId(data.projectId);
    setBriefing(nextBriefing);
    setVersions((current) => [...current, data.version]);
    addMessage(createMessage('assistant', 'Pronto! Aqui estão as prévias do seu ambiente. Peça ajustes quando quiser.', data.version));
  }

  async function send(text: string) {
    const message = text.trim();
    if (!message || busy) return;

    setInput('');
    if (!started) addMessage(createMessage('assistant', INTRO));
    addMessage(createMessage('user', message));
    setIsLoading(true);

    try {
      const endpoint = hasPreview && projectId ? `/api/projects/${projectId}/refine` : '/api/ai/chat';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hasPreview ? { message, briefing } : { projectId, message }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Não foi possível processar sua mensagem.');

      if (data.projectId) setProjectId(data.projectId);
      if (data.briefing) setBriefing(data.briefing);
      if (data.version) setVersions((current) => [...current, data.version]);
      addMessage(createMessage('assistant', data.response || 'Certo.', data.version));

      if (!hasPreview && data.readyToGenerate) {
        setIsLoading(false);
        await generatePreview(data.projectId || projectId, completeBriefing(data.briefing), message);
      }
    } catch (error) {
      addMessage(createMessage('assistant', error instanceof Error ? error.message : 'Não foi possível concluir agora. Tente novamente.'));
    } finally {
      setIsLoading(false);
      setIsGenerating(false);
    }
  }

  async function generateNow() {
    if (busy) return;
    try {
      await generatePreview(projectId, completeBriefing(briefing), 'Gerar prévia com o briefing atual.');
    } catch (error) {
      addMessage(createMessage('assistant', error instanceof Error ? error.message : 'Não foi possível gerar as prévias agora.'));
    } finally {
      setIsGenerating(false);
    }
  }

  function newProject() {
    setProjectId(undefined);
    setBriefing(emptyBriefing);
    setMessages([]);
    setVersions([]);
    setInput('');
    setMobileSidebar(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    send(input);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      send(input);
    }
  }

  const composer = (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="rounded-[26px] border border-white/10 bg-[#141210] p-2 pl-5 shadow-[0_10px_40px_rgba(0,0,0,0.35)] transition focus-within:border-gold-400/40">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder={hasPreview ? 'Peça um ajuste: troque a pedra, a cuba, a iluminação...' : 'Descreva o ambiente que você imagina...'}
            aria-label="Mensagem para o assistente"
            className="max-h-[200px] min-h-[44px] flex-1 resize-none bg-transparent py-2.5 text-[15px] leading-6 text-stone-150 outline-none placeholder:text-white/35"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            aria-label="Enviar mensagem"
            className="mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-300 text-ink-950 transition hover:bg-gold-200 disabled:bg-white/10 disabled:text-white/30"
          >
            <ArrowUp size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </form>
  );

  const sidebar = (
    <div className="flex h-full flex-col p-3">
      <div className="flex items-center justify-between px-2 py-2">
        <Link href="/" aria-label="Voltar ao site">
          <Image src="/assets/logo/mht-logo-creme-ouro.webp" alt="MHT Marmoraria" width={1200} height={670} className="h-auto w-20" />
        </Link>
        <button type="button" onClick={() => (mobileSidebar ? setMobileSidebar(false) : setSidebarOpen(false))} aria-label="Fechar barra lateral" className="rounded-lg p-2 text-stone-250 transition hover:bg-white/5 hover:text-stone-150">
          {mobileSidebar ? <X size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      <button type="button" onClick={newProject} className="mt-3 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-stone-150 transition hover:bg-white/5">
        <SquarePen size={17} />
        Novo projeto
      </button>

      <p className="mt-6 px-3 text-xs text-stone-250">Versões deste projeto</p>
      <div className="mt-2 min-h-0 flex-1 space-y-0.5 overflow-y-auto">
        {versions.length === 0 ? (
          <p className="px-3 py-2 text-xs leading-relaxed text-white/35">As prévias geradas aparecem aqui.</p>
        ) : (
          [...versions].reverse().map((version) => (
            <button
              key={version.id}
              type="button"
              onClick={() => {
                setLightbox({ images: version.imagesJson, index: 0 });
                setMobileSidebar(false);
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-stone-250 transition hover:bg-white/5 hover:text-stone-150"
            >
              <History size={15} className="shrink-0" />
              <span className="truncate">
                V{version.versionNumber} · {version.userRequest || 'Prévia'}
              </span>
            </button>
          ))
        )}
      </div>

      <div className="space-y-1 border-t border-white/10 pt-3">
        <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-stone-150 transition hover:bg-white/5">
          <WhatsAppIcon size={16} className="text-emerald-400" />
          Falar com especialista
        </a>
        <Link href="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-stone-250 transition hover:bg-white/5 hover:text-stone-150">
          <ArrowLeft size={16} />
          Voltar ao site
        </Link>
      </div>
    </div>
  );

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-[#0b0a09] text-stone-150">
      {/* Barra lateral (desktop) */}
      <aside className={`hidden shrink-0 border-r border-white/[0.06] bg-[#080706] transition-[width] duration-300 md:block ${sidebarOpen ? 'w-[260px]' : 'w-0 overflow-hidden border-r-0'}`}>
        <div className="h-full w-[260px]">{sidebar}</div>
      </aside>

      {/* Barra lateral (celular) */}
      {mobileSidebar && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="portal-overlay absolute inset-0 bg-black/70" onClick={() => setMobileSidebar(false)} aria-hidden="true" />
          <aside className="portal-drawer absolute inset-y-0 left-0 w-[280px] bg-[#080706]">{sidebar}</aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topo */}
        <header className="flex h-14 shrink-0 items-center justify-between gap-2 px-3">
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setMobileSidebar(true)} aria-label="Abrir menu" className="rounded-lg p-2 text-stone-250 transition hover:bg-white/5 md:hidden">
              <Menu size={20} />
            </button>
            {!sidebarOpen && (
              <>
                <button type="button" onClick={() => setSidebarOpen(true)} aria-label="Abrir barra lateral" className="hidden rounded-lg p-2 text-stone-250 transition hover:bg-white/5 md:block">
                  <PanelLeftOpen size={18} />
                </button>
                <button type="button" onClick={newProject} aria-label="Novo projeto" className="hidden rounded-lg p-2 text-stone-250 transition hover:bg-white/5 md:block">
                  <SquarePen size={18} />
                </button>
              </>
            )}
            <p className="px-2 font-display text-lg uppercase tracking-wide text-stone-150">
              Assistente <span className="text-gold-300">MHT</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            {started && (
              <button type="button" onClick={() => setBriefingOpen(true)} className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs text-stone-250 transition hover:border-gold-400/40 hover:text-stone-150">
                <ClipboardList size={14} />
                Briefing {filled}/{BRIEFING_FIELDS.length}
              </button>
            )}
            {hasPreview && (
              <button type="button" onClick={() => setSpecialistOpen(true)} className="flex items-center gap-2 rounded-full bg-gold-300 px-3.5 py-1.5 text-xs font-semibold text-ink-950 transition hover:bg-gold-200">
                <UserRoundCheck size={14} />
                <span className="hidden sm:inline">Enviar para especialista</span>
                <span className="sm:hidden">Especialista</span>
              </button>
            )}
          </div>
        </header>

        {!started ? (
          /* Tela inicial */
          <main className="flex flex-1 flex-col items-center overflow-y-auto px-4 pb-10">
            <div className="my-auto w-full max-w-2xl py-6">
              <h1 className="text-center font-display text-[1.75rem] uppercase leading-tight tracking-wide text-stone-150 sm:text-4xl">
                Qual ambiente vamos <span className="text-gold-300">criar</span> hoje?
              </h1>
              <p className="mt-3 text-center text-sm text-stone-250">
                Descreva sua ideia e eu monto prévias conceituais em vários ângulos, com a pedra que você escolher.
              </p>
              <div className="mt-8">{composer}</div>
              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion.title}
                    type="button"
                    onClick={() => send(suggestion.text)}
                    className="rounded-2xl border border-white/10 px-4 py-3 text-left transition hover:border-gold-400/40 hover:bg-white/[0.03]"
                  >
                    <span className="block text-sm text-stone-150">{suggestion.title}</span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-stone-250">{suggestion.text}</span>
                  </button>
                ))}
              </div>
            </div>
          </main>
        ) : (
          <>
            {/* Conversa */}
            <main ref={scrollRef} className="flex-1 overflow-y-auto">
              <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6">
                {messages.map((message) =>
                  message.role === 'user' ? (
                    <div key={message.id} className="flex justify-end">
                      <p className="max-w-[80%] whitespace-pre-wrap break-words rounded-3xl bg-[#1c1a17] px-5 py-3 text-[15px] leading-7 text-stone-150">{message.content}</p>
                    </div>
                  ) : (
                    <div key={message.id} className="flex gap-4">
                      <AssistantAvatar />
                      <div className="min-w-0 flex-1 pt-1">
                        <p className="whitespace-pre-wrap text-[15px] leading-7 text-stone-150/90">{message.content}</p>
                        {message.version && <PreviewGrid version={message.version} onOpen={(images, index) => setLightbox({ images, index })} />}
                      </div>
                    </div>
                  ),
                )}

                {busy && (
                  <div className="flex gap-4">
                    <AssistantAvatar />
                    <div className="pt-1">
                      {isGenerating ? (
                        <div className="w-full max-w-md">
                          <p className="text-sm text-stone-250">Gerando as prévias do seu ambiente...</p>
                          <div className="mt-3 grid grid-cols-3 gap-2">
                            {Array.from({ length: 3 }).map((_, index) => (
                              <span key={index} className="aspect-[4/3] w-28 animate-pulse rounded-xl bg-white/[0.06]" />
                            ))}
                          </div>
                        </div>
                      ) : (
                        <span className="flex gap-1 py-3" aria-label="Digitando">
                          {[0, 150, 300].map((delay) => (
                            <span key={delay} className="h-2 w-2 animate-bounce rounded-full bg-gold-300/80" style={{ animationDelay: `${delay}ms` }} />
                          ))}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {!hasPreview && !busy && filled >= 2 && (
                  <div className="flex justify-center">
                    <button type="button" onClick={generateNow} className="flex items-center gap-2 rounded-full border border-gold-400/30 px-4 py-2 text-xs text-gold-200 transition hover:bg-gold-400/10">
                      <Wand2 size={14} />
                      Gerar prévia com o que já temos
                    </button>
                  </div>
                )}
              </div>
            </main>

            <div className="shrink-0 px-4 pb-3">
              <div className="mx-auto w-full max-w-3xl">{composer}</div>
            </div>
          </>
        )}

        <p className="shrink-0 px-4 pb-3 text-center text-[11px] text-white/35">
          As imagens são prévias conceituais. Medidas, viabilidade e valores são confirmados por um especialista.
        </p>
      </div>

      {/* Briefing */}
      <Modal open={briefingOpen} onClose={() => setBriefingOpen(false)} title="Briefing do projeto" description="O que o assistente já entendeu do seu ambiente.">
        <dl className="divide-y divide-white/[0.06]">
          {BRIEFING_FIELDS.map(([field, label]) => (
            <div key={field} className="flex items-start justify-between gap-6 py-2.5">
              <dt className="text-sm text-stone-250">{label}</dt>
              <dd className={`text-right text-sm ${briefing[field] ? 'text-stone-150' : 'text-white/30'}`}>{briefing[field] || 'A definir'}</dd>
            </div>
          ))}
        </dl>
      </Modal>

      <SpecialistDialog open={specialistOpen} onClose={() => setSpecialistOpen(false)} projectId={projectId} />

      {/* Visualização em tela cheia */}
      {lightbox && (
        <PreviewLightbox
          images={lightbox.images}
          index={lightbox.index}
          onIndexChange={(index) => setLightbox({ ...lightbox, index })}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}

function PreviewLightbox({
  images,
  index,
  onIndexChange,
  onClose,
}: {
  images: ProjectImage[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const handlers = useRef({ onIndexChange, onClose, index, total: images.length });
  handlers.current = { onIndexChange, onClose, index, total: images.length };
  const current = images[index];

  // Keyboard: Esc closes, arrows navigate. Focus goes into the dialog and back to the opener on close.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    document.body.style.overflow = 'hidden';

    function onKeyDown(event: globalThis.KeyboardEvent) {
      const { onIndexChange: change, onClose: close, index: currentIndex, total } = handlers.current;
      if (event.key === 'Escape') close();
      if (event.key === 'ArrowRight') change((currentIndex + 1) % total);
      if (event.key === 'ArrowLeft') change((currentIndex - 1 + total) % total);
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
      opener?.focus();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black/95" role="dialog" aria-modal="true" aria-label="Prévia em tela cheia">
      <div className="flex items-center justify-between p-4">
        <p className="text-sm text-stone-150" aria-live="polite">
          {imageLabels[current.type]}
          <span className="ml-2 text-stone-250">
            {index + 1}/{images.length}
          </span>
        </p>
        <button ref={closeRef} type="button" onClick={onClose} aria-label="Fechar" className="rounded-full p-2 text-stone-150 transition hover:bg-white/10">
          <X size={20} />
        </button>
      </div>
      <div className="relative min-h-0 flex-1" onClick={onClose}>
        <Image src={current.imageUrl} alt={imageLabels[current.type]} fill unoptimized className="object-contain" />
        {images.length > 1 &&
          ([-1, 1] as const).map((step) => (
            <button
              key={step}
              type="button"
              aria-label={step < 0 ? 'Anterior' : 'Próxima'}
              onClick={(event) => {
                event.stopPropagation();
                onIndexChange((index + step + images.length) % images.length);
              }}
              className={`absolute top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 ${step < 0 ? 'left-4' : 'right-4'}`}
            >
              {step < 0 ? <ChevronLeft size={22} /> : <ChevronRight size={22} />}
            </button>
          ))}
      </div>
      <div className="flex justify-center gap-2 overflow-x-auto p-4">
        {images.map((image, imageIndex) => (
          <button
            key={image.id}
            type="button"
            onClick={() => onIndexChange(imageIndex)}
            aria-label={imageLabels[image.type]}
            aria-current={imageIndex === index}
            className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 ${imageIndex === index ? 'border-gold-400' : 'border-transparent opacity-60 hover:opacity-100'}`}
          >
            <Image src={image.imageUrl} alt="" fill unoptimized className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}

function SpecialistDialog({ open, onClose, projectId }: { open: boolean; onClose: () => void; projectId?: string }) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!projectId) return;
    setStatus('sending');
    const response = await fetch(`/api/projects/${projectId}/send-to-specialist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))),
    });
    setStatus(response.ok ? 'sent' : 'error');
  }

  const input = 'w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-3 text-sm text-stone-150 outline-none transition placeholder:text-white/30 focus:border-gold-400/60';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Enviar para especialista"
      description="Um especialista da MHT analisa sua prévia, confirma medidas e materiais e prepara a proposta."
    >
      {status === 'sent' ? (
        <div className="py-4 text-center">
          <UserRoundCheck size={32} className="mx-auto text-gold-300" />
          <p className="mt-3 text-sm text-stone-150">Projeto enviado! Em breve entraremos em contato pelo WhatsApp.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <input name="customerName" required minLength={2} maxLength={120} placeholder="Seu nome" className={input} />
          <input name="customerWhatsapp" required minLength={8} maxLength={40} placeholder="WhatsApp com DDD" className={input} />
          <textarea name="message" required rows={3} maxLength={2000} defaultValue="Gostaria de enviar essa prévia para análise de um especialista." className={`${input} resize-none`} />
          {status === 'error' && <p className="text-sm text-red-300" role="alert">Não foi possível enviar agora. Tente novamente.</p>}
          <button type="submit" disabled={status === 'sending'} className="w-full rounded-xl bg-gold-300 py-3 text-sm font-semibold text-ink-950 transition hover:bg-gold-200 disabled:opacity-60">
            {status === 'sending' ? 'Enviando...' : 'Enviar projeto'}
          </button>
        </form>
      )}
    </Modal>
  );
}
