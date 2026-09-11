export type EbookData = {
  id: string;
  slug: string;
  title: string;
  description: string;
  fileName: string;
  pageCount?: number;
  isPremium: boolean;
};

export const ebooks: EbookData[] = [
  {
    id: "eb-ia-saas",
    slug: "creer-des-revenus-avec-ia-et-saas",
    title: "Créer des revenus avec l'IA et le SaaS",
    description:
      "Le guide pratique pour comprendre le SaaS à l'ère de l'IA, ses opportunités concrètes, et la méthode étape par étape pour lancer son propre produit numérique — avec un bonus pour déployer son SaaS soi-même (GitHub, base de données, hébergement, paiement).",
    fileName: "creer-des-revenus-avec-ia-et-saas.pdf",
    pageCount: 11,
    isPremium: true,
  },
];
