import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Recipe Catalog',
    short_name: 'Recipes',
    description: 'A personal recipe catalog',
    start_url: '/',
    display: 'standalone',
    background_color: '#FDF6EC',
    theme_color: '#D4734A',
    icons: [
      { src: '/icon', sizes: '32x32', type: 'image/png' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  }
}
