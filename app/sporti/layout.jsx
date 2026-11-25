import { localizeMetadata } from '@/utils/i18n/metadata';
import '../../node_modules/alk-tall-mtavruli/css/alk-tall-mtavruli.css';

const metadataKa = {
  title: 'სპორტი',
  description: 'მაუწყებელი სპორტი, სტატიები და ვიდეოები',
};

// English pages get the English title (utils/i18n/metadata.js).
export function generateMetadata() {
  return localizeMetadata(metadataKa);
}

// The <html>, <body>, Google Analytics and LanguageProvider come from
// app/layout.js. A section layout must not add them again: a second
// <html> inside <body> breaks hydration, and a second AnalyticsPageView
// counts every visit twice.
export default function SportLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#AD88C6]">
      {children}
    </div>
  );
}
