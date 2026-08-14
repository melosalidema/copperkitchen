import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
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
  title: 'Copper Kitchen | Bicester Restaurant',
  description:
    'Copper Kitchen was a cosy bistro in the centre of Bicester serving freshly home-made food, near Bicester Village. Now operating as Boca Tapas Bar and Grill.',
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
    'Copper Kitchen was a cosy bistro in the centre of Bicester serving freshly home-made food, near Bicester Village. It is permanently closed — the site at 75 Sheep Street now operates as Boca Tapas Bar and Grill (https://www.bocabicester.com/).'
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
        {children}
      </body>
    </html>
  );
}
