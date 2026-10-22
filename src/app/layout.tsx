import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
  weight: ['500', '600', '700'],
});

/**
 * Canonical origin of the deployed site. Used to build absolute URLs for
 * OpenGraph/Twitter cards and the canonical link tag. Falls back to the Vercel
 * preview/production URL when the explicit variable is absent, and finally to a
 * relative base so local development never warns.
 */
const SITE_URL: string | undefined =
  process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, '') ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);

const SITE_NAME = 'Doctor Tracker';
const SITE_DESCRIPTION =
  'A secure admin portal for managing doctors and patients: directory, records, analytics and audit-friendly workflows.';

export const metadata: Metadata = {
  metadataBase: SITE_URL ? new URL(SITE_URL) : undefined,
  title: {
    default: SITE_NAME,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  // The portal is private — no search-engine indexing.
  robots: { index: false, follow: false },
  // Explicit icon declarations: the SVG in this directory doubles as the
  // favicon, with a shortcut entry for older clients.
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
    shortcut: '/icon.svg',
  },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#05070f' },
    { media: '(prefers-color-scheme: light)', color: '#f4f6fb' },
  ],
};

/**
 * Applies the persisted theme before hydration to avoid a flash of the wrong
 * colour scheme. Kept intentionally tiny and synchronous.
 */
const themeBootstrap = `(function(){try{var t=localStorage.getItem('dt-theme');document.documentElement.setAttribute('data-theme',t==='light'?'light':'dark');}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
