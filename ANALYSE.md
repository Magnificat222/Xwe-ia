# Xwé IA — Analyse préalable & plan de reconstruction

> Document produit **avant** toute ligne de code, conformément à la consigne.
> Il décrit l'existant, ce qui est conservé, ce qui est reconstruit, les risques,
> l'architecture cible, la base de données, les pages, le système de composants
> et le plan de migration.

---

## 1. Ce qui existe aujourd'hui

**Stack actuelle** : Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 ·
Prisma + PostgreSQL · Auth.js v5 (beta) · Framer Motion · Zustand · Kkiapay · Resend · Gemini.

**Volumétrie** : ~13 200 lignes réparties sur 226 fichiers, dont ~1 900 lignes de
données de démonstration en dur (`lib/data/*`).

### Inventaire fonctionnel

| Domaine | État réel |
|---|---|
| Landing page | Splash animé, hero « Quel est ton objectif ? », stats live, grille de catégories, showcase parcours, pricing 3 offres, footer |
| Auth | Inscription / connexion (credentials, bcrypt), mot de passe oublié, reset, vérification e-mail (Resend) |
| Onboarding | Écran unique : choix d'une catégorie → 3 missions suggérées |
| Dashboard | Bandeau dégradé, stats missions/quiz/badges, donut par catégorie, activité récente, recommandations, préférences d'affichage |
| Missions | Catalogue + détail (étapes, conseils, erreurs, checklist), complétion, favoris, historique |
| Parcours | Liste + détail (timeline de missions), accès Premium / achat unitaire |
| Projets guidés | Wizard multi-étapes (business plan) → génération `.docx` |
| Prompts / Outils / Ebooks | Bibliothèques listées depuis la base, ebooks PDF servis par route authentifiée |
| Arène (quiz) | Étapes, questions générées par Gemini ou banque manuelle, score + bonus vitesse, badges, classement, duels asynchrones |
| Discussion | « Salon Premium » : fil unique, réponses, images base64, réponse auto Gemini, polling 5 s |
| Notifications | Cloche + liste, marquage lu |
| Paiement | Widget Kkiapay + vérification serveur → activation Premium |
| Admin | CRUD missions, parcours, prompts, ebooks, quiz, utilisateurs, réglages, support |
| Légal | À propos, conditions, confidentialité, contact |

### Identité visuelle (à préserver)

- **Palette** issue du logo : `noir #100d0a`, `noir-soft #1a1512`, `noir-elevated #241d17`,
  `ivoire #f5efe4`, `ivoire-dim #b8ab96`, `or #c9a24b`, `or-vif #e6c675`,
  `braise #c9531f`, `feuillage #3a7a52` (+ variantes `-soft`), et un thème clair inversé.
- **Typographies** : `Unbounded` (display), `Inter` (corps), `IBM Plex Mono` (mono, tags,
  chiffres), + `Atkinson Hyperlegible` / `Bricolage Grotesque` en préférence de lecture.
- **Signatures graphiques** : le **liseré** (bande de triangles or reprise de l'ornement du
  logo), la **trajectoire-line** (dégradé vertical or → braise le long des timelines),
  les cartes `rounded-card` bordées `ivoire/10` sur `noir-elevated` avec survol `or/30`,
  l'indicateur braise à gauche de l'item de navigation actif, le bandeau dashboard
  en dégradé braise → feuillage avec motif circuit en filigrane, le splash logo 3D.
- **Ton éditorial** : suréclat `font-mono uppercase tracking-[0.2em] text-or` au-dessus de
  chaque titre de section — c'est un marqueur fort de la marque.

---

## 2. Ce qui est conservé

1. **Toute l'identité visuelle** listée ci-dessus, formalisée en vrai design system
   (tokens sémantiques + primitives documentées) plutôt qu'en classes recopiées.
2. **Le positionnement produit** : objectif → parcours → missions → progression →
   résultat. C'est déjà la bonne colonne vertébrale ; elle devient le modèle de données.
3. **Le modèle économique hybride** : gratuit / achat au parcours (FCFA) / Premium.
4. **Le contenu de démonstration** : catégories, missions, parcours, prompts, outils,
   quiz sont réécrits au nouveau format et re-seedés — rien n'est perdu.
5. **Les choix régionaux** : Kkiapay (Mobile Money + carte, XOF), interface 100 % française.
6. **Les fonctionnalités différenciantes** : Arène, Discussion, Outils IA, Ebooks,
   documents générés, favoris, notifications, admin.

---

## 3. Ce qui doit être reconstruit

