import '../../style/globals.css'
import '../../node_modules/alk-tall-mtavruli/css/alk-tall-mtavruli.css';
import { Noto_Sans_Georgian } from '@next/font/google';

const notoSansGeorgian = Noto_Sans_Georgian({
  subsets: ['georgian'],
  display: 'swap',
  variable: '--font-noto-sans-georgian',
});

export const metadata = {
  title: 'მაუწყებელი',
  description: 'მედია პლათფორმა მაუწყებელი',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={notoSansGeorgian.variable}>
      <body>{children}</body>
    </html>
  );
}
