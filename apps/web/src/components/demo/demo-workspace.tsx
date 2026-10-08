'use client';

import { useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import Image from 'next/image';
import styles from './demo.module.css';

const tabs = [
  'Overview',
  'Events',
  'Guests',
  'Tasks',
  'Expenses',
  'Shopping',
  'Vendors',
] as const;
type Tab = (typeof tabs)[number];

const events = [
  {
    name: 'Haldi',
    day: '10 Dec',
    time: '10:00 AM',
    venue: 'Poolside lawns',
    dress: 'Yellow & floral',
    attendees: 126,
    invited: 140,
    tone: 'gold',
  },
  {
    name: 'Mehndi',
    day: '10 Dec',
    time: '4:00 PM',
    venue: 'Palace verandah',
    dress: 'Pastels & traditional',
    attendees: 144,
    invited: 180,
    tone: 'sage',
  },
  {
    name: 'Sangeet',
    day: '11 Dec',
    time: '7:00 PM',
    venue: 'Regal ballroom',
    dress: 'A little sparkle',
    attendees: 238,
    invited: 280,
    tone: 'burgundy',
  },
  {
    name: 'Wedding',
    day: '12 Dec',
    time: '7:15 PM',
    venue: 'Baradari mandap',
    dress: 'Traditional festive',
    attendees: 248,
    invited: 286,
    tone: 'burgundy',
  },
  {
    name: 'Reception',
    day: '13 Dec',
    time: '7:30 PM',
    venue: 'Palace gardens',
    dress: 'Evening celebration',
    attendees: 252,
    invited: 286,
    tone: 'sage',
  },
] as const;

const guests = [
  ['Riya Sharma', 'Bride', 'Jaipur', 'Haldi, Wedding', 'Attending'],
  ['Karan Mehta', 'Groom', 'Delhi', 'Sangeet, Wedding', 'Pending'],
  ['Neha Kapoor', 'Common', 'Mumbai', 'Wedding, Reception', 'Attending'],
  ['Vivek Singh', 'Groom', 'Pune', 'Wedding', 'Not Attending'],
];

const tasks = [
  ['Confirm the flower palette', 'Mehndi', 'Priya', '8 Dec', 'In Progress'],
  ['Finalize the sangeet playlist', 'Sangeet', 'Riya', '9 Dec', 'To Do'],
  ['Check venue arrival timings', 'Wedding', 'Ashu', '10 Dec', 'To Do'],
  [
    'Shortlist invitation wording',
    'Wedding-level',
    'Neha',
    '5 Dec',
    'Completed',
  ],
];

const expenses = [
  ['Venue & catering', 'Wedding', '₹5,20,000', '₹3,40,000', 'Partially Paid'],
  ['Photography', 'All events', '₹1,40,000', '₹90,000', 'Partially Paid'],
  ['Decor & flowers', 'All events', '₹1,00,000', '₹50,000', 'Partially Paid'],
  ['Music & sound', 'Sangeet', '₹50,000', '₹30,000', 'Partially Paid'],
  ['Invitations', 'Wedding-level', '₹30,000', '₹10,000', 'Partially Paid'],
];

const shopping = [
  ['Wedding lehenga', 'Clothing', 'Priya', 'Wedding', 'Purchased'],
  ['Sherwani accessories', 'Accessories', 'Ashu', 'Wedding', 'Ordered'],
  ['Welcome hampers', 'Gifts', 'Guests', 'Wedding-level', 'Shortlisted'],
  ['Sangeet shoes', 'Footwear', 'Priya', 'Sangeet', 'Need to Buy'],
];

const vendors = [
  ['Frame & Story Studio', 'Photographer', 'All events', 'Ashu'],
  ['Marigold Celebrations', 'Decorator', 'Haldi, Mehndi, Wedding', 'Priya'],
  ['The Royal Table', 'Caterer', 'Wedding, Reception', 'Ashu'],
  ['Rhythm Collective', 'DJ & sound', 'Sangeet', 'Riya'],
];

function Status({ children }: { children: string }) {
  const positive = ['Attending', 'Completed', 'Purchased'].includes(children);
  return (
    <span
      className={`${styles.status} ${positive ? styles.statusPositive : styles.statusNeutral}`}
    >
      {children}
    </span>
  );
}

function SampleTable({
  title,
  caption,
  columns,
  rows,
  statusColumn,
}: {
  title: string;
  caption: string;
  columns: string[];
  rows: string[][];
  statusColumn?: number;
}) {
  return (
    <div className={styles.tableSection}>
      <div className={styles.panelHeading}>
        <div>
          <h3>{title}</h3>
          <p>{caption}</p>
        </div>
        <span className={styles.quietBadge}>Sample data</span>
      </div>
      <div
        className={styles.tableWrap}
        role="region"
        aria-label={`${title} sample table`}
        tabIndex={0}
      >
        <table className={styles.table}>
          <caption className={styles.srOnly}>
            {title} — illustrative, read-only records
          </caption>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column} scope="col">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row[0]}>
                {row.map((value, index) => (
                  <td key={`${row[0]}-${columns[index]}`}>
                    {index === statusColumn ? <Status>{value}</Status> : value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Events({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`${styles.events} ${compact ? styles.eventsCompact : ''}`}>
      {events.map((event, index) => (
        <article
          key={event.name}
          className={`${styles.event} ${styles[event.tone]}`}
        >
          <span className={styles.eventNumber} aria-hidden="true">
            0{index + 1}
          </span>
          <p className={styles.eventDate}>
            {event.day} · {event.time}
          </p>
          <h3>{event.name}</h3>
          <p className={styles.eventVenue}>{event.venue}</p>
          {!compact && (
            <p className={styles.dressCode}>Dress code: {event.dress}</p>
          )}
          <p className={styles.eventAttendees}>
            {event.attendees} of {event.invited} attending · sample RSVP
          </p>
        </article>
      ))}
    </div>
  );
}

function Stat({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className={styles.stat}>
      <dt>{label}</dt>
      <dd>{value}</dd>
      <p>{detail}</p>
    </div>
  );
}

function Overview() {
  return (
    <>
      <dl className={styles.stats}>
        <Stat
          label="Wedding guests"
          value="286"
          detail="248 attending the wedding event"
        />
        <Stat
          label="Tasks completed"
          value="34 / 42"
          detail="8 little details still to arrange"
        />
        <Stat
          label="Recorded expenses"
          value="₹8,40,000"
          detail="₹5,20,000 paid · ₹3,20,000 remaining"
        />
      </dl>
      <div className={styles.panelHeading}>
        <div>
          <h3>Five celebrations. One beautiful story.</h3>
          <p>A sample of the standard events created with a wedding.</p>
        </div>
      </div>
      <Events compact />
      <div className={styles.overviewColumns}>
        <div className={styles.overviewCard}>
          <div className={styles.panelHeading}>
            <div>
              <h3>Little things, shared together</h3>
              <p>A few tasks from the sample workspace</p>
            </div>
          </div>
          <ul className={styles.taskList}>
            {tasks.slice(0, 3).map((task) => (
              <li key={task[0]}>
                <span className={styles.taskDot} aria-hidden="true" />
                <div>
                  <strong>{task[0]}</strong>
                  <p>
                    {task[2]} · Due {task[3]}
                  </p>
                </div>
                <Status>{task[4] ?? 'To Do'}</Status>
              </li>
            ))}
          </ul>
        </div>
        <div className={`${styles.overviewCard} ${styles.rsvpCard}`}>
          <p className={styles.eyebrow}>Wedding event · Sample RSVP</p>
          <h3>Making room for your people.</h3>
          <div className={styles.rsvpTotal}>
            <strong>248</strong>
            <span>guests attending</span>
          </div>
          <div className={styles.rsvpBar} aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <ul className={styles.rsvpLegend}>
            <li>
              <span className={styles.sageDot} />
              248 attending
            </li>
            <li>
              <span className={styles.goldDot} />
              28 pending
            </li>
            <li>
              <span className={styles.grayDot} />
              10 not attending
            </li>
          </ul>
          <p className={styles.footnote}>
            Responses belong to individual events. The guest list stays in one
            place.
          </p>
        </div>
      </div>
    </>
  );
}

function TabContent({ tab }: { tab: Tab }) {
  const content: Record<Tab, ReactNode> = {
    Overview: <Overview />,
    Events: (
      <>
        <div className={styles.panelHeading}>
          <div>
            <h3>A celebration for every chapter</h3>
            <p>Illustrative dates, venues, and event-level guest responses.</p>
          </div>
        </div>
        <Events />
      </>
    ),
    Guests: (
      <>
        <dl className={styles.stats}>
          <Stat
            label="Guests in one collection"
            value="286"
            detail="Bride, Groom, and Common sides"
          />
          <Stat
            label="Wedding event attending"
            value="248"
            detail="Individual per-event responses"
          />
          <Stat
            label="Wedding event pending"
            value="28"
            detail="10 guests not attending"
          />
        </dl>
        <SampleTable
          title="The people who make it a wedding"
          caption="Four example records from the sample guest list. An event response is shown below."
          columns={['Guest', 'Side', 'City', 'Assigned events', 'Wedding RSVP']}
          rows={guests}
          statusColumn={4}
        />
      </>
    ),
    Tasks: (
      <SampleTable
        title="A clear place for every little detail"
        caption="Four example tasks, assigned to people and events. 34 of 42 sample tasks are completed overall."
        columns={['Task', 'Event', 'Assignee', 'Due date', 'Status']}
        rows={tasks}
        statusColumn={4}
      />
    ),
    Expenses: (
      <>
        <dl className={styles.stats}>
          <Stat
            label="Total recorded"
            value="₹8,40,000"
            detail="Across 5 illustrative expenses"
          />
          <Stat
            label="Paid so far"
            value="₹5,20,000"
            detail="Sample payments recorded"
          />
          <Stat
            label="Remaining"
            value="₹3,20,000"
            detail="Recorded amount minus paid amount"
          />
        </dl>
        <SampleTable
          title="The numbers, together in one place"
          caption="Illustrative expense amounts in INR. No payments are processed in this preview."
          columns={['Expense', 'Event', 'Amount', 'Paid', 'Payment status']}
          rows={expenses}
          statusColumn={4}
        />
      </>
    ),
    Shopping: (
      <SampleTable
        title="Something special for everyone"
        caption="Shopping is tracked separately from expenses. Four illustrative items are shown."
        columns={['Item', 'Category', 'For whom', 'Event', 'Status']}
        rows={shopping}
        statusColumn={4}
      />
    ),
    Vendors: (
      <SampleTable
        title="Your wedding team, all together"
        caption="Fictional vendor records for this sample. No vendor booking or marketplace payments."
        columns={['Vendor', 'Category', 'Linked events', 'Coordinated by']}
        rows={vendors}
      />
    ),
  };
  return content[tab];
}

export function DemoWorkspace() {
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function handleTabKey(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    let nextIndex: number | undefined;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft')
      nextIndex = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = tabs.length - 1;
    if (nextIndex === undefined) return;
    event.preventDefault();
    const nextTab = tabs[nextIndex];
    if (!nextTab) return;
    setActiveTab(nextTab);
    tabRefs.current[nextIndex]?.focus();
  }

  return (
    <section
      className={styles.workspace}
      aria-label="Read-only Ashu and Priya planning workspace"
    >
      <div className={styles.workspaceHero}>
        <div className={styles.workspaceHeroCopy}>
          <p className={styles.eyebrow}>The Ashu &amp; Priya wedding</p>
          <h2>
            A celebration,
            <br />
            <span>beautifully in sync.</span>
          </h2>
          <p className={styles.workspaceDate}>
            12 December 2026 <span aria-hidden="true">·</span> Jaipur
          </p>
          <div className={styles.familyLine}>
            <span className={styles.avatars} aria-hidden="true">
              <span>A</span>
              <span>P</span>
              <span>R</span>
              <span>N</span>
            </span>
            <span>One shared space for the couple &amp; family</span>
          </div>
        </div>
        <div className={styles.heroPhoto}>
          <Image
            src="/images/ashu-priya-wedding.jpg"
            alt="Sample wedding photograph of an Indian bride and groom"
            fill
            sizes="(max-width: 600px) 85vw, 420px"
            className={styles.photo}
          />
          <span className={styles.photoTag}>
            Every detail. Every celebration.
          </span>
        </div>
      </div>

      <div
        className={styles.tabBar}
        role="tablist"
        aria-label="Sample wedding planning sections"
      >
        {tabs.map((tab, index) => (
          <button
            key={tab}
            type="button"
            role="tab"
            id={`demo-tab-${tab.toLowerCase()}`}
            aria-controls={`demo-panel-${tab.toLowerCase()}`}
            aria-selected={activeTab === tab}
            tabIndex={activeTab === tab ? 0 : -1}
            ref={(element) => {
              tabRefs.current[index] = element;
            }}
            onClick={() => setActiveTab(tab)}
            onKeyDown={(event) => handleTabKey(event, index)}
            className={styles.tab}
          >
            {tab}
          </button>
        ))}
        <span className={styles.tabReadOnly}>Read-only</span>
      </div>
      {tabs.map((tab) => (
        <div
          key={tab}
          role="tabpanel"
          id={`demo-panel-${tab.toLowerCase()}`}
          aria-labelledby={`demo-tab-${tab.toLowerCase()}`}
          tabIndex={activeTab === tab ? 0 : -1}
          hidden={activeTab !== tab}
          className={styles.tabPanel}
        >
          <TabContent tab={tab} />
        </div>
      ))}
      <div className={styles.workspaceFooter}>
        <span className={styles.smallDiamond} aria-hidden="true">
          ✧
        </span>
        Illustrative workspace · Viewing this sample never changes a real
        wedding.
      </div>
    </section>
  );
}
