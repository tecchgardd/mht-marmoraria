'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Plus, Save, Share2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import AiPreviewGallery from './AiPreviewGallery';
import AiProjectChat, { type ChatMessage } from './AiProjectChat';
import AiProjectSummary from './AiProjectSummary';
import AiVersionHistory from './AiVersionHistory';
import SendToSpecialistButton from './SendToSpecialistButton';
import type { Briefing, ProjectImage, ProjectVersion } from '@/lib/ai/types';

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

function createMessage(role: ChatMessage['role'], content: string): ChatMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role,
    content,
  };
}

function completeBriefing(briefing: Briefing): Briefing {
  return {
    ambiente: briefing.ambiente || 'Cozinha',
    estilo: briefing.estilo || 'Moderna',
    pedra: briefing.pedra || 'Marmore branco Calacatta',
    coresMoveis: briefing.coresMoveis || 'Armarios pretos foscos',
    bancada: briefing.bancada || 'Ilha central',
    pia: briefing.pia || 'Pia dupla',
    iluminacao: briefing.iluminacao || 'Pendentes em LED quente',
    medidasAproximadas: briefing.medidasAproximadas || 'A confirmar',
    referencias: briefing.referencias || '',
    observacoes: briefing.observacoes || 'Projeto conceitual premium para marmoraria.',
  };
}

