import fs from 'fs';
import path from 'path';

/**
 * Look up a project from the vector DB by slug.
 * Tries exact match first, then fuzzy title-based matching.
 */
function findProjectBySlug(slug: string) {
  const projectsDbPath = path.join(process.cwd(), 'docs', 'projects-vector-db.json');
  if (!fs.existsSync(projectsDbPath)) return null;

  const projectsDb = JSON.parse(fs.readFileSync(projectsDbPath, 'utf8'));
  const normalized = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');

  // Exact slug match
  let chunk = projectsDb.find(
    (c: any) => (c.metadata?.slug || '').toLowerCase() === normalized,
  );

  // Fuzzy title match
  if (!chunk) {
    chunk = projectsDb.find((c: any) => {
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

  const portfolioDir = path.join(process.cwd(), 'public', 'portfolio');
  const files = fs.existsSync(portfolioDir) ? fs.readdirSync(portfolioDir) : [];
  
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
    title: chunk.metadata.title,
    year: chunk.metadata.year,
    role: chunk.metadata.role,
    techStack: chunk.metadata.techStack,
    image: exactMain ? `/portfolio/${exactMain}` : null,
    gallery: relatedFiles.filter(f => f !== exactMain).map(f => `/portfolio/${f}`),
    _rawContent: chunk.content, // Used for context generation later
    isContextStreaming: true, // Flag for the UI
  };
}
