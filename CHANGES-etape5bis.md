# Étape 5 bis — corrections après revue

## Paiements
- Kkiapay bloqué : `KKIAPAY_COMING_SOON = true` (`lib/constants.ts`). `/api/kkiapay/verify` répond 503 « bientôt disponible »
  sans toucher à la base ni à Kkiapay. Le script Kkiapay n'est plus chargé sur la page d'accueil.
- Page tarifs : bouton principal « Payer par Mobile Money » (→ `/credits`, MTN / Celtis) ; bouton « Carte bancaire / Kkiapay —
  bientôt disponible » grisé. Si les paiements manuels sont fermés (Admin → Réglages), repli sur « Demander un accès Premium ».
- Admin → Réglages : la case « Paiement Premium ouvert à tous » est retirée (elle ne pilotait que Kkiapay).
  La colonne `selfServePremiumEnabled` reste en base (aucune migration).

## Corrections
- Liens e-mail (inscription, vérification, mot de passe oublié) : nouvelle fonction `getBaseUrl()` (`lib/app-url.ts`) qui lit
  `AUTH_URL` en premier. Avant, seul `NEXTAUTH_URL` était lu, absent de `.env.example`.
- Quiz : la durée est mesurée par le serveur (`startedAt` → soumission), plus par le navigateur ; les réponses sont validées
  (entiers, dans les bornes) ; JSON invalide → 400 au lieu d'une erreur 500.
- Salon Premium : message limité à 2000 caractères (création et modification), image limitée à ~1,1 Mo et à jpeg/png/webp/gif,
  JSON invalide → 400.
- Renvoi de l'e-mail de vérification : 3 par heure et par compte.
- `.env.example` : base `xwe_ia`, `AUTH_URL` documenté, Kkiapay marqué suspendu.

## Aucune migration
Aucun changement de schéma : `migrate deploy` n'a rien de nouveau à appliquer.

## À prévoir plus tard
- Invalider les anciennes sessions après un changement de mot de passe (demande un champ en base : migration additive).
- Webhook Kkiapay avant de rouvrir ce moyen de paiement.
- Stockage de fichiers pour les images du salon (au lieu de base64 en base).
