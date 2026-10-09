import Header from '@/components/Header';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Services from '@/components/Services';
import ProjectsGallery from '@/components/ProjectsGallery';
import Materials from '@/components/Materials';
import HowItWorks from '@/components/HowItWorks';
import WhyChooseUs from '@/components/WhyChooseUs';
import Footer from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import ScrollReveal from '@/components/ScrollReveal';
import QuoteProvider from '@/components/quote/QuoteProvider';
import { getCompanyProfile } from '@/lib/company/repository';
import { getPublishedContent } from '@/lib/content/repository';

// Content changes from the portal revalidate this page immediately; this is only a safety net.
export const revalidate = 3600;

// Shape expected by the home components.
function toCard(item) {
  return {
    id: item.id,
    name: item.title,
    label: item.title,
    category: item.category,
    desc: item.summary,
    details: item.description,
    features: item.features,
    images: item.images,
  };
}

export default async function Home() {
  const [company, services, materials, cases, banners] = await Promise.all([
    getCompanyProfile(),
    getPublishedContent('service'),
    getPublishedContent('material'),
    getPublishedContent('case'),
    getPublishedContent('banner'),
  ]);

  return (
    <QuoteProvider whatsapp={company.whatsapp}>
    <main>
      <Header showServices={services.length > 0} />
      <ScrollReveal delay={0}>
        <Hero
          media={banners.flatMap((banner) => banner.images)}
          featured={cases[0] && { title: cases[0].title, eyebrow: cases[0].category || 'Case de sucesso', image: cases[0].images[0] }}
          projects={company.about.projects}
        />
      </ScrollReveal>
      <ScrollReveal delay={80}><About company={company} /></ScrollReveal>
      <ScrollReveal delay={100}><Services services={services.map(toCard)} /></ScrollReveal>
      <ScrollReveal delay={120}><ProjectsGallery projects={cases.map(toCard)} /></ScrollReveal>
      <ScrollReveal delay={140}><Materials materials={materials.map(toCard)} /></ScrollReveal>
      <ScrollReveal delay={160}><HowItWorks /></ScrollReveal>
      <ScrollReveal delay={180}><WhyChooseUs /></ScrollReveal>
      <ScrollReveal delay={200}><Footer company={company} /></ScrollReveal>
      <WhatsAppFloat />
    </main>
    </QuoteProvider>
  );
}
