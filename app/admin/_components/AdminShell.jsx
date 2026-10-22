// app/admin/_components/AdminShell.jsx — header, navigation and page frame.

import Link from 'next/link';
import SignOutButton from './SignOutButton';
import { CONTENT_TYPES, TYPE_ORDER } from '@/utils/stats/content-types';

const NAV = [
  { key: 'overview', href: '/admin/stats', label: 'მიმოხილვა' },
  ...TYPE_ORDER.map((type) => ({ key: type, href: `/admin/stats/${type}`, label: CONTENT_TYPES[type].label })),
];

export default function AdminShell({ session, active, children }) {
  return (
    <div className="admin-wrap">
      <header className="admin-header">
        <Link href="/admin/stats" className="admin-brand">
          მაუწყებელი <span>· სტატისტიკა</span>
        </Link>
        <div className="admin-user">
          <span>{session.user.email}</span>
          <SignOutButton />
        </div>
      </header>
      <nav className="admin-nav" aria-label="სტატისტიკის განყოფილებები">
        {NAV.map((item) => (
          <Link key={item.key} href={item.href} aria-current={active === item.key ? 'page' : undefined}>
            {item.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}

export function PeriodChips({ basePath, period, extraQuery = '' }) {
  const options = [
    ['today', 'დღეს'],
    ['7d', '7 დღე'],
    ['30d', '30 დღე'],
    ['all', 'სულ'],
  ];
  return (
    <div className="chips" role="group" aria-label="პერიოდი">
      {options.map(([key, label]) => (
        <Link
          key={key}
          className="chip"
          href={`${basePath}?period=${key}${extraQuery}`}
          aria-current={period === key ? 'true' : undefined}
        >
          {label}
        </Link>
      ))}
    </div>
  );
}

export function NotConfigured() {
  return (
    <div className="notice error">
      <strong>სტატისტიკის ბაზა ჯერ არ არის ჩართული.</strong>
      <p style={{ margin: '6px 0 0' }}>
        დეველოპერმა უნდა დააყენოს STATS_DATABASE_URL და STATS_SECRET. სანამ ეს არ მოხდება, საიტზე არაფერი
        ითვლება და არაფერი იცვლება.
      </p>
    </div>
  );
}
