/**
 * Screen 7.4 — Set the mandate (placeholder).
 * WP-2 replaces this file with the full implementation (including the
 * ?edit=:agentId edit mode + re-pricing sheet); WP-0 only registers the
 * route so navigation and shell tests work end to end.
 */
export default function Mandate() {
  return (
    <div className="mx-auto max-w-shell px-6 py-8" data-testid="screen-Mandate">
      <div className="mb-1 text-2xs font-bold uppercase tracking-widest text-faint">
        Screen 7.4 · placeholder (WP-2)
      </div>
      <h1 className="text-lg">Set the mandate</h1>
      <p className="mt-2 max-w-xl text-sm text-muted">
        Four rule groups + Principal countersignature (and ?edit=:agentId edit
        mode).
      </p>
    </div>
  );
}
