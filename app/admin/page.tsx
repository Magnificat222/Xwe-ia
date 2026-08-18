import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Target, Library, BookOpen, Swords, Users, MessageCircleHeart, Settings } from "lucide-react";

export default async function AdminHomePage() {
  const [missionCount, promptCount, ebookCount, stageCount, userCount] = await Promise.all([
    prisma.mission.count(),
    prisma.prompt.count(),
    prisma.ebook.count(),
    prisma.quizStage.count(),
    prisma.user.count(),
  ]);

  const sections = [
    { href: "/admin/missions", label: "Missions", count: missionCount, icon: Target },
    { href: "/admin/prompts", label: "Prompts", count: promptCount, icon: Library },
    { href: "/admin/ebooks", label: "Ebooks", count: ebookCount, icon: BookOpen },
    { href: "/admin/quiz", label: "Étapes de quiz", count: stageCount, icon: Swords },
    { href: "/admin/users", label: "Utilisateurs", count: userCount, icon: Users },
    { href: "/admin/support", label: "Salon Premium", count: null, icon: MessageCircleHeart },
    { href: "/admin/settings", label: "Réglages", count: null, icon: Settings },
  ];

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl text-ivoire">Panneau d'administration</h1>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {sections.map((section) => (
          <Link key={section.href} href={section.href}>
            <Card className="flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-or/10 text-or">
                <section.icon size={20} />
              </div>
              <div>
                <p className="text-sm text-ivoire">{section.label}</p>
                {section.count !== null && (
                  <p className="text-xs text-ivoire-dim">{section.count} élément{section.count > 1 ? "s" : ""}</p>
                )}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
