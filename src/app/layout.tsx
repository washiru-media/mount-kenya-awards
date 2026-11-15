import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'MOUNT KENYA AWARDS', description: 'Celebrate excellence. Discover nominees and cast your vote.' };
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><body>{children}</body></html>;
}
