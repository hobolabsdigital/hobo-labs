import type { Metadata, Viewport } from 'next';
import { Anton, Darker_Grotesque, Fraunces, Inter, Saira_Condensed, Space_Mono } from 'next/font/google';
import { SITE_DESCRIPTION, SITE_IMAGE, SITE_NAME, SITE_TITLE, SITE_URL } from '@/features/site/metadata';
import { DEFAULT_THEME, THEME_BOOT_SCRIPT } from '@/features/site/themes';
import './styles/tokens.css';
import './styles/base.css';
import './styles/hero.css';
import './styles/sections.css';
import './styles/closing.css';
import './styles/reel.css';
import './styles/orchestration.css';
import './styles/quest.css';
import './styles/motion.css';

// Blueprint (the default sheet) is all Space Mono, so it's the only face preloaded.
// The other themes' faces load the first time someone switches to them.
const spaceMono = Space_Mono({ variable: '--font-space-mono', weight: ['400', '700'], subsets: ['latin'] });
const anton = Anton({ variable: '--font-anton', weight: ['400'], subsets: ['latin'], preload: false });
const darker = Darker_Grotesque({
  variable: '--font-darker',
  weight: ['500', '600', '700'],
  subsets: ['latin'],
  preload: false,
});
const inter = Inter({ variable: '--font-inter', subsets: ['latin'], preload: false });
const saira = Saira_Condensed({
  variable: '--font-saira',
  weight: ['400', '500', '700', '800'],
  subsets: ['latin'],
  preload: false,
});
const fraunces = Fraunces({ variable: '--font-fraunces', subsets: ['latin'], preload: false });

const title = SITE_TITLE;
const description = SITE_DESCRIPTION;

// Each sheet restates its own openGraph/twitter (see sheetMetadata); these are the fallbacks.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: title, template: '%s — Emile Harmel' },
  description,
  authors: [{ name: 'Emile Harmel' }],
  keywords: [
    'Emile Harmel',
    'creative technologist',
    'senior software engineer',
    'agentic AI',
    'multi-agent orchestration',
    'TypeScript',
    'Next.js',
    'WebGL',
    'design systems',
    'Graz',
  ],
  openGraph: {
    type: 'website',
    url: '/',
    siteName: SITE_NAME,
    title,
    description,
    images: [SITE_IMAGE],
  },
  twitter: { card: 'summary_large_image', title, description, images: [SITE_IMAGE] },
};

export const viewport: Viewport = {
  themeColor: '#f0ede6',
};

export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const fonts = [spaceMono, anton, darker, inter, saira, fraunces].map((f) => f.variable).join(' ');
  return (
    // data-scroll-behavior: Next 16 no longer drops the CSS smooth scroll for route changes
    // unless asked, and a new sheet should land at its top, not glide there.
    <html
      lang="en"
      data-theme={DEFAULT_THEME}
      data-scroll-behavior="smooth"
      className={fonts}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
