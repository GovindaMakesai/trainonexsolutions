import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { About } from '@/components/portfolio/About';
import { Contact } from '@/components/portfolio/Contact';
import { Hero } from '@/components/portfolio/Hero';
import { Services } from '@/components/portfolio/Services';
import { Work } from '@/components/portfolio/Work';
import { Seo } from '@/components/ui/Seo';
import { site } from '@/content/site';

export function HomePage() {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.slice(1);
    const timer = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
    return () => window.clearTimeout(timer);
  }, [location.hash]);

  return (
    <>
      <Seo
        title="Trainonex Solutions — Considered products. Reliable software."
        description={site.hero.summary}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'ProfessionalService',
          name: site.legalName,
          email: site.email,
          description: site.hero.summary,
          areaServed: 'Worldwide',
        }}
      />
      <Hero />
      <Work />
      <Services />
      <About />
      <Contact />
    </>
  );
}
