import Link from "next/link";
import { EbookForm } from "@/components/admin/ebook-form";
import { ArrowLeft } from "lucide-react";

export default function NewEbookPage() {
  return (
    <div>
      <Link href="/admin/ebooks" className="mb-6 inline-flex items-center gap-1.5 text-sm text-ivoire-dim hover:text-or">
        <ArrowLeft size={15} /> Retour aux ebooks
      </Link>
      <h1 className="mb-6 font-display text-2xl text-ivoire">Nouvel ebook</h1>
      <EbookForm mode="create" />
    </div>
  );
}
