import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Toaster } from 'sonner';
import TattibekeChat from '@/components/chat/TattibekeChat';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: 'QazaqTamaq | Казахская агротехнологичная платформа',
  description: 'Платформа для покупки свежего казахстанского мяса и молочной продукции от местных фермеров',
  keywords: 'мясо, молочная продукция, казахстан, фермеры, оптовая торговля, маркетплейс',
  authors: [{ name: 'QazaqTamaq Team' }],
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-white text-gray-900">
        <Providers>
          <Navbar />
          {children}
          <TattibekeChat />
          <Toaster
            position="top-right"
            richColors
            toastOptions={{
              style: { fontFamily: "'Plus Jakarta Sans', sans-serif" },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}