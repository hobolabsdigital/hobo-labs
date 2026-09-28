import type { Metadata, Viewport } from 'next';
import { Anton, Darker_Grotesque, Fraunces, Inter, Saira_Condensed, Space_Mono } from 'next/font/google';
import { DEFAULT_THEME, THEME_BOOT_SCRIPT } from '@/features/site/themes';
import './styles/tokens.css';
import './styles/base.css';
import './styles/hero.css';
import './styles/sections.css';
import './styles/closing.css';

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

const title = 'Emile Harmel — Creative Technologist & Senior Engineer';
const description =
  'A thousand frames. Ten on brand. I build the filter. Agent pipelines for image, voice and video where code — not hope — decides what ships. Graz, CET.';

export const metadata: Metadata = {
  metadataBase: new URL('https://hobolabs.digital'),
  title,
  description,
  authors: [{ name: 'Emile Harmel' }],
  keywords: [
    'Emile Harmel',
    'creative technologist',
    'senior software engineer',
    'agentic AI',
    'TypeScript',
    'Next.js',
    'WebGL',
    'design systems',
    'Graz',
  ],
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'Hobo Labs',
    title,
    description,
  },
  twitter: { card: 'summary_large_image', title, description },
};

export const viewport: Viewport = {
  themeColor: '#f0ede6',
};

export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const fonts = [spaceMono, anton, darker, inter, saira, fraunces].map((f) => f.variable).join(' ');
  return (
    <html lang="en" data-theme={DEFAULT_THEME} className={fonts} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
