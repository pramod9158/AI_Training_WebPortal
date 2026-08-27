import type { Metadata } from 'next';
import { Space_Grotesk, Inter } from 'next/font/google';
import './globals.css';
import { ClientAppWrapper } from '@/components/ClientAppWrapper';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Waynautic Academy | AI & Software Engineering Mastery',
  description: 'Production-ready AI & dev skills platform teaching LLMs, Prompt Engineering, Model APIs, AI IDEs, Local AI, Vector DBs, and RAG systems.',
  openGraph: {
    title: 'Waynautic Academy - AI & Dev Skills',
    description: 'Learn AI engineering, Python, Git, Vector Databases, and RAG pipelines.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased min-h-screen flex flex-col selection:bg-cyan-500 selection:text-black">
        <ClientAppWrapper>{children}</ClientAppWrapper>
      </body>
    </html>
  );
}
