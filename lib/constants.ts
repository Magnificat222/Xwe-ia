// Single source of truth for the Premium plan price, in Francs CFA (XOF) —
// the currency actually charged via KKiaPay. Used both for display on the
// pricing card and for the real checkout amount, so they can never drift
// apart again.
export const PREMIUM_AMOUNT_XOF = 3200;
