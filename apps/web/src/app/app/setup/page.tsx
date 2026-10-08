import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import {
  AccountShell,
  ConnectionNotice,
} from '@/components/account/account-shell';
import { CreateWeddingForm } from '@/components/account/create-wedding-form';
import { SignOut } from '@/components/account/sign-out';
import { loadSession } from '@/lib/server-api';
import styles from '@/components/account/account.module.css';

export const metadata: Metadata = {
  title: 'Create your wedding',
  robots: { index: false, follow: false },
};

export default async function SetupPage() {
  const session = await loadSession();
  if (!session) return <ConnectionNotice />;
  if (!session.requiresWeddingSetup) redirect('/app/dashboard');
  return (
    <AccountShell>
      <div className={styles.formCard}>
        <p className={styles.eyebrow}>Your first step, together</p>
        <h1 className={styles.title}>Let’s make it your wedding.</h1>
        <p className={styles.copy}>
          Welcome, {session.user.name}. Add a few details to create your shared
          planning space.
        </p>
        <CreateWeddingForm csrfToken={session.csrfToken} />
        <div className={styles.divider}>
          <SignOut csrfToken={session.csrfToken} />
        </div>
      </div>
    </AccountShell>
  );
}
