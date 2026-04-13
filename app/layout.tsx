import type { Metadata, Viewport } from 'next';
import '@azelenets/aegis-design-system/globals.css';
import './globals.css';
import { jetBrainsMono, orbitron } from '@/lib/fonts';

export const metadata: Metadata = {
  applicationName: 'SPECTER-LINK',
  title: {
    default: 'SPECTER-LINK // Secure P2P Channel',
    template: '%s | SPECTER-LINK',
  },
  description:
    'Browser-native, peer-to-peer video, audio, and text chat. No accounts, no server-side data storage. All communication happens directly between peers via WebRTC.',
  keywords: ['WebRTC', 'peer-to-peer', 'chat', 'video call', 'audio call', 'screen share', 'privacy'],
  openGraph: {
    title: 'SPECTER-LINK // Secure P2P Channel',
    description:
      'Browser-native, peer-to-peer video, audio, and text chat with no accounts and no server-side data storage.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'SPECTER-LINK // Secure P2P Channel',
    description:
      'Browser-native, peer-to-peer video, audio, and text chat with no accounts and no server-side data storage.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#020617',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${orbitron.variable} ${jetBrainsMono.variable}`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
