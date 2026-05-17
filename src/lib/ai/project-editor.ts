import { RAGChunk } from './types';
import projectsDbRaw from '../../../docs/projects-vector-db.json';

const projectsDb = projectsDbRaw as RAGChunk[];

const PORTFOLIO_FILES = [
  'Find-My-Mazda-01.png', 'Find-My-Mazda-02.png', 'Find-My-Mazda-03.png', 'Find-My-Mazda-04.png',
  'Innovation-Summit-01.png', 'Innovation-Summit-02.png', 'Innovation-Summit-03.png', 'Innovation-Summit-04.png', 'Innovation-Summit-05.png', 'Innovation-Summit-06.png',
  'Monstory-01.png', 'Monstory-02.png', 'Monstory-03.png', 'Monstory-04.png', 'Monstory-05.png',
  'Oceana-01.png', 'Oceana-02.png',
  'Wagner-Piza-01.png', 'Wagner-Piza-02.png',
  'Woozle-Goozle-01.png', 'Woozle-Goozle-02.png',
  'Xitrust-Moxis-01.png', 'Xitrust-Moxis-02.png', 'Xitrust-Moxis-03.png', 'Xitrust-Moxis-04.png',
  'epa.png', 'find-my-mazda.png', 'monstory.png', 'moxis.png', 'my-mazda.png', 'nestle-wagner.png', 'oceana.png', 'woozle-goozle.png'
];

/**
 * Look up a project from the vector DB by slug.
 * Tries exact match first, then fuzzy title-based matching.
 */
function findProjectBySlug(slug: string): RAGChunk | null {
  const normalized = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');

  // Exact slug match
  let chunk = projectsDb.find(
    (c: RAGChunk) => (c.metadata?.slug || '').toLowerCase() === normalized,
  );

  // Fuzzy title match
  if (!chunk) {
    chunk = projectsDb.find((c: RAGChunk) => {
      const titleSlug = (c.metadata?.title || '')
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      return (
        titleSlug === normalized ||
        titleSlug.includes(normalized) ||
        normalized.includes(titleSlug)
      );
    });
  }

  return chunk ?? null;
}

export function getProjectStaticData(slug: string) {
  const chunk = findProjectBySlug(slug);
  if (!chunk) return null;

  const files = PORTFOLIO_FILES;
  
  const slugLower = slug.toLowerCase();
  const exactMain = files.find(f => f.toLowerCase() === `${slugLower}.png`);
  
  const searchKey = slugLower.replace(/-/g, '');
  const searchTokens = slugLower.split('-');
  const fallbackToken = searchTokens[searchTokens.length - 1]; // e.g. "wagner" for "nestle-wagner"
  
  const relatedFiles = files.filter(f => {
    const normalizedF = f.toLowerCase().replace(/-/g, '');
    return (normalizedF.includes(searchKey) || normalizedF.includes(fallbackToken)) && f.match(/\.(png|jpg|jpeg)$/i);
  });

  return {
    title: chunk.metadata?.title,
    year: chunk.metadata?.year,
    role: chunk.metadata?.role,
    techStack: chunk.metadata?.techStack,
    image: exactMain ? `/portfolio/${exactMain}` : null,
    gallery: relatedFiles.filter(f => f !== exactMain).map(f => `/portfolio/${f}`),
    _rawContent: chunk.content, // Used for context generation later
    isContextStreaming: true, // Flag for the UI
  };
}
