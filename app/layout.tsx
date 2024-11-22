import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { NavBarWrapper } from 'components/nav-bar-wrapper';
import { AuthProvider } from 'contexts/auth-context';
import { Toaster } from 'components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Admin Panel',
  description: 'Admin panel for managing companies',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <NavBarWrapper />
          <main className="container mx-auto p-4 md:p-10">
            {children}
          </main>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
