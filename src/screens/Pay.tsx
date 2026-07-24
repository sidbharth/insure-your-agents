/**
 * Screen 7.8 — Deposit requirement now (placeholder).
 * WP-3 replaces this file with the full implementation; WP-0 only registers
 * the route so navigation and shell tests work end to end.
 */
export default function Pay() {
  return (
    <div className="mx-auto max-w-shell px-6 py-8" data-testid="screen-Pay">
      <div className="mb-1 text-2xs font-bold uppercase tracking-widest text-faint">
        Screen 7.8 · placeholder (WP-3)
      </div>
      <h1 className="text-lg">Deposit requirement now</h1>
      <p className="mt-2 max-w-xl text-sm text-muted">Order summary, settlement line in N, retention preview, activation ceremony.</p>
    </div>
  );
}
