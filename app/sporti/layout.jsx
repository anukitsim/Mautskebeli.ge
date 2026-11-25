import '../../node_modules/alk-tall-mtavruli/css/alk-tall-mtavruli.css';

export const metadata = {
  title: 'სპორტი',
  description: 'მაუწყებელი სპორტი, სტატიები და ვიდეოები',
};

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
