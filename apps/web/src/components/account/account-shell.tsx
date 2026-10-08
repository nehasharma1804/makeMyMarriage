import Link from 'next/link';
import type { ReactNode } from 'react';
import styles from './account.module.css';

export function AccountShell({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand}>
          <span className={styles.mark} aria-hidden="true">
            ∞
          </span>
          Make My Marriage
        </Link>
        <Link href="/demo" className={styles.headerLink}>
          Explore a sample wedding ↗
        </Link>
      </header>
      <main id="main-content" className={styles.main}>
        {children}
      </main>
    </div>
  );
}

export function ConnectionNotice() {
  return (
    <AccountShell>
      <div className={styles.center}>
        <p className={styles.eyebrow}>Let’s reconnect</p>
        <h1 className={styles.title}>We couldn’t open your workspace.</h1>
        <p className={styles.copy}>
          Please try again shortly. Your wedding details haven’t been changed.
        </p>
        <Link href="/login" className={styles.button}>
          Back to sign-in
        </Link>
      </div>
    </AccountShell>
  );
}
