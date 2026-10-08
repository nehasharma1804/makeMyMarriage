// Vercel defaults to the public demo until the full account launch is prepared.
// Local development retains the API-backed account flow.
export function isPublicDemo() {
  return (
    process.env.PUBLIC_DEMO_ONLY === 'true' ||
    (process.env.VERCEL === '1' && process.env.PUBLIC_DEMO_ONLY !== 'false')
  );
}
