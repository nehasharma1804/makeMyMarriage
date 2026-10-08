import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { DemoWorkspace } from '@/components/demo/demo-workspace';
import styles from '@/components/demo/demo.module.css';
import { isPublicDemo } from '@/lib/deployment-mode';

export const metadata: Metadata = {
  title: 'Ashu & Priya · Sample wedding',
  description:
    'Explore an illustrative, read-only Ashu and Priya wedding workspace, from celebrations and guests to tasks and expenses.',
};

export default function DemoPage() {
  const demoOnly = isPublicDemo();
  return (
    <div className={styles.page}>
      <a className={styles.skipLink} href="#main-content">
        Skip to sample wedding
      </a>
      <header className={styles.header}>
        <Link href="/" className={styles.brand}>
          <span className={styles.brandMark} aria-hidden="true">
            ∞
          </span>
          Make My Marriage
        </Link>
        <nav
          aria-label="Sample wedding navigation"
          className={styles.headerNav}
        >
          <a href="#guest-experience" className={styles.textLink}>
            Guest experience
          </a>
          <Link href={demoOnly ? '/' : '/login'} className={styles.smallButton}>
            {demoOnly ? 'Back to home' : 'Create your wedding'}{' '}
            <span aria-hidden="true">↗</span>
          </Link>
        </nav>
      </header>

      <main id="main-content" className={styles.main}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>
            A little inspiration for your big day
          </p>
          <h1 className={styles.pageTitle}>
            Step inside a wedding, beautifully organized.
          </h1>
          <p className={styles.introCopy}>
            Meet Ashu &amp; Priya. Explore how one shared space can bring their
            celebrations, family, and all the little details together.
          </p>
        </div>

        <aside className={styles.sampleNotice} aria-label="About this demo">
          <span className={styles.sampleBadge}>Read-only sample</span>
          <p>
            Names, dates, totals, and vendor details below are illustrative.
            This preview doesn’t save changes, send invitations, accept RSVPs,
            or upload media.
            {demoOnly && ' Accounts and personal workspaces are coming later.'}
          </p>
        </aside>

        <DemoWorkspace />

        <section
          id="guest-experience"
          className={styles.guestSection}
          aria-labelledby="guest-experience-title"
        >
          <div className={styles.guestCopy}>
            <p className={styles.eyebrow}>Beyond the planning workspace</p>
            <h2 id="guest-experience-title" className={styles.sectionTitle}>
              A warm welcome,
              <br />
              for every guest.
            </h2>
            <p>
              A wedding website can bring the invitation, celebration details,
              and per-event RSVP together. Guests would see only the details you
              choose to share, without accessing your private planning.
            </p>
            <ul className={styles.guestFeatures}>
              <li>Couple names, wedding date, and a personal invitation</li>
              <li>Event times, venues, and dress codes</li>
              <li>Per-event RSVP without a guest account</li>
            </ul>
            <p className={styles.illustrationNote}>
              Website and invitation preview only. Guest sharing, RSVP, media,
              and livestream integrations will be built in later phases.
            </p>
          </div>
          <div className={styles.invitation}>
            <div className={styles.invitationTop}>
              <span className={styles.invitationLabel}>
                Classic website · Sample
              </span>
              <span aria-hidden="true">✧</span>
            </div>
            <div className={styles.invitationPhoto}>
              <Image
                src="/images/ashu-priya-wedding.jpg"
                alt="Indian bride and groom in wedding attire, used as the sample couple’s photograph"
                fill
                sizes="(max-width: 760px) 80vw, 400px"
                className={styles.photo}
              />
            </div>
            <p className={styles.invitationKicker}>
              Together with our families
            </p>
            <h3 className={styles.coupleNames}>Ashu &amp; Priya</h3>
            <p className={styles.invitationMessage}>
              We would love to celebrate our next chapter with you.
            </p>
            <div className={styles.invitationDetails}>
              <p>12 December 2026</p>
              <span aria-hidden="true">·</span>
              <p>Jaipur, Rajasthan</p>
            </div>
            <div className={styles.invitationFooter}>
              Event details &amp; RSVP would appear here
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className={styles.stepsSection}
          aria-labelledby="how-it-works-title"
        >
          <p className={styles.eyebrow}>From “yes” to the big day</p>
          <h2 id="how-it-works-title" className={styles.sectionTitle}>
            Your wedding starts with a shared space.
          </h2>
          <ol className={styles.steps}>
            <li>
              <span className={styles.stepNumber}>01</span>
              <h3>Make it yours</h3>
              <p>
                Sign in with email and add your couple names, wedding date, and
                location. Your five standard events provide a starting point.
              </p>
            </li>
            <li>
              <span className={styles.stepNumber}>02</span>
              <h3>Bring the details together</h3>
              <p>
                The planned workspace will organize guests, tasks, expenses,
                shopping, and vendors around your wedding and its events.
              </p>
            </li>
            <li>
              <span className={styles.stepNumber}>03</span>
              <h3>Welcome your people</h3>
              <p>
                Later phases will add family collaboration, invitations, a
                wedding website, guest RSVP, and private photo sharing.
              </p>
            </li>
          </ol>
        </section>

        <section className={styles.finalCta} aria-labelledby="demo-cta-title">
          <span className={styles.flourish} aria-hidden="true">
            ✧
          </span>
          <p className={styles.eyebrow}>Your story. Your celebrations.</p>
          <h2 id="demo-cta-title">Now imagine this, for your wedding.</h2>
          <p>
            Start with your own wedding workspace, then build the details
            together.
          </p>
          {demoOnly && (
            <p>
              Personal accounts are coming later. For now, enjoy exploring the
              sample.
            </p>
          )}
          <Link href={demoOnly ? '/' : '/login'} className={styles.button}>
            {demoOnly ? 'Back to Make My Marriage' : 'Create your wedding'}{' '}
            <span aria-hidden="true">↗</span>
          </Link>
        </section>
      </main>

      <footer className={styles.footer}>
        <Link href="/">Make My Marriage</Link>
        <p>Made for the celebrations. And everyone who makes them happen.</p>
        <span>Illustrative product preview</span>
      </footer>
    </div>
  );
}
