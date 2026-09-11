import type { Metadata } from "next";
import Link from "next/link";
import { Crown, Trophy, Target, Flame, Settings } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, Stat, SectionHeading } from "@/components/ui/misc";
import { PageTransition, Stagger, StaggerItem } from "@/components/motion";
import { ProfileForm } from "@/components/app/account-forms";
import { requireUser } from "@/lib/auth/guards";
import { getProfile, getDashboardStats, getCurrentGoal } from "@/lib/queries/progress";
import { formatDate, LEVEL_LABELS } from "@/lib/utils";
import { resolveIcon } from "@/lib/icons";

export const metadata: Metadata = { title: "Profil" };

const ROLE_LABELS: Record<string, string> = {
  user: "Membre",
  moderator: "Modérateur",
  admin: "Administrateur",
  super_admin: "Super administrateur",
};

export default async function ProfilePage() {
  const session = await requireUser("/profil");
  const [profile, stats, goal] = await Promise.all([
    getProfile(session.id),
    getDashboardStats(session.id),
    getCurrentGoal(session.id),
  ]);

  const GoalIcon = goal
    ? (resolveIcon(goal.icon, Target))
    : Target;

  return (
    <PageTransition className="mx-auto max-w-3xl space-y-7">
      <SectionHeading eyebrow="Ton compte" title="Profil" />

      <Card>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <Avatar
            name={profile?.displayName ?? session.name ?? session.email}
            src={session.avatarUrl}
            size={72}
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-xl text-ivoire">
                {profile?.displayName ?? session.name ?? "Membre"}
              </h1>
              {session.plan === "premium" && (
                <Badge tone="or">
                  <Crown size={11} /> Premium
                </Badge>
              )}
              {session.role !== "user" && <Badge tone="braise">{ROLE_LABELS[session.role]}</Badge>}
            </div>
            <p className="mt-1 text-sm text-ivoire-dim">{session.email}</p>
            {profile?.bio && (
              <p className="mt-2.5 text-sm leading-relaxed text-ivoire-dim">{profile.bio}</p>
            )}
            <p className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ivoire-faint">
              {profile?.domain && <span>{profile.domain}</span>}
              {profile?.level && <span>{LEVEL_LABELS[profile.level]}</span>}
              {profile?.country && <span>{profile.country}</span>}
            </p>
          </div>
          <Link href="/parametres" className="shrink-0">
            <Button variant="ghost" size="sm" icon={<Settings size={15} />}>
              Paramètres
            </Button>
          </Link>
        </div>
      </Card>

      <Stagger className="grid grid-cols-3 gap-3">
        <StaggerItem>
          <Stat label="Missions" value={stats.missionsCompleted} icon={<Target size={18} />} tone="braise" />
        </StaggerItem>
        <StaggerItem>
          <Stat label="Parcours" value={stats.pathwaysCompleted} icon={<Flame size={18} />} tone="or" />
        </StaggerItem>
        <StaggerItem>
          <Stat label="Résultats" value={stats.results} icon={<Trophy size={18} />} tone="feuillage" />
        </StaggerItem>
      </Stagger>

      {goal && (
        <Link href={`/objectifs/${goal.slug}`}>
          <Card interactive className="flex items-center gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-or/10 text-or">
              <GoalIcon size={20} strokeWidth={1.6} />
            </span>
            <div className="min-w-0">
              <p className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-or">
                Objectif actuel
              </p>
              <CardTitle className="mt-1 text-sm">{goal.title}</CardTitle>
            </div>
          </Card>
        </Link>
      )}

      {profile?.interests && profile.interests.length > 0 && (
        <Card>
          <CardTitle className="text-base">Centres d'intérêt</CardTitle>
          <ul className="mt-3 flex flex-wrap gap-2">
            {profile.interests.map((interest) => (
              <li
                key={interest}
                className="rounded-full border border-ivoire/12 px-3 py-1.5 text-xs text-ivoire-dim"
              >
                {interest}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <ProfileForm
        defaults={{
          displayName: profile?.displayName ?? session.name ?? "",
          bio: profile?.bio ?? "",
          domain: profile?.domain ?? "",
          country: profile?.country ?? "",
        }}
      />

      <p className="text-center text-xs text-ivoire-faint">
        Membre depuis le {formatDate(profile?.createdAt)}
      </p>
    </PageTransition>
  );
}
