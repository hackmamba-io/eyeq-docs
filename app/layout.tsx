import '@/app/global.css';
import { RootProvider } from 'fumadocs-ui/provider';
import { Inter } from 'next/font/google';

// Font loader must be called at module scope - Next.js requirement
const inter = Inter({ subsets: ['latin'] });

export default function Layout({ children }: LayoutProps<'/'>) {
  // Use system fonts for static export to avoid CORS issues with file:// protocol
  // For normal builds, use Google Fonts
  const fontClassName = process.env.EXPORT_STATIC === 'true' ? undefined : inter.className;
  
  return (
    <html lang="en" className={fontClassName} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
