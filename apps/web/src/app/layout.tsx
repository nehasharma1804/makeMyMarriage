import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import localFont from 'next/font/local';
import './globals.css';

const jakarta = localFont({
  src: './fonts/plus-jakarta-sans.ttf',
  variable: '--font-jakarta',
  weight: '400 800',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Make My Marriage | Your wedding, beautifully organized',
    template: '%s | Make My Marriage',
  },
  description:
    'A shared planning space for Indian weddings. Bring your events, guests, family tasks, expenses, and wedding memories together.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body>{children}</body>
    </html>
  );
}
