// Single source of truth for the Premium plan price, in Francs CFA (XOF) —
// the currency actually charged via KKiaPay. Used both for display on the
// pricing card and for the real checkout amount, so they can never drift
// apart again.
export const PREMIUM_AMOUNT_XOF = 5795;

// Kkiapay est suspendu : le paiement en ligne est « bientôt disponible ».
// Tant que cette valeur est true, /api/kkiapay/verify refuse TOUT, quel que
// soit le réglage en base. Repasser à false (et revoir lib/kkiapay-premium.ts
// + un webhook) pour le rouvrir.
export const KKIAPAY_COMING_SOON = true;
