'use client';

// Marks this browser as an owner's device (see /api/reading/staff), so the
// owner's own article reading is never counted. Runs once per page view.

import { useEffect } from 'react';

export default function StaffMarker() {
  useEffect(() => {
    fetch('/api/reading/staff', { method: 'POST', credentials: 'same-origin' }).catch(() => {});
  }, []);
  return null;
}
