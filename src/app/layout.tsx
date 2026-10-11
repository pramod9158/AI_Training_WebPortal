import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import './globals.css';
import { ClientAppWrapper } from '@/components/ClientAppWrapper';

// Waynautic brand font — used for both headings and body
const manropeHeading = Manrope({
  subsets: ['latin'],
  variable: '--font-heading',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const manropeBody = Manrope({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'Waynautic Academy | AI & Software Engineering Mastery',
  description: 'Production-ready AI & dev skills platform teaching LLMs, Prompt Engineering, Model APIs, AI IDEs, Local AI, Vector DBs, and RAG systems.',
  icons: {
    icon: [
      { url: '/Waynautic%20Logo%20Icon%20Only.png', type: 'image/png' },
    ],
    shortcut: '/Waynautic%20Logo%20Icon%20Only.png',
    apple: '/Waynautic%20Logo%20Icon%20Only.png',
  },
  openGraph: {
    title: 'Waynautic Academy - AI & Dev Skills',
    description: 'Learn AI engineering, Python, Git, Vector Databases, and RAG pipelines.',
    type: 'website',
  },
};

import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manropeHeading.variable} ${manropeBody.variable}`} suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" href="/Waynautic%20Logo%20Icon%20Only.png" />
        <link rel="shortcut icon" type="image/png" href="/Waynautic%20Logo%20Icon%20Only.png" />
        <link rel="apple-touch-icon" href="/Waynautic%20Logo%20Icon%20Only.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('waynautic_theme');
                if (t === 'dark') {
                  document.documentElement.classList.add('dark');
                } else if (t === 'light') {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased min-h-screen flex flex-col selection:bg-cyan-500 selection:text-black w-full max-w-full overflow-x-hidden">
        <ClientAppWrapper>{children}</ClientAppWrapper>
        <Analytics />
      </body>
    </html>
  );
}
