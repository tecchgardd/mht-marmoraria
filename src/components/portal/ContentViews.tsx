import { notFound } from 'next/navigation';
import Media from '@/components/Media';
import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';
import { cardClass, primaryButtonClass } from './styles';
import { getContent, listContent } from '@/lib/content/repository';
import { contentKinds, type ContentKind } from '@/lib/content/types';
import { missingCloudinaryConfig } from '@/lib/portal/config';
import ContentForm from './ContentForm';

export async function ContentListView({ kind }: { kind: ContentKind }) {
  const items = await listContent(kind);
  const { label, singular, slug } = contentKinds[kind];

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-display text-xs uppercase tracking-widest2 text-gold-300">Conteúdo do site</p>
          <h1 className="mt-1 font-display text-3xl uppercase tracking-wide text-stone-150">{label}</h1>
          <p className="mt-1 text-sm text-stone-250">
            {items.length} {items.length === 1 ? 'item' : 'itens'} · a ordem e a publicação definem o que aparece na home.
          </p>
        </div>
        <Link href={`/portal/${slug}/novo`} className={primaryButtonClass}>
          <Plus size={16} />
          Novo {singular}
        </Link>
      </div>

      {items.length === 0 ? (
        <p className={`${cardClass} mt-8 p-8 text-center text-sm text-stone-250`}>
          Nenhum {singular} cadastrado ainda.
        </p>
      ) : (
        <ul className={`${cardClass} mt-8 divide-y divide-white/[0.06] overflow-hidden`}>
          {items.map((item) => (
            <li key={item.id}>
              <Link href={`/portal/${slug}/${item.id}`} className="flex items-center gap-4 px-4 py-3 transition hover:bg-white/[0.03]">
                <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-black">
                  {item.images[0] && <Media media={item.images[0]} alt="" sizes="80px" videoMode="still" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-stone-150">{item.title}</p>
                  <p className="truncate text-sm text-stone-250">{item.summary || item.category || '—'}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs ${item.published ? 'bg-emerald-500/15 text-emerald-300' : 'bg-white/10 text-stone-250'}`}>
                  {item.published ? 'Publicado' : 'Rascunho'}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function FormHeader({ kind, title }: { kind: ContentKind; title: string }) {
  const { label, slug } = contentKinds[kind];
  return (
    <div className="mb-8">
      <Link href={`/portal/${slug}`} className="-mx-2 inline-flex items-center gap-1.5 rounded-lg px-2 py-2 text-xs text-stone-250 transition hover:text-gold-300">
        <ArrowLeft size={13} />
        {label}
      </Link>
      <h1 className="mt-2 font-display text-3xl uppercase tracking-wide text-stone-150">{title}</h1>
    </div>
  );
}

export function NewContentView({ kind }: { kind: ContentKind }) {
  return (
    <>
      <FormHeader kind={kind} title={`Novo ${contentKinds[kind].singular}`} />
      <ContentForm kind={kind} uploadsEnabled={missingCloudinaryConfig().length === 0} />
    </>
  );
}

export async function EditContentView({ kind, id }: { kind: ContentKind; id: string }) {
  const item = await getContent(id);
  if (!item || item.kind !== kind) notFound();

  return (
    <>
      <FormHeader kind={kind} title={`Editar ${contentKinds[kind].singular}`} />
      <ContentForm kind={kind} item={item} uploadsEnabled={missingCloudinaryConfig().length === 0} />
    </>
  );
}
