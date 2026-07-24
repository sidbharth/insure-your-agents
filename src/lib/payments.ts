/**
 * Centralized payment preflight / execute helper (plan §7a, finding 7) —
 * FROZEN SIGNATURES; WP-1 fills the bodies.
 *
 * This is the ONLY code path that moves value. executePayment:
 *   1. await priceFeed.refetchNow()   (REQ-6.2 — before ANY payment action)
 *   2. record: append paymentHistory item {dueAt, paidAt: now, amountUsd,
 *      amountN, rateUsed}
 *   3. return receipt {rateUsed, paidAt, amountN}
 * Activation is a SEPARATE store transition after recording
 * (session.activateEnrollments(receipt)).
 */
import type { Timestamp } from '../store/types';

export type PaymentScope = 'initial-premium' | 'delta' | 'claim-settlement';

export interface NamedBlocker {
  /** Stable key, e.g. 'mandate-not-countersigned'. */
  key: string;
  /** Named-reason blocking copy (REQ-7.8.1, AC-7). */
  reason: string;
}

export type PreflightResult = { ok: true } | { ok: false; blockers: NamedBlocker[] };

/**
 * Pure preflight; drives the Pay button's disabled state. Initial-premium
 * scope checks: hash registered + ownership verified, mandate countersigned,
 * all tier-1 gates on, payment method selected.
 */
export function paymentPreflight(
  _session: PaymentSessionView,
  _scope: PaymentScope,
): PreflightResult {
  throw new Error('WP-1');
}

/** The minimal session view preflight needs (kept narrow for purity/tests). */
export interface PaymentSessionView {
  agents: Array<{
    id: string;
    configHash: string;
    ownershipVerified: boolean;
    tier1AllOn: boolean;
    mandateCountersigned: boolean;
  }>;
  paymentMethodSelected: boolean;
}

export type PaymentKind = 'initial' | 'delta' | 'claim-settlement';

export interface PaymentTargets {
  /** Agents (initial/delta) or claim (settlement) the payment applies to. */
  agentIds?: string[];
  claimId?: string;
}

export interface PaymentReceipt {
  kind: PaymentKind;
  rateUsed: number;
  paidAt: Timestamp;
  amountUsd: number;
  amountN: number;
  targets: PaymentTargets;
}

/**
 * Execute a payment: re-fetch the price first, record the payment history
 * item, return the receipt. Never activates anything itself.
 */
export async function executePayment(
  _kind: PaymentKind,
  _amountUsd: number,
  _targets: PaymentTargets,
): Promise<PaymentReceipt> {
  throw new Error('WP-1');
}
