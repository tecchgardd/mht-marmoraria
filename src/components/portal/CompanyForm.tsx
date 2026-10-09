'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent, type ReactNode } from 'react';
import { Building2, Check, Clock, Facebook, Instagram, Linkedin, MapPin, MessageCircle, Music2, Sparkles, Youtube } from 'lucide-react';
import type { CompanyProfile } from '@/lib/company/profile';
import type { ContentImage } from '@/lib/content/types';
import ImageUploader from './ImageUploader';
import { cardClass, inputClass, labelClass, primaryButtonClass, readError } from './styles';

function Section({ icon: Icon, title, description, children }: { icon: typeof Building2; title: string; description: string; children: ReactNode }) {
  return (
    <section className={`${cardClass} p-6`}>
      <div className="mb-5 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-400/10 text-gold-300">
          <Icon size={18} />
        </span>
        <div>
          <h2 className="font-display text-base uppercase tracking-wide text-stone-150">{title}</h2>
          <p className="text-sm text-stone-250">{description}</p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({
  label,
  name,
  defaultValue,
  wide,
  placeholder,
  type = 'text',
  maxLength,
}: {
  label: string;
  name: string;
  defaultValue: string;
  wide?: boolean;
  placeholder?: string;
  type?: string;
  maxLength?: number;
}) {
  return (
    <div className={wide ? 'sm:col-span-2' : ''}>
      <label htmlFor={name} className={labelClass}>{label}</label>
      <input id={name} name={name} type={type} defaultValue={defaultValue} placeholder={placeholder} maxLength={maxLength} className={inputClass} />
    </div>
  );
}

export default function CompanyForm({ profile, uploadsEnabled }: { profile: CompanyProfile; uploadsEnabled: boolean }) {
  const router = useRouter();
  const [aboutImage, setAboutImage] = useState<ContentImage[]>(profile.about.image ? [profile.about.image] : []);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const value = (key: string) => String(form.get(key) ?? '');
    const payload: CompanyProfile = {
      name: value('name'),
      description: value('description'),
      phone: value('phone'),
      whatsapp: value('whatsapp'),
      whatsappMessage: value('whatsappMessage'),
      email: value('email'),
      hoursWeekdays: value('hoursWeekdays'),
      hoursSaturday: value('hoursSaturday'),
      address: {
        street: value('address.street'),
        district: value('address.district'),
        city: value('address.city'),
        state: value('address.state').toUpperCase(),
        zip: value('address.zip'),
      },
      socials: {
        instagram: value('socials.instagram'),
        facebook: value('socials.facebook'),
        youtube: value('socials.youtube'),
        tiktok: value('socials.tiktok'),
        linkedin: value('socials.linkedin'),
      },
      about: {
        title: value('about.title'),
        text: value('about.text'),
        years: value('about.years'),
        projects: value('about.projects'),
        clients: value('about.clients'),
        image: aboutImage[0] ? { url: aboutImage[0].url, publicId: aboutImage[0].publicId, type: aboutImage[0].type ?? 'image' } : null,
      },
    };

    setError('');
    setSaved(false);
    setIsSaving(true);
    const response = await fetch('/api/portal/company', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (response.ok) {
      setSaved(true);
      router.refresh();
    } else {
      setError(await readError(response, 'Não foi possível salvar.'));
    }
    setIsSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} onChange={() => setSaved(false)} className="space-y-6">
      <Section icon={Building2} title="Identidade" description="Nome e apresentação que aparecem no rodapé do site.">
        <Field label="Nome da empresa" name="name" defaultValue={profile.name} maxLength={80} />
        <div className="sm:col-span-2">
          <label htmlFor="description" className={labelClass}>Descrição curta</label>
          <textarea id="description" name="description" rows={3} maxLength={400} defaultValue={profile.description} className={inputClass} />
        </div>
      </Section>

      <Section icon={MessageCircle} title="Contato" description="Usados nos botões de WhatsApp, no rodapé e no botão flutuante.">
        <Field label="Telefone" name="phone" defaultValue={profile.phone} placeholder="(48) 3333-3333" />
        <Field label="WhatsApp" name="whatsapp" defaultValue={profile.whatsapp} placeholder="(48) 99999-9999" />
        <Field label="Mensagem inicial do WhatsApp" name="whatsappMessage" defaultValue={profile.whatsappMessage} wide maxLength={200} />
        <Field label="E-mail" name="email" type="email" defaultValue={profile.email} wide />
      </Section>

      <Section icon={Clock} title="Horário de atendimento" description="Exibido no rodapé.">
        <Field label="Dias úteis" name="hoursWeekdays" defaultValue={profile.hoursWeekdays} placeholder="Seg a Sex: 08h às 18h" />
        <Field label="Sábado" name="hoursSaturday" defaultValue={profile.hoursSaturday} placeholder="Sábado: 08h às 12h" />
      </Section>

      <Section icon={MapPin} title="Endereço" description="Aparece no rodapé e define o ponto do mapa.">
        <Field label="Rua e número" name="address.street" defaultValue={profile.address.street} wide />
        <Field label="Bairro" name="address.district" defaultValue={profile.address.district} />
        <Field label="Cidade" name="address.city" defaultValue={profile.address.city} />
        <Field label="Estado (UF)" name="address.state" defaultValue={profile.address.state} maxLength={2} />
        <Field label="CEP" name="address.zip" defaultValue={profile.address.zip} />
      </Section>

      <Section icon={Instagram} title="Redes sociais" description="Cole o link completo do perfil. Redes em branco não aparecem no site.">
        {[
          { key: 'instagram', label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/mhtmarmoraria' },
          { key: 'facebook', label: 'Facebook', icon: Facebook, placeholder: 'https://facebook.com/...' },
          { key: 'youtube', label: 'YouTube', icon: Youtube, placeholder: 'https://youtube.com/@...' },
          { key: 'tiktok', label: 'TikTok', icon: Music2, placeholder: 'https://tiktok.com/@...' },
          { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/company/...' },
        ].map(({ key, label, icon: Icon, placeholder }) => (
          <div key={key}>
            <label htmlFor={`socials.${key}`} className={`${labelClass} flex items-center gap-1.5`}>
              <Icon size={12} /> {label}
            </label>
            <input
              id={`socials.${key}`}
              name={`socials.${key}`}
              type="url"
              placeholder={placeholder}
              defaultValue={profile.socials[key as keyof CompanyProfile['socials']]}
              className={inputClass}
            />
          </div>
        ))}
      </Section>

      <Section icon={Sparkles} title="Seção Sobre" description="Texto, números e foto da seção Sobre da página inicial.">
        <Field label="Título" name="about.title" defaultValue={profile.about.title} wide maxLength={120} />
        <div className="sm:col-span-2">
          <label htmlFor="about.text" className={labelClass}>Texto (deixe uma linha em branco entre parágrafos)</label>
          <textarea id="about.text" name="about.text" rows={6} maxLength={2000} defaultValue={profile.about.text} className={inputClass} />
        </div>
        <div className="grid gap-4 sm:col-span-2 sm:grid-cols-3">
          <Field label="Anos de experiência" name="about.years" defaultValue={profile.about.years} placeholder="15" />
          <Field label="Projetos entregues" name="about.projects" defaultValue={profile.about.projects} placeholder="500" />
          <Field label="Clientes atendidos" name="about.clients" defaultValue={profile.about.clients} placeholder="200" />
        </div>
        <div className="sm:col-span-2">
          <p className={labelClass}>Foto ou vídeo da seção</p>
          <ImageUploader images={aboutImage} onChange={setAboutImage} uploadsEnabled={uploadsEnabled} max={1} />
        </div>
      </Section>

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-[#0d0c0a]/90 p-4 backdrop-blur">
        <button type="submit" disabled={isSaving} className={primaryButtonClass}>
          {isSaving ? 'Salvando...' : 'Salvar alterações'}
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-emerald-300" role="status">
            <Check size={15} /> Salvo. O site já foi atualizado.
          </span>
        )}
        {error && <span className="text-sm text-red-300" role="alert">{error}</span>}
      </div>
    </form>
  );
}
