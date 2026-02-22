import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Life Command Center',
    short_name: 'CMD Center',
    description: 'Ton centre de controle cyberpunk personnel',
    start_url: '/life-command-center/',
    display: 'fullscreen',
    orientation: 'landscape',
    background_color: '#0a0a0f',
    theme_color: '#00d4ff',
    icons: [
      {
        src: '/life-command-center/icons/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
