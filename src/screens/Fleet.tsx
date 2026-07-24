/**
 * Screen 7.7 — Add additional agents (WP-3; mockups postpurchase-fleet-*).
 *
 * Fleet table + three ways to add agents: duplicate the wizard agent, add a
 * sample agent, or "Import fleet (CSV)" — a latency-theater sweep enrolling
 * the 11 seeded agents in the FIXED Appendix-B order. The totals bar is the
 * EXACT sum of per-agent premiums, $ and N — no discount logic anywhere
 * (REQ-7.7.1, AC-5). The concentration loading is decided atomically on the
 * prospective book (lib/concentration.enroll, plan §4b): the meter crosses
 * 40% at Settle-Bot; Vendor-Bot (exactly 40.0000%) carries no tag; frozen
 * tags persist if the book later drops (REQ-7.7.2, AC-6). Legacy-Bot shows
 * 1.2% + "Coverage B excluded" (REQ-7.7.3). Row menu → De-enroll per D7
 * (REQ-7.7.4) via lib/pricing.deEnrollRefund.
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConcentrationMeter } from '../components/ConcentrationMeter';
import { LatencyTheater } from '../components/LatencyTheater';
import { MathValue } from '../components/MathValue';
import { SimulatedBadge } from '../components/SimulatedBadge';
import { StatusPill } from '../components/StatusPill';
import { FLEET_CALLOUT_COMMON_CAUSE, FLEET_CALLOUT_SUM } from '../data/copy';
import { HELIOS, WIZARD_AGENT, type SeedAgentSpec } from '../data/seed';
import { currentShare } from '../lib/concentration';
import { demoNow } from '../lib/demoClock';
import { shortHash } from '../lib/hash';
import { formatN, formatPct, formatUsd, usdToN, type MathBreakdown } from '../lib/money';
import { deEnrollRefund } from '../lib/pricing';
import { useStore } from '../store';
import type { Agent, Enrollment } from '../store/types';
import {
  capUsdFor,
  controlsSummary,
  coverageBExcluded,
  duplicateWizardAgent,
  enrollAgent,
  enrollmentRatePct,
  fleetTotals,
  hasConcentrationLoading,
  latestEnrollmentsByAgent,
  prepareImportedAgent,
  remainingImportSpecs,
} from './purchase/enroll';

interface ImportState {
  specs: SeedAgentSpec[];
  index: number;
  /** Name of the agent whose enrollment crossed the 40% threshold. */
  crossedAt?: string;
}

