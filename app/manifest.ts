import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SPECTER-LINK // Secure P2P Channel',
    short_name: 'SPECTER-LINK',
    description:
      'Browser-native, peer-to-peer video, audio, and text chat with no accounts and no server-side message storage.',
    start_url: '/',
    display: 'standalone',
    background_color: '#020617',
    theme_color: '#020617',
    icons: [
      {
        src: '/icon.svg',
        type: 'image/svg+xml',
        sizes: 'any',
      },
    ],
  };
}
