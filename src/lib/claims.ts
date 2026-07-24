/**
 * Deterministic claim-adjudication pipeline (plan §5a, PRD §9) — FROZEN
 * SIGNATURES; WP-1 fills the bodies.
 *
 * One pure function; coverage route and covered quantum are DERIVED, never
 * passed in. Pipeline order:
 *   1. conditions precedent at event time (conditions.ts)
 *   2. coverage eligibility + route derivation (S-09 checks attestation
 *      operative at eventAt; S-24 → model-conduct exclusion; S-03 → D;
 *      S-18 → C; S-17 → F)
 *   3. covered-loss quantum (e.g. S-03: $60,000 − $50,000 cap = $10,000)
 *   4. per-event limit (A–D 100% of cap; E 50%; F 15% w/ recovery sub-cap 10%)
 *   5. coinsurance on the governed slice only (20/15/15/20 per tier-2 at event)
 *   6. retention = max(500 × usdPerN, 0.02 × grossLoss), after coinsurance;
 *      waived for Coverage D when the guardrail passed its latest verification
 *   7. floor: payoutUsd = max(0, quantumAfterLimit − coinsurance − retention)
 */
import type {
  AdjudicationResult,
  AgentEventState,
  Enrollment,
  Incident,
  Mandate,
  RecoveryWaterfall,
  VerificationInterval,
} from '../store/types';

export interface AdjudicationInput {
  incident: Incident;
  /** From interval histories at incident.eventAt. */
  agentStateAtEvent: AgentEventState;
  mandateAtEvent: Mandate;
  enrollment: Enrollment;
  operatorHistory: VerificationInterval[];
  /** Day-of-payment rate (via payments helper). */
  usdPerN: number;
}

export function adjudicate(_input: AdjudicationInput): AdjudicationResult {
  throw new Error('WP-1');
}

/**
 * Recovery waterfall: recovered funds repay the insurer first, then the
 * insured's retained slice, then any uninsured loss (S-18: $10,000 → all to
 * the insurer).
 */
export function recoveryWaterfall(
  _recoveredUsd: number,
  _insurerPaidUsd: number,
  _insuredRetainedUsd: number,
): RecoveryWaterfall {
  throw new Error('WP-1');
}
