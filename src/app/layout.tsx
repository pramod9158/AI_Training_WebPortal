import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ClientAppWrapper } from '@/components/ClientAppWrapper';
import { Analytics } from '@vercel/analytics/react';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'Waynautic Academy | AI & Software Engineering Mastery',
  description:
    'Production-ready AI & dev skills platform teaching LLMs, Prompt Engineering, Model APIs, AI IDEs, Local AI, Vector DBs, and RAG systems.',
  icons: {
    icon:     [{ url: '/Waynautic%20Logo%20Icon%20Only.png', type: 'image/png' }],
    shortcut: '/Waynautic%20Logo%20Icon%20Only.png',
    apple:    '/Waynautic%20Logo%20Icon%20Only.png',
  },
  openGraph: {
    title:       'Waynautic Academy - AI & Dev Skills',
    description: 'Learn AI engineering, Python, Git, Vector Databases, and RAG pipelines.',
    type:        'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Waynautic Design System §3.1 – Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap"
          rel="stylesheet"
        />

        <link rel="icon"             type="image/png" href="/Waynautic%20Logo%20Icon%20Only.png" />
        <link rel="shortcut icon"    type="image/png" href="/Waynautic%20Logo%20Icon%20Only.png" />
        <link rel="apple-touch-icon"                  href="/Waynautic%20Logo%20Icon%20Only.png" />

        {/* Theme: apply dark class before paint to avoid flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('waynautic_theme');
                if (t === 'dark') { document.documentElement.classList.add('dark'); }
                else if (t === 'light') { document.documentElement.classList.remove('dark'); }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col w-full max-w-full overflow-x-hidden">
        <ClientAppWrapper>{children}</ClientAppWrapper>
        <Analytics />
      </body>
    </html>
  );
}
