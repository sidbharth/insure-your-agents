/**
 * Screen 7.1 — Get started (WP-2; mockup wizard-landing-default.html).
 * Positioning line, "Get started" CTA → /verify, three-step preview strip,
 * "How it works" 60-second explainer (the four end-user questions), demo
 * small print, and the single-role Operator footnote (REQ-7.1.1). No signup,
 * no email capture (REQ-7.1.2). The session comes pre-seeded from data/seed
 * — the company name is rename-able in place.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { POSITIONING_LINE } from '../data/copy';
import { useStore } from '../store';

const STEPS = [
  {
    n: 1,
    title: 'Prove your company',
    body: 'Verify your legal entity so the programme can pursue recovery on your behalf and stand behind claims.',
  },
  {
    n: 2,
    title: 'Connect your agents',
    body: "Register each agent's configuration fingerprint, sign its rulebook, and choose its safety controls.",
  },
  {
    n: 3,
    title: 'Get covered',
    body: 'See the price and the coverage it buys, pay the premium in $NEAR at the live rate, and cover attaches instantly.',
  },
];

/** The four end-user questions (PRD §2) — the 60-second explainer. */
const HOW_IT_WORKS = [
  {
    q: 'Who is eligible for coverage?',
    a: 'Coverage requires four baseline controls: a registered agent identity, enforced transfer caps, an enforced payee whitelist, and action logging. An agent that lacks any of these is declined rather than charged a higher premium.',
  },
  {
    q: 'How is the premium calculated?',
    a: "The premium starts at a base rate of 0.6% of the agent's per-transaction cap. A published surcharge is added for each optional control that is not in place, and the total rate never exceeds 3.0%. The full calculation behind any figure is available through the Show the math toggle.",
  },
  {
    q: 'What does the policy cover?',
    a: "The policy provides six coverages, labeled A through F, ranging from mandate breaches to cleanup and recovery costs. It does not cover losses caused by an incorrect model decision alone. The policy insures the delegation and the systems that enforce it, not the model's judgment.",
  },
  {
    q: 'What happens when a loss occurs?',
    a: 'You notify the programme within 48 hours of discovery and contain the incident immediately. Most of the twelve-item evidence package is assembled automatically from your own records. Claims are acknowledged within 2 business days, decided within 30 days of a complete package, and paid within 10 days of the decision.',
  },
];

export default function GetStarted() {
  const navigate = useNavigate();
  const operatorName = useStore((s) => s.operator.name);
  const renameOperator = useStore((s) => s.renameOperator);
  const [showHow, setShowHow] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState(operatorName);

  const commitRename = () => {
    const next = draftName.trim();
    if (next.length > 0) renameOperator(next);
    else setDraftName(operatorName);
    setEditingName(false);
  };

  return (
    <div className="mx-auto max-w-shell px-6 py-10" data-testid="screen-GetStarted">
      <div className="mx-auto max-w-[860px]">
        {/* Seeded company — accept or rename (PRD 7.1 system behavior) */}
        <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-muted">
          {editingName ? (
            <input
              autoFocus
              data-testid="company-name-input"
              className="rounded-md border border-line bg-panel px-2 py-1 text-sm text-ink"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitRename();
                if (e.key === 'Escape') {
                  setDraftName(operatorName);
                  setEditingName(false);
                }
              }}
            />
          ) : (
            <>
              <b className="text-ink" data-testid="company-name">
                {operatorName}
              </b>

              <button
                type="button"
                data-testid="rename-company"
                className="text-xs text-accent-ink underline decoration-dotted"
                onClick={() => {
                  setDraftName(operatorName);
                  setEditingName(true);
                }}
              >
                rename
              </button>
            </>
          )}
        </div>

        <h1 className="max-w-[720px] text-2xl font-bold tracking-tight text-ink">
          {POSITIONING_LINE}.
        </h1>
        <p className="mt-3 max-w-[640px] text-md text-muted">
          Verify your company, register an agent, and set its mandate.
          Pricing responds to each safety control you enable. Setup takes
          about six minutes.
        </p>

        <div className="mt-6 flex items-center gap-4">
          <button
            type="button"
            data-testid="get-started"
            onClick={() => navigate('/verify')}
            className="rounded-lg bg-accent px-6 py-2.5 text-md font-semibold text-ink shadow-card hover:bg-[#0bd489]"
          >
            Get started
          </button>
          <button
            type="button"
            data-testid="how-it-works-toggle"
            aria-expanded={showHow}
            onClick={() => setShowHow((v) => !v)}
            className="text-sm font-semibold text-accent-ink"
          >
            How it works
          </button>
        </div>

        {showHow && (
          <div
            data-testid="how-it-works"
            className="mt-5 grid grid-cols-1 gap-3 rounded-card border border-line bg-panel p-5 shadow-card md:grid-cols-2"
          >
            {HOW_IT_WORKS.map((item) => (
              <div key={item.q}>
                <div className="text-sm font-semibold text-ink">{item.q}</div>
                <p className="mt-1 text-xs text-muted">{item.a}</p>
              </div>
            ))}
          </div>
        )}

        {/* three-step preview strip */}
        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3" data-testid="step-strip">
          {STEPS.map((step) => (
            <div key={step.n} className="rounded-card border border-line bg-panel p-5 shadow-card">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-soft text-sm font-bold text-accent-ink">
                {step.n}
              </span>
              <div className="mt-3 text-md font-semibold text-ink">{step.title}</div>
              <p className="mt-1.5 text-sm text-muted">{step.body}</p>
            </div>
          ))}
        </div>

        {/* single-role footnote (REQ-7.1.1) */}
        <p className="mt-2 max-w-[640px] text-xs text-faint" data-testid="operator-footnote">
          You're signed in as the <b className="text-muted">Operator</b>, the
          company that runs the agents. The Principal, whose funds the agents
          spend, appears once: to countersign the mandate.
        </p>
      </div>
    </div>
  );
}
