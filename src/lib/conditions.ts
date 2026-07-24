/**
 * Event-time conditions-precedent evaluation over interval histories
 * (plan §5b, finding 2) — FROZEN SIGNATURES; WP-1 fills the bodies.
 *
 * All presenter/user actions write interval boundaries, never overwrite
 * booleans; current UI state = "interval open at demoClock.now()".
 */
import type {
  Agent,
  ConditionState,
  Enrollment,
  Interval,
  Mandate,
  Operator,
  Timestamp,
} from '../store/types';

/**
 * Evaluate all six condition components at instant `t`:
 * - gatesOperative: every tier-1 gate has an open interval covering t
 * - mandateInForce: some countersigned version's [inForceFrom, inForceTo) covers t
 * - premiumCurrent: no payment item with dueAt < t−15d still unpaid at t
 * - verificationCurrent: operator verified-interval covers t
 * - suspended: a suspension interval covers t
 * - enrolled: effectiveAt ≤ t < (terminatedAt ?? ∞)
 */
export function conditionStateAt(
  _t: Timestamp,
  _agent: Agent,
  _mandateVersions: Mandate[],
  _enrollment: Enrollment | undefined,
  _operator: Operator,
): ConditionState {
  throw new Error('WP-1');
}

/** True iff some interval in the list covers `t` ([from, to) semantics, open to = ∞). */
export function intervalCovers(_intervals: Interval[], _t: Timestamp): boolean {
  throw new Error('WP-1');
}

/**
 * Reduce a ConditionState to the pass/fail contract used by adjudication;
 * `failedCondition` names the first failing condition for the denial copy.
 */
export function conditionsPrecedentAt(_state: ConditionState): {
  pass: boolean;
  failedCondition?: string;
} {
  throw new Error('WP-1');
}
