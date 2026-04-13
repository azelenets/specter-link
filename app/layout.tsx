import type { Metadata } from 'next';
import '@azelenets/aegis-design-system/globals.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'SPECTER-LINK // Secure P2P Channel',
  description:
    'Browser-native, peer-to-peer video, audio, and text chat. No accounts, no server-side data storage. All communication happens directly between peers via WebRTC.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        {/* Material Symbols — required by AEGIS design-system icon components */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
