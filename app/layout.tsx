import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import FHEVM from '@/components/FHEVM';
import { Toaster } from 'sonner';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Drop Dis | Distribute Everything',
  description: 'Distribution powered by zama fhevm',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased `}>
        <Toaster
          toastOptions={{
            style: {
              background: 'red',
              color: 'white',
            },
          }}
        />
        <FHEVM />
        {children}
      </body>
    </html>
  );
}
