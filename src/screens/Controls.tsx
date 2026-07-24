/**
 * Screen 7.5 — Safety controls (placeholder).
 * WP-2 replaces this file with the full implementation; WP-0 only registers
 * the route so navigation and shell tests work end to end.
 */
export default function Controls() {
  return (
    <div className="mx-auto max-w-shell px-6 py-8" data-testid="screen-Controls">
      <div className="mb-1 text-2xs font-bold uppercase tracking-widest text-faint">
        Screen 7.5 · placeholder (WP-2)
      </div>
      <h1 className="text-lg">Safety controls</h1>
      <p className="mt-2 max-w-xl text-sm text-muted">Tier-1 gates that DECLINE, tier-2 priced toggles, animated rate ladder.</p>
    </div>
  );
}
