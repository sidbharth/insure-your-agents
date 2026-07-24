/**
 * Scenario Explorer data (PRD §7.10, plan §8) — WP-4 owned.
 *
 * The framework's scenario library turned into an interactive quiz: eight
 * curated situations, deliberately mixing covered, partly covered, and
 * denied (≥2 denials — REQ-7.10.1). Each verdict is decisive — "Covered
 * under B," "Not covered — model conduct" — with the coverage route, ONE
 * clause-level reason, and the control that made the difference
 * (REQ-7.10.2).
 *
 * Scenario 2 is conditional on attestation: the verdict function receives
 * the effective attestation state (the target agent's real
 * attestation-at-event-time AND the "what if no attestation?" toggle), so
 * the same event flips Covered(B) → Denied-as-unprovable (AC-3c).
 *
 * Dollar figures are derived from the policy's actual cap via the claims
 * engine's per-event-limit rule and the seeded incident parameters — never
 * hard-coded totals.
 */
import { perEventLimit } from '../lib/claims';
import { formatUsd } from '../lib/money';
import { SEED_INCIDENT_PARAMS } from './seed';

export interface ScenarioContext {
  /** The policy's per-agent cap (quote-stage cap pre-purchase). */
  capUsd: number;
  /**
   * Effective attestation for scenario 2: the target agent's attestation
   * operative at event time AND NOT the "what if no attestation?" toggle.
   */
  attested: boolean;
}

export interface ScenarioVerdict {
  covered: boolean;
  /** Decisive headline, e.g. "Covered under B" / "Not covered — model conduct". */
  headline: string;
  /** The coverage route line (or the explicit absence of one). */
  routeLine: string;
  /** THE one clause-level reason. */
  reason: string;
  clause: string;
  /** Which control made the difference (or why none could). */
  control: string;
}

export interface ScenarioDef {
  num: number;
  /** Short picker label. */
  title: string;
  /** Longer narrative shown above the verdict card. */
  narrative: string;
  /** Static picker chip (scenario 2 stays "Covered" in the picker — the toggle lives in the detail). */
  pickerVerdict: 'Covered' | 'Denied';
  /** Scenario 2 only: renders the "what if no attestation?" toggle + agent picker. */
  attestationSensitive?: boolean;
  verdict: (ctx: ScenarioContext) => ScenarioVerdict;
}

const S03 = SEED_INCIDENT_PARAMS['S-03'];

