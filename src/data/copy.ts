/**
 * Long-form on-screen copy skeleton (plan §2): exclusion wall, coverage
 * cards, tooltips, denial-letter templates. Text quoted from the PRD
 * (§7.6, §7.11, GT-4, D1/D4) wherever the PRD quotes it.
 */
import type { CoverageRoute } from '../store/types';

// ---------------------------------------------------------------------------
// Positioning / shell
// ---------------------------------------------------------------------------

export const POSITIONING_LINE =
  'Insurance for AI agents that move money — priced by the safety controls you actually run';

export const DEMO_SMALL_PRINT =
  'Demo environment. Nothing here is real, except the price of N.';

export const RESET_FOOTNOTE =
  'Demo state lives in memory only — refreshing the page resets everything to the seed data.';

export const UNVERIFIED_BANNER =
  "Unverified operator: +0.4% is added to every quote — and no claim can be paid for any event that happens while verification isn't current. Verifying later protects future events only.";

// ---------------------------------------------------------------------------
// Coverage cards (PRD §7.6) — display-only, derived, never selected
// ---------------------------------------------------------------------------

export interface CoverageCardCopy {
  route: CoverageRoute;
  title: string;
  oneLiner: string;
  whatItPays: string;
  keyCondition: string;
}

export const COVERAGE_CARDS: CoverageCardCopy[] = [
  {
    route: 'A',
    title: 'Agent broke its rulebook',
    oneLiner:
      'Pays the net assets that left when the agent acted outside its mandate. No attacker needed.',
    whatItPays:
      'Net assets that left when the agent acted outside its mandate — wrong payee, over cap, wrong asset/chain, undelegated action.',
    keyCondition: 'The countersigned mandate defines "outside the rules."',
  },
  {
    route: 'B',
    title: 'Agent was manipulated',
    oneLiner:
      'Pays when an attacker tricked the agent while it stayed inside the rules.',
    whatItPays:
      'Losses from prompt injection, poisoned data, a compromised tool, a spoofed instruction channel, or a deepfaked approval.',
    keyCondition:
      'The trick must be provable — which is what attestation is for. This card greys out if attestation is off.',
  },
  {
    route: 'C',
    title: 'Keys were stolen',
    oneLiner:
      'Pays when signing credentials inside the disclosed setup are stolen or misused.',
    whatItPays:
      'Money that moved without the agent or Principal initiating it, signed with stolen credentials from the disclosed key map.',
    keyCondition:
      "Only credentials in the disclosed key map are covered; the Principal's own seed phrase on a sticky note is not this policy's risk.",
  },
  {
    route: 'D',
    title: 'A guardrail failed to fire',
    oneLiner:
      'Pays the slice of loss a correctly-working scheduled guardrail would have stopped.',
    whatItPays:
      'The amount over a cap the cap-checker let through, the amount a timelock should have held, everything after a kill switch was pressed but ignored.',
    keyCondition:
      'The deductible is waived if that guardrail had passed its latest scheduled test.',
  },
  {
    route: 'E',
    title: 'Someone else was harmed and comes after you',
    oneLiner:
      "Pays damages and defense costs when a third party claims your agent's covered failure hurt them.",
    whatItPays:
      "Damages and defense costs when a merchant, wallet, solver, or another agent's owner claims your agent's covered failure hurt them.",
    keyCondition: 'Defense costs eat into the limit. Per-event limit: 50% of the cap.',
  },
  {
    route: 'F',
    title: 'Cleanup and recovery',
    oneLiner:
      'Pays investigation, tracing, bounties, freezes, key rotation — and responds to near-misses worth investigating.',
    whatItPays:
      'Investigation, on-chain tracing, approved white-hat bounties, legal freezes, emergency key rotation.',
    keyCondition:
      'Per-event limit: 15% of the cap, with recovery/bounty costs capped at 10%. Reported near-misses are the data this whole market runs on.',
  },
];

export const COVERAGE_PANEL_TOOLTIP =
  "Coverage isn't a menu here — it's the shadow your controls cast.";

export const COVERAGE_B_GREY_REASON =
  "Coverage B — agent-compromise — will be excluded: without attested inputs, manipulation can't be proven.";

// ---------------------------------------------------------------------------
// Exclusion wall (PRD §7.6.3 / GT-4) — never collapsible by default
// ---------------------------------------------------------------------------

