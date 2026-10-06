import { Oswald, Inter } from 'next/font/google';
import './globals.css';

const oswald = Oswald({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-oswald',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  title: 'MHT Marmoraria | Mármores, Granitos e Quartzitos de Alto Padrão',
  description:
    'Mármores, granitos e quartzitos para projetos residenciais e comerciais de alto padrão. Fabricação própria e instalação especializada.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${oswald.variable} ${inter.variable}`}>
      <body className="font-sans antialiased bg-ink-950 text-stone-150">
        {children}
      </body>
    </html>
  );
}
