'use client';

import { useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createWeddingSchema, type WeddingWorkspace } from '@mmm/contracts';
import { ApiRequestError, requestApi } from '@/lib/api-client';
import styles from './account.module.css';

export function CreateWeddingForm({ csrfToken }: { csrfToken: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const submitting = useRef(false);
  const router = useRouter();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const form = new FormData(event.currentTarget);
    const input = createWeddingSchema.safeParse({
      brideName: form.get('brideName'),
      groomName: form.get('groomName'),
      weddingDate: form.get('weddingDate'),
      city: form.get('city'),
      description: form.get('description'),
    });
    setError('');
    setFieldErrors({});
    if (!input.success) {
      const messages: Record<string, string> = {};
      for (const issue of input.error.issues) {
        const field = String(issue.path[0]);
        messages[field] =
          field === 'weddingDate'
            ? 'Choose a valid wedding date.'
            : 'Please check this field.';
      }
      setFieldErrors(messages);
      return;
    }
    submitting.current = true;
    setBusy(true);
    try {
      await requestApi<WeddingWorkspace>('weddings', {
        method: 'POST',
        headers: { 'x-csrf-token': csrfToken },
        body: JSON.stringify(input.data),
      });
      router.replace('/app/dashboard');
      router.refresh();
    } catch (failure) {
      if (failure instanceof ApiRequestError && failure.status === 401) {
        router.replace('/login');
        return;
      }
      if (
        failure instanceof ApiRequestError &&
        ['WEDDING_ALREADY_EXISTS', 'RESOURCE_CONFLICT'].includes(failure.code)
      ) {
        router.replace('/app/dashboard');
        router.refresh();
        return;
      }
      setError(
        failure instanceof ApiRequestError
          ? failure.message
          : 'We couldn’t create your wedding. Please try again.',
      );
      setBusy(false);
      submitting.current = false;
    }
  }

  const errorFor = (name: string) =>
    fieldErrors[name] && (
      <span id={`${name}-error`} className={styles.fieldError}>
        {fieldErrors[name]}
      </span>
    );

  return (
    <form className={styles.form} onSubmit={submit} aria-busy={busy}>
      <div className={styles.twoColumns}>
        <div className={styles.field}>
          <label htmlFor="brideName">Bride’s name</label>
          <input
            id="brideName"
            name="brideName"
            autoComplete="off"
            required
            maxLength={100}
            disabled={busy}
            aria-invalid={Boolean(fieldErrors.brideName)}
            aria-describedby={
              fieldErrors.brideName ? 'brideName-error' : undefined
            }
          />
          {errorFor('brideName')}
        </div>
        <div className={styles.field}>
          <label htmlFor="groomName">Groom’s name</label>
          <input
            id="groomName"
            name="groomName"
            autoComplete="off"
            required
            maxLength={100}
            disabled={busy}
            aria-invalid={Boolean(fieldErrors.groomName)}
            aria-describedby={
              fieldErrors.groomName ? 'groomName-error' : undefined
            }
          />
          {errorFor('groomName')}
        </div>
      </div>
      <div className={styles.twoColumns}>
        <div className={styles.field}>
          <label htmlFor="weddingDate">Wedding date</label>
          <input
            type="date"
            id="weddingDate"
            name="weddingDate"
            min="1900-01-01"
            max="2200-12-31"
            required
            disabled={busy}
            aria-invalid={Boolean(fieldErrors.weddingDate)}
            aria-describedby={
              fieldErrors.weddingDate ? 'weddingDate-error' : undefined
            }
          />
          {errorFor('weddingDate')}
        </div>
        <div className={styles.field}>
          <label htmlFor="city">Wedding city</label>
          <input
            id="city"
            name="city"
            autoComplete="address-level2"
            placeholder="e.g. Jaipur"
            required
            maxLength={120}
            disabled={busy}
            aria-invalid={Boolean(fieldErrors.city)}
            aria-describedby={fieldErrors.city ? 'city-error' : undefined}
          />
          {errorFor('city')}
        </div>
      </div>
      <div className={styles.field}>
        <label htmlFor="description">
          A little about your celebration{' '}
          <span className={styles.small}>(optional)</span>
        </label>
        <textarea
          id="description"
          name="description"
          maxLength={2000}
          disabled={busy}
          placeholder="Share a note about the wedding you’re planning."
          aria-invalid={Boolean(fieldErrors.description)}
          aria-describedby={
            fieldErrors.description ? 'description-error' : undefined
          }
        />
        {errorFor('description')}
      </div>
      <p className={styles.small}>
        We’ll add Haldi, Mehndi, Sangeet, Wedding, and Reception to your
        workspace. Their dates and venues can be planned later.
      </p>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <div className={styles.formActions}>
        <span className={styles.small} role="status">
          {busy
            ? 'Creating your wedding…'
            : 'Your planning details stay in your private workspace.'}
        </span>
        <button type="submit" className={styles.button} disabled={busy}>
          {busy ? 'Creating…' : 'Create your wedding →'}
        </button>
      </div>
    </form>
  );
}
