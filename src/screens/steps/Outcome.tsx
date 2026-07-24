/**
 * Claim step 5 — Outcome (screen 7.11, mockups
 * postpurchase-claim-outcome-payout.html / -denial.html; REQ-7.11.4).
 *
 * Covered: the full pipeline arithmetic (quantum → limit → coinsurance →
 * retention → payout) in $ and N at the day-of-payment rate — settlement is
 * paid through `executePayment('claim-settlement')` so the refetch-first rule
 * holds; S-18 renders the recovery waterfall (insurer repaid first).
 *
 * Denials are first-class end screens, never errors: S-24 model-conduct as a
 * letter with the Coverage-B counterfactual (AC-10); condition-precedent
 * denials carry the forward-looking "Complete verification" action (AC-13).
 */
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { priceFeedMode } from '../../components/helpers';
import { MathValue } from '../../components/MathValue';
import { SimulatedBadge } from '../../components/SimulatedBadge';
import {
  DENIAL_CONDITION_PRECEDENT,
  DENIAL_MODEL_CONDUCT,
  RECOVERY_WATERFALL_COPY,
  SETTLEMENT_CAPTION,
} from '../../data/copy';
import { buildAdjudicationInput, SCENARIOS } from '../../data/incidents';
import { adjudicate, recoveryWaterfall } from '../../lib/claims';
import { formatClockTime, formatN, formatUsd } from '../../lib/money';
import { executePayment, PaymentAbortedError } from '../../lib/payments';
import { demoNow } from '../../lib/demoClock';
import { useStore } from '../../store';
import type { AdjudicationResult, Claim, Incident } from '../../store/types';
import { Callout, claimRef, fmtUtcDateLong } from './shared';

export interface OutcomeProps {
  claim: Claim;
  incident: Incident;
  onBack: () => void;
}

