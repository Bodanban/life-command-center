import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Life Command Center',
    short_name: 'CMD Center',
    description: 'Ton centre de controle cyberpunk personnel',
    start_url: '/',
    display: 'standalone',
    orientation: 'landscape',
    background_color: '#0a0a0f',
    theme_color: '#00d4ff',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
