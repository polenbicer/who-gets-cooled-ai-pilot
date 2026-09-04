import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://cooling.polenbicer.dev'),
  title: 'Who Gets Cooled? | Urban Heat AI Decision Sandbox',
  description:
    'An explainable urban heat decision sandbox comparing policy priorities and AI-identified vulnerability profiles in Brussels, Amsterdam, Istanbul and Izmir.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Who Gets Cooled? | Urban Heat AI Decision Sandbox',
    description:
      'Explore how urban heat policy priorities change who receives public cooling investment.',
    url: 'https://cooling.polenbicer.dev/',
    siteName: 'Who Gets Cooled?',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
