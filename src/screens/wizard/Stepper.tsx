/**
 * WP-2 wizard progress stepper (mockups wizard-*.html): six steps —
 * Company → Agent → Mandate → Controls → Quote → Pay & activate.
 * Done steps render a green check; the current step is highlighted.
 */
export type WizardStepKey =
  | 'company'
  | 'agent'
  | 'mandate'
  | 'controls'
  | 'quote'
  | 'pay';

const STEPS: { key: WizardStepKey; label: string }[] = [
  { key: 'company', label: 'Company' },
  { key: 'agent', label: 'Agent' },
  { key: 'mandate', label: 'Mandate' },
  { key: 'controls', label: 'Controls' },
  { key: 'quote', label: 'Quote' },
  { key: 'pay', label: 'Pay & activate' },
];

export interface WizardStepperProps {
  current: WizardStepKey;
  className?: string;
}

export function WizardStepper({ current, className = '' }: WizardStepperProps) {
  const currentIdx = STEPS.findIndex((s) => s.key === current);
  return (
    <div className={className} data-testid="wizard-stepper">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        {STEPS.map((step, i) => {
          const state = i < currentIdx ? 'done' : i === currentIdx ? 'current' : 'todo';
          return (
            <span key={step.key} className="flex items-center gap-1.5 text-xs" data-state={state}>
              <span
                className={`flex h-[18px] w-[18px] flex-none items-center justify-center rounded-full text-[10px] font-bold ${
                  state === 'done'
                    ? 'bg-good-bg text-good'
                    : state === 'current'
                      ? 'bg-accent text-white'
                      : 'bg-line-soft text-faint'
                }`}
              >
                {state === 'done' ? '✓' : i + 1}
              </span>
              <span
                className={
                  state === 'current'
                    ? 'font-semibold text-ink'
                    : state === 'done'
                      ? 'text-body'
                      : 'text-faint'
                }
              >
                {step.label}
              </span>
            </span>
          );
        })}
      </div>
      <div className="mt-1 text-2xs font-semibold uppercase tracking-widest text-faint">
        Step {Math.max(1, currentIdx + 1)} of 6
      </div>
    </div>
  );
}
