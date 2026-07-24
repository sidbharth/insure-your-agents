/**
 * Claim-clock state machine + business-day math (plan §5c, finding 3) —
 * FROZEN SIGNATURES; WP-1 fills the bodies.
 *
 * Anchor → deadline rules:
 * - discoveredAt → notify within 48 h (near-miss: 7 d). Operator's clock.
 * - notifiedAt → acknowledgedAt within 2 business days. Insurer.
 * - packageReceivedAt → incompleteNoticeAt within 5 business days if any
 *   applicable item is still `missing`. Insurer.
 * - packageCompleteAt set when the LAST applicable item flips auto/uploaded
 *   (may equal the initial submission). An incomplete package BLOCKS the
 *   determination clock entirely — the 30-day window starts only at
 *   packageCompleteAt, never at packageReceivedAt.
 * - packageCompleteAt → determinedAt within 30 days. Insurer.
 * - determinedAt → paidAt within 10 days. Insurer.
 * Business-day math is weekday-only.
 */
import type { ClockState, DeadlineRow, Timestamp } from '../store/types';

/** Deadline rows for the timeline UI: label, dueAt, whoseClock, status. */
export function deadlines(_state: ClockState): DeadlineRow[] {
  throw new Error('WP-1');
}

/**
 * Advance the state machine to `now` (presenter fast-forward drives this via
 * the demo clock); insurer anchors auto-fill as their windows elapse.
 */
export function advance(_state: ClockState, _now: Timestamp): ClockState {
  throw new Error('WP-1');
}

/** t + n business days (weekday-only). */
export function addBusinessDays(_t: Timestamp, _days: number): Timestamp {
  throw new Error('WP-1');
}

/** t + n calendar days. */
export function addDays(_t: Timestamp, _days: number): Timestamp {
  throw new Error('WP-1');
}
