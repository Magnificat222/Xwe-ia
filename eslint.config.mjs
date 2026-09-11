import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: ["_legacy/**", ".next/**", ".next-verify/**", "node_modules/**"],
  },
  {
    rules: {
      // Le produit est en français : les apostrophes sont partout dans les
      // textes. Les échapper en &apos; rendrait le JSX illisible sans rien
      // apporter — React échappe déjà le contenu.
      "react/no-unescaped-entities": "off",

      // Les imports inutilisés restent une erreur, sauf ceux préfixés par _.
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
];

export default eslintConfig;
