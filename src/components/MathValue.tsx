/**
 * MathValue — a money/rate figure that, when the global "Show the math"
 * toggle is on, expands into its complete arithmetic: inputs, formula,
 * clause references, and both currencies at the displayed rate
 * (REQ-6.7/6.8, decision D4, AC-14). Frozen props — WP-2..5 consume.
 */
import type { ReactNode } from 'react';
import { formatN, formatUsd, usdToN, type MathBreakdown } from '../lib/money';
import { useStore } from '../store';

export interface MathValueProps {
  /** The rendered figure, e.g. "$300/yr" or "0.6%". */
  children: ReactNode;
  /** The complete arithmetic behind the figure. */
  breakdown: MathBreakdown;
  /** Extra classes on the wrapping element. */
  className?: string;
}

export function MathValue({ children, breakdown, className }: MathValueProps) {
  const showMath = useStore((s) => s.showMath);
  const usdPerN = useStore((s) => s.priceFeed.usdPerN);
  const rate = breakdown.rateUsed ?? usdPerN;

  return (
    <span className={className} data-testid="math-value">
      <span className="num">{children}</span>
      {showMath && (
        <span
          data-testid="math-expansion"
          className="mt-1.5 block rounded-md border border-accent-line bg-accent-soft px-3 py-2 text-xs text-ink-2"
        >
          {breakdown.title && (
            <span className="mb-1 block text-2xs font-bold uppercase tracking-wider text-accent-ink">
              {breakdown.title}
            </span>
          )}
          {breakdown.inputs.length > 0 && (
            <span className="block space-y-0.5">
              {breakdown.inputs.map((line, i) => (
                <span key={i} className="flex justify-between gap-4">
                  <span className="text-muted">{line.label}</span>
                  <span className="num font-mono">
                    {line.amount}
                    {line.clause && (
                      <span className="ml-1.5 text-faint">· {line.clause}</span>
                    )}
                  </span>
                </span>
              ))}
            </span>
          )}
          {breakdown.lines && breakdown.lines.length > 0 && (
            <span className="mt-1 block space-y-0.5 border-t border-accent-line pt-1">
              {breakdown.lines.map((line, i) => (
                <span key={i} className="flex justify-between gap-4">
                  <span className="text-muted">{line.label}</span>
                  <span className="num font-mono">
                    {line.amount}
                    {line.clause && (
                      <span className="ml-1.5 text-faint">· {line.clause}</span>
                    )}
                  </span>
                </span>
              ))}
            </span>
          )}
          <span className="mt-1 block border-t border-accent-line pt-1 font-mono text-xs">
            {breakdown.formula}
            {breakdown.clause && (
              <span className="ml-1.5 text-faint">· clause {breakdown.clause}</span>
            )}
          </span>
          {breakdown.resultUsd !== undefined && (
            <span className="num mt-0.5 block font-semibold">
              {formatUsd(breakdown.resultUsd)} ≈{' '}
              {formatN(usdToN(breakdown.resultUsd, rate), { maxFractionDigits: 1 })}{' '}
              <span className="font-normal text-muted">
                at 1 N = ${rate.toFixed(2)}
              </span>
            </span>
          )}
        </span>
      )}
    </span>
  );
}
