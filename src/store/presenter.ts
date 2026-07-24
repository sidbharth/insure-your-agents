/**
 * Presenter slice (plan §2/§10). WP-0 freezes the state shape
 * {panelOpen, armed, timeOffsetMs} and the action SIGNATURES; WP-5 owns the
 * full action implementations (incident builders, forced states, etc.).
 * Implementations here are minimal but real for panel/time/arming.
 */
import type { StateCreator } from 'zustand';
import type { PresenterSlice, RootState } from './types';

export const createPresenterSlice: StateCreator<RootState, [], [], PresenterSlice> = (
  set,
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

  // WP-5 replaces this body with the full incident builder (artifacts +
  // applicability matrix per plan §5d). The signature is frozen.
  injectIncident: (scenarioId, agentId, lossUsd) => {
    void scenarioId;
    void agentId;
    void lossUsd;
    throw new Error('WP-5: injectIncident is implemented by the presenter work package');
  },
});
