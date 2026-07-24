/**
 * "Simulated" badge (REQ-6.5): anything simulated that would be a real-world
 * attestation, signature, or payment carries this small persistent badge.
 * The live N price is the one element not badged — it carries its
 * live-source label instead (PriceChip).
 */
export interface SimulatedBadgeProps {
  className?: string;
}

export function SimulatedBadge({ className = '' }: SimulatedBadgeProps) {
  return (
    <span
      data-testid="simulated-badge"
      className={`inline-flex items-center gap-1 rounded border border-dashed border-[#b9c4d0] bg-[#fafbfd] px-1.5 py-0.5 align-middle text-[9.5px] font-bold uppercase tracking-wider text-faint ${className}`}
    >
      Simulated
    </span>
  );
}
