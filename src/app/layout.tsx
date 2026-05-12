import type { Metadata } from "next";
import { Space_Mono, Inter } from "next/font/google";
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
    <html lang="en" className={`${spaceMono.variable} ${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
      </head>
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <div className="fixed top-8 left-8 z-[100] pointer-events-none mix-blend-difference">
            <Logo className="w-40 h-auto text-white" />
          </div>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
