'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent, type InputHTMLAttributes } from 'react';
import { ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { readError } from './styles';

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon: typeof Mail;
  name: string;
};

function Field({ label, icon: Icon, name, type = 'text', ...props }: FieldProps) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === 'password';

  return (
    <div>
      <label htmlFor={name} className="mb-2 block font-display text-xs uppercase tracking-widest2 text-stone-250">
        {label}
      </label>
      <div className="group relative">
        <Icon size={16} className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-stone-250 transition group-focus-within:text-gold-300" />
        <input
          id={name}
          name={name}
          type={isPassword && visible ? 'text' : type}
          required
          className="w-full border-0 border-b border-white/15 bg-transparent py-3 pl-7 pr-9 text-[15px] text-stone-150 outline-none transition placeholder:text-white/25 focus:border-gold-400"
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((current) => !current)}
            aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
            className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-stone-250 transition hover:text-gold-300"
          >
            {visible ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  );
}

export default function LoginForm({ firstUser }: { firstUser: boolean }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch(firstUser ? '/api/portal/auth/setup' : '/api/portal/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(form)),
      });

      if (response.ok) {
        router.replace('/portal');
        router.refresh();
        return;
      }
      setError(await readError(response, 'Não foi possível entrar.'));
    } catch {
      setError('Sem conexão com o servidor. Tente novamente.');
    }
    setIsSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      {firstUser ? (
        <>
          <p className="border-l-2 border-gold-400 pl-3 text-sm leading-relaxed text-stone-250">
            Nenhum usuário cadastrado ainda. Este será o primeiro acesso ao portal.
          </p>
          <Field label="E-mail" name="email" type="email" icon={Mail} autoComplete="email" placeholder="voce@mhtmarmoraria.com.br" />
          <Field label="Senha" name="password" type="password" icon={Lock} minLength={8} autoComplete="new-password" placeholder="Mínimo de 8 caracteres" />
        </>
      ) : (
        <>
          <Field label="E-mail" name="email" type="email" icon={Mail} autoComplete="email" autoFocus />
          <Field label="Senha" name="password" type="password" icon={Lock} autoComplete="current-password" />
        </>
      )}

      {error && (
        <p className="rounded-sm border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200" role="alert">
          {error}
        </p>
      )}

      <button type="submit" disabled={isSubmitting} className="btn-gold w-full disabled:cursor-not-allowed disabled:opacity-60">
        {isSubmitting ? 'Aguarde...' : firstUser ? 'Criar acesso' : 'Entrar'}
        {!isSubmitting && <ArrowRight size={16} />}
      </button>
    </form>
  );
}
