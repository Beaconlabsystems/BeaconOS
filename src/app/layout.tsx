import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Beacon OS - Founder Cockpit',
  description: 'Your guiding light to ambitious goals. A premium founder cockpit for tracking vision, roadmap, and daily progress.',
  keywords: ['founder', 'startup', 'productivity', 'goal tracking', 'vision board'],
  authors: [{ name: 'Beacon Labs' }],
  openGraph: {
    title: 'Beacon OS - Founder Cockpit',
    description: 'Your guiding light to ambitious goals',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
