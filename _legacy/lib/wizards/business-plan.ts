import type { WizardConfig } from "./types";

export const businessPlanWizard: WizardConfig = {
  type: "business-plan",
  slug: "mon-business-plan",
  title: "Mon business plan",
  description:
    "Un parcours en 5 étapes pour structurer votre idée en business plan concret — vos propres réponses, mises en forme, sans texte inventé par une IA.",
  steps: [
    {
      key: "comprendre",
      title: "Comprendre mon projet",
      description: "Décrivez votre idée avec vos mots — pas besoin que ce soit parfait.",
      fields: [
        {
          key: "idee",
          label: "Quel produit ou service voulez-vous vendre ?",
          type: "textarea",
          placeholder: "Décrivez votre idée en quelques phrases...",
        },
        {
          key: "probleme",
          label: "Quel problème concret ça résout ?",
          type: "textarea",
          placeholder: "Qu'est-ce qui manque aujourd'hui à vos futurs clients ?",
        },
      ],
    },
    {
      key: "marche",
      title: "Identifier mon marché",
      description: "Qui sont vos clients, et qui d'autre essaie déjà de les convaincre ?",
      fields: [
        {
          key: "clientele",
          label: "Qui sont vos clients cibles ?",
          type: "textarea",
          placeholder: "Âge, situation, où ils se trouvent, ce qu'ils font aujourd'hui...",
        },
        {
          key: "besoins",
          label: "Quels sont leurs besoins ou frustrations principales ?",
          type: "textarea",
        },
        {
          key: "concurrents",
          label: "Qui propose déjà quelque chose de similaire ?",
          type: "textarea",
          placeholder: "Concurrents directs, indirects, ou solutions de contournement actuelles.",
        },
      ],
    },
    {
      key: "modele",
      title: "Construire mon modèle économique",
      description: "La base d'un Business Model Canvas, en vos propres mots.",
      fields: [
        {
          key: "propositionValeur",
          label: "Votre proposition de valeur",
          type: "textarea",
          placeholder: "Qu'est-ce qui rend votre offre différente ou meilleure ?",
        },
        {
          key: "canaux",
          label: "Vos canaux — comment les clients vous trouveront et achèteront",
          type: "textarea",
        },
        {
          key: "revenus",
          label: "Vos sources de revenus",
          type: "textarea",
          placeholder: "Vente directe, abonnement, commission...",
        },
        {
          key: "couts",
          label: "Vos principaux postes de coûts",
          type: "textarea",
        },
      ],
    },
    {
      key: "previsions",
      title: "Construire mes prévisions",
      description: "Des chiffres, même approximatifs — ils s'affineront avec le temps.",
      fields: [
        {
          key: "coutsEstimes",
          label: "Coûts estimés pour démarrer",
          type: "textarea",
        },
        {
          key: "revenusPrevus",
          label: "Revenus prévus sur les 6 premiers mois",
          type: "textarea",
        },
        {
          key: "besoinsFinancement",
          label: "Besoins de financement, si applicable",
          type: "textarea",
        },
        {
          key: "hypotheses",
          label: "Vos hypothèses principales",
          type: "textarea",
          placeholder: "Sur quoi repose ce chiffrage ? Qu'est-ce qui pourrait le changer ?",
        },
      ],
    },
  ],
};
