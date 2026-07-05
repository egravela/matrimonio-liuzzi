import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Great_Vibes } from 'next/font/google';
import InstallPrompt from '@/components/InstallPrompt';
import RegisterSW from '@/components/RegisterSW';
import TabBar from '@/components/TabBar';
import { SPLASH_SCREENS } from '../scripts/lib/splash-sizes.mjs';
import './globals.css';

// iOS mostra una vera splash screen a schermo intero se gliene forniamo una
// per ogni risoluzione; Android invece genera sempre e solo icona + colore
// di sfondo del manifest, senza possibilità di personalizzazione.
const startupImages = SPLASH_SCREENS.map(({ file, width, height, ratio }) => ({
  url: `/splash/${file}`,
  media: `(device-width: ${width}px) and (device-height: ${height}px) and (-webkit-device-pixel-ratio: ${ratio}) and (orientation: portrait)`,
}));

const greatVibes = Great_Vibes({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-great-vibes',
});

const cormorant = Cormorant_Garamond({
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-cormorant',
});

export const metadata: Metadata = {
  title: 'Elena & Tommaso — 19 settembre 2026',
  description:
    'Condividi le tue foto e i tuoi video del matrimonio di Elena e Tommaso, Parco di Montebello, 19 settembre 2026.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Elena & Tommaso',
    startupImage: startupImages,
  },
  icons: {
    apple: '/icons/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#98a37b',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${greatVibes.variable} ${cormorant.variable}`}>
      <body>
        {children}
        <TabBar />
        <InstallPrompt />
        <RegisterSW />
      </body>
    </html>
  );
}
