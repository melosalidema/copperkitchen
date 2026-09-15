import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import SmoothScroll from '@/components/SmoothScroll';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap'
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'Copper Kitchen | Bicester Restaurant (2014–2025)',
  description:
    'Copper Kitchen was a cosy bistro in the centre of Bicester serving freshly home-made food. Permanently closed on 26 October 2025 — this site is a tribute to its legacy.',
  metadataBase: new URL('https://copperkitchen.local')
};

const restaurantSchema = {
  '@context': 'https://schema.org',
  '@type': 'Restaurant',
  name: 'Copper Kitchen',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '75 Sheep Street',
    addressLocality: 'Bicester',
    addressRegion: 'Oxfordshire',
    postalCode: 'OX26 6JS',
    addressCountry: 'GB'
  },
  telephone: '+441869240877',
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 51.899632,
    longitude: -1.152961
  },
  servesCuisine: 'British',
  description:
    'Copper Kitchen was a cosy bistro in the centre of Bicester serving freshly home-made food at 75 Sheep Street from 2014. It permanently closed on 26 October 2025 — this website is preserved as a tribute to its legacy.'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="grain font-body antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantSchema) }}
        />
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
