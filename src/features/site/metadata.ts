import type { Metadata } from 'next';
import { CONTACT, SHEETS, type Sheet } from './content';

export const SITE_URL = 'https://hobolabs.digital';
export const SITE_NAME = 'Hobo Labs';
export const SITE_TITLE = `${CONTACT.name} — Creative Technologist & Senior Engineer`;
export const SITE_DESCRIPTION = SHEETS[0].description;

/**
 * One share card for the whole set. A plain file rather than the
 * opengraph-image convention, which never reaches a page that restates
 * openGraph — and every sheet does.
 */
export const SITE_IMAGE = {
  url: '/og.png',
  type: 'image/png',
  width: 1200,
  height: 630,
  alt: 'Emile Harmel — “A thousand frames. Ten on brand. I build the filter.” over a marbled cobalt-and-red generative field, with a blueprint loupe measuring it.',
};

/**
 * A sheet's own metadata. Next merges metadata shallowly, so a page that sets
 * openGraph or twitter replaces the layout's whole object — restate it all.
 * The front page (sheet 01) keeps the full site title; the rest go through
 * the layout's title template.
 */
export function sheetMetadata(sheet: Sheet): Metadata {
  const front = sheet.href === '/';
  const title = front ? SITE_TITLE : `${sheet.label} — ${CONTACT.name}`;
  return {
    title: front ? { absolute: SITE_TITLE } : sheet.label,
    description: sheet.description,
    alternates: { canonical: sheet.href },
    openGraph: {
      type: 'website',
      url: sheet.href,
      siteName: SITE_NAME,
      title,
      description: sheet.description,
      images: [SITE_IMAGE],
    },
    twitter: { card: 'summary_large_image', title, description: sheet.description, images: [SITE_IMAGE] },
  };
}