export default function Outcome({ claim, incident, onBack }: OutcomeProps) {
  const agents = useStore((s) => s.agents);
  const mandates = useStore((s) => s.mandates);
  const enrollments = useStore((s) => s.enrollments);
  const operator = useStore((s) => s.operator);
  const priceFeed = useStore((s) => s.priceFeed);
  const feedMode = priceFeedMode(priceFeed);
  const setClockState = useStore((s) => s.setClockState);
  const setAdjudication = useStore((s) => s.setAdjudication);
  const updateClaim = useStore((s) => s.updateClaim);
  const [paying, setPaying] = useState(false);

  const paid = claim.clockState.anchors.paidAt !== undefined;

  // Unpaid claims always recompute from the incident's own parameters and the
  // interval histories at event time (REQ-7.11.3, AC-9/AC-13). PAID claims
  // render the adjudication persisted at payment time — the settled math is
  // immutable, so later price-feed refreshes never change what a paid claim
  // displays.
  const liveResult: AdjudicationResult = useMemo(
    () =>
      adjudicate(
        buildAdjudicationInput(
          { agents, mandates, enrollments, operator },
          incident,
          priceFeed.usdPerN,
        ),
      ),
    [agents, mandates, enrollments, operator, incident, priceFeed.usdPerN],
  );
  const result: AdjudicationResult =
    paid && claim.adjudication !== undefined ? claim.adjudication : liveResult;

  const determinedAt = claim.clockState.anchors.determinedAt ?? demoNow();

  const acceptPayment = async () => {
    if (result.math === undefined || paid || paying) return;
    setPaying(true);
    const gen = useStore.getState().resetGeneration;
    try {
      // Refetch-first day-of-payment conversion; credits the demo wallet.
      // The dollar amount is a FUNCTION of the post-refetch rate: retention is
      // max(500 N × rate, 2% × loss), so the payout itself is rate-dependent
      // and must be re-adjudicated at the rate actually used for transfer.
      let settled: AdjudicationResult = result;
      const receipt = await executePayment(
        'claim-settlement',
        (rateUsed) => {
          const s = useStore.getState();
          settled = adjudicate(
            buildAdjudicationInput(
              {
                agents: s.agents,
                mandates: s.mandates,
                enrollments: s.enrollments,
                operator: s.operator,
              },
              incident,
              rateUsed,
            ),
          );
          return settled.math?.payoutUsd ?? 0;
        },
        { claimId: claim.id },
        { stale: () => useStore.getState().resetGeneration !== gen },
      );
      // Persist the payment-time adjudication so the paid claim renders this
      // exact math forever, regardless of later feed movement.
      setAdjudication(claim.id, settled);
      const anchors = { ...claim.clockState.anchors, paidAt: receipt.paidAt };
      setClockState(claim.id, { ...claim.clockState, anchors, phase: 'Paid' });
      const scripted = SCENARIOS[incident.scenarioId].scriptedRecoveryUsd;
      if (scripted !== undefined && settled.math !== undefined) {
        const retained = settled.math.coinsuranceUsd + settled.math.retentionUsd;
        updateClaim(claim.id, {
          recovery: {
            amountUsd: scripted,
            waterfall: recoveryWaterfall(scripted, settled.math.payoutUsd, retained),
          },
        });
      }
    } catch (err) {
      if (err instanceof PaymentAbortedError) return; // reset raced the payment
      throw err;
    } finally {
      setPaying(false);
    }
  };

  if (!result.eligibility.covered) {
    const conditionDenial = !result.conditionsPrecedent.pass;
    return (
      <DenialLetter
        claim={claim}
        incident={incident}
        result={result}
        conditionDenial={conditionDenial}
        determinedAt={determinedAt}
        onBack={onBack}
      />
    );
  }

  const math = result.math;
  if (math === undefined) return null;
  const scripted = SCENARIOS[incident.scenarioId].scriptedRecoveryUsd;
  const retainedUsd = math.coinsuranceUsd + math.retentionUsd;
  const waterfall =
    claim.recovery?.waterfall ??
    (scripted !== undefined
      ? recoveryWaterfall(scripted, math.payoutUsd, retainedUsd)
      : undefined);

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[1fr_380px]" data-testid="claim-step-outcome">
      <div className="rounded-card border border-line bg-panel shadow-card">
        <div className="flex items-center gap-3 rounded-t-card border-b border-good-line bg-good-bg px-5 py-4">
          <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-good text-xs font-bold text-white">
            ✓
          </span>
          <h2 className="text-md font-bold text-good" data-testid="outcome-verdict">
            Covered — payment approved
          </h2>
          <span className="ml-auto">
            <SimulatedBadge />
          </span>
        </div>

        <div className="space-y-3 p-5">
          <div className="flex items-baseline justify-between gap-4 text-sm">
            <span className="text-muted">
              {incident.scenarioId === 'S-17'
                ? 'Investigation and response costs — Coverage F'
                : incident.scenarioId === 'S-03'
                  ? 'Covered quantum — the excess over the mandate cap (Coverage D)'
                  : `Loss — net assets out (${result.eligibility.clause})`}
            </span>
            <span className="num font-mono font-semibold text-ink" data-testid="outcome-loss">
              {formatUsd(math.coveredQuantumUsd, { maxFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-4 text-sm">
            <span className="text-muted">− Coinsurance (skipped tier-2 controls, 5.5)</span>
            <span className="num font-mono font-semibold text-ink" data-testid="outcome-coinsurance">
              − {formatUsd(math.coinsuranceUsd, { maxFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-4 text-sm">
            <span className="text-muted">
              − Retention — subtracted after coinsurance (5.3)
              {math.retentionWaived && (
                <span className="ml-2 rounded-md border border-good-line bg-good-bg px-1.5 py-0.5 text-2xs font-semibold text-good">
                  waived
                  {incident.scenarioId === 'S-03'
                    ? ' — the guardrail passed its latest scheduled verification'
                    : ' — near-miss, no net asset loss'}
                </span>
              )}
            </span>
            <span className="num font-mono font-semibold text-ink" data-testid="outcome-retention">
              − {formatUsd(math.retentionUsd, { maxFractionDigits: 2 })}
            </span>
          </div>

          <div className="border-t border-line pt-3">
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-sm font-bold text-ink">Payout</span>
              <MathValue breakdown={math.breakdown} className="text-right">
                <span className="num text-xl font-bold text-ink" data-testid="outcome-payout">
                  {formatUsd(math.payoutUsd, { maxFractionDigits: 2 })}
                </span>
              </MathValue>
            </div>
            <div className="num mt-1 text-right font-mono text-xs text-accent-ink" data-testid="outcome-payout-n">
              ≈ {formatN(math.payoutN, { maxFractionDigits: 0 })} at the day-of-payment
              rate · 1 N = ${math.rateUsed.toFixed(2)} ·{' '}
              {feedMode === 'stale' ? 'last known' : feedMode} ·{' '}
              {formatClockTime(priceFeed.fetchedAt)}
            </div>
          </div>

          <p className="border-t border-line pt-3 text-xs text-muted">{SETTLEMENT_CAPTION}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3.5">
        {waterfall !== undefined && (
          <div className="rounded-card border border-line bg-panel p-4 shadow-card" data-testid="recovery-waterfall">
            <div className="flex items-baseline justify-between">
              <h3 className="text-sm font-bold text-ink">Recovery waterfall</h3>
              <span className="num font-mono text-xs font-semibold text-accent-ink">
                {formatUsd(waterfall.recoveredUsd)} recovered by tracing
              </span>
            </div>
            <p className="mt-1.5 text-xs text-muted">{RECOVERY_WATERFALL_COPY}</p>
            <ul className="mt-3 space-y-2 text-xs">
              <li className="flex items-center justify-between rounded-lg border border-line bg-[#fafbfd] px-3 py-2">
                <span>
                  <b>1 · Insurer</b>{' '}
                  <span className="text-muted">
                    — until its {formatUsd(math.payoutUsd)} is restored
                  </span>
                </span>
                <span className="num font-mono font-semibold text-good">
                  {formatUsd(waterfall.toInsurerUsd)} → here
                </span>
              </li>
              <li className="flex items-center justify-between rounded-lg border border-line bg-[#fafbfd] px-3 py-2">
                <span>
                  <b>2 · You</b>{' '}
                  <span className="text-muted">
                    — retained {formatUsd(retainedUsd)} (coinsurance + retention)
                  </span>
                </span>
                <span className="num font-mono text-muted">
                  {waterfall.toInsuredRetainedUsd > 0
                    ? formatUsd(waterfall.toInsuredRetainedUsd)
                    : 'next in line'}
                </span>
              </li>
              <li className="flex items-center justify-between rounded-lg border border-line bg-[#fafbfd] px-3 py-2">
                <span>
                  <b>3 · Loss beyond the limits</b>
                </span>
                <span className="num font-mono text-muted">
                  {waterfall.toUninsuredUsd > 0 ? formatUsd(waterfall.toUninsuredUsd) : '—'}
                </span>
              </li>
            </ul>
          </div>
        )}

        <Callout title="Why the payout is what it is">
          The retention is the deductible every event bears
          {math.retentionWaived ? ' (waived here)' : ''}. Coinsurance exists only where a
          skipped tier-2 control governs the loss: you saved on the control, so you share
          the pain the control would have prevented (5.5).
        </Callout>

        {paid ? (
          <div
            data-testid="payment-accepted"
            className="rounded-lg border border-good-line bg-good-bg px-3 py-2.5 text-center text-sm font-semibold text-good"
          >
            ✓ Payment accepted — {formatN(math.payoutN, { maxFractionDigits: 0 })} credited
            to your wallet
          </div>
        ) : (
          <button
            type="button"
            data-testid="accept-payment"
            disabled={paying}
            onClick={() => void acceptPayment()}
            className="rounded-lg bg-ink px-3.5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
          >
            {paying
              ? 'Fetching the day-of-payment rate…'
              : `Accept payment — ${formatN(math.payoutN, { maxFractionDigits: 0 })}`}
          </button>
        )}

        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-line px-3.5 py-2 text-sm font-semibold text-muted"
        >
          Back to clocks
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Denial letters (REQ-7.11.4 — polished end screens, never errors)
// ---------------------------------------------------------------------------

interface DenialProps {
  claim: Claim;
  incident: Incident;
  result: AdjudicationResult;
  /** true = condition-precedent denial; false = model-conduct (S-24) etc. */
  conditionDenial: boolean;
  determinedAt: number;
  onBack: () => void;
}

function DenialLetter({ claim, incident, result, conditionDenial, determinedAt, onBack }: DenialProps) {
  const operatorName = useStore((s) => s.operator.name);
  const agent = useStore((s) => s.agents.find((a) => a.id === incident.agentId));
  const notifiedAt = claim.clockState.anchors.notifiedAt;

  const modelConduct = incident.scenarioId === 'S-24' && !conditionDenial;
  const bExcluded = !conditionDenial && !modelConduct; // S-09 without attestation
  const verdictLabel = conditionDenial
    ? 'Not payable — condition precedent'
    : modelConduct
      ? 'Not covered — model conduct'
      : 'Not covered — Coverage B excluded';
  const clauseLabel = conditionDenial
    ? `${DENIAL_CONDITION_PRECEDENT.clause} · Condition precedent`
    : modelConduct
      ? '4.9 · Model conduct exclusion'
      : 'D3.5 · Coverage B exclusion';

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[1fr_380px]" data-testid="claim-step-outcome">
      <div
        className="rounded-card border border-line bg-panel shadow-card"
        data-testid="denial-letter"
        style={{ padding: '34px 40px' }}
      >
        <div className="flex items-start justify-between border-b border-line pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-ink text-xs font-extrabold text-white">
              IA
            </span>
            <span className="text-sm font-bold text-ink">Agent Insurance Programme</span>
          </div>
          <div className="text-right text-2xs text-faint">
            <div>Claim {claimRef(claim.id)} · Policy P-2026-0147</div>
            <div>Determination date: {fmtUtcDateLong(determinedAt)}</div>
          </div>
        </div>

        <div className="mt-5 space-y-4 text-sm leading-relaxed text-body">
          <p>Dear {operatorName},</p>
          {conditionDenial ? (
            <>
              <p>
                We have completed our review of the loss of{' '}
                <b className="num">{formatUsd(incident.lossGrossUsd)}</b>
                {notifiedAt !== undefined && <> notified on {fmtUtcDateLong(notifiedAt)}</>},
                involving {agent?.name ?? incident.agentId}. Your notification was timely
                and your evidence package complete. Thank you.
              </p>
              <p>
                <b className="text-ink">
                  Our determination is that this claim is not payable.
                </b>{' '}
                A condition precedent to cover failed as of the event time:{' '}
                <b>{result.conditionsPrecedent.failedCondition}</b>.{' '}
                {DENIAL_CONDITION_PRECEDENT.body}
              </p>
              <div
                data-testid="condition-forward-action"
                className="rounded-lg border border-[#c6d9f5] bg-[#eaf1fc] px-4 py-3 text-xs text-[#1d5bbf]"
              >
                <b>The forward-looking fix:</b> conditions precedent are evaluated at each
                event&rsquo;s own time — restoring the condition now protects every future
                event from this moment on.
                <div className="mt-2">
                  <Link
                    to="/verify"
                    data-testid="complete-verification-action"
                    className="inline-block rounded-lg bg-[#1d5bbf] px-3 py-1.5 font-semibold text-white"
                  >
                    {DENIAL_CONDITION_PRECEDENT.forwardAction}
                  </Link>
                </div>
              </div>
            </>
          ) : modelConduct ? (
            <>
              <p>
                We have completed our review of the loss of{' '}
                <b className="num">{formatUsd(incident.lossGrossUsd)}</b>
                {notifiedAt !== undefined && <> notified on {fmtUtcDateLong(notifiedAt)}</>},
                in which {agent?.name ?? incident.agentId} paid an invoice for goods that
                were never ordered and do not exist. We reviewed your full evidence
                package, including the attested input and output records for the session
                in question. Your notification was timely, your containment was exemplary,
                and your records were complete. Thank you.
              </p>
              <p>
                <b className="text-ink">Our determination is that this loss is not covered.</b>{' '}
                {DENIAL_MODEL_CONDUCT.body}
              </p>
              <div
                data-component-id="coverage-b-counterfactual"
                data-testid="coverage-b-counterfactual"
                className="rounded-lg border border-[#c6d9f5] bg-[#eaf1fc] px-4 py-3 text-xs text-[#1d5bbf]"
              >
                <b>For the boundary&rsquo;s sake, the counterfactual:</b>{' '}
                {DENIAL_MODEL_CONDUCT.counterfactual} Fooled by an attacker is covered and
                provable; simply wrong is not this policy.
              </div>
              <p>
                This determination does not affect your policy&rsquo;s standing, your
                renewal terms, or any other agent in your fleet. Because your reporting and
                containment were within every clock, this event has been recorded to your
                file as fully compliant conduct.
              </p>
            </>
          ) : (
            <>
              <p>
                We have completed our review of the loss of{' '}
                <b className="num">{formatUsd(incident.lossGrossUsd)}</b>
                {notifiedAt !== undefined && <> notified on {fmtUtcDateLong(notifiedAt)}</>},
                involving {agent?.name ?? incident.agentId}.
              </p>
              <p>
                <b className="text-ink">Our determination is that this loss is not covered.</b>{' '}
                The claimed manipulation is {result.eligibility.reason} (clause{' '}
                {result.eligibility.clause}). Without attested input/output records,
                &ldquo;we believe it was tricked&rdquo; cannot be distinguished from the
                excluded case of the model simply being wrong.
              </p>
              <div className="rounded-lg border border-[#c6d9f5] bg-[#eaf1fc] px-4 py-3 text-xs text-[#1d5bbf]">
                <b>The forward-looking fix:</b> enabling TEE attestation restores Coverage
                B for future events — the control is what makes manipulation provable.
              </div>
            </>
          )}
          <p>
            Respectfully,
            <br />
            <b className="text-ink">Claims Determination · Agent Insurance Programme</b>
          </p>
          <p className="border-t border-line pt-3 text-2xs text-faint">
            You may request fast-track review of this determination within 30 days.
            Reference: {clauseLabel}; Appendix 2 (evidence standard). <SimulatedBadge />
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3.5">
        <div className="rounded-card border border-line bg-panel p-4 shadow-card" data-testid="determination-summary">
          <h3 className="mb-2 text-2xs font-bold uppercase tracking-widest text-faint">
            Determination summary
          </h3>
          <dl className="space-y-1.5 text-xs">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Verdict</dt>
              <dd>
                <span className="rounded-md border border-bad-line bg-bad-bg px-2 py-0.5 font-semibold text-bad" data-testid="outcome-verdict">
                  {verdictLabel}
                </span>
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Clause</dt>
              <dd className="font-mono">{clauseLabel}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Loss claimed</dt>
              <dd className="num font-mono">{formatUsd(incident.lossGrossUsd)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Amount payable</dt>
              <dd className="num font-mono font-semibold">$0 · 0 N</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Evidence package</dt>
              <dd className="num font-mono">
                {claim.evidence.filter((e) => e.status === 'auto' || e.status === 'uploaded').length}{' '}
                of {claim.evidence.filter((e) => e.status !== 'notApplicable').length} · complete
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Clocks</dt>
              <dd>all met</dd>
            </div>
          </dl>
        </div>

        <Callout title="Why denials look this polished">
          Disciplined refusal is half of what makes an insurance programme credible. The
          boundary is published, reasoned, and delivered with the same care as a payment —
          never an error state.
        </Callout>

        <button
          type="button"
          className="rounded-lg border border-line bg-panel px-3.5 py-2 text-sm font-semibold text-ink"
        >
          Request fast-track review
        </button>
        {bExcluded && (
          <p className="text-2xs text-faint">
            {verdictLabel}: {result.eligibility.reason}
          </p>
        )}
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-line px-3.5 py-2 text-sm font-semibold text-muted"
        >
          Back to clocks
        </button>
      </div>
    </div>
  );
}
