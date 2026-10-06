'use client';

import { ImagePlus, Send, Sparkles } from 'lucide-react';
import type { Briefing } from '@/lib/ai/types';

export type ChatMessage = {
  id: string;
  role: 'assistant' | 'user';
  content: string;
};

type AiProjectChatProps = {
  messages: ChatMessage[];
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
  briefing: Briefing;
};

const quickSuggestions = [
  'Cozinha moderna com ilha, mármore branco, armários pretos, pia dupla e iluminação quente.',
  'Banheiro premium com pia esculpida, cuba dupla, pedra clara e espelho grande.',
  'Área gourmet com bancada grande em granito claro, churrasqueira ao fundo e banquetas.',
];

export default function AiProjectChat({
  messages,
  input,
  setInput,
  onSend,
  isLoading,
  briefing,
}: AiProjectChatProps) {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSend();
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-[#7A1230]/30 bg-[#0D0608] p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#C9A257]/35 bg-[#7A1230]/35 text-[#F2D28A]">
            <Sparkles size={17} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Assistente de Projetos IA</h2>
            <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-[#C9A257]/20 bg-[#C9A257]/10 px-2 py-0.5 text-[0.65rem] text-[#F2D28A]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#C9A257]" />
              Online
            </span>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[88%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-6 sm:max-w-[82%] ${
                message.role === 'user'
                  ? 'bg-[#7A1230] text-white shadow-[0_10px_24px_rgba(122,18,48,0.28)]'
                  : 'border border-[#7A1230]/25 bg-[#12070B] text-white/85'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="inline-flex items-center gap-2 rounded-2xl border border-[#7A1230]/25 bg-[#12070B] px-4 py-3 text-sm text-white/80">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#C9A257]" />
            Gerando seu projeto...
          </div>
        )}

        {!briefing.ambiente && (
          <div className="space-y-2 pt-2">
            {quickSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setInput(suggestion)}
                className="w-full rounded-xl border border-[#7A1230]/25 bg-[#12070B] px-3 py-2 text-left text-xs leading-5 text-white/60 transition hover:border-[#C9A257]/50 hover:text-white"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-[#7A1230]/30 bg-[#080405] p-4">
        <div className="rounded-2xl border border-[#7A1230]/35 bg-[#12070B] p-3">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            rows={3}
            placeholder="Digite sua mensagem..."
            className="max-h-28 min-h-16 w-full resize-none bg-transparent text-sm text-white outline-none placeholder:text-white/35"
          />
          <div className="mt-2 flex items-center justify-between">
            <button type="button" className="rounded-lg p-2 text-white/35 transition hover:bg-[#7A1230]/25 hover:text-[#F2D28A]">
              <ImagePlus size={17} />
            </button>
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              aria-label="Enviar mensagem"
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#C9A257] text-black transition hover:bg-[#F2D28A] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/30"
            >
              <Send size={17} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
