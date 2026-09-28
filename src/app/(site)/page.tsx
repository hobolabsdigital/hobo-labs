import { CONTACT, TAPES } from '@/features/site/content';
import { Contact } from '@/features/site/components/Contact';
import { Hero } from '@/features/site/components/Hero';
import { Method } from '@/features/site/components/Method';
import { Monstoryx } from '@/features/site/components/Monstoryx';
import { Nav } from '@/features/site/components/Nav';
import { Nutrons } from '@/features/site/components/Nutrons';
import { Orchestration } from '@/features/site/components/Orchestration';
import { PageChrome } from '@/features/site/components/PageChrome';
import { Receipts } from '@/features/site/components/Receipts';
import { Tape } from '@/features/site/components/Tape';
import { Work } from '@/features/site/components/Work';

const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: CONTACT.name,
  jobTitle: 'Creative Technologist & Senior Software Engineer',
  email: `mailto:${CONTACT.email}`,
  url: 'https://hobolabs.digital',
  sameAs: [CONTACT.linkedin],
  address: { '@type': 'PostalAddress', addressLocality: 'Graz', addressCountry: 'AT' },
  knowsAbout: ['TypeScript', 'Next.js', 'Agentic AI systems', 'Generative image and video pipelines', 'Multi-agent orchestration', 'WebGL', 'Design systems'],
  worksFor: { '@type': 'Organization', name: 'MonstoryX' },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd).replace(/</g, '\\u003c') }}
      />
      <a className="skip" href="#receipts">
        Skip to content
      </a>
      <div className="scroll-meter" aria-hidden="true" />
      <Nav />
      <main>
        <Hero />
        <Receipts />
        <Nutrons />
        <Monstoryx />
        <Tape items={TAPES.method} />
        <Method />
        <Orchestration />
        <Work />
        <Tape items={TAPES.roles} reverse />
        <Contact />
      </main>
      <PageChrome />
    </>
  );
}
