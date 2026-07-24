/**
 * ConcentrationMeter (REQ-7.7.2, GT-6): shared-component share of the
 * (simulated) programme book vs the 40% threshold. Labeled
 * "programme-wide, simulated". Frozen props — WP-3/4 consume.
 */
import { CONCENTRATION_METER_LABEL } from '../data/copy';

export interface ConcentrationMeterProps {
  /** Component label, e.g. "Helios v2.3". */
  component: string;
  /** Current share of the book, 0..1. */
  share: number;
  /** Threshold, 0..1 (0.40 per clause 5.8.2). */
  threshold?: number;
  className?: string;
}

export function ConcentrationMeter({
  component,
  share,
  threshold = 0.4,
  className = '',
}: ConcentrationMeterProps) {
  const over = share > threshold;
  const pct = Math.min(1, share) * 100;

  return (
    <div data-testid="concentration-meter" className={className}>
      <div className="mb-1 flex items-baseline justify-between text-xs">
        <span className="font-semibold text-ink">
          {component}{' '}
          <span className="font-normal text-faint">· {CONCENTRATION_METER_LABEL}</span>
        </span>
        <b className={`num ${over ? 'text-warn' : 'text-ink'}`} data-testid="share-readout">
          {(share * 100).toFixed(1)}%
        </b>
      </div>
      <div className="relative h-2.5 overflow-hidden rounded-full bg-line-soft">
        <div
          className={`h-full rounded-full transition-all ${over ? 'bg-warn-deep' : 'bg-accent'}`}
          style={{ width: `${pct}%` }}
        />
        <div
          className="absolute top-0 h-full w-px bg-bad"
          style={{ left: `${threshold * 100}%` }}
          title={`${threshold * 100}% concentration threshold (5.8.2)`}
        />
      </div>
      <div className="num mt-0.5 text-2xs text-faint">
        {(threshold * 100).toFixed(0)}% threshold — enrollments past this carry a
        +0.1% loading
      </div>
      {over && (
        <div className="mt-1 text-2xs font-semibold text-warn" data-testid="over-threshold">
          Above threshold — new {component} enrollments carry the +0.1% loading
        </div>
      )}
    </div>
  );
}
