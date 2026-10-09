'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Trash2, UserPlus } from 'lucide-react';
import type { PortalUser } from '@/lib/auth/users';
import Modal, { ConfirmDialog } from './Modal';
import { cardClass, dangerButtonClass, inputClass, labelClass, primaryButtonClass, readError } from './styles';

const NEW_USER_FORM = 'new-user-form';

export default function UsersManager({ users, currentUserId }: { users: PortalUser[]; currentUserId: string }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<PortalUser | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  function openCreate() {
    setError('');
    setCreating(true);
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSaving(true);

    const response = await fetch('/api/portal/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))),
    });

    if (response.ok) {
      const { user } = await response.json();
      setCreating(false);
      setNotice(`Usuário ${user.email} criado.`);
      router.refresh();
    } else {
      setError(await readError(response, 'Não foi possível criar o usuário.'));
    }
    setIsSaving(false);
  }

  async function handleDelete() {
    if (!deleting) return;
    setIsSaving(true);
    const response = await fetch(`/api/portal/users/${deleting.id}`, { method: 'DELETE' });
    if (response.ok) {
      setNotice(`Usuário ${deleting.email} excluído.`);
      router.refresh();
    } else {
      setNotice(await readError(response, 'Não foi possível excluir o usuário.'));
    }
    setDeleting(null);
    setIsSaving(false);
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-display text-xs uppercase tracking-widest2 text-gold-300">Acesso</p>
          <h1 className="mt-1 font-display text-3xl uppercase tracking-wide text-stone-150">Usuários</h1>
          <p className="mt-1 text-sm text-stone-250">Quem pode entrar no portal e editar o conteúdo do site.</p>
        </div>
        <button type="button" onClick={openCreate} className={primaryButtonClass}>
          <UserPlus size={16} />
          Novo usuário
        </button>
      </div>

      {notice && (
        <p className="mt-6 rounded-lg border border-gold-400/25 bg-gold-400/[0.06] px-4 py-3 text-sm text-gold-100" role="status">
          {notice}
        </p>
      )}

      <ul className={`${cardClass} mt-8 divide-y divide-white/[0.06] overflow-hidden`}>
        {users.map((user) => (
          <li key={user.id} className="flex items-center gap-4 px-5 py-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold-400/50 bg-gradient-to-br from-gold-400/20 to-transparent font-display text-sm uppercase text-gold-200">
              {user.email.charAt(0)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-stone-150">{user.email}</p>
              <p className="mt-0.5 flex items-center gap-2 text-xs text-stone-250">
                Desde {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                {user.id === currentUserId && <span className="rounded-full bg-gold-400/15 px-2 py-0.5 text-[11px] text-gold-200">você</span>}
              </p>
            </div>
            {user.id !== currentUserId && (
              <button type="button" onClick={() => setDeleting(user)} className={dangerButtonClass} aria-label={`Excluir ${user.email}`}>
                <Trash2 size={15} />
              </button>
            )}
          </li>
        ))}
      </ul>

      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title="Novo usuário"
        description="A pessoa entra no portal com este e-mail e senha."
        footer={
          <>
            <button type="button" onClick={() => setCreating(false)} className="rounded-md px-4 py-2.5 text-sm text-stone-250 transition hover:bg-white/5 hover:text-stone-150">
              Cancelar
            </button>
            <button type="submit" form={NEW_USER_FORM} disabled={isSaving} className={primaryButtonClass}>
              {isSaving ? 'Criando...' : 'Criar usuário'}
            </button>
          </>
        }
      >
        <form id={NEW_USER_FORM} onSubmit={handleCreate} className="space-y-4">
          <div>
            <label htmlFor="email" className={labelClass}>E-mail</label>
            <input id="email" name="email" type="email" required autoComplete="off" className={inputClass} />
          </div>
          <div>
            <label htmlFor="password" className={labelClass}>Senha (mín. 8 caracteres)</label>
            <input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" className={inputClass} />
          </div>
          {error && <p className="text-sm text-red-300" role="alert">{error}</p>}
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
        isLoading={isSaving}
        title="Excluir usuário"
        description={`${deleting?.email ?? ''} perde o acesso ao portal imediatamente.`}
      />
    </>
  );
}
