'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';

export default function LoginButtons({ google, dev }) {
  const [email, setEmail] = useState('');

  return (
    <div className="card">
      {google && (
        <button
          type="button"
          className="btn btn-primary"
          style={{ width: '100%' }}
          onClick={() => signIn('google', { callbackUrl: '/admin/stats' })}
        >
          შესვლა Google-ით
        </button>
      )}

      {dev && (
        <form
          style={{ marginTop: google ? 20 : 0 }}
          onSubmit={(e) => {
            e.preventDefault();
            signIn('dev-login', { email, callbackUrl: '/admin/stats' });
          }}
        >
          <label className="field">
            <span>ელფოსტა (მხოლოდ ლოკალური ტესტისთვის)</span>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <button type="submit" className="btn" style={{ width: '100%' }}>
            ტესტური შესვლა
          </button>
          <p className="dev-note">ეს ფორმა მხოლოდ დეველოპერის კომპიუტერზე ჩანს. რეალურ საიტზე არ არსებობს.</p>
        </form>
      )}
    </div>
  );
}
