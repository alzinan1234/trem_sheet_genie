// Simulation data persists across refresh using localStorage
// but clears when user explicitly starts a new simulation

const SIM_DATA_KEY = 'tsg_simulation_data';
const SIM_RESULTS_KEY = 'tsg_simulation_results';
const SIM_STEP_KEY = 'tsg_simulation_step';

export const simulationStorage = {
  // Save simulation input data (steps 1-4)
  saveSimData: (data: any) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(SIM_DATA_KEY, JSON.stringify({ ...data, _savedAt: Date.now() }));
    } catch {}
  },

  // Load simulation input data
  loadSimData: (): any | null => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(SIM_DATA_KEY);
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      // Expire after 24 hours
      if (Date.now() - (parsed._savedAt || 0) > 24 * 60 * 60 * 1000) {
        localStorage.removeItem(SIM_DATA_KEY);
        return null;
      }
      return parsed;
    } catch { return null; }
  },

  // Save results data
  saveResultsData: (data: any) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(SIM_RESULTS_KEY, JSON.stringify({ ...data, _savedAt: Date.now() }));
    } catch {}
  },

  // Load results data
  loadResultsData: (): any | null => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(SIM_RESULTS_KEY);
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      if (Date.now() - (parsed._savedAt || 0) > 24 * 60 * 60 * 1000) {
        localStorage.removeItem(SIM_RESULTS_KEY);
        return null;
      }
      return parsed;
    } catch { return null; }
  },

  // Save current step
  saveStep: (step: string) => {
    if (typeof window === 'undefined') return;
    try { localStorage.setItem(SIM_STEP_KEY, step); } catch {}
  },

  // Load current step
  loadStep: (): string | null => {
    if (typeof window === 'undefined') return null;
    try { return localStorage.getItem(SIM_STEP_KEY); } catch { return null; }
  },

  // Clear all simulation data (when starting fresh)
  clearAll: () => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(SIM_DATA_KEY);
      localStorage.removeItem(SIM_RESULTS_KEY);
      localStorage.removeItem(SIM_STEP_KEY);
      // Also clear old sessionStorage keys
      sessionStorage.removeItem('simulationData');
      sessionStorage.removeItem('simulationResultsData');
    } catch {}
  },
};
