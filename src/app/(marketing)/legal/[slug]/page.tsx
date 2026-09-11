import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Markdown } from "@/components/app/markdown";
import { Breadcrumb } from "@/components/ui/misc";
import { getLegalPage, getLegalPages } from "@/lib/queries/catalogue";
import { formatDate } from "@/lib/utils";

export const revalidate = 3600;

export async function generateStaticParams() {
  const pages = await getLegalPages().catch(() => []);
  return pages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getLegalPage(slug);
  return { title: page?.title ?? "Page légale" };
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [page, all] = await Promise.all([getLegalPage(slug), getLegalPages()]);
  if (!page || !page.isPublished) notFound();

  return (
    <div className="px-5 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <Breadcrumb items={[{ label: "Accueil", href: "/" }, { label: page.title }]} />

        <h1 className="mt-6 font-display text-2xl leading-tight text-ivoire sm:text-3xl">
          {page.title}
        </h1>
        <p className="mt-2 text-xs text-ivoire-faint">
          Dernière mise à jour le {formatDate(page.updatedAt)}
        </p>

        <div className="mt-8">
          <Markdown content={page.body} />
        </div>

        {all.length > 1 && (
          <nav aria-label="Autres pages légales" className="mt-12 border-t border-ivoire/8 pt-6">
            <p className="mb-3 font-mono text-[0.66rem] uppercase tracking-[0.2em] text-or">
              Autres documents
            </p>
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {all
                .filter((item) => item.slug !== page.slug)
                .map((item) => (
                  <li key={item.id}>
                    <Link
                      href={`/legal/${item.slug}`}
                      className="text-sm text-ivoire-dim transition-colors hover:text-or"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
            </ul>
          </nav>
        )}
      </div>
    </div>
  );
}
