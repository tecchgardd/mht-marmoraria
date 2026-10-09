'use client';

import Image from 'next/image';
import { useState, type ChangeEvent } from 'react';
import { Check, CloudOff, ImagePlus, Library, Play, Star, X } from 'lucide-react';
import { siteMediaLibrary } from '@/lib/content/defaults';
import Modal from './Modal';
import { isVideo, type ContentImage } from '@/lib/content/types';
import { primaryButtonClass, readError } from './styles';

const MAX_IMAGES = 12;
const MAX_IMAGE_MB = 10;
const MAX_VIDEO_MB = 100;

type UploadSignature = {
  cloudName: string;
  apiKey: string;
  folder: string;
  timestamp: number;
  signature: string;
};

async function uploadToCloudinary(file: File, signature: UploadSignature): Promise<ContentImage> {
  const body = new FormData();
  body.append('file', file);
  body.append('api_key', signature.apiKey);
  body.append('timestamp', String(signature.timestamp));
  body.append('folder', signature.folder);
  body.append('signature', signature.signature);

  // "auto" lets Cloudinary accept both photos and videos.
  const response = await fetch(`https://api.cloudinary.com/v1_1/${signature.cloudName}/auto/upload`, {
    method: 'POST',
    body,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || `Falha ao enviar ${file.name}.`);
  return { url: data.secure_url, publicId: data.public_id, type: data.resource_type === 'video' ? 'video' : 'image' };
}

export default function ImageUploader({
  images,
  onChange,
  uploadsEnabled,
  max = MAX_IMAGES,
}: {
  images: ContentImage[];
  onChange: (images: ContentImage[]) => void;
  uploadsEnabled: boolean;
  /** Maximum number of files for this field. */
  max?: number;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);

  const usedUrls = new Set(images.map((image) => image.url));
  const available = siteMediaLibrary.filter((media) => !usedUrls.has(media.url));

  function openLibrary() {
    setPicked([]);
    setLibraryOpen(true);
  }

  function togglePicked(url: string) {
    setPicked((current) => (current.includes(url) ? current.filter((item) => item !== url) : [...current, url]));
  }

  function addPicked() {
    const room = max - images.length;
    const additions = siteMediaLibrary.filter((media) => picked.includes(media.url)).slice(0, room);
    onChange([...images, ...additions]);
    setLibraryOpen(false);
  }

  async function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length) return;

    setError('');
    if (images.length + files.length > max) {
      setError(max === 1 ? 'Escolha apenas um arquivo.' : `Máximo de ${max} arquivos.`);
      return;
    }
    const unsupported = files.find((file) => !file.type.startsWith('image/') && !file.type.startsWith('video/'));
    if (unsupported) {
      setError(`${unsupported.name} não é foto nem vídeo.`);
      return;
    }
    const tooBig = files.find((file) => {
      const limit = file.type.startsWith('video/') ? MAX_VIDEO_MB : MAX_IMAGE_MB;
      return file.size > limit * 1024 * 1024;
    });
    if (tooBig) {
      const limit = tooBig.type.startsWith('video/') ? MAX_VIDEO_MB : MAX_IMAGE_MB;
      setError(`${tooBig.name} passa de ${limit} MB.`);
      return;
    }

    setIsUploading(true);
    try {
      const response = await fetch('/api/portal/upload-signature', { method: 'POST' });
      if (!response.ok) throw new Error(await readError(response, 'Não foi possível preparar o envio.'));
      const signature: UploadSignature = await response.json();

      const uploaded = await Promise.all(files.map((file) => uploadToCloudinary(file, signature)));
      onChange([...images, ...uploaded]);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Falha ao enviar fotos.');
    } finally {
      setIsUploading(false);
    }
  }

  function makeCover(index: number) {
    onChange([images[index], ...images.filter((_, current) => current !== index)]);
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((image, index) => (
          <div key={image.publicId || image.url} className="group relative aspect-[4/3] overflow-hidden rounded-md border border-white/10 bg-black">
            {isVideo(image) ? (
              <>
                <video src={image.url} muted playsInline preload="metadata" className="h-full w-full object-cover" />
                <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded bg-black/70 px-2 py-0.5 text-[11px] text-white">
                  <Play size={11} fill="currentColor" />
                  Vídeo
                </span>
              </>
            ) : (
              <Image src={image.url} alt={`Foto ${index + 1}`} fill className="object-cover" sizes="240px" />
            )}
            {index === 0 && (
              <span className="absolute left-2 top-2 rounded bg-gold-400 px-2 py-0.5 text-[11px] font-semibold uppercase text-ink-950">Capa</span>
            )}
            <div className="absolute right-2 top-2 flex gap-1">
              {index > 0 && (
                <button type="button" onClick={() => makeCover(index)} aria-label="Usar como capa" title="Usar como capa" className="flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-gold-200 transition hover:bg-black">
                  <Star size={14} />
                </button>
              )}
              <button type="button" onClick={() => onChange(images.filter((_, current) => current !== index))} aria-label="Remover foto" title="Remover foto" className="flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-red-600">
                <X size={14} />
              </button>
            </div>
          </div>
        ))}

        {images.length < max && uploadsEnabled && (
          <label className={`flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-white/20 text-center text-sm text-stone-250 transition hover:border-gold-400/60 hover:text-gold-200 ${isUploading ? 'pointer-events-none opacity-60' : ''}`}>
            <ImagePlus size={22} />
            {isUploading ? 'Enviando...' : 'Enviar fotos ou vídeos'}
            <input type="file" accept="image/*,video/*" multiple={max > 1} onChange={handleFiles} className="sr-only" disabled={isUploading} />
          </label>
        )}

        {images.length < max && available.length > 0 && (
          <button
            type="button"
            onClick={openLibrary}
            className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-md border border-dashed border-white/20 text-center text-sm text-stone-250 transition hover:border-gold-400/60 hover:text-gold-200"
          >
            <Library size={22} />
            Escolher do site
          </button>
        )}
      </div>

      {!uploadsEnabled && (
        <p className="mt-3 flex items-start gap-2 rounded-lg border border-amber-500/25 bg-amber-500/[0.07] px-3 py-2.5 text-xs leading-relaxed text-amber-200">
          <CloudOff size={14} className="mt-0.5 shrink-0" />
          Envio de arquivos novos desativado: faltam as credenciais do Cloudinary no servidor. Por enquanto, escolha fotos e
          vídeos que já estão no site.
        </p>
      )}
      <p className="mt-2 text-xs text-white/40">
        {max > 1 ? `O primeiro arquivo é a capa. Até ${max} arquivos: ` : 'Um arquivo: '}fotos de até {MAX_IMAGE_MB} MB e vídeos de até {MAX_VIDEO_MB} MB.
      </p>
      {error && <p className="mt-2 text-sm text-red-300" role="alert">{error}</p>}

      <Modal
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        title="Fotos e vídeos do site"
        description="Selecione os arquivos que já estão publicados no site."
        size="lg"
        footer={
          <>
            <button type="button" onClick={() => setLibraryOpen(false)} className="rounded-md px-4 py-2.5 text-sm text-stone-250 transition hover:bg-white/5 hover:text-stone-150">
              Cancelar
            </button>
            <button type="button" onClick={addPicked} disabled={!picked.length} className={primaryButtonClass}>
              Adicionar {picked.length > 0 && `(${picked.length})`}
            </button>
          </>
        }
      >
        <div className="grid max-h-[55vh] grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-3">
          {available.map((media) => {
            const selected = picked.includes(media.url);
            return (
              <button
                key={media.url}
                type="button"
                onClick={() => togglePicked(media.url)}
                aria-pressed={selected}
                className={`relative aspect-[4/3] overflow-hidden rounded-lg border-2 bg-black transition ${selected ? 'border-gold-400' : 'border-transparent hover:border-white/30'}`}
              >
                {isVideo(media) ? (
                  <video src={media.url} muted playsInline preload="metadata" className="h-full w-full object-cover" />
                ) : (
                  <Image src={media.url} alt="" fill className="object-cover" sizes="200px" />
                )}
                {isVideo(media) && (
                  <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded bg-black/70 px-2 py-0.5 text-[11px] text-white">
                    <Play size={11} fill="currentColor" />
                    Vídeo
                  </span>
                )}
                {selected && (
                  <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-gold-400 text-ink-950">
                    <Check size={14} strokeWidth={3} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </Modal>
    </div>
  );
}
