import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import { ContactForm } from "@/components/marketing/contact-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "Contact — Xwé IA" };

export default function ContactPage() {
  return (
    <main>
      <Navbar />
      <div className="mx-auto max-w-xl px-6 py-16">
        <Link href="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-ivoire-dim hover:text-or">
          <ArrowLeft size={15} /> Retour à l'accueil
        </Link>

        <p className="font-mono text-xs uppercase tracking-[0.2em] text-or">Contact</p>
        <h1 className="mt-2 font-display text-3xl text-ivoire">Une question, un bug ?</h1>
        <p className="mt-2 text-sm text-ivoire-dim">
          Écrivez-nous — nous répondons généralement sous 48h.
        </p>

        <div className="mt-8">
          <ContactForm />
        </div>
      </div>
      <Footer />
    </main>
  );
}
