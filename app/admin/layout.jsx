// app/admin/layout.jsx — owners' statistics dashboard (never indexed by search engines).

import './admin.css';

export const metadata = {
  title: 'სტატისტიკა – მაუწყებელი',
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }) {
  return <div className="admin-root">{children}</div>;
}
