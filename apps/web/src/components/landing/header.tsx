'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Icon } from './icon';

const navigation = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '/demo', label: 'Demo' },
  { href: '#family-collaboration', label: 'Family collaboration' },
];

export function LandingHeader({ demoOnly = false }: { demoOnly?: boolean }) {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    <header className="mmm-header">
      <div className="mmm-container mmm-header-inner">
        <Link className="mmm-brand" href="/" aria-label="Make My Marriage home">
          <span className="mmm-brand-mark">
            <Icon name="infinity" />
          </span>
          <span>Make My Marriage</span>
        </Link>
        <nav className="mmm-desktop-nav" aria-label="Main navigation">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mmm-header-actions">
          {!demoOnly && (
            <Link className="mmm-sign-in" href="/login">
              Sign in
            </Link>
          )}
          <Link
            className="mmm-button mmm-button-primary mmm-header-cta"
            href={demoOnly ? '/demo' : '/login'}
          >
            {demoOnly ? 'Explore the demo' : 'Create your wedding'}
          </Link>
          <button
            className="mmm-menu-toggle"
            ref={toggle}
            type="button"
            aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => setOpen(!open)}
          >
            <Icon name={open ? 'close' : 'menu'} />
          </button>
        </div>
      </div>
      <nav
        id="mobile-navigation"
        className={`mmm-mobile-nav${open ? ' is-open' : ''}`}
        aria-label="Mobile navigation"
        hidden={!open}
      >
        {navigation.map((item) => (
          <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
            {item.label}
          </Link>
        ))}
        {!demoOnly && (
          <Link href="/login" onClick={() => setOpen(false)}>
            Sign in with email
          </Link>
        )}
      </nav>
    </header>
  );
}
