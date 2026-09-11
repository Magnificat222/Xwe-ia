export interface DashboardPrefs {
  showStats: boolean;
  showCategoryChart: boolean;
  showActivity: boolean;
  showRecommended: boolean;
}

export const DEFAULT_DASHBOARD_PREFS: DashboardPrefs = {
  showStats: true,
  showCategoryChart: true,
  showActivity: true,
  showRecommended: true,
};

export function parseDashboardPrefs(raw: unknown): DashboardPrefs {
  if (!raw || typeof raw !== "object") return DEFAULT_DASHBOARD_PREFS;
  return { ...DEFAULT_DASHBOARD_PREFS, ...(raw as Partial<DashboardPrefs>) };
}
