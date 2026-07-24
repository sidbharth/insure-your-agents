/**
 * Screen 7.9 — My policies (placeholder).
 * WP-4 replaces this file with the full implementation; WP-0 only registers
 * the route so navigation and shell tests work end to end.
 */
export default function Policies() {
  return (
    <div className="mx-auto max-w-shell px-6 py-8" data-testid="screen-Policies">
      <div className="mb-1 text-2xs font-bold uppercase tracking-widest text-faint">
        Screen 7.9 · placeholder (WP-4)
      </div>
      <h1 className="text-lg">My policies</h1>
      <p className="mt-2 max-w-xl text-sm text-muted">Per-agent policy rows, near-miss feed, renewal preview, mid-term changes.</p>
    </div>
  );
}
