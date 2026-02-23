import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Life Command Center',
  description: 'Your personal cyberpunk command dashboard',
  icons: {
    icon: '/life-command-center/icons/icon-192x192.png',
    apple: '/life-command-center/icons/icon-192x192.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#00d4ff',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="dark">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/life-command-center/sw.js', {
                    scope: '/life-command-center/'
                  });
                });
              }
            `,
          }}
        />
      </head>
      <body className="min-h-screen overflow-hidden bg-cyber-bg-deep">
        {children}
      </body>
    </html>
  );
}
