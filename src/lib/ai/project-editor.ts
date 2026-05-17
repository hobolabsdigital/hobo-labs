import { RAGChunk } from './types';
import projectsDbRaw from '../../../docs/projects-vector-db.json';

const projectsDb = projectsDbRaw as RAGChunk[];

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

/**
 * Build image paths from slug-based naming convention.
 *
 * Convention:
 *   Hero:    /portfolio/{slug}-01.png  (or /portfolio/{slug}.png if no gallery)
 *   Gallery: /portfolio/{slug}-01.png … /portfolio/{slug}-{nn}.png
 *
 * galleryCount is stored in the vector DB metadata.
 */
function buildImagePaths(slug: string, galleryCount: number) {
  if (galleryCount > 0) {
    const gallery = Array.from({ length: galleryCount }, (_, i) =>
      `/portfolio/${slug}-${String(i + 1).padStart(2, '0')}.png`
    );
    return { hero: gallery[0], gallery };
  }

  // Fallback for projects with only a hero placeholder (e.g. editorial-canvas, hermes)
  return { hero: `/portfolio/${slug}.png`, gallery: [] };
}

export function getProjectStaticData(slug: string) {
  const chunk = findProjectBySlug(slug);
  if (!chunk) return null;

  const galleryCount = (chunk.metadata?.galleryCount as number) ?? 0;
  const { hero, gallery } = buildImagePaths(slug, galleryCount);

  return {
    title: chunk.metadata?.title,
    year: chunk.metadata?.year,
    role: chunk.metadata?.role,
    techStack: chunk.metadata?.techStack,
    image: hero,
    gallery,
    _rawContent: chunk.content, // Used for context generation later
    isContextStreaming: true, // Flag for the UI
  };
}