export const SCENARIOS: ScenarioDef[] = [
  {
    num: 1,
    title: 'Harness bug skips the whitelist check; funds go to a stranger',
    narrative:
      'A harness bug skips the whitelist check and funds go to a payee that was never on the list. No attacker anywhere — the machinery simply acted outside the mandate.',
    pickerVerdict: 'Covered',
    verdict: ({ capUsd }) => ({
      covered: true,
      headline: 'Covered under A + D',
      routeLine: `Coverage A — agent broke its rulebook · pays up to 100% of the ${formatUsd(capUsd)} cap, with D picking up the slice the whitelist guardrail should have stopped`,
      reason:
        'The transfer left to a payee outside the countersigned whitelist — a mandate breach needs no attacker (Coverage A), and the skipped whitelist check is a guardrail that failed to fire (Coverage D).',
      clause: 'Coverage A · Coverage D',
      control:
        'Action logging + the registered whitelist: the logs prove the payee was off-list, which is what turns "something went wrong" into a payable breach.',
    }),
  },
  {
    num: 2,
    title:
      'Hidden instructions on a product page trick the agent into paying an attacker — inside all its rules',
    narrative:
      'Hidden instructions on a product page trick the agent into paying an attacker. The agent stayed inside every rule — approved payee, under cap, in-mandate action.',
    pickerVerdict: 'Covered',
    attestationSensitive: true,
    verdict: ({ capUsd, attested }) =>
      attested
        ? {
            covered: true,
            headline: 'Covered under B',
            routeLine: `Coverage B — agent was manipulated · pays up to 100% of the ${formatUsd(capUsd)} cap`,
            reason:
              'The attested input record proves crafted adversarial content reached the agent (clause D3.5): fooled by an attacker = covered and provable. Without that proof this exact event is unprovable — and unpayable.',
            clause: 'D3.5',
            control:
              'TEE attestation. It is the difference between "we believe the agent was tricked" and "here is cryptographic proof of the trick."',
          }
        : {
            covered: false,
            headline: 'Denied — unprovable without attestation',
            routeLine:
              'Coverage B would apply — but Coverage B is excluded on this agent',
            reason:
              'Skipping TEE attestation excludes Coverage B entirely (rate schedule + D3.5): without attested inputs, manipulation can\u2019t be proven, so "the agent was tricked" cannot be distinguished from "the agent was simply wrong."',
            clause: 'D3.5',
            control:
              'TEE attestation — the +0.6% saved at quote time is exactly what this claim needed at proof time.',
          },
  },
  {
    num: 3,
    title: `Cap module waves through ${formatUsd(S03.lossGrossUsd)} against a ${formatUsd(50_000)} cap`,
    narrative:
      'The cap-checking module fails open and waves through a transfer above the mandate\u2019s per-transaction cap. The guardrail existed, was scheduled, and simply did not fire.',
    pickerVerdict: 'Covered',
    verdict: ({ capUsd }) => {
      const excess = Math.max(0, S03.lossGrossUsd - capUsd);
      return {
        covered: true,
        headline: `Covered under D — the ${formatUsd(excess)} excess`,
        routeLine: `Coverage D — a guardrail failed to fire · pays the slice the cap module would have stopped: ${formatUsd(S03.lossGrossUsd)} − ${formatUsd(capUsd)} = ${formatUsd(excess)}`,
        reason:
          'Coverage D pays the excess a correctly-working cap module would have stopped — not the gross transfer. The deductible is waived because the cap module had passed its latest scheduled test (5.3).',
        clause: 'Coverage D · 5.3',
        control:
          'Scheduled guardrail verification: passing the latest test is what waives the deductible on this claim.',
      };
    },
  },
  {
    num: 4,
    title:
      'Agent session key stolen from the Operator\u2019s servers; attacker signs directly',
    narrative:
      'The agent\u2019s session key is exfiltrated from the Operator\u2019s servers and the attacker signs transfers directly — neither the agent nor the Principal initiated anything.',
    pickerVerdict: 'Covered',
    verdict: ({ capUsd }) => ({
      covered: true,
      headline: 'Covered under C',
      routeLine: `Coverage C — keys were stolen · pays up to 100% of the ${formatUsd(capUsd)} cap`,
      reason:
        'Signing credentials inside the disclosed key map were stolen and misused, and money moved without the agent or Principal initiating it — the definition of a Coverage C event.',
      clause: 'Coverage C',
      control:
        'The disclosed key map: only credentials in the disclosed setup are covered — disclosure is what made this key an insured key.',
    }),
  },
  {
    num: 5,
    title:
      'Agent pays a completely hallucinated invoice — real payee, in-cap, no attacker anywhere',
    narrative:
      'The agent pays a completely hallucinated invoice — real payee, in-cap, and no attacker anywhere in the attested inputs.',
    pickerVerdict: 'Denied',
    verdict: () => ({
      covered: false,
      headline: 'Not covered — model conduct',
      routeLine: 'No coverage route — model conduct exclusion (4.9)',
      reason:
        'The attested record shows clean inputs and an in-mandate action: the model was simply wrong. Fooled by an attacker = covered and provable; simply wrong = not this policy. The policy insures the delegation and the machinery, not the model\u2019s brain.',
      clause: '4.9',
      control:
        'None could — this boundary is what keeps the class insurable at all.',
    }),
  },
  {
    num: 6,
    title:
      'Model provider outage; a payment deadline is missed; late fees follow',
    narrative:
      'The model provider goes down, the agent misses a payment deadline, and late fees follow. Nothing was attacked; nothing moved outside the mandate.',
    pickerVerdict: 'Denied',
    verdict: () => ({
      covered: false,
      headline: 'Not covered — model conduct',
      routeLine:
        'No coverage route — uptime is model conduct / service-level territory (4.9)',
      reason:
        'The model simply being slow or unavailable is excluded model conduct: downtime and its consequential fees belong to a service-level agreement with the provider, not to this policy.',
      clause: '4.9',
      control:
        'None applies — no safety control governs a provider\u2019s uptime; that risk is contractual, not insurable here.',
    }),
  },
  {
    num: 7,
    title:
      'Principal fat-fingers the mandate cap ($500,000 instead of $50,000); agent spends within the typo',
    narrative:
      'The Principal types the per-transaction cap as $500,000 instead of $50,000, countersigns it, and the agent spends within the typo.',
    pickerVerdict: 'Denied',
    verdict: ({ capUsd }) => ({
      covered: false,
      headline: 'Not covered — the countersigned mandate is the mandate',
      routeLine: `No route for the excess (S-31) — though cleanup help under F applies, up to ${formatUsd(perEventLimit('F', capUsd))} (15% of cap)`,
      reason:
        'The agent acted inside the mandate as countersigned — the signature is what makes the rulebook the rulebook (S-31). The policy doesn\u2019t pay for the typo; Coverage F still helps with cleanup and containment.',
      clause: 'S-31 · T3.2',
      control:
        'Countersignature: it protects both sides — the Principal\u2019s signature defines the mandate, so an unsigned intention can\u2019t override a signed cap.',
    }),
  },
  {
    num: 8,
    title:
      'A compromised insured agent poisons a counterparty\u2019s agent; the counterparty sues',
    narrative:
      'A compromised insured agent poisons a counterparty\u2019s agent; the counterparty sues for their losses while the insured agent also lost funds of its own.',
    pickerVerdict: 'Covered',
    verdict: ({ capUsd }) => ({
      covered: true,
      headline: 'Covered under E + B',
      routeLine: `Coverage E — someone else was harmed · pays their claim up to ${formatUsd(perEventLimit('E', capUsd))} (50% of cap) · Coverage B pays the insured\u2019s own losses up to ${formatUsd(perEventLimit('B', capUsd))}`,
      reason:
        'The counterparty\u2019s damages flow from the insured agent\u2019s covered failure (Coverage E, defense costs inside the limit); the insured\u2019s own manipulation losses are Coverage B, provable through the attested record.',
      clause: 'Coverage E · Coverage B',
      control:
        'TEE attestation again — it proves the insured agent was itself compromised, which is what routes the counterparty\u2019s claim to E instead of a bare liability fight.',
    }),
  },
];

/** REQ-7.10.1: at least two of the eight scenarios end in denial. */
export const DENIED_SCENARIO_COUNT = SCENARIOS.filter(
  (s) => s.pickerVerdict === 'Denied',
).length;
