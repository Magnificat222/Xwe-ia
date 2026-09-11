import Link from "next/link";
import { Logo } from "./brand";
import { Lisere } from "@/components/ui/misc";

const columns = [
  {
    title: "Produit",
    links: [
      { href: "/objectifs", label: "Objectifs" },
      { href: "/parcours", label: "Parcours" },
      { href: "/outils", label: "Outils IA" },
      { href: "/tarifs", label: "Tarifs" },
    ],
  },
  {
    title: "Ressources",
    links: [
      { href: "/faq", label: "FAQ" },
      { href: "/a-propos", label: "À propos" },
      { href: "/contact", label: "Contact" },
      { href: "/support", label: "Support" },
    ],
  },
  {
    title: "Légal",
    links: [
      { href: "/legal/conditions", label: "Conditions d'utilisation" },
      { href: "/legal/confidentialite", label: "Confidentialité" },
      { href: "/legal/mentions-legales", label: "Mentions légales" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-ivoire/10 bg-noir">
      <Lisere className="opacity-30" />
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ivoire-dim">
              Xwé IA transforme tes idées en résultats concrets, étape par étape, avec l'aide de
              l'intelligence artificielle.
            </p>
          </div>

          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-or">
                {column.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-ivoire-dim transition-colors hover:text-ivoire"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-ivoire/8 pt-6 text-xs text-ivoire-faint sm:flex-row">
          <p>© {new Date().getFullYear()} Xwé IA. Tous droits réservés.</p>
          <p>
            Un projet de{" "}
            <a
              href="https://mabidouz-mu14.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-or transition-colors hover:text-or-vif"
            >
              Magnificat Bidouzo — AI Creative Strategist
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
