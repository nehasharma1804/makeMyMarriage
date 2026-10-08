import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { LandingHeader } from './header';
import { Icon, type IconName } from './icon';
import { isPublicDemo } from '@/lib/deployment-mode';

const events = [
  {
    name: 'Haldi & Phoolon ki Holi',
    shortName: 'Haldi',
    icon: 'flower',
    tone: 'gold',
    time: 'Morning · December 10',
    venue: 'Poolside lawns',
    dress: 'Yellow & floral',
    metric: '140 invited guests',
    detail: '22 of 24 tasks complete',
    lead: 'Maa & Mami',
    attending: 126,
    invited: 140,
  },
  {
    name: 'Mehndi Sundowner',
    shortName: 'Mehndi',
    icon: 'brush',
    tone: 'sage',
    time: 'Afternoon · December 10',
    venue: 'Palace verandah',
    dress: 'Pastels & traditional',
    metric: '180 invited guests',
    detail: 'Henna artists confirmed',
    lead: 'Priya & cousins',
    attending: 144,
    invited: 180,
  },
  {
    name: 'Grand Sangeet',
    shortName: 'Sangeet',
    icon: 'music',
    tone: 'burgundy',
    time: 'Evening · December 11',
    venue: 'Regal ballroom',
    dress: 'A little sparkle',
    metric: '280 invited guests',
    detail: 'Music vendor confirmed',
    lead: 'Simran & siblings',
    attending: 238,
    invited: 280,
  },
  {
    name: 'Wedding & Vidaai',
    shortName: 'Wedding',
    icon: 'flame',
    tone: 'burgundy',
    time: '7:15 PM · December 12',
    venue: 'Baradari mandap',
    dress: 'Traditional festive',
    metric: '286 invited guests',
    detail: 'Ceremony venue confirmed',
    lead: 'Papa & Chachaji',
    attending: 248,
    invited: 286,
  },
  {
    name: 'Royal Reception',
    shortName: 'Reception',
    icon: 'party',
    tone: 'sage',
    time: 'Evening · December 13',
    venue: 'Palace gardens',
    dress: 'Evening celebration',
    metric: '286 invited guests',
    detail: 'Décor setup scheduled',
    lead: 'Ashu & both families',
    attending: 252,
    invited: 286,
  },
] as const;

const activities = [
  {
    initial: 'A',
    tone: 'gold',
    who: 'Ashu',
    action: 'saved the Sangeet music vendor.',
    detail: 'Vendor contact · Sangeet',
  },
  {
    initial: 'R',
    tone: 'sage',
    who: 'Papa',
    action: 'recorded the catering advance.',
    detail: '₹2,50,000 paid · Expenses',
  },
  {
    initial: 'P',
    tone: 'burgundy',
    who: 'Priya',
    action: 'added six guests to the bride’s side.',
    detail: 'Guest list · Bride’s side',
  },
  {
    initial: 'K',
    tone: 'neutral',
    who: 'Maa',
    action: 'completed the Haldi flower checklist.',
    detail: 'Task completed · Haldi',
  },
] as const;

function Button({
  href,
  children,
  secondary = false,
  arrow = false,
}: {
  href: string;
  children: ReactNode;
  secondary?: boolean;
  arrow?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`mmm-button ${secondary ? 'mmm-button-secondary' : 'mmm-button-primary'}`}
    >
      {children}
      {arrow && <Icon name="arrow" />}
    </Link>
  );
}

function SectionHeading({
  label,
  title,
  description,
  centered = false,
}: {
  label: string;
  title: ReactNode;
  description?: string;
  centered?: boolean;
}) {
  return (
    <div className={`mmm-section-heading${centered ? ' is-centered' : ''}`}>
      <p className="mmm-eyebrow">{label}</p>
      <h2>{title}</h2>
      {description && <p className="mmm-section-description">{description}</p>}
    </div>
  );
}

function IconTile({
  name,
  tone = 'burgundy',
}: {
  name: IconName;
  tone?: string;
}) {
  return (
    <span className={`mmm-icon-tile mmm-tone-${tone}`}>
      <Icon name={name} />
    </span>
  );
}

function Avatar({
  initial,
  tone = 'burgundy',
  small = false,
}: {
  initial: string;
  tone?: string;
  small?: boolean;
}) {
  return (
    <span
      className={`mmm-avatar mmm-avatar-${tone}${small ? ' is-small' : ''}`}
      aria-hidden="true"
    >
      {initial}
    </span>
  );
}

