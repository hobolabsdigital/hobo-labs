import { Hero } from '@/features/site/components/Hero';
import { LatestWork } from '@/features/site/components/LatestWork';
import { Method } from '@/features/site/components/Method';
import { SiteShell } from '@/features/site/components/SiteShell';
import { CONTACT, sheet } from '@/features/site/content';
import { SITE_URL, sheetMetadata } from '@/features/site/metadata';

const SHEET = sheet('/');

export const metadata = sheetMetadata(SHEET);

const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: CONTACT.name,
  jobTitle: 'Creative Technologist & Senior Software Engineer',
  email: `mailto:${CONTACT.email}`,
  url: SITE_URL,
  sameAs: [CONTACT.linkedin],
  address: { '@type': 'PostalAddress', addressLocality: 'Graz', addressCountry: 'AT' },
  knowsAbout: ['TypeScript', 'Next.js', 'Agentic AI systems', 'Generative image and video pipelines', 'Multi-agent orchestration', 'WebGL', 'Design systems'],
  worksFor: { '@type': 'Organization', name: 'MonstoryX' },
};

/** Sheet 01, the general arrangement: who, the latest two products, how the work gets made. */
export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd).replace(/</g, '\\u003c') }}
      />
      <SiteShell sheet={SHEET} hero={<Hero />}>
        <LatestWork />
        <Method />
      </SiteShell>
    </>
  );
}
