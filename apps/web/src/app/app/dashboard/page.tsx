import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  AccountShell,
  ConnectionNotice,
} from '@/components/account/account-shell';
import { SignOut } from '@/components/account/sign-out';
import { loadSession, loadWedding } from '@/lib/server-api';
import styles from '@/components/account/account.module.css';

export const metadata: Metadata = {
  title: 'Your wedding workspace',
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const session = await loadSession();
  if (!session) return <ConnectionNotice />;
  if (session.requiresWeddingSetup) redirect('/app/setup');
  const result = await loadWedding();
  if (!result) return <ConnectionNotice />;
  if (!result.workspace) redirect('/app/setup');
  const { wedding, membership, events } = result.workspace;
  const weddingDate = new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'long',
    timeZone: 'UTC',
  }).format(new Date(`${wedding.weddingDate}T00:00:00Z`));
  return (
    <AccountShell>
      <div className={styles.dashboardTitle}>
        <div>
          <p className={styles.eyebrow}>Your wedding workspace</p>
          <h1 className={styles.title}>
            {wedding.brideName} &amp; {wedding.groomName}
          </h1>
          <p className={styles.copy}>
            Your wedding is saved. Your celebrations begin here.
          </p>
        </div>
        <SignOut csrfToken={session.csrfToken} />
      </div>
      <dl className={styles.stats}>
        <div className={styles.stat}>
          <dt>Wedding date</dt>
          <dd>{weddingDate}</dd>
        </div>
        <div className={styles.stat}>
          <dt>Celebration city</dt>
          <dd>{wedding.city}</dd>
        </div>
        <div className={styles.stat}>
          <dt>Your role</dt>
          <dd>
            {membership.role === 'ADMIN' ? 'Wedding admin' : 'Family member'}
          </dd>
        </div>
      </dl>
      <section className={styles.section}>
        <h2>Your celebrations</h2>
        <p className={styles.copy}>
          These five events are saved in your workspace. Individual event
          planning will be added next.
        </p>
        <div className={styles.events}>
          {events.map((event) => (
            <article key={event.id} className={styles.event}>
              <h3>{event.name}</h3>
              <p>{event.date ? event.date : 'Date to be planned'}</p>
            </article>
          ))}
        </div>
      </section>
      {wedding.description && (
        <section className={styles.section}>
          <h2>About your celebration</h2>
          <p className={styles.copy}>{wedding.description}</p>
        </section>
      )}
      <div className={styles.notice}>
        <strong>A beginning, beautifully organized.</strong>
        Guest lists, family collaboration, tasks, expenses, and sharing will be
        added as the project develops.{' '}
        <Link href="/demo">Explore the sample wedding</Link> to preview the
        planning experience.
      </div>
    </AccountShell>
  );
}
