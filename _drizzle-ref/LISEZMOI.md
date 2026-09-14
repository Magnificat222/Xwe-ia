# Référence Drizzle (non utilisée par l'application)

Ce dossier conserve la reconstruction Drizzle + `src/app/`, écartée au profit
de l'architecture d'origine (Prisma + `app/`).

Il n'est **pas** compilé : `tsconfig.json` l'exclut et aucun fichier de
l'application ne l'importe. Il sert uniquement de référence quand on porte
une fonctionnalité du Prompt 2 vers Prisma.

## Ce qu'on peut y récupérer

| Sujet | Chemin |
|---|---|
| Schéma des 9 tables du Prompt 2 | `src/db/schema.ts` (commerce, IA) |
| Moteur de prix et promotions | `src/lib/pricing.ts` |
| Cycle de vie des commandes MoMo | `src/lib/services/orders.ts` |
| Abstraction IA + repli hors ligne | `src/lib/ai/` |
| Écrans d'administration commerciale | `src/app/admin/{commandes,prix,promotions,ia}/` |
| Analyse initiale | `ANALYSE.md` |

Supprimable sans risque une fois le portage terminé.
