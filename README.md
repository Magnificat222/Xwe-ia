# Xwé IA

Assistant IA orienté objectifs : l'utilisateur choisit un objectif concret
(business plan, lancement d'entreprise, soutenance, personal branding...) et
la plateforme le guide, mission par mission, jusqu'au résultat.

Ce dépôt est maintenant **entièrement câblé sur une vraie base de données** :
inscription/connexion réelles, paiement Kkiapay (Mobile Money & carte),
CRUD admin sur les missions, recherche intelligente, et favoris persistés
sont tous fonctionnels. Il ne reste plus qu'à créer une base PostgreSQL,
renseigner les clés dans `.env`, et déployer.

## Stack

- **Next.js 15** (App Router) + **TypeScript** + **React 19**
- **Tailwind CSS v4** (tokens définis dans `app/globals.css`)
- **Framer Motion** pour les animations
- **Zustand** pour l'état client (favoris)
- **React Hook Form** + **Zod** pour les formulaires
- **Prisma** + **PostgreSQL**
- **Auth.js (NextAuth v5)** avec adaptateur Prisma
- **Kkiapay** (paiement Mobile Money & carte, clés préparées)

## Structure du projet

```
app/
  (auth)/login, register, forgot-password    → pages d'authentification
  (dashboard)/dashboard, profile              → espace utilisateur connecté
  admin/missions, admin/users                 → back-office
  missions/, missions/[slug]                  → Mission Center (catalogue + détail)
  prompts/                                    → bibliothèque de prompts
  toolbox/                                    → AI Toolbox
  api/auth/[...nextauth]                      → route Auth.js
  page.tsx                                    → landing page
  layout.tsx, globals.css                     → layout racine + design tokens
components/
  ui/           → primitives (Button, Card, Badge)
  marketing/    → sections de la landing page
  dashboard/    → sidebar, progress ring
  missions/     → mission card
  shared/       → auth card, form field
hooks/          → stores Zustand (favoris)
lib/
  data/         → données de démonstration (categories, missions, tools, prompts, paths)
  validations/  → schémas Zod
  auth.ts       → configuration Auth.js
  prisma.ts     → client Prisma singleton
  utils.ts      → helpers (cn, formatMinutes)
prisma/
  schema.prisma → tous les modèles (User, Mission, Category, Prompt,
                  LearningPath, Favorite, Progress, Tool, Subscription, History)
  seed.ts       → injecte les données de lib/data/* dans la base
types/          → types de domaine partagés
middleware.ts   → protège /dashboard, /profile, /admin, /favoris
```

## Installation

```bash
# 1. Installer les dépendances
npm install

# 2. Copier les variables d'environnement
cp .env.example .env
# renseigner DATABASE_URL, AUTH_SECRET (npx auth secret), et les clés Kkiapay

# 3. Générer le client Prisma et créer les tables
npx prisma generate
npm run db:push

# 4. (optionnel) injecter les données de démonstration
npm run db:seed

# 5. Lancer le serveur de développement
npm run dev
```

L'application est accessible sur http://localhost:3000.

## Ce qui est déjà branché sur la base de données

- **Auth** : `/api/register` crée l'utilisateur (mot de passe hashé avec
  bcrypt) ; la page de connexion appelle `signIn("credentials", ...)`.
  `middleware.ts` protège `/dashboard`, `/profile`, `/admin`, `/favoris`.
- **Missions, parcours, prompts, outils** : les pages publiques
  (`/missions`, `/parcours`, `/prompts`, `/toolbox`) lisent directement
  Prisma. La landing page (sections marketing) garde des données de
  démonstration statiques par choix, pour rester rapide sans dépendre de
  la base.
- **Paiement** : `KkiapayCheckoutButton` charge le widget Kkiapay (Mobile
  Money + carte, adapté à un public béninois/ouest-africain) ; à la
  confirmation du paiement, le composant appelle `POST /api/kkiapay/verify`,
  qui **revérifie la transaction côté serveur** (jamais confiance dans le
  seul événement client, comme recommandé par Kkiapay) avant d'activer
  `Subscription.plan = "PREMIUM"`.
  ⚠️ Kkiapay ne gère pas nativement les abonnements récurrents comme Stripe
  — chaque paiement est ponctuel. Pour un vrai modèle mensuel, il faudra soit
  relancer l'utilisateur chaque mois (rappel e-mail + nouveau paiement),
  soit explorer `setup_payout` du SDK Kkiapay pour des prélèvements
  programmés. À ce stade, le squelette active Premium à la confirmation du
  paiement ; la logique de renouvellement/expiration reste à construire.
- **Admin** : `lib/actions/missions.ts` contient les Server Actions
  create/update/delete/publish, protégées par un contrôle `role === "ADMIN"`.
  Le tableau missions est déjà branché (créer/supprimer) ; le formulaire de
  création/édition (modale ou page dédiée) reste à construire si tu veux
  une UI complète — les actions serveur sont prêtes à l'emploi.
- **Recherche intelligente** : `GET /api/search?q=...` interroge missions,
  prompts, parcours et outils ; le composant `GlobalSearch` est dans la
  barre du dashboard.
- **Favoris** : `hooks/use-favorites-store.ts` (Zustand) appelle
  `/api/favorites` avec mise à jour optimiste ; `FavoriteMissionButton` est
  déjà posé sur la page de détail d'une mission, et `/favoris` liste tout.
- **Historique** : chaque visite d'une page de mission par un utilisateur
  connecté crée une entrée `History`, utilisée sur le tableau de bord.

## Pour créer ton premier compte admin

Après un `db:seed`, aucun utilisateur n'a le rôle `ADMIN` par défaut.
Inscris-toi normalement via `/register`, puis promeus ton compte :

```bash
npx prisma studio
```

Ouvre la table `User`, trouve ton compte, et change `role` de `USER` à
`ADMIN`. Tu auras alors accès à `/admin/missions` et `/admin/users`.

## Déploiement (Vercel)

1. Pousser le dépôt sur GitHub.
2. Importer le projet dans Vercel.
3. Renseigner les variables d'environnement (`DATABASE_URL`, `AUTH_SECRET`,
   `AUTH_URL` = URL de production, clés Kkiapay).
4. Utiliser une base PostgreSQL managée (Neon, Supabase, Railway) : Vercel ne
   fournit pas de Postgres par défaut.
5. Ajouter `prisma generate` au build si besoin (`postinstall` le fait déjà).
