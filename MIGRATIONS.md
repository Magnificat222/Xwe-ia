# Migrations Prisma — stratégie (v2)

La base de production a été créée avec `prisma db push` (aucun historique).
On passe à `prisma migrate` en DEUX migrations :

1. `0_init` = baseline : l'état ACTUEL de la production, **marquée appliquée sans être exécutée**.
2. `20260930120000_paths_credits_payments` = évolution additive (Parcours v2, crédits, paiements manuels, accès).

⚠️ La baseline doit être générée depuis le schéma **d'origine**, figé dans
`prisma/baseline/schema.0_init.prisma` (sha256 dans `schema.0_init.sha256`),
et NON depuis `schema.prisma` (qui contient déjà les nouvelles tables).

## A — Sauvegarde
Neon : créer une branche de la base de production. La garder jusqu'à la fin.

## B — Vérifier que la baseline correspond VRAIMENT à la production (aucune perte possible)
```bash
# DATABASE_URL = production (lecture seule, aucune écriture)
npx prisma migrate diff \
  --from-url "$DATABASE_URL" \
  --to-schema-datamodel prisma/baseline/schema.0_init.prisma \
  --script
```
Résultat attendu : `-- This is an empty migration.`
S'il affiche du SQL, la prod a dérivé du schéma : NE PAS continuer, m'envoyer le SQL affiché.

## C — Générer la baseline
```bash
mkdir -p prisma/migrations/0_init
npx prisma migrate diff --from-empty \
  --to-schema-datamodel prisma/baseline/schema.0_init.prisma \
  --script > prisma/migrations/0_init/migration.sql
```

## D — Répéter sur une branche Neon de TEST (copie de la prod)
```bash
npx prisma migrate resolve --applied 0_init   # la baseline : rien n'est exécuté
npx prisma migrate deploy                     # applique uniquement 20260930120000_...
npx prisma migrate status                     # "Database schema is up to date"
npx prisma migrate diff --from-url "$DATABASE_URL" --to-schema-datamodel prisma/schema.prisma --exit-code
```
Contrôles : nombre de lignes de User/Mission/LearningPath/Progress/GuidedProject identique avant/après ;
`SELECT slug, "isPremium", "accessType" FROM "LearningPath"` cohérent.

## E — Production
Mêmes commandes, dans cet ordre : `migrate resolve --applied 0_init` puis `migrate deploy`.
Ensuite seulement : `npm run db:seed` (idempotent ; les packs de crédits sont créés **inactifs**).

## Règles
- `db push` interdit sur la production.
- Changements additifs d'abord ; pas de DROP sans plan de reprise.
- Les CHECK et le trigger "ledger immuable" sont dans le SQL à la main : Prisma ne les voit pas, ils ne créent pas de dérive.
- Rollback de la migration 2 : voir `ROLLBACK.sql` dans son dossier (uniquement avant que des crédits réels existent).

## Premium : 31 jours (décision produit)
- Un paiement Premium = 31 jours. Un nouveau paiement approuvé **prolonge** depuis la date de fin si l'abonnement est encore actif, sinon depuis maintenant.
- La migration donne aux Premium existants (sans date de fin) **une seule période de 31 jours à partir du déploiement**, puis ils renouvellent comme les autres. Pour une autre durée, modifier `INTERVAL '31 days'` dans le SQL avant `migrate deploy`.
- Le prix Premium passe à 5795 FCFA (valeur par défaut + ligne `SiteSettings` existante). Modifiable ensuite dans Admin → Réglages.
- Les Premium attribués par un admin (Admin → Utilisateurs) reçoivent aussi 31 jours.

## Migration 3 — `20261001090000_kkiapay_transactions_rate_limit` (Étape 5, sécurité)
- Crée `KkiapayTransaction` (index UNIQUE sur `transactionId` : une transaction Kkiapay ne donne Premium qu'une seule fois) et `RateLimit` (compteurs anti-abus).
- 100 % additive : aucune table existante n'est modifiée. Rollback : `ROLLBACK.sql` dans son dossier.
- Ordre de déploiement : `migrate deploy` AVANT de déployer le code (le code lit/écrit ces deux tables).
- Test sur la branche Neon de test : `npx prisma migrate deploy` puis `npx prisma migrate status`.
