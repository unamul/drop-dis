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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased relative`}>
        <div className="">{children}</div>
        <Toaster
          position="top-right"
          expand={false}
          richColors
          closeButton
          toastOptions={{
            className: 'professional-toast',
            style: {
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backdropFilter: 'blur(15px)',
              WebkitBackdropFilter: 'blur(15px)',
              border: '1px solid rgba(102, 126, 234, 0.3)',
              color: '#1f2937',
              fontWeight: '600',
              borderRadius: '16px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(102, 126, 234, 0.1)',
              padding: '18px',
              fontSize: '14px',
              maxWidth: '400px',
              minHeight: '60px',
              display: 'flex',
              alignItems: 'center',
              position: 'relative',
              overflow: 'hidden',
            },
          }}
        />
        <FHEVM />
      </body>
    </html>
  );
}
