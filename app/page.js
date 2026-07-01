import Header from '@/components/Header';
import Hero from '@/components/Hero';
import StatsBar from '@/components/StatsBar';
import ProjectsGallery from '@/components/ProjectsGallery';
import Materials from '@/components/Materials';
import HowItWorks from '@/components/HowItWorks';
import WhyChooseUs from '@/components/WhyChooseUs';
import Footer from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import ScrollReveal from '@/components/ScrollReveal';

export default function Home() {
  return (
    <main>
      <Header />
      <ScrollReveal delay={0}><Hero /></ScrollReveal>
      <ScrollReveal delay={80}><StatsBar /></ScrollReveal>
      <ScrollReveal delay={120}><ProjectsGallery /></ScrollReveal>
      <ScrollReveal delay={140}><Materials /></ScrollReveal>
      <ScrollReveal delay={160}><HowItWorks /></ScrollReveal>
      <ScrollReveal delay={180}><WhyChooseUs /></ScrollReveal>
      <ScrollReveal delay={200}><Footer /></ScrollReveal>
      <WhatsAppFloat />
    </main>
  );
}
