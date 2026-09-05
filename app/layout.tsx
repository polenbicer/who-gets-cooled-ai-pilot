import type { Metadata } from 'next';
import './globals.css';

const siteUrl = 'https://cooling.polenbicer.dev';
const siteTitle = 'Who Gets Cooled? | Urban Heat Policy Simulation';
const siteDescription =
  'An interactive urban heat policy and climate justice simulation comparing how public cooling priorities affect neighbourhoods in Brussels, Amsterdam, Istanbul and Izmir.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: 'Who Gets Cooled?',
  title: siteTitle,
  description: siteDescription,
  keywords: [
    'urban heat policy',
    'urban cooling policy',
    'urban heat inequality',
    'climate justice',
    'environmental justice',
    'heat vulnerability',
    'neighbourhood cooling',
    'public cooling investment',
    'Brussels urban heat',
    'Amsterdam urban heat',
    'Istanbul urban heat',
    'Izmir urban heat',
  ],
  authors: [{ name: 'Polen Biçer', url: 'https://polenbicer.dev' }],
  creator: 'Polen Biçer',
  publisher: 'Polen Biçer',
  category: 'Urban Studies',
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: siteUrl,
    siteName: 'Who Gets Cooled?',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: siteTitle,
    description: siteDescription,
  },
};

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Who Gets Cooled?',
  alternateName: 'Who Gets Cooled? Urban Heat Policy Simulation',
  url: siteUrl,
  description: siteDescription,
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'Any',
  inLanguage: 'en',
  author: {
    '@type': 'Person',
    name: 'Polen Biçer',
    url: 'https://polenbicer.dev',
  },
  about: [
    { '@type': 'Thing', name: 'Urban heat policy' },
    { '@type': 'Thing', name: 'Climate justice' },
    { '@type': 'Thing', name: 'Environmental justice' },
    { '@type': 'Thing', name: 'Heat vulnerability' },
  ],
  spatialCoverage: ['Brussels', 'Amsterdam', 'Istanbul', 'Izmir'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </body>
    </html>
  );
}