export const EXCLUSION_WALL_MANTRA =
  "The policy insures the delegation and the machinery, not the model's brain.";

export const EXCLUSION_WALL: string[] = [
  'The model simply being wrong, slow, or badly trained — the policy insures the delegation and the machinery, not the model\'s brain.',
  'Market prices moving, including stablecoin depegs.',
  'The blockchain itself failing or forking.',
  'A third-party protocol getting hacked when the agent used it innocently and in-mandate.',
  "A transfer the Principal personally authorized while deceived — that's a conventional crime-policy risk.",
  'Losses while running a changed, un-notified configuration.',
  'Sanctions, war, state attacks.',
  "The Operator's own board-level fraud.",
];

// ---------------------------------------------------------------------------
// Tier-2 surcharge chips + insurer's-why hovers (PRD §7.5)
// ---------------------------------------------------------------------------

export interface Tier2Copy {
  key: string;
  label: string;
  surcharge: string;
  chip?: string;
  insurersWhy: string;
}

export const TIER2_COPY: Tier2Copy[] = [
  {
    key: 'attestation',
    label: 'TEE attestation',
    surcharge: '+0.6%',
    chip: COVERAGE_B_GREY_REASON,
    insurersWhy:
      'Without tamper-proof receipts of what the agent saw and did, "we believe it was tricked" is unprovable.',
  },
  {
    key: 'kyb',
    label: 'Verified company identity (KYB)',
    surcharge: '+0.4%',
    chip: 'and no event during an unverified period can be claimed',
    insurersWhy: "We can't pursue recovery against a company we can't name.",
  },
  {
    key: 'timelock',
    label: 'Timelock on large transfers',
    surcharge: '+0.3%',
    insurersWhy:
      'A hold window is the last chance to catch and reverse a bad transfer before it leaves.',
  },
  {
    key: 'recovery',
    label: 'Recovery mechanism',
    surcharge: '+0.3%',
    chip: 'and you keep 20% of whatever a recovery path would have clawed back',
    insurersWhy: 'No recovery path means every recoverable dollar stays lost.',
  },
  {
    key: 'harnessAudit',
    label: 'Independent harness audit',
    surcharge: '+0.3%',
    chip: 'and 20% coinsurance on guardrail-failure claims until first audit',
    insurersWhy: 'Unassessed guardrails are unpriceable guardrails.',
  },
  {
    key: 'hitl',
    label: 'Human approval above threshold',
    surcharge: '+0.3%',
    chip: 'and you keep 15% of losses above the threshold',
    insurersWhy:
      'A person in the loop above the threshold is the cheapest large-loss circuit breaker there is.',
  },
  {
    key: 'killSwitch',
    label: 'Kill switch + anomaly monitoring',
    surcharge: '+0.2%',
    chip: 'and you keep 15% of losses after the first missed alert',
    insurersWhy:
      'Losses that continue after the first alert should have been stoppable.',
  },
];

export const TIER1_DECLINE_COPY = (gateLabel: string) =>
  `No ${gateLabel} → not insurable. This isn't a surcharge — it's the gate.`;

export const COUNTERSIGN_GATE_REASON =
  'No countersignature, no cover (framework T3.2).';

export const S31_NOTE =
  "If the rulebook itself is wrong — say a cap typed as $500,000 instead of $50,000 — the policy doesn't pay for the typo; the signature is what makes that fair.";

export const OPEN_SET_LOADING_NOTE = '+0.3% added to the compromise-coverage rate';

// ---------------------------------------------------------------------------
// Advanced pricing disclosure — STATIC copy, not computed (plan §4)
// ---------------------------------------------------------------------------

export const ADVANCED_PRICING_COPY = [
  'Payment-rail adjustments: a rail binding exact amount + exact payee with a short reversal window earns −0.05%; a reusable or open-amount credential rail adds +0.1%. Not applied in this demo quote.',
  'Research-only agent floor: an agent that moves no value still pays a minimum of 25% of baseline, because Coverages E and F stay live for it. Not applied in this demo quote.',
];

// ---------------------------------------------------------------------------
// Claims copy
// ---------------------------------------------------------------------------

export const NOTIFY_RULE_COPY =
  'Notification is due within 48 hours of discovery (near-misses: 7 days). Discovery counts from when anyone responsible knew — or should have known from an alert.';

