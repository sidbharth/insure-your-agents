/**
 * Screen 7.12 — Presenter panel (placeholder overlay).
 * WP-5 replaces this file with the six control groups (inject incident,
 * verification, price, time, force states, reset). WP-0 owns the chord
 * listener in App.tsx and this drawer's open/close plumbing.
 */
import { useStore } from '../store';

export default function PresenterPanel() {
  const open = useStore((s) => s.presenter.panelOpen);
  const setPanelOpen = useStore((s) => s.setPanelOpen);
  const reset = useStore((s) => s.reset);

  if (!open) return null;

  return (
    <div
      data-testid="presenter-panel"
      className="fixed inset-y-0 right-0 z-50 w-[380px] overflow-y-auto border-l border-ink-2 bg-ink p-5 text-white shadow-card"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xs font-bold uppercase tracking-widest text-[#9db1cc]">
            Presenter panel · hidden
          </div>
          <h2 className="text-md text-white">Stage manager</h2>
        </div>
        <button
          type="button"
          data-testid="presenter-close"
          onClick={() => setPanelOpen(false)}
          className="rounded-lg border border-white/20 px-2.5 py-1 text-xs text-[#c3cfdf]"
        >
          Close
        </button>
      </div>
      <p className="mt-3 text-xs text-[#93a5bc]">
        Placeholder (WP-5): inject incident · verification control · price
        control · time control · force states · reset.
      </p>
      <button
        type="button"
        data-testid="presenter-reset"
        onClick={() => reset()}
        className="mt-4 w-full rounded-lg bg-bad px-3 py-2 text-sm font-semibold text-white"
      >
        Reset to seed
      </button>
    </div>
  );
}