export default function AiAssistantPage() {
  const [projectId, setProjectId] = useState<string>();
  const [briefing, setBriefing] = useState<Briefing>(emptyBriefing);
  const [messages, setMessages] = useState<ChatMessage[]>([
    createMessage(
      'assistant',
      'Ola! Vou te ajudar a criar o ambiente dos seus sonhos. Qual ambiente voce deseja projetar?',
    ),
  ]);
  const [input, setInput] = useState('');
  const [images, setImages] = useState<ProjectImage[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string>();
  const [versions, setVersions] = useState<ProjectVersion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const projectBriefing = useMemo(() => briefing, [briefing]);

  async function generatePreview(nextProjectId: string | undefined, nextBriefing: Briefing, userRequest: string) {
    setIsGenerating(true);
    const response = await fetch('/api/ai/generate-preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId: nextProjectId,
        briefing: nextBriefing,
        userRequest,
      }),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Nao foi possivel gerar as previas.');
    }

    setProjectId(data.projectId);
    setBriefing(nextBriefing);
    setImages(data.images);
    setSelectedImageId(data.images[0]?.id);
    setVersions((current) => [...current, data.version]);
  }

  async function handleSend() {
    const message = input.trim();
    if (!message || isLoading || isGenerating) return;

    setInput('');
    setMessages((current) => [...current, createMessage('user', message)]);
    setIsLoading(true);

    try {
      const endpoint = images.length > 0 && projectId ? `/api/projects/${projectId}/refine` : '/api/ai/chat';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(images.length > 0 ? { message, briefing: projectBriefing } : { projectId, message }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Nao foi possivel processar sua mensagem.');
      }

      const nextBriefing = completeBriefing(data.briefing || projectBriefing);
      if (data.projectId) setProjectId(data.projectId);
      if (data.briefing) setBriefing(data.briefing);
      if (data.images) {
        setImages(data.images);
        setSelectedImageId(data.images[0]?.id);
      }
      if (data.version) setVersions((current) => [...current, data.version]);

      setMessages((current) => [
        ...current,
        createMessage(
          'assistant',
          data.response || 'Perfeito. Vou manter o mesmo projeto e alterar apenas o item solicitado.',
        ),
      ]);

      if (!images.length && data.readyToGenerate) {
        await generatePreview(data.projectId || projectId, nextBriefing, message);
        setMessages((current) => [
          ...current,
          createMessage('assistant', 'Gerei as primeiras previas do seu ambiente. Voce pode pedir ajustes pelo chat.'),
        ]);
      }
    } catch (error) {
      setMessages((current) => [
        ...current,
        createMessage(
          'assistant',
          error instanceof Error ? error.message : 'Nao foi possivel concluir agora. Tente novamente.',
        ),
      ]);
    } finally {
      setIsLoading(false);
      setIsGenerating(false);
    }
  }

  async function handleGenerate() {
    if (isGenerating) return;
    try {
      await generatePreview(
        projectId,
        completeBriefing(projectBriefing),
        'Gerar previas conceituais consistentes em multiplos angulos.',
      );
    } catch (error) {
      setMessages((current) => [
        ...current,
        createMessage(
          'assistant',
          error instanceof Error ? error.message : 'Nao foi possivel gerar as previas agora.',
        ),
      ]);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[#050505] text-white">
      <header className="flex h-[76px] items-center justify-between gap-4 border-b border-[#7A1230]/35 bg-[#060303] px-6 shadow-[0_18px_50px_rgba(122,18,48,0.12)]">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 transition hover:border-[#C9A257]/50">
            <Image src="/assets/logo-mht.svg" alt="MHT Marmoraria" width={156} height={48} className="h-11 w-auto" priority />
          </Link>
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/60 transition hover:text-white">
            <ArrowLeft size={16} />
            Voltar para Home
          </Link>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <h1 className="text-lg font-semibold text-white">Assistente IA</h1>
          <span className="rounded-full border border-[#C9A257]/30 bg-[#7A1230]/40 px-3 py-1 text-sm text-[#F2D28A]">
            Em criacao
          </span>
        </div>

        <div className="flex items-center gap-3 max-xl:gap-2">
          <button
            type="button"
            onClick={handleGenerate}
            className="inline-flex items-center gap-2 rounded-lg border border-[#7A1230]/45 bg-[#12070B] px-4 py-2 text-sm text-white/80 transition hover:border-[#C9A257]/60 hover:text-white max-sm:hidden"
          >
            <Plus size={15} />
            Novo projeto
          </button>
          <button type="button" className="inline-flex items-center gap-2 rounded-lg border border-[#7A1230]/45 bg-[#12070B] px-4 py-2 text-sm text-white/80 transition hover:border-[#C9A257]/60 hover:text-white max-lg:hidden">
            <Save size={15} />
            Salvar
          </button>
          <button type="button" className="inline-flex items-center gap-2 rounded-lg border border-[#7A1230]/45 bg-[#12070B] px-4 py-2 text-sm text-white/80 transition hover:border-[#C9A257]/60 hover:text-white max-lg:hidden">
            <Share2 size={15} />
            Compartilhar
          </button>
          <a
            href="https://wa.me/5511999999999"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-[#C9A257]/50 bg-[#C9A257] px-4 py-2 text-sm font-semibold text-black transition hover:bg-[#F2D28A] max-sm:hidden"
          >
            Falar com especialista
          </a>
        </div>
      </header>

      <main className="grid h-[calc(100vh-76px)] grid-cols-[340px_minmax(0,1fr)_340px] max-lg:h-auto max-lg:min-h-[calc(100vh-76px)] max-lg:grid-cols-1">
        <aside className="min-h-0 border-r border-[#7A1230]/30 bg-[#080405] max-lg:h-[calc(100vh-76px)]">
          <AiProjectChat
            messages={messages}
            input={input}
            setInput={setInput}
            onSend={handleSend}
            isLoading={isLoading || isGenerating}
            briefing={briefing}
          />
        </aside>

        <section className="min-h-0 overflow-y-auto bg-[radial-gradient(circle_at_top_left,rgba(122,18,48,0.18),transparent_34%),#050505] px-6 py-6">
          <div className="mx-auto max-w-[1180px] space-y-5">
            <AiPreviewGallery
              images={images}
              selectedImageId={selectedImageId}
              onSelectImage={setSelectedImageId}
              isGenerating={isGenerating}
            />

            <p className="text-center text-xs text-white/45">
              As imagens sao previas conceituais. Medidas, viabilidade e valores serao confirmados por um especialista.
            </p>
          </div>
        </section>

        <aside className="min-h-0 overflow-y-auto border-l border-[#7A1230]/30 bg-[#080405] p-5 max-lg:border-l-0 max-lg:border-t max-lg:border-[#7A1230]/30">
          <div className="space-y-5">
            <AiProjectSummary briefing={projectBriefing} />
            <SendToSpecialistButton projectId={projectId} />
            <AiVersionHistory versions={versions} />
          </div>
        </aside>
      </main>
    </div>
  );
}
