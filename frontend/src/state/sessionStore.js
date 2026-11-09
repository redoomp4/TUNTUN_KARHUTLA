/**
 * @fileoverview Ephemeral Session State Manager (window.sessionStorage)
 * @module state/sessionStore
 *
 * Satisfies NFR-05, NFR-06, NFR-07, and NFR-12:
 * - Zero user registration / zero PII collection
 * - Persistent across page refreshes within the active browser tab
 * - Automatically isolated and cleared when tab closes
 */

export const SESSION_STORAGE_KEY = 'dg_learning_session_v2';

/**
 * Generates default initial session state.
 * @returns {object}
 */
export function createDefaultSessionState() {
  return {
    sessionId: 'SES-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
    activeView: 'scanner',
    showAllViews: true,
    scanHistory: [],
    simulator: {
      activeScenario: 'courier',
      completedScenarios: {},
      safeDecisions: 0,
      riskyDecisions: 0
    },
    detective: {
      activeCase: 'prize',
      caseResults: {}
    },
    checklist: {}
  };
}

/**
 * Loads session state from window.sessionStorage with schema fallback.
 * @param {Storage} [storage=window.sessionStorage]
 * @returns {object}
 */
export function loadSessionState(storage = window.sessionStorage) {
  const defaults = createDefaultSessionState();
  try {
    const raw = storage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    return {
      ...defaults,
      ...parsed,
      scanHistory: Array.isArray(parsed.scanHistory) ? parsed.scanHistory : [],
      simulator: { ...defaults.simulator, ...(parsed.simulator || {}) },
      detective: { ...defaults.detective, ...(parsed.detective || {}) },
      checklist: { ...(parsed.checklist || {}) }
    };
  } catch {
    return defaults;
  }
}

/**
 * Saves session state into window.sessionStorage.
 * @param {object} state
 * @param {Storage} [storage=window.sessionStorage]
 */
export function saveSessionState(state, storage = window.sessionStorage) {
  try {
    storage.setItem(SESSION_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Gracefully ignore quota errors in private browsing
  }
}
