import type { ReactNode } from 'react';

const drawings = {
  infinity: (
    <path d="M12 12C9 8 7.5 6.5 5 6.5a5.5 5.5 0 0 0 0 11c2.5 0 4-1.5 7-5.5s4.5-5.5 7-5.5a5.5 5.5 0 0 1 0 11c-2.5 0-4-1.5-7-5.5Z" />
  ),
  arrow: <path d="M4 12h15m-6-6 6 6-6 6" />,
  chevron: <path d="m9 5 7 7-7 7" />,
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M7 3v4m10-4v4M3 10h18m-13 4h2m4 0h2m-8 4h2" />
    </>
  ),
  people: (
    <>
      <circle cx="9" cy="7" r="3" />
      <path d="M3 21v-3a6 6 0 0 1 12 0v3m2-17a3 3 0 0 1 0 6m2 11v-3a6 6 0 0 0-3-5" />
    </>
  ),
  shield: (
    <>
      <path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z" />
      <path d="m8 12 3 3 5-6" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  checkCircle: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m7 12 3 3 7-7" />
    </>
  ),
  heart: <path d="m12 21-8-8a5.5 5.5 0 0 1 8-7.5A5.5 5.5 0 0 1 20 13l-8 8Z" />,
  temple: (
    <>
      <path d="M3 21h18M5 21V11h14v10M3 11h18L12 3 3 11Zm5 10v-6h8v6" />
      <path d="M12 3V1m-5 10v2m10-2v2" />
    </>
  ),
  flower: (
    <>
      <path d="M12 8c-5-9-12-1-6 4-9 5-1 12 4 6 5 9 12 1 6-4 9-5 1-12-4-6Z" />
      <circle cx="12" cy="13" r="3" />
    </>
  ),
  brush: (
    <>
      <path d="m14 5 5-3 3 3-3 5-7 7-5-5 7-7Z" />
      <path d="M7 12c-3 0-5 2-5 5 0 2-1 4-1 4s7 1 8-4" />
    </>
  ),
  music: (
    <>
      <path d="M9 18V5l11-2v13M9 9l11-2" />
      <ellipse cx="6" cy="18" rx="3" ry="3" />
      <ellipse cx="17" cy="16" rx="3" ry="3" />
    </>
  ),
  flame: (
    <path d="M12 22c-6 0-9-5-7-10 1-3 3-4 3-7 2 2 3 3 3 6 3-3 3-6 3-9 5 5 7 9 6 13-1 5-4 7-8 7Zm0-3c3 0 4-2 3-5-1 1-1 2-3 2-1-1-1-2-1-4-3 3-3 7 1 7Z" />
  ),
  party: (
    <>
      <path d="m3 21 4-14 10 10-14 4Zm4-14 10 10M14 3v3m5-1-2 3m5 4h-3M9 2l1 2m10 17 2 1" />
      <path d="M13 10c5 0 1-5 7-5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  wallet: (
    <>
      <path d="M21 8V5H5a3 3 0 0 0 0 6h16v9H5a3 3 0 0 1-3-3V8" />
      <path d="M21 11h-6v5h6" />
      <circle cx="17" cy="13.5" r=".5" />
    </>
  ),
  shopping: (
    <>
      <path d="M5 7h14l2 14H3L5 7Z" />
      <path d="M8 8V6a4 4 0 0 1 8 0v2" />
    </>
  ),
  tasks: (
    <>
      <rect x="5" y="3" width="16" height="18" rx="2" />
      <path d="M9 8h8m-8 5h8m-8 5h5M2 7h3m-3 6h3m-3 6h3" />
    </>
  ),
  vendor: (
    <>
      <rect x="3" y="7" width="18" height="14" rx="2" />
      <path d="M8 7V3h8v4M3 12h18m-11 0v3h4v-3" />
    </>
  ),
  camera: (
    <>
      <path d="M8 5 6 8H3v12h18V8h-3l-2-3H8Z" />
      <circle cx="12" cy="13" r="4" />
    </>
  ),
  upload: (
    <>
      <path d="M6 17a5 5 0 0 1-2-9 8 8 0 0 1 15-2 5 5 0 0 1 0 11M12 22V11m-4 4 4-4 4 4" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 6 9 7 9-7" />
    </>
  ),
  location: (
    <>
      <path d="M19 10c0 5-7 12-7 12S5 15 5 10a7 7 0 1 1 14 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  link: (
    <>
      <path d="m10 8 3-3a5 5 0 0 1 7 7l-3 3m-3 1-3 3a5 5 0 0 1-7-7l3-3m2 5 6-6" />
    </>
  ),
  phone: (
    <>
      <rect x="6" y="2" width="12" height="20" rx="3" />
      <path d="M10 5h4m-3 14h2" />
    </>
  ),
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  close: <path d="m6 6 12 12M6 18 18 6" />,
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof drawings;

export function Icon({
  name,
  className = '',
}: {
  name: IconName;
  className?: string;
}) {
  return (
    <svg
      className={`mmm-icon ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {drawings[name]}
    </svg>
  );
}
