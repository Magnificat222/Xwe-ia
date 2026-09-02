export interface WizardField {
  key: string;
  label: string;
  type: "text" | "textarea";
  placeholder?: string;
  help?: string;
}

export interface WizardStep {
  key: string;
  title: string;
  description: string;
  fields: WizardField[];
}

export interface WizardConfig {
  type: string;
  slug: string;
  title: string;
  description: string;
  steps: WizardStep[];
}

export type WizardAnswers = Record<string, Record<string, string>>;
