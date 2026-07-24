/**
 * Screen 7.11 — File a claim (WP-5; plan §8, mockups postpurchase-claim-*).
 *
 * Empty state: process map + "ask your presenter to break something."
 * With injected incidents: open a claim per incident (populating the 12-item
 * evidence checklist from the §5d applicability matrix; near-miss claims get
 * the 7-day notify window), then the five-step flow:
 * Notify → Contain → Evidence → Clocks & decision → Outcome.
 */
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CLAIM_EMPTY_STATE } from '../data/copy';
import { buildEvidenceChecklist, SCENARIOS } from '../data/incidents';
import { formatUsd } from '../lib/money';
import { useStore } from '../store';
import type { Claim as ClaimType, Incident } from '../store/types';
import ClocksAndDecision from './steps/ClocksAndDecision';
import Contain from './steps/Contain';
import Evidence from './steps/Evidence';
import Notify from './steps/Notify';
import Outcome from './steps/Outcome';
import { ClaimChrome, claimRef, STEP_LABELS } from './steps/shared';

// ---------------------------------------------------------------------------
// Empty state / incident inbox
// ---------------------------------------------------------------------------

const PROCESS_MAP: { label: string; note: string }[] = [
  { label: 'Notify', note: 'within 48h of discovery' },
  { label: 'Contain', note: 'immediate and unconditional' },
  { label: 'Evidence', note: '12-item package, mostly auto' },
  { label: 'Clocks & decision', note: 'published deadlines' },
  { label: 'Outcome', note: 'payment or a reasoned denial' },
];