| # | Sujet | Pourquoi | Décision |
|---|---|---|---|
| 1 | **Modèle de données** | Aucune entité `Goal`, `MissionResponse`, `Result`, `Document`, `Report`, `AuditLog`, `LegalPage`. Une mission est un article statique (`steps` JSON en lecture seule) : l'utilisateur ne **produit** rien, donc « transformer une idée en résultat » n'est pas réellement implémenté. | Schéma complet reconstruit (27 tables), missions à **champs typés** et réponses persistées. |
| 2 | **ORM : Prisma → Drizzle** | Prisma dépend de moteurs Rust téléchargés au `postinstall` depuis `binaries.prisma.sh` — **injoignable depuis cet environnement** (et sur tout CI/réseau filtré), donc rien n'est vérifiable ni démontrable. Par ailleurs Drizzle = pas de binaire, cold start serverless plus court, SQL explicite, migrations versionnées en clair. | Drizzle ORM + `pg`. Même PostgreSQL, même hébergeur (Neon/Supabase/Railway) : **aucune migration de données nécessaire**, seul le code d'accès change. |
| 3 | **Authentification : Auth.js v5 beta → session maison** | Dépendance en *beta* depuis deux ans sur le chemin critique ; JWT gonflé par les données utilisateur (le code contient déjà un contournement du `REQUEST_HEADER_TOO_LARGE`) ; rôles lus dans un token potentiellement périmé. | Sessions opaques en base (token aléatoire 256 bits, **haché** avant stockage), cookie `httpOnly/secure/sameSite=lax`, rôle relu côté serveur à chaque requête sensible, révocation immédiate possible, suppression de compte réelle. |
| 4 | **Onboarding** | Un seul écran, rien n'est enregistré : aucune personnalisation n'en découle. | Parcours en 5 étapes (nom, domaine, niveau, objectifs, intérêts), **skippable**, persisté dans `profiles`, débouchant sur des recommandations réelles. |
| 5 | **Progression** | `Progress` est un booléen par mission, sans notion de parcours. | `mission_progress` + `pathway_progress` (pourcentage, mission courante, dates), calculés côté serveur. |
| 6 | **Objectifs** | Catégories en dur dans le code, non administrables. | Table `goals` + `goal_pathways`, entièrement administrable. |
| 7 | **Accès / droits** | Logique dispersée (`isPremium` sur mission, `accessType` sur parcours, `role === "ADMIN"` recopié partout). | Un seul module serveur `lib/access` : `resolveAccess(user, resource)` + gardes `requireUser / requireRole / requirePathwayAccess`. |
| 8 | **Navigation mobile** | Le desktop est simplement réduit ; un tiroir latéral pour tout. | Barre d'onglets basse + tiroir secondaire, lecteur de mission plein écran pensé pouce. |
| 9 | **Pages manquantes** | Pas de FAQ, tarifs autonome, achats, résultats, paramètres, notifications, arène hors quiz, pages légales éditables. | Créées. |
| 10 | **Middleware** | Ne vérifie que la *présence* d'un cookie ; `/admin` est protégé au même niveau qu'une page utilisateur. | Le middleware ne fait que la redirection optimiste ; **toute** autorisation est revalidée en base dans les layouts/route handlers. |

---

## 4. Ce qui doit être amélioré

- **Animations** : bibliothèque de variantes partagées (`lib/motion`) — apparition au scroll,
  stagger, transitions de page, compteurs animés, anneaux de progression, transitions entre
  missions, skeletons, retours de succès/erreur. Respect strict de `prefers-reduced-motion`
  (déjà présent en CSS, désormais aussi côté Framer Motion via `useReducedMotion`).
- **Accessibilité** : contrastes AA vérifiés sur les deux thèmes, focus visible homogène
  (anneau or), navigation clavier complète, `aria-label`/`aria-live` sur les états async,
  cibles tactiles ≥ 44 px, structure sémantique (`main`, `nav`, `h1..h3` uniques).
- **Performance** : composants serveur par défaut, `"use client"` réservé aux îlots
  interactifs, requêtes agrégées (une requête par bloc au lieu de N+1), `next/image`,
  `dynamic()` pour les modules lourds (éditeur, graphiques), cache `revalidateTag`
  sur les contenus publics, index SQL sur toutes les clés de lecture.
- **Qualité** : couche `lib/queries` typée, validation Zod partagée client/serveur,
  Server Actions pour les mutations, journal d'audit sur les actions d'administration.
