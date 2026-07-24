/**
 * Prospective-book concentration math (plan §4b, finding 8) — FROZEN
 * SIGNATURES; WP-1 fills the bodies.
 *
 * Loading determination is ATOMIC on the prospective post-enrollment book:
 * share = (componentCaps + addedCap) / (totalCaps + addedCap); loading iff
 * strictly > 0.40; then commit. Appendix B: Vendor-Bot ends at exactly
 * 40.0000% → no loading; Settle-Bot at 40.5085% → loading. Existing
 * enrollments keep their frozen rates when the book later drops.
 */
import type { ProgrammeBook } from '../store/types';

/** Prospective share (0..1) of `component` if `addedCapUsd` were enrolled. */
export function prospectiveShare(
  _book: ProgrammeBook,
  _component: string,
  _addedCapUsd: number,
): number {
  throw new Error('WP-1');
}

/** Strictly > 0.40 on the prospective post-enrollment book. */
export function loadingApplies(
  _book: ProgrammeBook,
  _component: string,
  _addedCapUsd: number,
): boolean {
  throw new Error('WP-1');
}

export interface EnrollDecision {
  loadingApplied: boolean;
  /** Post-commit share (0..1) of the component. */
  shareAfter: number;
  book: ProgrammeBook;
}

/** Atomic: decide loading on the prospective book, then mutate/return the book. */
export function enroll(
  _book: ProgrammeBook,
  _component: string,
  _capUsd: number,
): EnrollDecision {
  throw new Error('WP-1');
}

/** Current (non-prospective) share of a component across the whole book. */
export function currentShare(_book: ProgrammeBook, _component: string): number {
  throw new Error('WP-1');
}