export const CONTAINMENT_RULE_COPY =
  'Containment is immediate and unconditional. Waiting for markets to recover, attackers to return funds, or anomalies to fix themselves means the delayed losses land on you.';

export const EVIDENCE_RING_COPY =
  'A complete package is what starts the decision clock.';

export const SETTLEMENT_CAPTION =
  'Paid in N at the day-of-payment rate; whatever form the insurer elects, the value delivered equals the covered dollar loss.';

export const RECOVERY_WATERFALL_COPY =
  'Recovered funds repay the insurer first, then your retained slice, then any loss beyond the limits.';

export const INSURER_DELAY_NOTE =
  "Insurer delay doesn't count against your time limits.";

export const CLAIM_EMPTY_STATE =
  'Nothing has gone wrong yet — ask your presenter to break something.';

export const SUSPENSION_COPY =
  "During suspension, new events aren't covered; events from before remain claimable. Other agents are unaffected.";

export const NEAR_MISS_CREDIT_HOVER =
  'Near-misses with no loss still matter — reporting them within 7 days earns credit and builds the loss data this market is priced on.';

// The twelve evidence items (framework Appendix 2), labels shared by all WPs.
export const EVIDENCE_ITEM_LABELS: Record<number, string> = {
  1: 'Signed incident narrative',
  2: 'Countersigned mandate version',
  3: 'Configuration hash + attestation chain',
  4: 'Action-log extract (24h before first loss through containment)',
  5: 'Chain tracing report',
  6: 'Attested input/output records (Coverage B)',
  7: 'Credential access logs + rotation evidence (Coverage C)',
  8: 'Guardrail spec + verification history + failing log line (Coverage D)',
  9: 'Counterparty demand (Coverage E)',
  10: 'Containment record',
  11: 'Valuation inputs',
  12: 'Recovery actions record',
};

// ---------------------------------------------------------------------------
// Denial-letter templates (REQ-7.11.4 — polished end screens, never errors)
// ---------------------------------------------------------------------------

export const DENIAL_MODEL_CONDUCT = {
  title: 'Determination: not covered — model conduct',
  body:
    'We reviewed the attested inputs and outputs for this event. They show no adversarial content, no compromised tool, and no spoofed instruction channel: the agent paid a real, whitelisted payee, within its cap, because the model was simply wrong. The policy insures the delegation and its safety machinery, not the model\'s brain — a model\'s bad judgment, downtime, or training is excluded model conduct.',
  counterfactual:
    'Had the attested inputs shown crafted adversarial content, this would have been Coverage B.',
  clause: 'Model Conduct Boundary (4.9)',
};

export const DENIAL_CONDITION_PRECEDENT = {
  title: 'Determination: not payable — condition precedent',
  body:
    'No claim is payable for an event that occurred while verification was not current. Verifying now protects future events.',
  forwardAction: 'Complete verification',
  clause: 'T3.4',
};

// ---------------------------------------------------------------------------
// Fleet teaching callouts (PRD §7.7)
// ---------------------------------------------------------------------------

export const FLEET_CALLOUT_SUM = {
  title: 'Why is the total just the sum?',
  body: "Each agent is priced on its own controls and its own cap. There's no volume discount, by design: twelve risks are twelve risks.",
};

export const FLEET_CALLOUT_COMMON_CAUSE = {
  title: 'But fleets do change two things.',
  body: "If one shared bug hits all twelve, that's one event: one per-event limit, one deductible — not twelve payouts. Shared infrastructure pools your fate.",
};

export const CONCENTRATION_METER_LABEL = 'programme-wide, simulated';

// ---------------------------------------------------------------------------
// Pay screen (PRD §7.8)
// ---------------------------------------------------------------------------

export const PAY_FRAMING =
  "What you pay now is the premium — the yearly price of the promise. The claims fund itself is seeded by the programme's treasury. Your deductible (the retention) is never paid up front; you'd bear it per event, only if a loss happens.";

export const QUARTERLY_NOTE =
  'An installment more than 15 days overdue suspends cover.';

export const ACTIVATION_CEREMONY_LINE =
  'Cover attached the moment three records existed together: your agent\'s fingerprint, the countersigned mandate, and this payment.';

export const POLICY_SCHEDULE_CAPTION =
  'In this framework, this record is the policy schedule. No paper.';