- **Sécurité** : aucun secret dans le bundle client (les clés Gemini/Kkiapay/Resend restent
  serveur), rate-limiting sur l'auth, hachage bcrypt coût 12, vérification d'origine sur
  les mutations, uploads en objet distant plutôt qu'en base64 (voir risques).

---

## 5. Risques techniques identifiés

| Risque | Impact | Mitigation retenue |
|---|---|---|
| `binaries.prisma.sh` bloqué (réseau filtré / CI) | Build et exécution impossibles | Drizzle, zéro binaire à télécharger |
| Images stockées en base64 (avatars, messages, PDF d'ebooks dans `fileData`) | Table qui gonfle, requêtes lentes, réponses lourdes | Colonnes `*_url` + adaptateur de stockage (`lib/storage`) : disque en dev, S3/R2/UploadThing en prod |
| Kkiapay ne gère pas l'abonnement récurrent | « Premium mensuel » qui n'expire jamais | `subscriptions.currentPeriodEnd` + vérification d'expiration à chaque résolution d'accès, relance e-mail (câblage complet en Prompt 2) |
| Rôle stocké dans le JWT | Escalade de privilèges après rétrogradation | Rôle relu en base pour toute action sensible |
| Discussion en *polling* 5 s | Charge inutile à l'échelle | Polling adaptatif maintenant, SSE prévu (interface `lib/realtime` isolée) |
| Appels IA synchrones (Gemini) | Timeout de fonction serverless, coût non maîtrisé | File d'attente + repli déterministe + quotas par plan (Prompt 2) |
| Pas de migrations versionnées (`db push`, `/prisma/migrations` ignoré) | Dérive de schéma en production | `drizzle-kit generate` → migrations SQL **commitées** |
| Contenu et code mélangés (`lib/data/*` importés par des pages) | Le contenu ne peut pas être édité sans redéploiement | Le contenu vit en base ; `lib/seed-data` ne sert qu'au seed initial |

---

## 6. Architecture proposée

```
Navigateur ── Server Components (rendu) ─┐
          └── Server Actions / Route Handlers ──┬── lib/auth      (session, rôles)
                                                ├── lib/access    (droits, plans)
                                                ├── lib/queries   (lecture typée)
                                                ├── lib/services  (progression, résultats, documents)
                                                ├── lib/ai        (fournisseur IA, serveur only)
                                                ├── lib/payments  (Kkiapay, serveur only)
                                                ├── lib/storage   (fichiers)
                                                └── db (Drizzle) ── PostgreSQL
```

Règles d'architecture :

1. **Serveur par défaut.** Un composant client doit justifier son interactivité.
2. **Aucun secret côté client.** Seules les variables `NEXT_PUBLIC_*` traversent, et
   aucune n'est sensible.
3. **Une seule porte d'entrée par domaine.** Une page n'appelle jamais `db` directement :
   elle passe par `lib/queries` ou `lib/services`.
4. **Autorisation au plus près de la donnée.** Chaque service commence par une garde.
5. **Modularité** : `src/modules/*` peut accueillir les domaines lourds du Prompt 2
   (paiement, IA, jeux) sans toucher au socle.

Découpage physique :

```
src/
  app/            (marketing) · (auth) · (app) · admin · api
  components/     ui/ · layout/ · marketing/ · app/ · admin/ · motion/
  db/             schema.ts · index.ts · migrations/ · seed.ts
  lib/            auth/ · access.ts · queries/ · services/ · validations/ · motion.ts · utils.ts
  content/        données de seed (objectifs, parcours, missions, outils…)
```

---

## 7. Structure de la base de données (27 tables)

**Identité & accès** — `users`, `profiles`, `sessions`, `verification_tokens`, `audit_logs`
**Contenu** — `categories`, `goals`, `pathways`, `goal_pathways`, `missions`, `resources`, `tools`, `prompts`
**Activité** — `mission_responses`, `mission_progress`, `pathway_progress`, `results`, `documents`, `favorites`, `notifications`
**Communauté** — `discussions`, `discussion_replies`, `reactions`, `reports`
**Arène** — `games`, `challenges`, `challenge_attempts`, `duels`
**Monétisation** — `payments`, `purchases`, `subscriptions`
**Plateforme** — `legal_pages`, `faq_items`, `site_settings`, `support_tickets`, `support_messages`

Points structurants :

- `missions.fields` : tableau JSON typé de champs (`short_text`, `long_text`,
  `single_choice`, `multi_choice`, `number`, `date`, `file`) — c'est ce qui rend la mission
  **productive** et non plus seulement lisible.
- `mission_responses.answers` : les réponses de l'utilisateur, brouillon puis soumises.
- `results` + `documents` : ce que l'utilisateur **repart avec**, alimenté à la validation
  d'une mission et à la fin d'un parcours.
- `pathways.access_type` ∈ {`free`, `paid`, `premium`} + `price_xof` : les trois modes du
  modèle économique, administrables.
- Les rôles vivent sur `users.role` ∈ {`user`, `moderator`, `admin`, `super_admin`} —
  pas de table `Admin` séparée, ce qui évite deux sources de vérité.

---

## 8. Structure des pages

**Public** `/` · `/objectifs` · `/parcours` · `/parcours/[slug]` · `/outils` · `/tarifs` ·
`/a-propos` · `/faq` · `/contact` · `/legal/[slug]`
**Auth** `/connexion` · `/inscription` · `/mot-de-passe-oublie` · `/reinitialiser`
**Onboarding** `/bienvenue`
**Application** `/tableau-de-bord` · `/objectifs` · `/parcours` · `/parcours/[slug]` ·
`/missions/[id]` (lecteur) · `/resultats` · `/resultats/[id]` · `/discussion` · `/arene` ·
`/outils` · `/premium` · `/achats` · `/notifications` · `/favoris` · `/profil` ·
`/parametres` · `/support`
**Admin** `/admin` · `utilisateurs` · `objectifs` · `parcours` · `missions` · `categories` ·
`ressources` · `outils` · `discussion` · `arene` · `paiements` · `premium` ·
`notifications` · `pages-legales` · `statistiques`

---

## 9. Système de composants

- **`ui/`** — primitives sans logique métier : `Button`, `IconButton`, `Card`, `Badge`,
  `Input`, `Textarea`, `Select`, `Checkbox`, `RadioGroup`, `Field`, `Progress`,
  `ProgressRing`, `Skeleton`, `Avatar`, `Tabs`, `Sheet`, `Dialog`, `Tooltip`, `Toast`,
  `EmptyState`, `SectionHeading`, `Liseré`, `Stat`.
- **`motion/`** — `Reveal`, `Stagger`, `AnimatedNumber`, `PageTransition` : toutes câblées
  sur `useReducedMotion`.
- **`layout/`** — `MarketingHeader`, `Footer`, `AppSidebar`, `AppTopbar`, `MobileTabBar`.
- **`app/`** — composants métier : `GoalCard`, `PathwayCard`, `MissionStepper`,
  `MissionFieldRenderer`, `ProgressSummary`, `ResultCard`, `NextMissionCard`…
- **`admin/`** — `DataTable`, `ResourceForm`, `ToggleField`, `AdminShell`.

Chaque primitive expose `variant`/`size`/`tone`, accepte `className` (fusion via `cn`),
transmet `ref` et ses attributs natifs, et gère `:focus-visible`.

---

## 10. Plan de migration

| Étape | Contenu | État |
|---|---|---|
| 0 | Analyse (ce document) | ✅ |
| 1 | Socle : dépendances, config, design system, tokens, primitives, animations | ✅ |
| 2 | Base de données Drizzle + migrations + seed du contenu existant | ✅ |
| 3 | Authentification maison + rôles + gardes + middleware | ✅ |
| 4 | Marketing : accueil, objectifs, parcours, tarifs, FAQ, à propos, légal | ✅ |
| 5 | Onboarding + dashboard + profil + paramètres + notifications + favoris | ✅ |
| 6 | Cœur produit : parcours → missions (champs typés) → progression → résultats | ✅ |
| 7 | Communauté, Arène, Outils IA, Premium, Achats, Support | ✅ (socle fonctionnel) |
| 8 | Administration (utilisateurs, contenus, légal, statistiques, audit) | ✅ |
| 9 | **Prompt 2** : paiement Kkiapay réel, IA, quotas, e-mails, analytics avancés | ⏳ |

**Rien n'est supprimé sans remplacement** : Ebooks → `resources` (type `pdf`),
Prompts → `prompts`, Projets guidés → parcours à champs typés + `documents`,
Salon Premium → `discussions`, Quiz/Duels → `games`/`challenges`/`duels`.

---

## 11. Décisions à valider

1. **Drizzle à la place de Prisma** — même PostgreSQL, aucune perte de données,
   déblocage immédiat de l'environnement de build.
2. **Session maison à la place d'Auth.js beta** — sortie d'une dépendance beta,
   révocation et suppression de compte réelles. OAuth Google reste ajoutable.
3. **Fichiers hors base** — les avatars/PDF passent par un adaptateur de stockage ;
   en développement, disque local.

Ces trois points sont réversibles isolément si tu préfères l'inverse.
