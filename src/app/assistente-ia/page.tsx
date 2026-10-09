import AiAssistantPage from '@/components/ai/AiAssistantPage';
import { whatsappUrl } from '@/lib/company/profile';
import { getCompanyProfile } from '@/lib/company/repository';

export const metadata = {
  title: 'Assistente IA | MHT Marmoraria',
  description: 'Crie prévias conceituais do seu ambiente em pedra com o assistente de IA da MHT.',
};

export default async function AssistenteIaPage() {
  const company = await getCompanyProfile();
  return <AiAssistantPage whatsappHref={whatsappUrl(company)} />;
}