function DeEnrollMenu({
  agent,
  enrollment,
  onClose,
}: {
  agent: Agent;
  enrollment: Enrollment;
  onClose: () => void;
}) {
  const claims = useStore((s) => s.claims);
  const incidents = useStore((s) => s.incidents);
  const usdPerN = useStore((s) => s.priceFeed.usdPerN);
  const deEnroll = useStore((s) => s.deEnrollAgent);

  const refund = deEnrollRefund(enrollment, { claims, incidents }, demoNow());
  const blocked = 'reason' in refund;

  return (
    <div
      data-testid={`deenroll-menu-${agent.id}`}
      className="absolute right-0 top-7 z-10 w-[340px] rounded-card border border-line bg-panel p-4 text-left shadow-card"
    >
      <div className="text-sm font-semibold text-ink">De-enroll {agent.name}</div>
      <p className="mt-1.5 text-xs text-muted">
        Cover for <b>new</b> events ends now; past events remain claimable.{' '}
        {blocked ? (
          <span data-testid="deenroll-no-refund">
            No premium returns — <b>{refund.reason}</b> on this agent (D7 exception).
          </span>
        ) : (
          <span data-testid="deenroll-refund">
            Unused premium returns pro rata —{' '}
            <MathValue breakdown={refund.breakdown} className="font-semibold text-ink">
              {formatUsd(refund.usd)} ≈ {formatN(usdToN(refund.usd, usdPerN), { maxFractionDigits: 1 })}
            </MathValue>{' '}
            — unless a claim has been paid or noticed on this agent.
          </span>
        )}
      </p>
      <div className="mt-3 flex gap-2">
        <button
          data-testid={`deenroll-confirm-${agent.id}`}
          className="rounded-md bg-bad px-3 py-1.5 text-xs font-semibold text-white"
          onClick={() => {
            deEnroll(agent.id);
            onClose();
          }}
        >
          De-enroll
        </button>
        <button
          className="rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-ink-2"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function Fleet() {
  const navigate = useNavigate();
  const state = useStore();
  const { agents, book } = state;
  const usdPerN = state.priceFeed.usdPerN;

  const [importing, setImporting] = useState<ImportState | null>(null);
  const [menuFor, setMenuFor] = useState<string | null>(null);

  // The wizard agent arrives from 7.6 priced but possibly not yet enrolled on
  // the book: enroll it first so its row exists and the Appendix-B
  // concentration arithmetic starts from 38.6% (plan §7).
  useEffect(() => {
    const wizard = useStore.getState().agents.find((a) => a.id === WIZARD_AGENT.id);
    if (wizard && wizard.status === 'Draft') {
      prepareImportedAgent(wizard.id);
      enrollAgent(wizard.id);
    }
  }, []);

  const enrollments = latestEnrollmentsByAgent(state);
  const rows = enrollments
    .map((e) => ({ enrollment: e, agent: agents.find((a) => a.id === e.agentId) }))
    .filter((r): r is { enrollment: Enrollment; agent: Agent } => r.agent !== undefined);

  const totals = fleetTotals(state);
  const heliosShare = currentShare(book, HELIOS);

  const totalsBreakdown: MathBreakdown = useMemo(() => {
    const live = rows.filter((r) => r.enrollment.terminatedAt === undefined);
    const groups = new Map<string, { count: number; premium: number }>();
    for (const r of live) {
      const key = `${formatPct(enrollmentRatePct(r.enrollment))} → ${formatUsd(r.enrollment.premiumUsd)}`;
      const g = groups.get(key) ?? { count: 0, premium: r.enrollment.premiumUsd };
      g.count += 1;
      groups.set(key, g);
    }
    const parts = [...groups.entries()].map(
      ([, g]) => `${g.count} × ${formatUsd(g.premium)}`,
    );
    return {
      title: 'Fleet premium — the exact sum, no volume discount',
      inputs: [...groups.entries()].map(([key, g]) => ({
        label: `${g.count} agent${g.count > 1 ? 's' : ''} at ${key.split(' → ')[0]}`,
        amount: `${g.count} × ${formatUsd(g.premium)}`,
      })),
      formula: `${parts.join(' + ')} = ${formatUsd(totals.premiumUsd)} · ÷ $${usdPerN.toFixed(2)} = ${formatN(usdToN(totals.premiumUsd, usdPerN), { maxFractionDigits: 0 })}`,
      clause: 'REQ-7.7.1 · Appendix 3',
      resultUsd: totals.premiumUsd,
      rateUsed: usdPerN,
    };
  }, [rows, totals.premiumUsd, usdPerN]);

  const startImport = () => {
    const specs = remainingImportSpecs(useStore.getState());
    if (specs.length === 0) return;
    setImporting({ specs, index: 0 });
  };

  // LatencyTheater re-reads onDone through a ref each render, so this closure
  // always sees the current `importing` — keep the store side effects OUT of
  // the setState updater (updaters must stay pure).
  const onAgentImported = () => {
    if (!importing || importing.index >= importing.specs.length) return;
    const spec = importing.specs[importing.index];
    prepareImportedAgent(spec.id);
    const outcome = enrollAgent(spec.id);
    const crossedAt =
      importing.crossedAt ?? (outcome.ok && outcome.loadingApplied ? spec.name : undefined);
    // finished — keep the state (and the crossed toast) around
    setImporting({ ...importing, index: importing.index + 1, crossedAt });
  };

  const sweepDone = importing !== null && importing.index >= importing.specs.length;
  const sweepRunning = importing !== null && !sweepDone;
  const currentSpec = sweepRunning ? importing.specs[importing.index] : null;

  return (
    <div className="mx-auto max-w-shell px-6 py-8" data-testid="screen-Fleet">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-lg">Your fleet</h1>
          <p className="mt-1 max-w-xl text-sm text-muted">
            Every agent is enrolled, priced, and covered individually. The fleet
            premium is the plain sum — with two honest fleet effects shown below.
          </p>
        </div>
        <div className="flex flex-none gap-2">
          <button
            data-testid="duplicate-agent-button"
            disabled={sweepRunning}
            className="rounded-md border border-line bg-panel px-3.5 py-2 text-xs font-semibold text-ink-2 shadow-card disabled:opacity-50"
            onClick={() => duplicateWizardAgent()}
          >
            Duplicate Procurement-Bot
          </button>
          <button
            data-testid="add-sample-agent-button"
            disabled={sweepRunning}
            className="rounded-md border border-line bg-panel px-3.5 py-2 text-xs font-semibold text-ink-2 shadow-card disabled:opacity-50"
            onClick={() => {
              const spec = remainingImportSpecs(useStore.getState())[0];
              if (spec) {
                prepareImportedAgent(spec.id);
                enrollAgent(spec.id);
              }
            }}
          >
            Add sample agent
          </button>
          <button
            data-testid="import-fleet-csv-button"
            disabled={sweepRunning || remainingImportSpecs(state).length === 0}
            className="rounded-md bg-accent px-3.5 py-2 text-xs font-semibold text-white disabled:opacity-60"
            onClick={startImport}
          >
            {sweepRunning ? 'Importing…' : 'Import fleet (CSV)'}
          </button>
        </div>
      </div>

      {/* import sweep — latency theater per agent, fixed Appendix-B order */}
      {sweepRunning && currentSpec && (
        <div className="mb-4" data-testid="import-progress-card">
          <div className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-ink">
            Importing fleet.csv — agent {importing.index + 1} of {importing.specs.length}:{' '}
            {currentSpec.name} <SimulatedBadge />
          </div>
          <LatencyTheater
            key={currentSpec.id}
            steps={[
              { label: 'Fetching manifest…' },
              { label: 'Computing configuration hash…' },
              { label: 'Checking tier-1 gates…' },
              { label: 'Pricing controls…' },
            ]}
            totalMs={550}
            onDone={onAgentImported}
          />
        </div>
      )}

      <div className="grid grid-cols-[1fr_320px] items-start gap-4">
        {/* ------------------------------------------------ fleet table */}
        <div className="overflow-visible rounded-card border border-line bg-panel shadow-card" data-testid="fleet-table">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-left text-2xs font-bold uppercase tracking-wider text-muted">
                <th className="px-4 py-2.5">Agent</th>
                <th className="px-2 py-2.5">Hash</th>
                <th className="px-2 py-2.5">Cap</th>
                <th className="px-2 py-2.5">Controls</th>
                <th className="px-2 py-2.5 text-right">Rate</th>
                <th className="px-2 py-2.5 text-right">Premium</th>
                <th className="px-2 py-2.5">Status</th>
                <th className="px-2 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {rows.map(({ agent, enrollment }) => {
                const terminated = enrollment.terminatedAt !== undefined;
                return (
                  <tr
                    key={agent.id}
                    data-testid={`fleet-row-${agent.id}`}
                    className={`border-b border-line-soft last:border-b-0 ${terminated ? 'opacity-55' : ''}`}
                  >
                    <td className="px-4 py-2.5 font-semibold text-ink">{agent.name}</td>
                    <td className="num px-2 py-2.5 font-mono text-xs text-muted">
                      {shortHash(agent.configHash)}
                    </td>
                    <td className="num px-2 py-2.5">{formatUsd(capUsdFor(state, agent.id))}</td>
                    <td className="px-2 py-2.5 text-xs text-muted">
                      {controlsSummary(agent)}
                      {hasConcentrationLoading(enrollment) && (
                        <span
                          data-testid="concentration-tag"
                          className="ml-1.5 inline-flex rounded border border-accent-line bg-accent-soft px-1.5 py-px text-2xs font-semibold text-accent-ink"
                        >
                          +0.1% concentration
                        </span>
                      )}
                      {coverageBExcluded(enrollment) && (
                        <span
                          data-testid="coverage-b-chip"
                          className="ml-1.5 inline-flex rounded border border-bad-line bg-bad-bg px-1.5 py-px text-2xs font-semibold text-bad"
                        >
                          Coverage B excluded
                        </span>
                      )}
                    </td>
                    <td className="num px-2 py-2.5 text-right font-semibold text-ink">
                      {formatPct(enrollmentRatePct(enrollment))}
                    </td>
                    <td className="num px-2 py-2.5 text-right">
                      {formatUsd(enrollment.premiumUsd)}
                      <span className="text-2xs text-faint"> /yr</span>
                    </td>
                    <td className="px-2 py-2.5">
                      <StatusPill status={agent.status} />
                    </td>
                    <td className="relative px-2 py-2.5 text-right">
                      {!terminated && (
                        <button
                          data-testid={`row-menu-${agent.id}`}
                          className="rounded px-1.5 text-md font-bold text-muted hover:bg-line-soft"
                          onClick={() => setMenuFor(menuFor === agent.id ? null : agent.id)}
                          aria-label={`Row menu for ${agent.name}`}
                        >
                          ⋯
                        </button>
                      )}
                      {menuFor === agent.id && !terminated && (
                        <DeEnrollMenu
                          agent={agent}
                          enrollment={enrollment}
                          onClose={() => setMenuFor(null)}
                        />
                      )}
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-sm text-muted">
                    No agents enrolled yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* totals bar — the exact sum, in $ and N (REQ-7.7.1, AC-5) */}
          <div
            data-testid="fleet-totals-bar"
            className="flex items-center gap-7 rounded-b-card bg-ink px-4 py-3 text-[#dfe7f2]"
          >
            <span className="text-2xs font-semibold uppercase tracking-wider text-[#9fb0c6]">
              Fleet total · {totals.count} agent{totals.count === 1 ? '' : 's'}
            </span>
            <span className="num text-xs">
              Insured caps <b className="text-sm">{formatUsd(totals.capsUsd)}</b>
            </span>
            <span className="num ml-auto whitespace-nowrap text-xs">
              Annual premium{' '}
              <MathValue breakdown={totalsBreakdown} className="font-bold">
                <b className="text-md" data-testid="fleet-total-premium">
                  {formatUsd(totals.premiumUsd)}
                </b>{' '}
                <span className="font-mono text-xs text-[#8ed8c3]" data-testid="fleet-total-n">
                  ≈ {formatN(usdToN(totals.premiumUsd, usdPerN), { maxFractionDigits: 0 })} at $
                  {usdPerN.toFixed(2)}
                </span>
              </MathValue>
            </span>
          </div>
          <div className="px-4 py-1.5 text-right text-2xs text-faint">
            exact sum of {totals.count} per-agent premiums · no volume discount
          </div>
        </div>

        {/* ------------------------------------------------ side rail */}
        <div className="flex flex-col gap-3.5">
          <div className="rounded-card border border-line bg-panel p-4 shadow-card">
            <ConcentrationMeter component={HELIOS} share={heliosShare} />
            {importing?.crossedAt && (
              <div
                data-testid="concentration-crossed-toast"
                className="mt-2.5 inline-flex rounded border border-warn-line bg-warn-bg px-2 py-1 text-2xs font-semibold text-warn"
              >
                Threshold crossed at {importing.crossedAt} — enrollments from here on
                carry the +0.1% loading (5.8.2)
              </div>
            )}
            <p className="mt-2 text-xs text-muted">
              Agents enrolled before a crossing keep their rate; the loading is frozen
              into each enrollment when it is made and never changes retroactively
              (5.8.2).
            </p>
          </div>

          <div className="rounded-card border border-line bg-panel p-4 shadow-card" data-testid="callout-sum">
            <div className="text-sm font-semibold text-ink">? {FLEET_CALLOUT_SUM.title}</div>
            <p className="mt-1 text-xs text-muted">{FLEET_CALLOUT_SUM.body}</p>
          </div>

          <div className="rounded-card border border-line bg-panel p-4 shadow-card" data-testid="callout-common-cause">
            <div className="text-sm font-semibold text-ink">! {FLEET_CALLOUT_COMMON_CAUSE.title}</div>
            <p className="mt-1 text-xs text-muted">{FLEET_CALLOUT_COMMON_CAUSE.body}</p>
          </div>

          <div className="rounded-card border border-line bg-panel p-4 shadow-card" data-testid="fleet-order-summary">
            <div className="text-2xs font-bold uppercase tracking-wider text-muted">
              Order so far
            </div>
            <div className="num mt-2 space-y-1 text-xs text-muted">
              <div className="flex justify-between">
                <span>Agents to enroll</span>
                <b className="text-ink">{totals.count}</b>
              </div>
              <div className="flex justify-between">
                <span>Total insured caps</span>
                <b className="text-ink">{formatUsd(totals.capsUsd)}</b>
              </div>
              <div className="flex justify-between border-t border-line-soft pt-1.5">
                <span>Annual premium</span>
                <b className="text-md text-ink">{formatUsd(totals.premiumUsd)}</b>
              </div>
            </div>
            <div className="num mt-1 text-right font-mono text-2xs text-accent">
              ≈ {formatN(usdToN(totals.premiumUsd, usdPerN), { maxFractionDigits: 0 })} · 1 N = $
              {usdPerN.toFixed(2)}
            </div>
            <button
              data-testid="continue-to-deposit-button"
              disabled={totals.count === 0 || sweepRunning}
              className="mt-3.5 w-full rounded-md bg-accent px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-60"
              onClick={() => navigate('/pay')}
            >
              Continue to deposit requirement
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
