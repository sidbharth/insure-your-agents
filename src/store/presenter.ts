/**
 * Presenter slice (plan §2/§10). WP-0 freezes the state shape
 * {panelOpen, armed, timeOffsetMs} and the action SIGNATURES; WP-5 owns the
 * full action implementations (incident builders, forced states, etc.).
 */
import type { StateCreator } from 'zustand';
import { buildIncident } from '../data/incidents';
import type { PresenterSlice, RootState } from './types';

export const createPresenterSlice: StateCreator<RootState, [], [], PresenterSlice> = (
  set,
  get,
) => ({
  presenter: {
    panelOpen: false,
    armed: false,
    timeOffsetMs: 0,
  },

  setPanelOpen: (open) =>
    set((s) => ({ presenter: { ...s.presenter, panelOpen: open } })),

  setArmed: (armed) =>
    set((s) => ({ presenter: { ...s.presenter, armed } })),

  advanceTime: (byMs) =>
    set((s) => ({
      presenter: { ...s.presenter, timeOffsetMs: s.presenter.timeOffsetMs + byMs },
    })),

  /**
   * Inject a scenario against a target agent (plan §7.12, REQ-7.12.1).
   * Builds the full Incident — narrative, demo-clock timestamps, containment
   * record, and pre-built mock artifacts for every applicable evidence item
   * per the §5d applicability matrix — adds it to the claims slice, and arms
   * the dashboard "Simulate incident" affordance. S-17 (blocked injection)
   * additionally lands a near-miss feed entry and a renewal data credit.
   */
  injectIncident: (scenarioId, agentId, lossUsd) => {
    const state = get();
    const agent = state.agents.find((a) => a.id === agentId);
    if (agent === undefined) return;

    const incident = buildIncident(scenarioId, agent, lossUsd);
    state.addIncident(incident);
    set((s) => ({ presenter: { ...s.presenter, armed: true } }));

    if (scenarioId === 'S-17') {
      // Near-miss: feed entry + data credit at renewal (REQ-7.9.3, AC-11).
      state.addNearMiss({
        id: `nm-${incident.id}`,
        type: 'blocked-injection',
        at: incident.discoveredAt,
        creditTag: '+ data credit at renewal',
        creditPoints: 0.01,
        description: 'Injection attempt blocked — reported',
      });
      state.addCredit(agentId, {
        type: 'near-miss',
        at: incident.discoveredAt,
        points: 0.01,
      });
    }
  },
});
