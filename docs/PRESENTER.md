# Presenter guide — Insure Your Agents demo

The presenter panel is a hidden stage-manager drawer. It is never linked
in-product; the audience only ever sees its in-world consequences.

## Opening the panel

- **Keyboard chord:** press `Shift+D` three times within ~1.5 seconds.
- **URL flag:** append `?presenter=1` to any route (e.g. `/dashboard?presenter=1`).
- Close with the `✕` button (or the chord again).

## Reset & persistence

All state is **in-memory only**. A browser refresh loses everything and
restarts from the seed. The panel's **FULL RESET** button restores the exact
seed state *including the seeded price setting `pinned: false`* — a presenter
pin set during the session never survives reset (AC-16). If you want the
pinned $3.00 rate after a reset, re-pin from the panel.

## Control reference

### 1. Inject incident

Pick a **target agent** (default Procurement-Bot) and optionally type a
**loss $** override (blank = the scenario default). Then hit one of the five
scenario buttons. Every injection builds the full incident record — narrative,
demo-clock timestamps (event/discovery at "now"), containment record, and
mock artifacts for every *applicable* evidence item per the §5d matrix — so
evidence auto-attach works on the claim screen. Injecting also **arms** the
dashboard "Simulate incident" affordance.

| Button | Scenario | Route | Default loss |
| --- | --- | --- | --- |
| S-03 | Cap-module failure | Coverage D | $60,000 gross |
| S-09 | Prompt injection | Coverage B | $20,000 |
| S-17 | Blocked injection (near-miss) | Coverage F | $0 + $2,400 investigation |
| S-18 | Key exfiltration | Coverage C | $35,000 |
| S-24 | Hallucinated invoice | Denial (model conduct) | $12,000 |

S-17 additionally drops a near-miss entry in the dashboard feed and a
+0.01-point data credit at renewal on the target agent.

### 2. Verification control

**REVOKE verified status** closes the operator's open verified interval;
**RESTORE** opens a new one. Conditions precedent are checked **at event
time**, so the AC-13 beat is: revoke → inject → the claim is not payable
(condition-precedent denial with a "Complete verification" forward action) →
restore → inject *again* → the new claim proceeds. Restoring does **not**
rescue the earlier claim — the interval history is the record.

### 3. Price control

**PIN N price at $3.00** — every conversion uses exactly $3.00 so the
Appendix-3 anchor numbers reconcile on stage. Unpin to return to the live
CoinGecko feed. (Reset always returns to unpinned.)

### 4. Time control

Fast-forward is **real state**: one virtual clock (`demoNow()`) drives claim
clocks, pro-ration, and renewals.

- `+2 bd` — past the acknowledgement window (2 business days).
- `+5 bd` — past the incomplete-package notice window.
- `+30 d` — past the determination window (runs from package-complete).
- `+10 d` — past the payment window.
- `+1 yr` — age the policy to renewal.
- **MISS a clock** — marks the latest claim `insurerMissed`; the claim screen
  highlights "insurer delay doesn't count against your time limits."

On every jump, insurer anchors (acknowledged / determination / payment)
auto-fill as their windows elapse on every open claim. Operator anchors
(notify, package submission) are never auto-filled — you still have to click.

### 5. Force states

All toggles act on the currently selected **target agent** (except
concentration, which is book-level):

- **Tier-1 logging lapse** — trips the `actionLogging` gate and suspends the
  agent ("tier-1 logging lapse"); toggle off to cure + unsuspend.
- **Hash mismatch** — suspends ("configuration hash mismatch").
- **Premium >15 d overdue** — marks an installment 16 days past due and
  suspends ("premium >15 days overdue").
- **Book concentration ABOVE 40%** — forces the Helios v2.3 external caps to
  $3.4 M (share above 40%); toggle off restores the seed $2.09 M.
- **Mark installment overdue** — the overdue payment item alone, without the
  suspension.

### 6. Full reset

Restores the exact seed: fleet, operator, enrollments, claims, incidents,
time offset 0, panel closed, price **unpinned**. A fresh price fetch resumes
immediately after.

## Demo crib sheet (expected outcomes at $3.00 pinned)

Prereq for a payable claim: the target agent must be **enrolled** at event
time (walk the purchase flow first, or the claim honestly denies with "not
enrolled at event time").

| Scenario | Beat | Expected outcome |
| --- | --- | --- |
| S-03 | Cap module failed but guardrails passed verification | Covered (D). Quantum = gross − per-tx cap ($60k − $50k = $10k); harness-audit coinsurance and retention **waived** (guardrail passed verification) → **pays exactly $10,000** |
| S-09 | Prompt injection with attested I/O | Covered (B) → **$18,500** ($20k − retention $1,000 − hitl coinsurance $500... shown line-by-line under "Show the math"). Inject against **Legacy-Bot** (no attestation) instead → denied "unprovable without attested I/O — Coverage B excluded" (D3.5) |
| S-17 | Injection blocked, reported | Near-miss (F): 7-day notify window, "no value moved," pays the **$2,400** investigation cost; retention waived; near-miss credit lands on the dashboard |
| S-18 | Key exfiltration | Covered (C) → **$33,500**; after payment a scripted **$10,000 recovery** flows down the waterfall — insurer first, all $10k to the insurer |
| S-24 | Hallucinated invoice — real payee, in-cap, model just wrong | **Denied** — model conduct (4.9). The letter carries the Coverage-B counterfactual: "Had the attested inputs shown crafted adversarial content, this would have been Coverage B." No payout math |

Other rehearsed beats:

- **AC-13:** REVOKE → inject S-09 → open claim → conditions banner red →
  denial letter names "verification not current at event time" + a
  "Complete verification" button → RESTORE → inject S-09 again → green banner.
- **Edited loss:** type a loss override before injecting — the whole payout
  pipeline recomputes from the incident's own parameters (REQ-7.11.3).
- **Clocks:** file, notify, submit the package, then fast-forward from the
  claim's step 4 — each jump fills the next insurer anchor as real state.
