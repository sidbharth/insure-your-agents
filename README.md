# AgentConnect Insurance

A working demonstration of an insurance product for AI agents that move money, built on the Agent Insurance Framework and priced in $NEAR. The application walks the full life of a policy: enrollment, pricing, coverage, claims, and denial.

The premise is simple. When commerce runs on agentic rails, the platforms that touch money will require insurance. This product insures the delegation given to an agent and the machinery that enforces it. It does not insure the model's judgment. An agent that is manipulated by an attacker is covered. An agent that is simply wrong is not.

## What the product does

**Eligibility is a gate, not a price.** Four controls are required before any quote exists: a registered configuration hash, enforced transfer caps, an enforced payee whitelist, and action logging. An agent missing any of these is declined.

**Pricing is published and mechanical.** The premium is 0.6% of the agent's per-transaction cap. Each optional safety control that is skipped adds a published surcharge, and the total rate never exceeds 3.0%. Every figure in the interface can be expanded into its full arithmetic with the Show the math toggle.

**Coverage is derived, not selected.** Six coverages respond to a breached mandate, a manipulated agent, stolen credentials, a failed guardrail, liability to counterparties, and the costs of response and recovery. The controls an Operator runs determine which coverages are live.

**Claims run on published clocks.** Notification is due within 48 hours of discovery. Most of the twelve-item evidence package assembles itself from the records a compliant stack already produces. Claims are acknowledged within 2 business days, decided within 30 days of a complete package, and paid within 10 days of the decision. Denials are delivered as reasoned determinations, not error states.

## Roles

The policy is taken out by the Operator for the benefit of the Operator and its enrolled Principals. The application offers three enrollment journeys.

| Role | Journey |
| --- | --- |
| Operator | Full enrollment. Verify the company, register agents, set mandates and controls, review the quote, and pay. |
| Principal | Short journey. Verify the organization, review the mandate the Operator prepared, and countersign it. Principals pay nothing and are paid directly for their own losses. |
| Operator and Principal | Full enrollment with the countersignature executed in-house by an authorized officer. |

## Running the application

```bash
npm install
npm run dev
```

The application runs at `http://localhost:5173`.

```bash
npm test        # run the test suite
npm run build   # typecheck and produce a production build
```

## Application structure

| Route | Screen |
| --- | --- |
| `/` | Landing page and role selection |
| `/verify` | Company verification (KYB) |
| `/connect` | Agent registration and ownership challenge |
| `/mandate` | Mandate authoring and countersignature |
| `/controls` | Safety controls and live pricing |
| `/quote` | Quote, coverages, and exclusions |
| `/fleet` | Fleet enrollment |
| `/pay` | Payment and activation |
| `/review` | Principal review and countersignature |
| `/policies` | Policy dashboard |
| `/coverage` | Coverage detail and the scenario explorer |
| `/claim` | Claims flow |
| `/dashboard` | Programme dashboard (underwriting-side portfolio view) |

## Data and simulation

All data lives in the browser. The session can be saved to local storage with the Save session control in the header and restored on the next visit. Reset returns the application to its sample fleet.

Verifications, signatures, and payments are simulated and carry a Simulated badge wherever they appear. The $NEAR reference price is live, fetched from CoinGecko and refreshed every minute. Every monetary figure traces to that rate, its source, and its timestamp.

## Framework

The product logic follows the Agent Insurance Framework: the six insuring agreements, the model conduct boundary, the tier-1 eligibility gates, the published rate schedule, the disclosure requirements, and the claims terms. Clause references throughout the interface (T3.2, D2.5, 5.8.2, Appendix 3) point into that document.
