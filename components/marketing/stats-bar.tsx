import { prisma } from "@/lib/prisma";

export async function StatsBar() {
  let userCount = 0;
  let completedMissions = 0;
  let quizAttempts = 0;
  let missionCount = 0;

  try {
    [userCount, completedMissions, quizAttempts, missionCount] = await Promise.all([
      prisma.user.count(),
      prisma.progress.count({ where: { completed: true } }),
      prisma.quizAttempt.count({ where: { completedAt: { not: null } } }),
      prisma.mission.count({ where: { isPublished: true } }),
    ]);
  } catch {
    // Right after a schema change, a brand-new table can briefly not exist
    // yet in production. Fail soft here (zeros) rather than break the
    // whole homepage build over a stats bar.
  }

  const stats = [
    { value: userCount, label: "membres inscrits" },
    { value: missionCount, label: "missions guidées" },
    { value: completedMissions, label: "missions terminées" },
    { value: quizAttempts, label: "quiz joués" },
  ];

  return (
    <section className="border-y border-ivoire/10 bg-noir-soft/40 px-6 py-10">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 md:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="font-display text-3xl text-or">{stat.value}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-ivoire-dim">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
