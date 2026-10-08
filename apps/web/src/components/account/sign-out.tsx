'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiRequestError, requestApi } from '@/lib/api-client';
import styles from './account.module.css';

export function SignOut({ csrfToken }: { csrfToken: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  async function signOut() {
    setBusy(true);
    try {
      await requestApi('auth/logout', {
        method: 'POST',
        headers: { 'x-csrf-token': csrfToken },
        body: '{}',
      });
      router.replace('/login');
      router.refresh();
    } catch (failure) {
      if (failure instanceof ApiRequestError && failure.status === 401) {
        router.replace('/login');
        router.refresh();
        return;
      }
      setBusy(false);
      setError('We couldn’t sign you out. Please try again.');
    }
  }
  return (
    <div>
      <button
        type="button"
        disabled={busy}
        onClick={signOut}
        className={`${styles.button} ${styles.secondary}`}
      >
        {busy ? 'Signing out…' : 'Sign out'}
      </button>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
