import type { Metadata } from "next";
import { Space_Mono, Inter, Saira_Condensed, Anton, Fraunces, Darker_Grotesque } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@wrksz/themes/next";
import { Logo } from '@/core/ui/Logo';

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  weight: ["400", "700"],
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const sairaCondensed = Saira_Condensed({
  variable: "--font-saira",
  weight: ["300", "400", "600", "800", "900"],
  subsets: ["latin"],
});

const anton = Anton({
  variable: "--font-brutalist",
  weight: ["400"],
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-retro",
  subsets: ["latin"],
});

const darkerGrotesque = Darker_Grotesque({
  variable: "--font-darker-grotesque",
  weight: ["400", "500", "700", "800"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Editorial Canvas Portfolio",
  description: "AI-powered experimental portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceMono.variable} ${inter.variable} ${sairaCondensed.variable} ${anton.variable} ${fraunces.variable} ${darkerGrotesque.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
      </head>
      <body className="min-h-full flex flex-col font-body bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange themes={['light', 'dark', 'blueprint', 'cyberpunk', 'brutalist', 'retro']}>
          <div className="fixed top-8 left-8 z-[100] pointer-events-none theme-logo-container">
            <Logo className="w-40 h-auto theme-logo" />
          </div>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