function SampleLabel({
  children = 'Illustrative product preview',
}: {
  children?: ReactNode;
}) {
  return <span className="mmm-sample-label">{children}</span>;
}

function HeroDashboard() {
  return (
    <div className="mmm-preview-card mmm-hero-dashboard">
      <div className="mmm-dashboard-header">
        <div className="mmm-wedding-identity">
          <IconTile name="temple" />
          <div>
            <h3>Ashu & Priya’s wedding</h3>
            <p>
              December 12, 2026 <span aria-hidden="true">·</span> Jaipur,
              Rajasthan
            </p>
          </div>
        </div>
        <div
          className="mmm-avatar-stack"
          aria-label="Four example family members"
        >
          <Avatar initial="P" />
          <Avatar initial="A" tone="gold" />
          <Avatar initial="R" tone="sage" />
          <Avatar initial="K" tone="neutral" />
        </div>
      </div>
      <div className="mmm-dashboard-content">
        <div className="mmm-preview-topline">
          <span className="mmm-location">
            <Icon name="location" /> Rambagh, Jaipur
          </span>
          <SampleLabel>Sample wedding</SampleLabel>
        </div>
        <div className="mmm-stats-grid">
          <div className="mmm-stat">
            <span>Celebrations</span>
            <strong>
              5 <small>events</small>
            </strong>
            <p className="mmm-sage-text">Haldi to Reception</p>
          </div>
          <div className="mmm-stat">
            <span>Guest list</span>
            <strong>
              286 <small>guests</small>
            </strong>
            <p>Across both families</p>
          </div>
          <div className="mmm-stat">
            <span>Family tasks</span>
            <strong className="mmm-burgundy-text">
              8 <small>remaining</small>
            </strong>
            <p>34 tasks completed</p>
          </div>
          <div className="mmm-stat">
            <span>Expenses</span>
            <strong>₹8.4L</strong>
            <p>₹5.2L recorded as paid</p>
          </div>
        </div>
        <div className="mmm-dashboard-bottom">
          <div className="mmm-mini-panel">
            <div className="mmm-mini-heading">
              <h4>
                <Icon name="calendar" /> Ritual schedule
              </h4>
              <Link href="/demo">View demo</Link>
            </div>
            <div className="mmm-timeline-list">
              {events.slice(1, 4).map((event) => (
                <div className="mmm-timeline-row" key={event.name}>
                  <span className={`mmm-dot mmm-dot-${event.tone}`} />
                  <div>
                    <strong>{event.shortName}</strong>
                    <p>{event.venue}</p>
                  </div>
                  <span className="mmm-pill mmm-pill-sage">
                    {event.invited} guests
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="mmm-mini-panel">
            <div className="mmm-mini-heading">
              <h4>
                <Icon name="clock" /> Family activity
              </h4>
            </div>
            <div className="mmm-mini-activity">
              {activities.map((item) => (
                <div key={item.who}>
                  <Avatar initial={item.initial} tone={item.tone} small />
                  <p>
                    <strong>{item.who}</strong> {item.action}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  const demoOnly = isPublicDemo();
  return (
    <section className="mmm-section mmm-hero mmm-container">
      <div className="mmm-hero-topline">
        <span className="mmm-workspace-label">
          <span className="mmm-dot mmm-dot-gold" /> Indian wedding workspace
        </span>
        <div className="mmm-hero-benefits">
          <span>
            <Icon name="shield" /> Private planning
          </span>
          <span>
            <Icon name="people" /> Family collaboration
          </span>
          <span>
            <Icon name="heart" /> Made for your celebrations
          </span>
        </div>
      </div>
      <div className="mmm-hero-intro">
        <div>
          <h1>
            Your wedding.
            <br />
            <em>Beautifully organized.</em>
          </h1>
          <p>
            Bring every event, guest, task, and expense together in one shared
            space. A thoughtful beginning for the celebrations you’ll remember
            forever.
          </p>
        </div>
        <div className="mmm-hero-actions">
          <Button href={demoOnly ? '/demo' : '/login'} arrow>
            {demoOnly ? 'Explore the wedding demo' : 'Create your wedding'}
          </Button>
          <Button href="/demo" secondary>
            <Icon name="heart" /> Explore Ashu & Priya’s wedding
          </Button>
        </div>
      </div>
      <div className="mmm-hero-visual">
        <HeroDashboard />
        <figure className="mmm-arched-photo">
          <Image
            src="/images/ashu-priya-wedding.jpg"
            alt="An Indian wedding couple celebrating with their families"
            fill
            sizes="(max-width: 900px) 100vw, 33vw"
            preload
          />
          <figcaption>
            <span>Rambagh Palace · Jaipur</span>
            <h3>
              Every celebration.
              <br />
              Every person you love.
            </h3>
            <p>
              <Icon name="heart" /> Ashu & Priya · Sample wedding
            </p>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

function ValuePillars() {
  const cards = [
    {
      icon: 'people',
      tone: 'burgundy',
      title: 'Plan together, peacefully',
      description:
        'A wedding belongs to the whole family. Organize responsibilities around a shared plan, with Admin and Member access for the people helping you.',
      link: 'Meet the shared workspace',
      href: '#family-collaboration',
    },
    {
      icon: 'party',
      tone: 'gold',
      title: 'Made for Indian weddings',
      description:
        'Begin with Haldi, Mehndi, Sangeet, Wedding, and Reception. Tailor each ceremony’s dates and venues to the traditions that make your celebration yours.',
      link: 'Explore the five celebrations',
      href: '#celebrations',
    },
    {
      icon: 'shield',
      tone: 'sage',
      title: 'Private and considered',
      description:
        'Your wedding workspace requires sign-in. Guest details and planning stay separate from the public wedding pages and sharing experiences planned next.',
      link: 'See the guest experience',
      href: '#guest-experience',
    },
  ] as const;
  return (
    <section className="mmm-section mmm-band-soft" id="how-it-works">
      <div className="mmm-container">
        <SectionHeading
          label="A thoughtful place to begin"
          title={
            <>
              Everything your family needs.
              <br />
              One wedding workspace.
            </>
          }
          description={
            isPublicDemo()
              ? 'Explore a sample wedding and preview the planning tools we’re building. Personal accounts and wedding creation will be available in a later release.'
              : 'Start with Email sign-in, create your wedding, and find your five celebrations ready to personalize. The planning tools below preview what comes next.'
          }
        />
        <div className="mmm-grid-three mmm-value-grid">
          {cards.map((card) => (
            <article
              className="mmm-card mmm-value-card"
              key={card.title}
              id={card.icon === 'shield' ? 'privacy-approach' : undefined}
            >
              <IconTile name={card.icon} tone={card.tone} />
              <h3>{card.title}</h3>
              <p>{card.description}</p>
              <a className="mmm-text-link" href={card.href}>
                {card.link}
                <Icon name="chevron" />
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function PlanningOverview() {
  const tasks = [
    {
      name: 'Confirm the Haldi floral arrangements',
      assignee: 'Completed by Maa',
      status: 'Done',
      tone: 'sage',
      complete: true,
    },
    {
      name: 'Check the ceremony essentials with Pandit Ji',
      assignee: 'Assigned to Papa',
      status: 'High priority',
      tone: 'gold',
      complete: false,
    },
    {
      name: 'Finalize the Sangeet music vendor',
      assignee: 'Assigned to Simran',
      status: 'Due Friday',
      tone: 'burgundy',
      complete: false,
    },
    {
      name: 'Review the Reception guest list',
      assignee: 'Assigned to Ashu',
      status: 'In progress',
      tone: 'neutral',
      complete: false,
    },
  ];
  return (
    <section className="mmm-section mmm-container" id="planning-overview">
      <SectionHeading
        label="The bigger picture"
        title="Your entire wedding at a glance."
        description="A preview of how event details, guest responses, family tasks, and expenses will come together around your celebrations."
        centered
      />
      <div className="mmm-preview-card mmm-overview-card">
        <div className="mmm-overview-banner">
          <div className="mmm-wedding-identity">
            <IconTile name="calendar" tone="gold" />
            <div>
              <h3>Ashu & Priya’s celebration plan</h3>
              <p>Five events · Jaipur · December 10–13, 2026</p>
            </div>
          </div>
          <div className="mmm-next-milestone">
            <span>Next milestone</span>
            <strong>Review Sangeet details</strong>
          </div>
        </div>
        <div className="mmm-overview-columns">
          <div>
            <div className="mmm-mini-heading">
              <h3>
                <Icon name="people" /> Event-level RSVP
              </h3>
              <span className="mmm-pill mmm-pill-sage">Sample responses</span>
            </div>
            <div className="mmm-rsvp-list">
              {events
                .filter((event) => event.shortName !== 'Mehndi')
                .map((event) => (
                  <div className="mmm-rsvp-item" key={event.shortName}>
                    <div>
                      <strong>{event.name}</strong>
                      <span>
                        {event.attending} / {event.invited} attending
                      </span>
                    </div>
                    <div className="mmm-progress-track">
                      <span
                        className={`mmm-progress-fill mmm-fill-${event.tone}`}
                        style={{
                          width: `${Math.round((event.attending / event.invited) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
            </div>
            <div className="mmm-overview-links">
              <Link href="/demo">
                <Icon name="people" /> Explore sample guests
              </Link>
              <a href="#core-modules">
                <Icon name="tasks" /> See the planning tools
              </a>
            </div>
          </div>
          <div>
            <div className="mmm-mini-heading">
              <h3>
                <Icon name="tasks" /> Family action items
              </h3>
              <span className="mmm-small-text">Example checklist</span>
            </div>
            <div className="mmm-task-list">
              {tasks.map((task) => (
                <div className="mmm-task-row" key={task.name}>
                  <span
                    className={`mmm-checkbox${task.complete ? ' is-checked' : ''}`}
                    aria-hidden="true"
                  >
                    {task.complete && <Icon name="check" />}
                  </span>
                  <div>
                    <strong>{task.name}</strong>
                    <p>{task.assignee}</p>
                  </div>
                  <span className={`mmm-pill mmm-pill-${task.tone}`}>
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <p className="mmm-preview-note">
          Illustrative sample data. Guest management, RSVP, and task editing are
          planned features.
        </p>
      </div>
    </section>
  );
}

function Celebrations() {
  return (
    <section className="mmm-section mmm-container" id="celebrations">
      <div className="mmm-heading-row">
        <SectionHeading
          label="Every ritual has its place"
          title="Every celebration. One place."
          description="Five familiar events are created with your wedding. Set your own dates, times, and venues as your plans take shape."
        />
        <Link className="mmm-subtle-link" href="/demo">
          <Icon name="calendar" /> View sample events
        </Link>
      </div>
      <div className="mmm-event-grid">
        {events.map((event) => (
          <article
            className={`mmm-card mmm-event-card mmm-event-${event.tone}`}
            key={event.name}
          >
            <div className="mmm-event-topline">
              <span>{event.time}</span>
              <Icon name={event.icon} />
            </div>
            <h3>{event.name}</h3>
            <p>
              {event.venue} · {event.dress}
            </p>
            <dl>
              <div>
                <dt>Guests</dt>
                <dd>{event.metric}</dd>
              </div>
              <div>
                <dt>Planning</dt>
                <dd>{event.detail}</dd>
              </div>
            </dl>
            <div className="mmm-event-lead">Coordinating: {event.lead}</div>
          </article>
        ))}
      </div>
      <p className="mmm-preview-note">
        Example event details from Ashu & Priya’s wedding.
      </p>
    </section>
  );
}

function CoreModules() {
  const cards = [
    {
      icon: 'people',
      tone: 'burgundy',
      title: 'Guests & event RSVP',
      subtitle: 'One guest list, many celebrations',
      description:
        'Keep bride’s side, groom’s side, and common guests together. Assign each person to the events they’re invited to and track their response for each event.',
      first: 'Bride’s side',
      firstValue: '142 sample guests',
      second: 'Groom’s side',
      secondValue: '144 sample guests',
    },
    {
      icon: 'tasks',
      tone: 'gold',
      title: 'Tasks & responsibilities',
      subtitle: 'A clear next step for everyone',
      description:
        'Give each task an owner, due date, priority, and status. Connect it to a ceremony or keep it at the wedding level so the little details have a place.',
      first: 'Family tasks',
      firstValue: '34 of 42 complete',
      second: 'Haldi flowers',
      secondValue: 'Assigned to Maa',
    },
    {
      icon: 'wallet',
      tone: 'sage',
      title: 'Expenses & payments',
      subtitle: 'Know what’s paid and remaining',
      description:
        'Record an expense’s total and paid amount, with its category, event, vendor, and receipt. Keep track of remaining balances without needing a separate spreadsheet.',
      first: 'Catering advance',
      firstValue: '₹2,50,000 paid',
      second: 'Remaining balance',
      secondValue: '₹3,20,000',
    },
    {
      icon: 'vendor',
      tone: 'burgundy',
      title: 'Vendors & contacts',
      subtitle: 'The people behind your celebration',
      description:
        'Keep saved vendors and their contact details with your wedding. Connect the photographer, caterer, decorator, and other vendors to the events they support.',
      first: 'Photography',
      firstValue: 'Wedding & Reception',
      second: 'Catering',
      secondValue: 'Contact saved',
    },
    {
      icon: 'shopping',
      tone: 'gold',
      title: 'Shopping & essentials',
      subtitle: 'From the shortlist to the celebration',
      description:
        'Organize what needs buying, who it is for, and who is taking care of it. Track shortlisted, ordered, and purchased items alongside your ceremony plans.',
      first: 'Haldi outfits',
      firstValue: 'Purchased',
      second: 'Ceremony essentials',
      secondValue: 'Shortlisted',
    },
    {
      icon: 'mail',
      tone: 'sage',
      title: 'Invitations & sharing',
      subtitle: 'A thoughtful welcome for your guests',
      description:
        'Planned digital invitations and wedding pages will bring event details, venues, and guest RSVP links together, while keeping private planning separate.',
      first: 'Wedding website',
      firstValue: 'Classic theme preview',
      second: 'Guest RSVP',
      secondValue: 'Planned secure links',
    },
  ] as const;
  return (
    <section className="mmm-section mmm-container" id="features">
      <div id="core-modules">
        <SectionHeading
          label="The plans, people, and little details"
          title="Six thoughtful tools. One shared plan."
          description="A preview of the planning features we’re building around the way Indian weddings come together."
        />
        <div className="mmm-grid-three mmm-module-grid">
          {cards.map((card) => (
            <article className="mmm-card mmm-module-card" key={card.title}>
              <div className="mmm-module-heading">
                <IconTile name={card.icon} tone={card.tone} />
                <div>
                  <h3>{card.title}</h3>
                  <span>{card.subtitle}</span>
                </div>
              </div>
              <p>{card.description}</p>
              <div className="mmm-module-example">
                <div>
                  <span>{card.first}</span>
                  <strong>{card.firstValue}</strong>
                </div>
                <div>
                  <span>{card.second}</span>
                  <strong>{card.secondValue}</strong>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function IllustrativeQr() {
  return (
    <svg
      className="mmm-qr"
      viewBox="0 0 100 100"
      role="img"
      aria-label="Illustrative QR pattern, not an active upload code"
    >
      <g fill="currentColor">
        <path
          fillRule="evenodd"
          d="M5 5h30v30H5V5Zm5 5v20h20V10H10Zm5 5h10v10H15V15ZM65 5h30v30H65V5Zm5 5v20h20V10H70Zm5 5h10v10H75V15ZM5 65h30v30H5V65Zm5 5v20h20V70H10Zm5 5h10v10H15V75Z"
        />
        <path d="M45 5h10v10H45zM40 25h10v15H40zM55 20h5v10h-5zM5 45h10v10H5zM25 40h10v10H25zM20 55h15v5H20zM40 50h10v10H40zM55 40h10v10H55zM70 40h10v15H70zM85 45h10v10H85zM45 65h10v10H45zM60 60h10v10H60zM75 60h20v5H75zM65 75h10v10H65zM80 75h15v10H80zM40 85h15v10H40zM60 90h20v5H60zM85 90h10v5H85z" />
      </g>
    </svg>
  );
}

function Memories() {
  return (
    <section className="mmm-section mmm-band-rose" id="memories">
      <div className="mmm-container mmm-split">
        <div>
          <span className="mmm-feature-badge">
            <Icon name="camera" /> Photo sharing · planned
          </span>
          <SectionHeading
            label="A place for the memories"
            title={
              <>
                Everyone takes candid photos.
                <br />
                <em>Bring those moments together.</em>
              </>
            }
            description="The planned guest upload experience will let family and friends scan a QR code and share photos from their browser, without creating an account."
          />
          <div className="mmm-check-list">
            <div>
              <Icon name="checkCircle" />
              <div>
                <strong>A private wedding gallery</strong>
                <p>Collect member and guest uploads with controlled access.</p>
              </div>
            </div>
            <div>
              <Icon name="checkCircle" />
              <div>
                <strong>Organized around your ceremonies</strong>
                <p>Choose an event or album when sharing wedding photos.</p>
              </div>
            </div>
            <div>
              <Icon name="checkCircle" />
              <div>
                <strong>Share the memories you choose</strong>
                <p>
                  Planned gallery links let you share an album with your people.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="mmm-photo-mockups">
          <div className="mmm-card mmm-table-card">
            <IconTile name="camera" tone="gold" />
            <p className="mmm-eyebrow mmm-gold-text">
              Sangeet night · Sample card
            </p>
            <h3>Capture our memories</h3>
            <p>
              A little moment from you.
              <br />A cherished memory for us.
            </p>
            <div className="mmm-qr-frame">
              <IllustrativeQr />
              <span>Illustration · Preview only</span>
            </div>
            <p className="mmm-small-text">Ashu & Priya’s celebration</p>
          </div>
          <div className="mmm-card mmm-upload-card">
            <div className="mmm-mini-heading">
              <h3>Guest photo upload</h3>
              <span className="mmm-pill mmm-pill-sage">Preview</span>
            </div>
            <div className="mmm-upload-selection">
              <Icon name="upload" />
              <strong>Sharing wedding memories</strong>
              <span>Sample browser upload</span>
            </div>
            <div className="mmm-upload-progress">
              <div>
                <span>Sangeet_family.jpg</span>
                <strong>100%</strong>
              </div>
              <div className="mmm-progress-track">
                <span
                  className="mmm-progress-fill mmm-fill-sage"
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <span>Dance_floor.jpg</span>
                <strong>78%</strong>
              </div>
              <div className="mmm-progress-track">
                <span
                  className="mmm-progress-fill mmm-fill-burgundy"
                  style={{ width: '78%' }}
                />
              </div>
            </div>
            <p className="mmm-preview-note">
              An illustration of a future upload flow.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Family() {
  const family = [
    {
      initial: 'P',
      tone: 'burgundy',
      name: 'Bride or groom',
      work: 'Create the wedding and manage its members',
      role: 'Admin',
    },
    {
      initial: 'R',
      tone: 'gold',
      name: 'Parents & relatives',
      work: 'Help with expenses, rituals, and family tasks',
      role: 'Member',
    },
    {
      initial: 'S',
      tone: 'sage',
      name: 'Siblings & cousins',
      work: 'Help organize events, guests, and shopping',
      role: 'Member',
    },
  ];
  return (
    <section className="mmm-section mmm-container" id="family-collaboration">
      <div className="mmm-family-split">
        <div>
          <SectionHeading
            label="Built for the whole family"
            title="Wedding planning was never a one-person job."
            description="Indian weddings thrive on joint effort. A shared wedding workspace will help parents, siblings, and cousins contribute with their own accounts."
          />
          <div className="mmm-family-roles">
            {family.map((person) => (
              <div className="mmm-family-role" key={person.name}>
                <Avatar initial={person.initial} tone={person.tone} />
                <div>
                  <strong>{person.name}</strong>
                  <p>{person.work}</p>
                </div>
                <span className={`mmm-pill mmm-pill-${person.tone}`}>
                  {person.role}
                </span>
              </div>
            ))}
          </div>
          <p className="mmm-preview-note">
            Member invitations and collaborative planning are coming next.
          </p>
        </div>
        <div className="mmm-preview-card mmm-family-feed">
          <div className="mmm-mini-heading">
            <div>
              <h3>Family activity, together</h3>
              <p>A preview of the updates you’ll find in your wedding.</p>
            </div>
            <Icon name="clock" />
          </div>
          <div className="mmm-activity-list">
            {activities.map((item) => (
              <div className="mmm-activity-row" key={item.who}>
                <Avatar initial={item.initial} tone={item.tone} />
                <div>
                  <p>
                    <strong>{item.who}</strong> {item.action}
                  </p>
                  <span>{item.detail}</span>
                </div>
              </div>
            ))}
          </div>
          <SampleLabel>Illustrative family activity</SampleLabel>
        </div>
      </div>
    </section>
  );
}

function GuestExperience() {
  return (
    <section className="mmm-section mmm-band-soft" id="guest-experience">
      <div className="mmm-container">
        <SectionHeading
          label="A thoughtful guest experience · planned"
          title="Beautiful for you. Simple for your guests."
          description="Invitations, event RSVP, and selected wedding details will be easy to open through public pages or secure links. Guests won’t need a planning account."
          centered
        />
        <div className="mmm-grid-three mmm-guest-grid">
          <article className="mmm-card mmm-phone-card">
            <div className="mmm-phone-notch" />
            <div className="mmm-invitation-preview">
              <span>Wedding invitation</span>
              <h3>
                Together with
                <br />
                our families
              </h3>
              <p>Join us to celebrate</p>
              <strong>Priya & Ashu</strong>
              <p>December 12 · Jaipur</p>
            </div>
            <ul className="mmm-guest-details">
              <li>Events and venue details</li>
              <li>A message from the couple</li>
              <li>A link to your event RSVP</li>
            </ul>
            <h3 className="mmm-phone-caption">1. Digital invitation</h3>
          </article>
          <article className="mmm-card mmm-phone-card">
            <div className="mmm-phone-notch" />
            <div className="mmm-rsvp-phone">
              <h4>
                <Icon name="mail" /> Your event RSVP
              </h4>
              <p>Will you join Ashu & Priya?</p>
              <div className="mmm-rsvp-choice">
                <span>Wedding ceremony</span>
                <strong>
                  <Icon name="check" /> Attending
                </strong>
              </div>
              <div className="mmm-rsvp-choice is-neutral">
                <span>Reception</span>
                <strong>Response pending</strong>
              </div>
              <p className="mmm-small-text">
                Your response is specific to each event.
              </p>
            </div>
            <ul className="mmm-guest-details">
              <li>One personal guest link</li>
              <li>See the events you’re invited to</li>
              <li>No account required</li>
            </ul>
            <h3 className="mmm-phone-caption">2. Simple guest RSVP</h3>
          </article>
          <article className="mmm-card mmm-phone-card">
            <div className="mmm-phone-notch" />
            <div className="mmm-guest-portal">
              <div className="mmm-mini-heading">
                <span>Wedding details</span>
                <span className="mmm-pill mmm-pill-gold">Preview</span>
              </div>
              <h4>Mehndi sundowner</h4>
              <p>Pastel florals & traditional kurtas</p>
              <div className="mmm-venue-label">
                <Icon name="location" /> Palace verandah · 4:00 PM
              </div>
            </div>
            <ul className="mmm-guest-details">
              <li>Selected public wedding details</li>
              <li>Secure QR photo upload links</li>
              <li>External livestream links</li>
            </ul>
            <h3 className="mmm-phone-caption">3. Wedding & event pages</h3>
          </article>
        </div>
      </div>
    </section>
  );
}

function WeddingWebsite() {
  return (
    <section className="mmm-section mmm-container" id="wedding-website">
      <div className="mmm-preview-card mmm-website-card">
        <SectionHeading
          label="Classic wedding website · planned"
          title="A beautiful digital home for your story."
          description="A wedding page with a unique link, your couple’s story, selected event details, venues, and RSVP access. You’ll choose what your guests can see."
          centered
        />
        <div className="mmm-website-preview">
          <div className="mmm-website-photo">
            <Image
              src="/images/ashu-priya-wedding.jpg"
              alt="Wedding portrait used in the Ashu and Priya sample wedding website"
              fill
              sizes="(max-width: 900px) 100vw, 40vw"
            />
          </div>
          <div className="mmm-website-story">
            <p className="mmm-eyebrow">Ashu & Priya</p>
            <h3>Together with our families.</h3>
            <p>
              We invite you to share in the music, rituals, and celebration of
              our union in the beautiful city of Jaipur.
            </p>
            <div className="mmm-website-details">
              <div>
                <span>Date & venue</span>
                <strong>December 12 · Jaipur</strong>
              </div>
              <div>
                <span>Dress code</span>
                <strong>Traditional festive</strong>
              </div>
            </div>
            <div className="mmm-website-actions">
              <Button href="/demo">Explore the sample wedding</Button>
              <SampleLabel>Website concept preview</SampleLabel>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DemoCallout() {
  return (
    <section className="mmm-section mmm-band-deep" id="demo">
      <div className="mmm-container">
        <div className="mmm-card mmm-demo-callout">
          <div>
            <span className="mmm-feature-badge mmm-badge-gold">
              <Icon name="heart" /> A sample wedding to explore
            </span>
            <h2>
              Don’t just imagine it.
              <br />
              Meet Ashu & Priya’s wedding.
            </h2>
            <p>
              Take a look at an illustrative wedding workspace, with familiar
              ceremonies, sample guests, tasks, expenses, and vendor contacts.
              No sign-up required.
            </p>
          </div>
          <Button href="/demo" arrow>
            Explore the wedding demo
          </Button>
        </div>
      </div>
    </section>
  );
}

function Closing() {
  const demoOnly = isPublicDemo();
  return (
    <section className="mmm-section mmm-closing mmm-container">
      <span className="mmm-closing-mark">
        <Icon name="infinity" />
      </span>
      <h2>
        Thousands of little things make
        <br />
        one unforgettable wedding.
        <br />
        <em>Keep them all together.</em>
      </h2>
      <p>
        Start with your shared wedding workspace.
        <br />
        Make room for the moments that matter.
      </p>
      <div className="mmm-closing-actions">
        <Button href={demoOnly ? '/demo' : '/login'}>
          {demoOnly ? 'Step inside the demo' : 'Create your wedding'}
        </Button>
        <Button href="/demo" secondary>
          Explore the demo
        </Button>
      </div>
      <p className="mmm-closing-note">
        {demoOnly
          ? 'Public preview · Sample data only · Accounts coming later'
          : 'Email sign-in · Five wedding events to start · Made for Indian weddings'}
      </p>
    </section>
  );
}

function Footer() {
  const demoOnly = isPublicDemo();
  const columns = [
    {
      title: 'Platform',
      links: [
        { label: 'Features', href: '#features' },
        { label: 'Wedding demo', href: '/demo' },
        { label: 'How it works', href: '#how-it-works' },
      ],
    },
    {
      title: 'Your celebration',
      links: [
        { label: 'Family collaboration', href: '#family-collaboration' },
        { label: 'Wedding events', href: '#celebrations' },
        { label: 'Guest experience', href: '#guest-experience' },
      ],
    },
    {
      title: 'A thoughtful beginning',
      links: [
        {
          label: demoOnly ? 'Explore the demo' : 'Create your wedding',
          href: demoOnly ? '/demo' : '/login',
        },
        { label: 'Privacy approach', href: '#privacy-approach' },
        { label: 'Photo sharing plans', href: '#memories' },
      ],
    },
  ];
  return (
    <footer className="mmm-footer">
      <div className="mmm-container">
        <div className="mmm-footer-top">
          <div>
            <Link className="mmm-brand" href="/">
              <span className="mmm-brand-mark">
                <Icon name="infinity" />
              </span>
              <span>Make My Marriage</span>
            </Link>
            <p>
              A thoughtful shared space for the plans, people, and many
              celebrations of an Indian wedding.
            </p>
          </div>
          <div className="mmm-footer-columns">
            {columns.map((column) => (
              <div key={column.title}>
                <h3>{column.title}</h3>
                {column.links.map((link) => (
                  <Link href={link.href} key={link.label}>
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="mmm-footer-bottom">
          <span>
            © {new Date().getFullYear()} Make My Marriage. Made with care for
            Indian weddings.
          </span>
          <span>Your plans. Your people. Your celebration.</span>
        </div>
      </div>
    </footer>
  );
}

export function LandingPage() {
  return (
    <div className="mmm-landing">
      <a className="mmm-skip-link" href="#main-content">
        Skip to content
      </a>
      <LandingHeader demoOnly={isPublicDemo()} />
      <main className="mmm-landing-main" id="main-content">
        {isPublicDemo() && (
          <p className="mmm-container intro" role="note">
            Public preview: explore a sample wedding. Accounts and personal
            workspaces are coming later.
          </p>
        )}
        <Hero />
        <ValuePillars />
        <PlanningOverview />
        <Celebrations />
        <CoreModules />
        <Memories />
        <Family />
        <GuestExperience />
        <WeddingWebsite />
        <DemoCallout />
        <Closing />
      </main>
      <Footer />
    </div>
  );
}
