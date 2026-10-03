import type { WizardConfig } from "./types";
import { businessPlanWizard } from "./business-plan";

export const wizards: Record<string, WizardConfig> = {
  "business-plan": businessPlanWizard,
};

export function getWizard(type: string): WizardConfig | undefined {
  return wizards[type];
}
