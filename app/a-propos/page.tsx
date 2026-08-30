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

        <p className="font-mono text-xs uppercase tracking-[0.2em] text-or">À propos</p>
        <h1 className="mt-2 font-display text-3xl text-ivoire">La personne derrière Xwé IA</h1>

        <div className="mt-8 overflow-hidden rounded-2xl">
          <Image
            src="/magni-portrait.jpg"
            alt="Magnificat Bidouzo, fondatrice de Xwé IA"
            width={900}
            height={1200}
            className="w-full object-cover"
          />
        </div>

        <div className="mt-8 space-y-5 text-sm leading-relaxed text-ivoire-dim">
          <p>
            Je m'appelle <span className="text-ivoire">Magnificat Bidouzo</span> — on m'appelle
            Magni. Je suis basée à Parakou, au Bénin, économiste agricole de formation, et
            aujourd'hui en Master 2 Gestion de Projet à l'Université de Parakou.
          </p>
          <p>
            J'ai fondé <span className="text-ivoire">KReaMAG</span>, une entreprise de
            personnalisation artisanale qui forme aussi de jeunes femmes de Parakou à un métier
            concret. Je porte également la marque <span className="text-ivoire">MABIDOUZ</span>,
            je suis ambassadrice pour l'ONG Edunovaplus, et je tiens MindDrive, ma boutique
            numérique. En parallèle, je me suis formée en profondeur à l'intelligence
            artificielle appliquée — pas pour en faire de la théorie, mais pour l'utiliser
            concrètement dans mes propres activités.
          </p>
          <p>
            <span className="text-ivoire">Xwé</span> veut dire « maison » en fon. Xwé IA est né
            d'un constat simple : beaucoup de gens en Afrique francophone entendent parler de
            l'intelligence artificielle sans jamais avoir un endroit pour l'apprendre pas à pas,
            dans leur langue, avec des exemples qui parlent à leur réalité — commerce, études,
            entrepreneuriat. Je n'ai jamais prétendu être ingénieure IA ; je suis quelqu'un qui
            utilise ces outils au quotidien et qui a voulu construire le parcours que j'aurais
            aimé avoir en commençant.
          </p>
          <p>
            Xwé IA est encore en phase de test — je travaille avec un petit groupe de personnes
            pour m'assurer que ce qui est proposé ici a une vraie utilité avant de l'ouvrir plus
            largement. Si vous avez une question, une suggestion, ou que vous voulez simplement
            échanger, la page{" "}
            <Link href="/contact" className="text-or hover:underline">Contact</Link> vous amène
            directement à moi.
          </p>
        </div>
      </div>
      <Footer />
    </main>
  );
}
