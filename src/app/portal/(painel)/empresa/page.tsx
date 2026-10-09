import CompanyForm from '@/components/portal/CompanyForm';
import { getCompanyProfile } from '@/lib/company/repository';
import { missingCloudinaryConfig } from '@/lib/portal/config';

export default async function CompanyPage() {
  const profile = await getCompanyProfile();

  return (
    <>
      <div className="mb-8">
        <p className="font-display text-xs uppercase tracking-widest2 text-gold-300">Configurações</p>
        <h1 className="mt-1 font-display text-3xl uppercase tracking-wide text-stone-150">Perfil da empresa</h1>
        <p className="mt-1 text-sm text-stone-250">Contatos, endereço, redes sociais e a seção Sobre. Tudo o que salvar aqui aparece no site.</p>
      </div>
      <CompanyForm profile={profile} uploadsEnabled={missingCloudinaryConfig().length === 0} />
    </>
  );
}
