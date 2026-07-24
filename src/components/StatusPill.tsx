/**
 * Status pill: Active / Suspended / De-enrolled / Declined / Draft / Quoted
 * with the mockups' green/amber/red/neutral semantics.
 */
import type { AgentStatus } from '../store/types';

export interface StatusPillProps {
  status: AgentStatus;
  /** Optional cause shown for Suspended (REQ-7.9.1). */
  reason?: string;
  className?: string;
}

const STYLES: Record<AgentStatus, string> = {
  Active: 'bg-good-bg text-good border-good-line',
  Suspended: 'bg-warn-bg text-warn border-warn-line',
  'De-enrolled': 'bg-line-soft text-muted border-line',
  Declined: 'bg-bad-bg text-bad border-bad-line',
  Draft: 'bg-line-soft text-muted border-line',
  Quoted: 'bg-accent-soft text-accent-ink border-accent-line',
};

const DOTS: Record<AgentStatus, string> = {
  Active: 'bg-good',
  Suspended: 'bg-warn-deep',
  'De-enrolled': 'bg-faint',
  Declined: 'bg-bad',
  Draft: 'bg-faint',
  Quoted: 'bg-accent',
};

export function StatusPill({ status, reason, className = '' }: StatusPillProps) {
  return (
    <span
      data-testid="status-pill"
      data-status={status}
      title={reason}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-2xs font-semibold ${STYLES[status]} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${DOTS[status]}`} />
      {status}
      {status === 'Suspended' && reason ? (
        <span className="font-normal">({reason})</span>
      ) : null}
    </span>
  );
}
