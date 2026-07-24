/**
 * THE pure pricing engine (plan §4, PRD §8) — FROZEN SIGNATURES.
 *
 * WP-0 stub: signatures are the contract; WP-1 fills the bodies.
 * Order of operations (exact): base 0.6 + skipped-tier-2 surcharges
 * (attestation 0.6, KYB 0.4, timelock/recovery/audit/HITL 0.3 each,
 * killSwitch 0.2) → ladderRatePct = min(rate, 3.0) → loadings AFTER the
 * clamp (concentration +0.1, open-set +0.3; displayed total may reach 3.4).
 * Tier-1 never appears in the formula: it gates, it never prices (GT-1).
 */
import type {
  Enrollment,
  RateLine,
  Tier1Controls,
  Tier2Controls,
  Timestamp,
  Claim,
  Incident,
} from '../store/types';
import type { MathBreakdown } from './money';

export interface PricingInput {
  capUsd: number;
  tier1: Tier1Controls;
  tier2: Tier2Controls;
  /** Mandate open counterparty set (+0.3% post-clamp loading). */
  openSet: boolean;
  /** Decided by concentration.ts at enrollment time (§4b). */
  concentrationLoading: boolean;
}

export interface PricingFlags {
  coverageBExcluded: boolean;
  kybClaimsTrap: boolean;
  recoveryCoins20: boolean;
  auditCoins20: boolean;
  hitlCoins15: boolean;
  killSwitchCoins15: boolean;
}

export type PricingResult =
  | { kind: 'declined'; missingGates: string[] }
  | {
      kind: 'quoted';
      /** Base + tier-2 surcharges, clamped at 3.0 (the tier-2 ladder ceiling). */
      ladderRatePct: number;
      /** Concentration 0.1 + openSet 0.3, applied after the clamp. */
      loadingsPct: number;
      /** ladderRatePct + loadingsPct (max 3.4). */
      totalRatePct: number;
      /** totalRatePct × cap. */
      premiumUsd: number;
      breakdown: RateLine[];
      /** Ladder hit 3.0 exactly. */
      ceilingReached: boolean;
      flags: PricingFlags;
    };

export function priceAgent(_input: PricingInput): PricingResult {
  throw new Error('WP-1');
}

export function premiumN(_premiumUsd: number, _usdPerN: number): number {
  throw new Error('WP-1');
}

export interface ProRataResult {
  usd: number;
  breakdown: MathBreakdown;
}

/** Pro-rata refund of a rate slice from a date to renewal (T5.3 logic). */
export function proRataRefund(
  _points: number,
  _capUsd: number,
  _fromDate: Timestamp,
  _renewalAt: Timestamp,
  _now: Timestamp,
): ProRataResult {
  throw new Error('WP-1');
}

export interface RepriceDeltaResult {
  deltaUsd: number;
  breakdown: MathBreakdown;
}

/**
 * Mandate re-pricing (§9a): annual difference pro-rated for the remaining
 * term — deltaUsd = (newAnnual − oldAnnual) × remainingDays / 365.
 */
export function repriceDelta(
  _oldInput: PricingInput,
  _newInput: PricingInput,
  _effectiveAt: Timestamp,
  _renewalAt: Timestamp,
): RepriceDeltaResult {
  throw new Error('WP-1');
}

export type DeEnrollRefundResult =
  | { usd: number; breakdown: MathBreakdown }
  | { usd: 0; reason: 'claim paid or noticed' };

/**
 * De-enrollment refund (§9b, D7): remaining-term pro-rata — unless any claim
 * has been paid or noticed on that agent, then $0 with the reason.
 */
export function deEnrollRefund(
  _enrollment: Enrollment,
  _agentClaims: { claims: Claim[]; incidents: Incident[] },
  _now: Timestamp,
): DeEnrollRefundResult {
  throw new Error('WP-1');
}

export interface RenewalPreview {
  renewalRatePct: number;
  breakdown: MathBreakdown;
}

/**
 * Renewal preview (§9c, demo-defined, AC-11): clamp(currentLadderRate − 0.05
 * clean-year − 0.01 × reportedNearMisses, floor 0.45, movement ±0.15 when
 * nothing about the setup changed).
 */
export function renewalPreview(
  _currentLadderRatePct: number,
  _reportedNearMisses: number,
  _setupUnchanged: boolean,
): RenewalPreview {
  throw new Error('WP-1');
}
