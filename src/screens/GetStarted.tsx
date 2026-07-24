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
import { DEMO_SMALL_PRINT, POSITIONING_LINE } from '../data/copy';
import { useStore } from '../store';

const STEPS = [
  {
    n: 1,
    title: 'Prove your company',
    body: 'Verify your legal identity so the programme can stand behind you — and chase stolen funds on your behalf.',
  },
  {
    n: 2,
    title: 'Connect your agents',
    body: "Register each agent's configuration fingerprint, sign its rulebook, and choose its safety controls.",
  },
  {
    n: 3,
    title: 'Get covered',
    body: 'See the price and the coverage it buys, pay the premium in N at the live rate, and cover attaches instantly.',
  },
];

/** The four end-user questions (PRD §2) — the 60-second explainer. */
const HOW_IT_WORKS = [
  {
    q: 'Who can get covered — and who cannot?',
    a: 'Four controls are non-negotiable gates: a registered agent identity, transfer caps, whitelist enforcement, and action logging. Miss one and the answer is declined — never merely more expensive.',
  },
  {
    q: 'What decides the price?',
    a: "A base rate of 0.6% of the agent's spending cap, a published surcharge for every optional control you skip, and a hard ceiling at 3.0%. Every number on screen opens up to show its full arithmetic.",
  },
  {
    q: 'What does the policy pay for — and never pay for?',
    a: "Six coverages, A through F, from a mandate breach to cleanup costs. It never pays for the model simply being wrong: the policy insures the delegation and the machinery, not the model's brain.",
  },
  {
    q: 'What happens when something goes wrong?',
    a: 'Notify within 48 hours, contain immediately, and your own records auto-fill most of a twelve-item evidence package. Published clocks: acknowledged in 2 business days, decided in 30 days, paid in 10.',
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
        <div className="mb-6 flex items-center gap-2 text-sm text-muted">
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
              <span>· Agentic insurance programme</span>
              <button
                type="button"
                data-testid="rename-company"
                className="text-xs text-accent underline decoration-dotted"
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
          Prove who you are, register an agent, write its rulebook, and watch
          the price respond to every control you switch on or off. Six
          minutes, end to end.
        </p>

        <div className="mt-6 flex items-center gap-4">
          <button
            type="button"
            data-testid="get-started"
            onClick={() => navigate('/verify')}
            className="rounded-lg bg-accent px-6 py-2.5 text-md font-semibold text-white shadow-card hover:bg-accent-ink"
          >
            Get started
          </button>
          <button
            type="button"
            data-testid="how-it-works-toggle"
            aria-expanded={showHow}
            onClick={() => setShowHow((v) => !v)}
            className="text-sm font-semibold text-accent"
          >
            How it works · 60 sec
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

        <p className="mt-8 text-xs text-faint" data-testid="demo-small-print">
          {DEMO_SMALL_PRINT}
        </p>
        {/* single-role footnote (REQ-7.1.1) */}
        <p className="mt-2 max-w-[640px] text-xs text-faint" data-testid="operator-footnote">
          You walk through this demo as the <b className="text-muted">Operator</b> — the
          company that runs the agents. The Principal, whose money the agents
          spend, appears once: at the mandate signature step.
        </p>
      </div>
    </div>
  );
}
