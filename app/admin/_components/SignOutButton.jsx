'use client';

import { signOut } from 'next-auth/react';

export default function SignOutButton() {
  return (
    <button type="button" className="btn-link" onClick={() => signOut({ callbackUrl: '/admin/login' })}>
      გასვლა
    </button>
  );
}
