import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Who Gets Cooled? | Urban Heat AI Decision Sandbox',
  description:
    'An explainable urban heat decision sandbox comparing policy priorities and AI-identified vulnerability profiles in Brussels and Amsterdam.',
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
