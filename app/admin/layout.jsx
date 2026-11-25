// app/admin/layout.jsx — owners' statistics dashboard (never indexed by search engines).

import { localizeMetadata } from '@/utils/i18n/metadata';
import './admin.css';

const metadataKa = {
  title: 'სტატისტიკა – მაუწყებელი',
  robots: { index: false, follow: false, nocache: true },
};

// English pages get the English title (utils/i18n/metadata.js).
export function generateMetadata() {
  return localizeMetadata(metadataKa);
}

export default function AdminLayout({ children }) {
  return <div className="admin-root">{children}</div>;
}
