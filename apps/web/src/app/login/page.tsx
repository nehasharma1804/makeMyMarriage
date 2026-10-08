import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { isPublicDemo } from '@/lib/deployment-mode';
import { PasswordSignIn } from '@/components/account/password-sign-in';
import { Icon } from '@/components/landing/icon';
import styles from '@/components/account/sign-in.module.css';

export const metadata: Metadata = {
  title: 'Sign in',
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  if (isPublicDemo()) redirect('/demo');
  return (
    <main className={styles.page}>
      <section className={styles.story} aria-labelledby="story-title">
        <nav className={styles.storyNav} aria-label="Return navigation">
          <Link href="/" className={styles.backLink}>
            <Icon name="arrow" />
            Back to Make My Marriage
          </Link>
          <span className={styles.badge}>Wedding workspace</span>
        </nav>
        <div className={styles.storyContent}>
          <div className={styles.photoFrame}>
            <Image
              src="/images/sign-in-wedding.jpg"
              alt="A bride and groom laughing together in a sunlit courtyard"
              fill
              sizes="(max-width: 900px) 1px, (max-width: 1100px) 38vw, 420px"
              className={styles.photo}
            />
            <Link href="/demo" className={styles.photoCaption}>
              <span className={styles.sampleDot} />
              Ashu &amp; Priya’s wedding <span>· Sample workspace</span>
            </Link>
          </div>
          <h2 id="story-title" className={styles.storyTitle}>
            Plan together.
            <br />
            <em>Celebrate together.</em>
          </h2>
          <p className={styles.storyCopy}>
            A little less planning. A little more celebrating.
            <br />A space for the wedding that’s uniquely yours.
          </p>
          <ul className={styles.benefits}>
            <li>
              <span className={styles.benefitIcon}>
                <Icon name="heart" />
              </span>
              <div>
                <strong>Your wedding, one home</strong>
                <p>Start with your story, date, and celebrations.</p>
              </div>
            </li>
            <li>
              <span className={styles.benefitIcon}>
                <Icon name="calendar" />
              </span>
              <div>
                <strong>Made for Indian celebrations</strong>
                <p>From Mehendi and Sangeet to the big day.</p>
              </div>
            </li>
            <li>
              <span className={styles.benefitIcon}>
                <Icon name="shield" />
              </span>
              <div>
                <strong>A private place to begin</strong>
                <p>Sign in to return to your wedding workspace.</p>
              </div>
            </li>
          </ul>
        </div>
        <p className={styles.storyFooter}>
          Made with care for Indian weddings, everywhere.
        </p>
      </section>

      <section className={styles.authPanel} aria-label="Your account">
        <div className={styles.authNav}>
          <Link href="/" className={styles.mobileBrand}>
            <Icon name="infinity" />
            Make My Marriage
          </Link>
          <Link href="/demo">
            Take a look around <Icon name="arrow" />
          </Link>
        </div>
        <div className={styles.card}>
          <div className={styles.brandHeader}>
            <Link
              href="/"
              className={styles.brandMark}
              aria-label="Make My Marriage home"
            >
              <Icon name="infinity" />
            </Link>
            <p className={styles.brandName}>Make My Marriage</p>
          </div>
          <PasswordSignIn />
          <div className={styles.divider}>
            <span>Just exploring?</span>
          </div>
          <Link href="/demo" className={styles.demoCard}>
            <span className={styles.demoIcon}>
              <Icon name="people" />
            </span>
            <span>
              <strong>Step inside a sample wedding</strong>
              <small>No account needed. Just a little inspiration.</small>
            </span>
            <Icon name="arrow" />
          </Link>
          <p className={styles.privateNote}>
            <Icon name="shield" />
            Your wedding workspace is private to your account.
          </p>
        </div>
        <footer className={styles.authFooter}>
          <Icon name="heart" /> A thoughtful beginning to your happily ever
          after.
        </footer>
      </section>
    </main>
  );
}
