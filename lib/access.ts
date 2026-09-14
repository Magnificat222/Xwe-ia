export type AccessMode = "FREE" | "PATH" | "PREMIUM";

export type FreeModule = "DISCUSSION" | "ARENE" | "OUTILS_IA";

export interface PathOffer {
  id: string;
  slug: string;
  title: string;
  description: string;
  priceXof: number;
  mode: AccessMode;
}

export const FREE_MODULES: FreeModule[] = ["DISCUSSION", "ARENE", "OUTILS_IA"];

export const DEFAULT_PATH_OFFERS: PathOffer[] = [
  {
    id: "business-plan",
    slug: "business-plan",
    title: "Créer mon Business Plan",
    description: "Du concept jusqu'au document final et exploitable.",
    priceXof: 2500,
    mode: "PATH",
  },
  {
    id: "cv-professionnel",
    slug: "cv-professionnel",
    title: "CV professionnel",
    description: "Un profil qui montre clairement votre valeur.",
    priceXof: 500,
    mode: "PATH",
  },
  {
    id: "strat-marketing",
    slug: "strategie-marketing",
    title: "Stratégie marketing",
    description: "Un plan concret pour mieux attirer et convertir.",
    priceXof: 2000,
    mode: "PATH",
  },
];

export function isFreeModule(module: FreeModule) {
  return FREE_MODULES.includes(module);
}

export function getAccessModeForPath(pathPriceXof?: number) {
  if (pathPriceXof === 0) return "FREE" as const;
  if (pathPriceXof && pathPriceXof > 0) return "PATH" as const;
  return "PREMIUM" as const;
}

export function isPremiumTierActive(isPremiumUser: boolean) {
  return isPremiumUser;
}
