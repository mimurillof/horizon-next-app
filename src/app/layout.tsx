import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import BackgroundAnimation from '@/components/BackgroundAnimation';
import { StagewiseToolbar } from '@stagewise/toolbar-next';
import { ReactPlugin } from '@stagewise-plugins/react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Horizon App',
  description: 'Gestiona tus portafolios de inversión',
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" />
      </head>
      <body className={inter.className}>
        <BackgroundAnimation />
        <main className="min-h-screen flex items-center justify-center p-4">
          {children}
        </main>
        <StagewiseToolbar config={{ plugins: [ReactPlugin] }} />
      </body>
    </html>
  );
}
