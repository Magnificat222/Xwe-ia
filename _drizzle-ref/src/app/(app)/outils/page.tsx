import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Wrench, Sparkles, BookOpen } from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/ui/misc";
import { PageTransition, Stagger, StaggerItem } from "@/components/motion";
import { FavoriteButton } from "@/components/app/actions";
import { CopyPromptButton } from "@/components/app/copy-button";
import { getTools, getPrompts, getResources, getCategories } from "@/lib/queries/catalogue";
import { getSession } from "@/lib/auth/session";
import { getFavorites } from "@/lib/queries/progress";

export const metadata: Metadata = {
  title: "Outils IA",
  description: "Une sélection d'outils, de prompts et de ressources utiles pour tes missions.",
};

export const revalidate = 600;

export default async function ToolsPage({
  searchParams,
}: {
  searchParams: Promise<{ categorie?: string }>;
}) {
  const { categorie } = await searchParams;
  const session = await getSession();

  const [tools, prompts, resources, categories, favorites] = await Promise.all([
    getTools(categorie),
    getPrompts(),
    getResources(),
    getCategories(),
    session ? getFavorites(session.id) : Promise.resolve([]),
  ]);

  const favSet = new Set(favorites.map((f) => `${f.entityType}:${f.entityId}`));

  return (
    <PageTransition className="mx-auto max-w-5xl space-y-12">
      <SectionHeading
        eyebrow="Boîte à outils"
        title="Outils IA, prompts et ressources"
        description="Ce n'est pas un catalogue de plus : chaque élément est là parce qu'il sert dans une mission."
      />

      <section>
        <div className="mb-6 flex flex-wrap gap-2">
          <Link
            href="/outils"
            className={`rounded-full border px-3.5 py-2 text-sm transition-colors ${
              !categorie
                ? "border-or bg-or/12 text-or-vif"
                : "border-ivoire/12 text-ivoire-dim hover:border-or/30 hover:text-ivoire"
            }`}
          >
            Tous
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/outils?categorie=${category.slug}`}
              className={`rounded-full border px-3.5 py-2 text-sm transition-colors ${
                categorie === category.slug
                  ? "border-or bg-or/12 text-or-vif"
                  : "border-ivoire/12 text-ivoire-dim hover:border-or/30 hover:text-ivoire"
              }`}
            >
              {category.name}
            </Link>
          ))}
        </div>

        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <StaggerItem key={tool.id}>
              <Card className="flex h-full flex-col">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-or/10 text-or">
                    <Wrench size={18} strokeWidth={1.6} />
                  </span>
                  <div className="flex items-center gap-1.5">
                    {tool.isFree && <Badge tone="feuillage">Gratuit</Badge>}
                    {session && (
                      <FavoriteButton
                        entityType="tool"
                        entityId={tool.id}
                        initial={favSet.has(`tool:${tool.id}`)}
                        compact
                      />
                    )}
                  </div>
                </div>
                <CardTitle className="text-base">{tool.name}</CardTitle>
                <CardDescription className="flex-1">{tool.description}</CardDescription>

                {tool.useCases.length > 0 && (
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {tool.useCases.slice(0, 3).map((useCase) => (
                      <li
                        key={useCase}
                        className="rounded-full bg-ivoire/6 px-2.5 py-1 text-[0.68rem] text-ivoire-dim"
                      >
                        {useCase}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-4 flex items-center justify-between border-t border-ivoire/8 pt-3">
                  <span className="text-xs text-ivoire-faint">{tool.pricing}</span>
                  <a
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="inline-flex items-center gap-1 text-xs text-or transition-colors hover:text-or-vif"
                  >
                    Ouvrir <ExternalLink size={12} />
                  </a>
                </div>
              </Card>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section>
        <SectionHeading
          eyebrow="Prompts"
          title="Des prompts prêts à l'emploi"
          description="Copie, adapte à ton contexte, utilise dans l'outil de ton choix."
        />
        <Stagger className="mt-6 grid gap-3 sm:grid-cols-2">
          {prompts.map((prompt) => (
            <StaggerItem key={prompt.id}>
              <Card className="flex h-full flex-col">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Sparkles size={15} className="shrink-0 text-or" /> {prompt.title}
                  </CardTitle>
                  {session && (
                    <FavoriteButton
                      entityType="prompt"
                      entityId={prompt.id}
                      initial={favSet.has(`prompt:${prompt.id}`)}
                      compact
                    />
                  )}
                </div>
                <p className="flex-1 font-mono text-xs leading-relaxed text-ivoire-dim">
                  {prompt.body}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {prompt.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="text-[0.66rem] text-ivoire-faint">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <CopyPromptButton text={prompt.body} />
                </div>
              </Card>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section>
        <SectionHeading eyebrow="Ressources" title="Pour aller plus loin" />
        <Stagger className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource) => (
            <StaggerItem key={resource.id}>
              <Card className="h-full">
                <div className="mb-2.5 flex items-center gap-2">
                  <BookOpen size={15} className="text-feuillage-vif" />
                  <Badge tone="outline">{resource.type}</Badge>
                </div>
                <CardTitle className="text-sm">{resource.title}</CardTitle>
                <CardDescription className="text-xs">{resource.description}</CardDescription>
                {resource.url && (
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="mt-3 inline-flex items-center gap-1 text-xs text-or hover:underline"
                  >
                    Consulter <ExternalLink size={11} />
                  </a>
                )}
              </Card>
            </StaggerItem>
          ))}
        </Stagger>
      </section>
    </PageTransition>
  );
}
