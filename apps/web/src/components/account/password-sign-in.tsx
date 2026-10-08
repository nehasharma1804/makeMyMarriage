'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  loginSchema,
  registerSchema,
  type AuthConfig,
  type AuthSession,
} from '@mmm/contracts';
import { ApiRequestError, requestApi } from '@/lib/api-client';
import { Icon } from '@/components/landing/icon';
import styles from './sign-in.module.css';

export function PasswordSignIn() {
  const [config, setConfig] = useState<AuthConfig | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const submitting = useRef(false);
  const errorRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    let active = true;
    requestApi<AuthConfig>('auth/config')
      .then(async (value) => {
        if (!active) return;
        setConfig(value);
        setLoaded(true);
        if (value.configured) {
          try {
            const session = await requestApi<AuthSession>('auth/me');
            if (active)
              router.replace(
                session.requiresWeddingSetup ? '/app/setup' : '/app/dashboard',
              );
          } catch (failure) {
            if (
              active &&
              !(failure instanceof ApiRequestError && failure.status === 401)
            )
              setError('We could not check your session. Please try again.');
          }
        }
      })
      .catch(() => {
        if (active) {
          setLoaded(true);
          setConfig(null);
        }
      });
    return () => {
      active = false;
    };
  }, [router, attempt]);

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current || !loaded || !config?.configured) return;
    const form = event.currentTarget;
    const values = new FormData(form);
    const password = String(values.get('password') ?? '');
    if (mode === 'register' && password !== values.get('confirmPassword')) {
      setError('The passwords do not match.');
      return;
    }
    submitting.current = true;
    setBusy(true);
    setError('');
    try {
      // Always obtain a fresh one-time challenge, including after a failed login.
      const fresh = await requestApi<AuthConfig>('auth/config');
      setConfig(fresh);
      if (!fresh.configured || !fresh.nonce || !fresh.csrfToken)
        throw new Error(
          'Sign-in is temporarily unavailable. Please try again shortly.',
        );
      const input = {
        email: values.get('email'),
        password,
        nonce: fresh.nonce,
        ...(mode === 'register' ? { name: values.get('name') } : {}),
      };
      const parsed = (
        mode === 'register' ? registerSchema : loginSchema
      ).safeParse(input);
      if (!parsed.success) {
        setError(
          mode === 'register'
            ? 'Enter your name, a valid email, and a password of 15–128 characters.'
            : 'Enter a valid email and password.',
        );
        return;
      }
      const session = await requestApi<AuthSession>(`auth/${mode}`, {
        method: 'POST',
        headers: { 'x-csrf-token': fresh.csrfToken },
        body: JSON.stringify(parsed.data),
      });
      form.reset();
      router.replace(
        session.requiresWeddingSetup ? '/app/setup' : '/app/dashboard',
      );
      router.refresh();
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : 'We could not sign you in. Please try again.',
      );
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }

  return (
    <>
      <h1 className={styles.formTitle}>
        {mode === 'login' ? 'Welcome back.' : 'Your story starts here.'}
      </h1>
      <p className={styles.formIntro}>
        {mode === 'login'
          ? 'Sign in and pick up where the planning left off.'
          : 'Create an account to start your wedding workspace.'}
      </p>
      <div className={styles.tabs} role="group" aria-label="Account action">
        <button
          type="button"
          className={styles.tab}
          aria-pressed={mode === 'login'}
          disabled={busy}
          onClick={() => {
            setMode('login');
            setShowPassword(false);
            setError('');
          }}
        >
          Sign in
        </button>
        <button
          type="button"
          className={styles.tab}
          aria-pressed={mode === 'register'}
          disabled={busy}
          onClick={() => {
            setMode('register');
            setShowPassword(false);
            setError('');
          }}
        >
          Create account
        </button>
      </div>
      {!loaded && (
        <p className={styles.loading} role="status">
          Connecting to your wedding workspace…
        </p>
      )}
      {loaded && !config?.configured && (
        <div className={styles.availability} role="status">
          <strong>We can’t connect to sign-in right now.</strong>
          Please try again in a moment. You can still explore the sample wedding
          below.
          <br />
          <button
            type="button"
            className={styles.retry}
            onClick={() => {
              setLoaded(false);
              setError('');
              setAttempt((value) => value + 1);
            }}
          >
            Try again
          </button>
        </div>
      )}
      <form
        key={mode}
        onSubmit={submit}
        className={styles.form}
        aria-busy={busy}
        aria-label={mode === 'login' ? 'Sign in' : 'Create account'}
      >
        {mode === 'register' && (
          <label className={styles.field}>
            Your name
            <input
              name="name"
              autoComplete="name"
              placeholder="How should we call you?"
              required
              maxLength={100}
              disabled={busy}
            />
          </label>
        )}
        <label className={styles.field}>
          Email address
          <input
            name="email"
            type="email"
            autoComplete="username"
            placeholder="you@example.com"
            required
            maxLength={254}
            disabled={busy}
          />
        </label>
        <div className={styles.field}>
          <label htmlFor="password">Password</label>
          <span className={styles.passwordControl}>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder={
                mode === 'register'
                  ? 'Choose a long, unique password'
                  : 'Enter your password'
              }
              autoComplete={
                mode === 'register' ? 'new-password' : 'current-password'
              }
              required
              minLength={mode === 'register' ? 15 : 1}
              maxLength={128}
              disabled={busy}
              aria-describedby={
                mode === 'register' ? 'password-help' : undefined
              }
            />
            <button
              className={styles.reveal}
              type="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-controls="password"
              aria-pressed={showPassword}
              disabled={busy}
              onClick={() => setShowPassword((value) => !value)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </span>
          {mode === 'register' && (
            <p id="password-help" className={styles.hint}>
              Use 15–128 characters. A memorable passphrase works well.
            </p>
          )}
        </div>
        {mode === 'register' && (
          <label className={styles.field}>
            Confirm password
            <input
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Enter your password again"
              required
              minLength={15}
              maxLength={128}
              disabled={busy}
            />
          </label>
        )}
        {error && (
          <div
            ref={errorRef}
            tabIndex={-1}
            className={styles.error}
            role="alert"
          >
            {error}
          </div>
        )}
        <button
          className={styles.submit}
          disabled={busy || !loaded || !config?.configured}
          type="submit"
        >
          {busy
            ? 'Please wait…'
            : mode === 'register'
              ? 'Create your account'
              : 'Sign in to your workspace'}
          {!busy && <Icon name="arrow" />}
        </button>
      </form>
    </>
  );
}
