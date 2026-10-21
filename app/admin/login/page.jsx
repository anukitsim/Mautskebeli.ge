// app/admin/login/page.jsx — owners' login.

import { redirect } from 'next/navigation';
import { getAdminSession, isAuthConfigured, loginMethods } from '@/utils/stats/auth';
import LoginButtons from './LoginButtons';

export const dynamic = 'force-dynamic';

const ERRORS = {
  AccessDenied: 'ამ ელფოსტას სტატისტიკაზე წვდომა არ აქვს. მიმართეთ ადმინისტრატორს.',
  CredentialsSignin: 'ამ ელფოსტას სტატისტიკაზე წვდომა არ აქვს.',
};

export default async function LoginPage({ searchParams }) {
  if (await getAdminSession()) redirect('/admin/stats');

  const error = searchParams?.error;
  return (
    <div className="admin-wrap">
      <div className="center-box">
        <h1 className="page-title">მაუწყებელი · სტატისტიკა</h1>
        <p className="page-meta">შესვლა მხოლოდ მფლობელებისთვის.</p>

        {error && (
          <div className="notice error" role="alert">
            <strong>{ERRORS[error] || 'შესვლა ვერ მოხერხდა. სცადეთ თავიდან.'}</strong>
          </div>
        )}

        {isAuthConfigured() ? (
          <LoginButtons google={loginMethods.google} dev={loginMethods.dev} />
        ) : (
          <div className="notice">შესვლა ჯერ არ არის ჩართული (დეველოპერმა უნდა დააყენოს).</div>
        )}
      </div>
    </div>
  );
}
