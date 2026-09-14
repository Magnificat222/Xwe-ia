/**
 * ATTENTION — le prix Premium ne vit plus ici.
 *
 * La source de vérité est la ligne `SiteSettings` en base, lue par
 * `getSiteSettings()` dans `lib/settings.ts` (valeur par défaut : 5500 XOF).
 * Elle est modifiable depuis l'administration, sans redéploiement.
 *
 * L'ancienne constante `PREMIUM_AMOUNT_XOF = 3200` a été retirée : elle
 * n'était plus importée nulle part et contredisait la base, ce qui exposait
 * au risque d'afficher un prix différent de celui réellement facturé.
 *
 * Pour obtenir le prix :
 *
 *   import { getSiteSettings } from "@/lib/settings";
 *   const { premiumPriceXof } = await getSiteSettings();
 *
 * Devise utilisée pour tous les paiements.
 */
export const CURRENCY = "XOF" as const;