function EmptyState() {
  return (
    <div className="mx-auto max-w-shell px-6 py-8" data-testid="screen-Claim">
      <h1 className="text-lg font-bold tracking-tight text-ink">File a claim</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted">
        Claims are decided on the attested record, on published clocks. A
        claim follows this route:
      </p>
      <div className="mt-6 flex flex-col overflow-hidden rounded-card border border-line bg-panel shadow-card sm:flex-row">
        {PROCESS_MAP.map((step, i) => (
          <div
            key={step.label}
            className="flex flex-1 items-center gap-2.5 border-b border-line px-4 py-3 last:border-b-0 sm:border-b-0 sm:border-r sm:py-4 sm:last:border-r-0"
          >
            <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full border border-line text-2xs font-bold text-faint">
              {i + 1}
            </span>
            <div>
              <div className="text-xs font-semibold text-ink">{step.label}</div>
              <div className="text-2xs text-faint">{step.note}</div>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-8 text-center text-sm text-muted" data-testid="claim-empty-state">
        {CLAIM_EMPTY_STATE}
      </p>
    </div>
  );
}

function IncidentInbox({ incidents }: { incidents: Incident[] }) {
  const claims = useStore((s) => s.claims);
  const agents = useStore((s) => s.agents);
  const openClaim = useStore((s) => s.openClaim);
  const updateClaim = useStore((s) => s.updateClaim);
  const setClockState = useStore((s) => s.setClockState);
  const navigate = useNavigate();

  const open = (incident: Incident) => {
    const existing = claims.find((c) => c.incidentId === incident.id);
    if (existing !== undefined) {
      navigate(`/claim/${existing.id}`);
      return;
    }
    const claimId = openClaim(incident.id);
    // Populate the 12-item checklist from the applicability matrix (§5d) —
    // auto items pre-stamped, uploadables missing, the rest notApplicable.
    updateClaim(claimId, { evidence: buildEvidenceChecklist(incident.scenarioId) });
    if (SCENARIOS[incident.scenarioId].nearMiss) {
      // Near-miss claims run on the 7-day notify window (GT-5).
      setClockState(claimId, {
        phase: 'Draft',
        anchors: { discoveredAt: incident.discoveredAt },
        nearMiss: true,
      });
    }
    navigate(`/claim/${claimId}`);
  };

  return (
    <div className="mx-auto max-w-shell px-6 py-8" data-testid="screen-Claim">
      <h1 className="text-lg font-bold tracking-tight text-ink">File a claim</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted">
        Incidents on your fleet. Each incident arrives with its own records
        (logs, chain data, attestations), so most of the evidence package
        attaches automatically.
      </p>
      <div className="mt-5 flex flex-col gap-2.5" data-testid="incident-inbox">
        {incidents.map((incident) => {
          const agent = agents.find((a) => a.id === incident.agentId);
          const claim = claims.find((c) => c.incidentId === incident.id);
          const meta = SCENARIOS[incident.scenarioId];
          return (
            <div
              key={incident.id}
              className="flex items-center gap-4 rounded-card border border-line bg-panel px-4 py-3.5 shadow-card"
            >
              <span className="num flex-none font-mono text-xs font-bold text-accent-ink">
                {incident.scenarioId}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-ink">
                  {meta.title} ({agent?.name ?? incident.agentId})
                </div>
                <div className="text-xs text-muted">
                  {incident.lossGrossUsd > 0
                    ? `Gross loss ${formatUsd(incident.lossGrossUsd)}`
                    : `Near-miss with ${formatUsd(incident.investigationCostUsd ?? 0)} in investigation costs`}
                </div>
              </div>
              <button
                type="button"
                data-testid={`open-claim-${incident.id}`}
                onClick={() => open(incident)}
                className={`flex-none rounded-lg px-3.5 py-2 text-sm font-semibold ${
                  claim !== undefined
                    ? 'border border-line text-ink'
                    : 'bg-accent text-ink'
                }`}
              >
                {claim !== undefined ? `Open claim ${claimRef(claim.id)}` : 'File a claim →'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Five-step flow
// ---------------------------------------------------------------------------

function stepFromClaim(claim: ClaimType): number {
  const a = claim.clockState.anchors;
  if (a.determinedAt !== undefined) return 5;
  if (a.packageReceivedAt !== undefined) return 4;
  if (a.notifiedAt !== undefined) return 2;
  return 1;
}

function ClaimFlow({ claim, incident }: { claim: ClaimType; incident: Incident }) {
  const agents = useStore((s) => s.agents);
  const [step, setStep] = useState(() => stepFromClaim(claim));
  const agent = agents.find((a) => a.id === incident.agentId);
  const meta = SCENARIOS[incident.scenarioId];

  const crumb = `${agent?.name ?? incident.agentId}, incident ${incident.scenarioId} (${meta.title.toLowerCase()})`;
  const subtitles: Record<number, string> = {
    1: 'A claim is decided on the attested record, on published clocks. First: what happened, and when did you discover it?',
    2: 'Containment is immediate and unconditional. Confirm the four duties before evidence.',
    3: 'The twelve-item evidence package. A compliant stack already holds most of it.',
    4: 'Published clocks, tracked as live state. Every deadline is visible while it runs.',
    5: claim.adjudication?.eligibility.covered === false
      ? 'Determination: not covered. A denial is a reasoned, referenced decision, delivered on the same clocks as a payment.'
      : 'Determination: covered. The payout is recomputed from this incident\u2019s own parameters. Every line opens under \u201cShow the math.\u201d',
  };

  return (
    <ClaimChrome crumbRef={claimRef(claim.id)} crumb={crumb} subtitle={subtitles[step] ?? ''} step={step}>
      {step === 1 && (
        <Notify claim={claim} incident={incident} onNext={() => setStep(2)} />
      )}
      {step === 2 && (
        <Contain
          claim={claim}
          incident={incident}
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
        />
      )}
      {step === 3 && (
        <Evidence
          claim={claim}
          incident={incident}
          onBack={() => setStep(2)}
          onNext={() => setStep(4)}
        />
      )}
      {step === 4 && (
        <ClocksAndDecision
          claim={claim}
          incident={incident}
          onBack={() => setStep(3)}
          onNext={() => setStep(5)}
        />
      )}
      {step === 5 && (
        <Outcome claim={claim} incident={incident} onBack={() => setStep(4)} />
      )}
      <div className="sr-only">{STEP_LABELS[step - 1]}</div>
    </ClaimChrome>
  );
}

// ---------------------------------------------------------------------------
// Route entry
// ---------------------------------------------------------------------------

export default function Claim() {
  const { claimId } = useParams();
  const incidents = useStore((s) => s.incidents);
  const claims = useStore((s) => s.claims);

  const claim = useMemo(
    () => claims.find((c) => c.id === claimId),
    [claims, claimId],
  );
  const incident = useMemo(
    () => (claim === undefined ? undefined : incidents.find((i) => i.id === claim.incidentId)),
    [incidents, claim],
  );

  if (claim !== undefined && incident !== undefined) {
    return <ClaimFlow key={claim.id} claim={claim} incident={incident} />;
  }
  if (incidents.length === 0) return <EmptyState />;
  return <IncidentInbox incidents={incidents} />;
}
