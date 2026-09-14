import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "À propos — Xwé IA" };

export default function AboutPage() {
  return (
    <main>
      <Navbar />
      <div className="mx-auto max-w-2xl px-6 py-16">
        <Link href="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-ivoire-dim hover:text-or">
          <ArrowLeft size={15} /> Retour à l'accueil
        </Link>

        <p className="font-mono text-xs uppercase tracking-[0.2em] text-or">À propos de Xwé IA</p>
        <h1 className="mt-2 font-display text-3xl text-ivoire">
          L'IA est puissante. Encore faut-il savoir quoi en faire.
        </h1>

        <div className="mt-8 overflow-hidden rounded-2xl">
          <Image
            src="/magni-portrait.jpg"
            alt="Magnificat Fidélia Sèdami Bidouzo, fondatrice de Xwé IA"
            width={900}
            height={1200}
            className="w-full object-cover"
          />
        </div>

        <div className="mt-8 space-y-5 text-sm leading-relaxed text-ivoire-dim">
          <p>
            Je m'appelle <span className="text-ivoire">BIDOUZO Magnificat Fidélia Sèdami</span>,
            mais beaucoup me connaissent sous le nom de <span className="text-ivoire">Magni</span>.
          </p>
          <p>
            Je suis étudiante en Master 2 en Gestion de Projet et je m'intéresse
            particulièrement au numérique, à l'intelligence artificielle et à la
            manière dont ces technologies peuvent être utilisées concrètement dans
            les études, l'entrepreneuriat et les projets du quotidien.
          </p>
          <p>
            Mon parcours avec l'IA n'a pas commencé avec l'envie de créer une
            plateforme. Il a commencé avec une question beaucoup plus simple :
          </p>
          <p className="border-l-2 border-or/40 pl-4 text-ivoire">
            « Comment faire pour utiliser l'IA autrement que pour simplement lui
            poser des questions ? »
          </p>
          <p>
            En explorant différents outils d'intelligence artificielle, j'ai
            découvert qu'une grande partie du problème ne venait pas du manque
            d'outils, mais plutôt de la difficulté à savoir quoi demander, dans
            quel ordre, avec quel contexte — et surtout comment transformer une
            réponse en véritable résultat.
          </p>
          <p>
            J'ai alors commencé à expérimenter, apprendre, créer des ressources et
            partager ce que je découvrais. C'est notamment dans cette démarche
            qu'est né <span className="text-ivoire">Copilote Pas Pilote</span>, un
            guide destiné à rendre l'utilisation de l'IA plus simple et plus
            concrète au quotidien.
          </p>
          <p>Mais une question restait :</p>
          <p className="border-l-2 border-or/40 pl-4 text-ivoire">
            « Et si on pouvait aller plus loin que les prompts ? »
          </p>

          <div className="liseré my-8" />

          <p>C'est ainsi qu'est née <span className="text-ivoire">Xwé IA</span>.</p>
          <p>Xwé IA part d'une idée simple :</p>
          <p className="font-display text-lg text-or">
            « Vous n'avez pas besoin d'un autre chatbot. Vous avez besoin
            d'arriver au résultat. »
          </p>
          <p>
            L'objectif de Xwé IA est d'aider les utilisateurs à transformer un
            objectif en actions concrètes, puis à utiliser l'intelligence
            artificielle au bon moment pour avancer. Plutôt que de demander à
            quelqu'un de connaître le prompt parfait, Xwé IA cherche à
            l'accompagner à travers des missions, des étapes et des ressources
            adaptées à son objectif.
          </p>
          <p className="text-ivoire">
            Créer un projet. Préparer un document. Développer une activité.
            Travailler sur ses études. Améliorer sa communication. Gagner du
            temps.
          </p>
          <p>
            L'idée est toujours la même : partir de ce que vous voulez accomplir
            et vous aider à avancer.
          </p>

          <div className="liseré my-8" />

          <h2 className="font-display text-xl text-ivoire">Pourquoi Xwé ?</h2>
          <p>
            Parce que je crois que l'IA ne devrait pas être réservée aux
            personnes qui savent déjà parfaitement l'utiliser. Aujourd'hui, les
            outils sont de plus en plus accessibles, mais leur utilisation reste
            parfois intimidante. On entend parler de prompts, d'agents,
            d'automatisation, de modèles et de dizaines de nouveaux outils chaque
            semaine.
          </p>
          <p>Pourtant, pour beaucoup de personnes, la vraie question reste simplement :</p>
          <p className="border-l-2 border-or/40 pl-4 text-ivoire">
            « D'accord… mais concrètement, je commence par quoi ? »
          </p>
          <p>C'est cette question que Xwé IA veut aider à résoudre.</p>

          <div className="liseré my-8" />

          <h2 className="font-display text-xl text-ivoire">
            Une plateforme qui évoluera avec ses utilisateurs
          </h2>
          <p>
            Xwé IA est un projet en construction. Il évoluera au fil des retours,
            des besoins et des usages de ses utilisateurs. L'ambition n'est pas
            de créer une plateforme qui prétend tout savoir. C'est de construire
            progressivement un outil simple, pratique et réellement utile, qui
            aide davantage de personnes à passer de :
          </p>
          <p className="border-l-2 border-ivoire/20 pl-4 text-ivoire">
            « Je ne sais pas comment utiliser l'IA »
          </p>
          <p>à :</p>
          <p className="border-l-2 border-or/40 pl-4 text-ivoire">
            « Je sais quoi faire, et l'IA m'aide à le faire. »
          </p>

          <p className="pt-4 text-center font-display text-lg text-ivoire">
            Bienvenue sur Xwé IA.
            <br />
            Votre objectif. Votre parcours. Vos résultats.
          </p>
        </div>

        <p className="mt-10 text-center text-sm text-ivoire-dim">
          Une question, une suggestion ?{" "}
          <Link href="/contact" className="text-or hover:underline">Écrivez-moi</Link>.
        </p>
      </div>
      <Footer />
    </main>
  );
}
