'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Trash2 } from 'lucide-react';
import { contentKinds, type ContentImage, type ContentItem, type ContentKind } from '@/lib/content/types';
import ImageUploader from './ImageUploader';
import { ConfirmDialog } from './Modal';
import {
  cardClass,
  dangerButtonClass,
  inputClass,
  labelClass,
  primaryButtonClass,
  readError,
  secondaryButtonClass,
} from './styles';

const titleLabels: Record<ContentKind, string> = {
  service: 'Nome do serviço',
  material: 'Nome do material',
  case: 'Título do projeto',
  banner: 'Nome do banner (uso interno)',
};

export default function ContentForm({
  kind,
  item,
  uploadsEnabled,
}: {
  kind: ContentKind;
  item?: ContentItem;
  uploadsEnabled: boolean;
}) {
  const router = useRouter();
  const listPath = `/portal/${contentKinds[kind].slug}`;
  const [images, setImages] = useState<ContentImage[]>(item?.images || []);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      kind,
      title: form.get('title'),
      category: form.get('category') || '',
      summary: form.get('summary') || '',
      description: form.get('description') || '',
      features: String(form.get('features') || '')
        .split('\n')
        .map((feature) => feature.trim())
        .filter(Boolean),
      images,
      published: form.get('published') === 'on',
      sortOrder: Number(form.get('sortOrder') || 0),
    };

    setError('');
    setIsSaving(true);
    const response = await fetch(item ? `/api/portal/items/${item.id}` : '/api/portal/items', {
      method: item ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      router.push(listPath);
      router.refresh();
      return;
    }
    setError(await readError(response, 'Não foi possível salvar.'));
    setIsSaving(false);
  }

  async function handleDelete() {
    if (!item) return;
    setIsSaving(true);
    const response = await fetch(`/api/portal/items/${item.id}`, { method: 'DELETE' });
    if (response.ok) {
      router.push(listPath);
      router.refresh();
      return;
    }
    setError(await readError(response, 'Não foi possível excluir.'));
    setIsSaving(false);
    setConfirmingDelete(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className={`${cardClass} space-y-5 p-5`}>
        <div>
          <label htmlFor="title" className={labelClass}>{titleLabels[kind]}</label>
          <input id="title" name="title" required maxLength={120} defaultValue={item?.title} className={inputClass} />
        </div>

        {kind === 'case' && (
          <div>
            <label htmlFor="category" className={labelClass}>Ambiente</label>
            <input id="category" name="category" maxLength={80} placeholder="Ex.: Cozinha, Banheiro, Fachada" defaultValue={item?.category} className={inputClass} />
          </div>
        )}

        {kind === 'banner' ? (
          <p className="text-sm leading-relaxed text-stone-250">
            As fotos e vídeos deste banner aparecem no fundo do topo do site, alternando entre si. Prefira arquivos horizontais
            e em alta resolução; o texto do topo continua o mesmo.
          </p>
        ) : (
          <>
            <div>
              <label htmlFor="summary" className={labelClass}>Descrição curta</label>
              <input id="summary" name="summary" maxLength={300} placeholder="Uma frase que aparece no card do site" defaultValue={item?.summary} className={inputClass} />
            </div>

            <div>
              <label htmlFor="description" className={labelClass}>Descrição completa</label>
              <textarea id="description" name="description" rows={5} maxLength={4000} defaultValue={item?.description} className={inputClass} />
            </div>
          </>
        )}

        {kind === 'material' && (
          <div>
            <label htmlFor="features" className={labelClass}>Características (uma por linha)</label>
            <textarea id="features" name="features" rows={4} placeholder={'Alta durabilidade\nBaixa manutenção'} defaultValue={item?.features.join('\n')} className={inputClass} />
          </div>
        )}
      </section>

      <section className={`${cardClass} p-5`}>
        <p className={labelClass}>Fotos e vídeos</p>
        <ImageUploader images={images} onChange={setImages} uploadsEnabled={uploadsEnabled} />
      </section>

      <section className={`${cardClass} flex flex-wrap items-end gap-6 p-5`}>
        <label className="-m-2 flex cursor-pointer items-center gap-3 rounded-lg p-2 text-sm text-stone-150">
          <input type="checkbox" name="published" defaultChecked={item?.published ?? true} className="h-5 w-5 accent-[#cda14f]" />
          Publicado no site
        </label>
        <div className="w-32">
          <label htmlFor="sortOrder" className={labelClass}>Ordem</label>
          <input id="sortOrder" name="sortOrder" type="number" min={0} max={9999} defaultValue={item?.sortOrder ?? 0} className={inputClass} />
        </div>
      </section>

      {error && <p className="text-sm text-red-300" role="alert">{error}</p>}

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={isSaving} className={primaryButtonClass}>
          {isSaving ? 'Salvando...' : 'Salvar'}
        </button>
        <button type="button" onClick={() => router.push(listPath)} className={secondaryButtonClass}>
          Cancelar
        </button>
        {item && (
          <button type="button" onClick={() => setConfirmingDelete(true)} disabled={isSaving} className={`${dangerButtonClass} ml-auto`}>
            <Trash2 size={15} />
            Excluir
          </button>
        )}
      </div>
      {item && (
        <ConfirmDialog
          open={confirmingDelete}
          onCancel={() => setConfirmingDelete(false)}
          onConfirm={handleDelete}
          isLoading={isSaving}
          title={`Excluir ${contentKinds[kind].singular}`}
          description={`"${item.title}" será removido do site e as fotos enviadas serão apagadas. Essa ação não pode ser desfeita.`}
        />
      )}
    </form>
  );
}
