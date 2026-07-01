'use client';

import Image from 'next/image';
import type { ProjectImage } from '@/lib/ai/types';

const imageLabels: Record<ProjectImage['type'], string> = {
  FRONT: 'Vista frontal',
  LEFT: 'Lateral esquerda',
  RIGHT: 'Lateral direita',
  TOP: 'Vista superior',
  COUNTERTOP_DETAIL: 'Detalhe da bancada',
  SINK_DETAIL: 'Detalhe da pia',
  FINISH_DETAIL: 'Close do acabamento',
};

const tabLabels = ['Todas as vistas', 'Frontal', 'Lateral esquerda', 'Lateral direita', 'Superior', 'Detalhes'];

type AiPreviewGalleryProps = {
  images: ProjectImage[];
  selectedImageId?: string;
  onSelectImage: (imageId: string) => void;
  isGenerating: boolean;
};

export default function AiPreviewGallery({
  images,
  selectedImageId,
  onSelectImage,
  isGenerating,
}: AiPreviewGalleryProps) {
  const selectedImage = images.find((image) => image.id === selectedImageId) || images[0];

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-[#7A1230]/35 bg-[#100608] shadow-[0_24px_70px_rgba(0,0,0,0.35)]">
        <div className="relative aspect-[16/9] min-h-[460px]">
          {selectedImage ? (
            <Image
              src={selectedImage.imageUrl}
              alt={imageLabels[selectedImage.type]}
              fill
              unoptimized
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-[radial-gradient(circle_at_50%_35%,rgba(122,18,48,0.34),transparent_38%),linear-gradient(135deg,#15080B,#050505)] px-8 text-center">
              <span className="text-xs uppercase tracking-[0.3em] text-[#C9A257]">Assistente IA</span>
              <h2 className="mt-4 text-3xl font-bold text-white">Sua prévia visual aparece aqui</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/60">
                Envie uma mensagem no chat para gerar vistas conceituais do seu ambiente.
              </p>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/75 to-transparent" />
          <span className="absolute bottom-4 left-4 rounded-lg bg-black/60 px-3 py-2 text-sm text-white">
            {selectedImage ? imageLabels[selectedImage.type] : 'Vista frontal'}
          </span>
          {isGenerating && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/65 backdrop-blur-sm">
              <div className="rounded-2xl border border-[#C9A257]/30 bg-[#12070B] px-7 py-5 text-center shadow-[0_22px_50px_rgba(0,0,0,0.35)]">
                <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-[#C9A257]/20 border-t-[#C9A257]" />
                <p className="mt-4 text-sm text-white/80">Gerando seu projeto...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {tabLabels.map((label, index) => (
          <button
            key={label}
            type="button"
            className={`rounded-lg border px-4 py-2 text-sm transition ${
              index === 0
                ? 'border-[#C9A257] bg-[#C9A257] text-black'
                : 'border-[#7A1230]/35 bg-[#12070B] text-white/70 hover:border-[#C9A257]/60 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1 max-xl:grid-cols-2">
        {images.length > 0
          ? images.slice(0, 6).map((image) => (
              <button
                key={image.id}
                type="button"
                onClick={() => onSelectImage(image.id)}
                className={`group overflow-hidden rounded-2xl border bg-[#12070B] text-left transition ${
                  image.id === selectedImage?.id ? 'border-[#C9A257]' : 'border-white/10 hover:border-[#C9A257]/60'
                }`}
              >
                <div className="relative aspect-[16/9]">
                  <Image src={image.imageUrl} alt={imageLabels[image.type]} fill unoptimized className="object-cover" />
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/80 to-transparent" />
                  <span className="absolute bottom-3 left-3 rounded-lg bg-black/60 px-3 py-1.5 text-xs text-white">
                    {imageLabels[image.type]}
                  </span>
                </div>
              </button>
            ))
          : Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="aspect-[16/9] rounded-2xl border border-[#7A1230]/25 bg-[#12070B]" />
            ))}
      </div>
    </>
  );
}
