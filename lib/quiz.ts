export const POINTS_PER_CORRECT_ANSWER = 10;

// Speed bonus is based on the average time spent per question across the
// whole attempt — rewards quick, confident answers without punishing
// someone who reads carefully but still gets everything right.
export function calculateSpeedBonus(durationSeconds: number, questionCount: number): number {
  const avgPerQuestion = durationSeconds / questionCount;
  if (avgPerQuestion <= 8) return 20;
  if (avgPerQuestion <= 15) return 10;
  return 0;
}

export type QuizBadgeTier = "BRONZE" | "SILVER" | "GOLD" | null;

// Thresholds are against the max possible totalScore for a 10-question
// stage: 10 correct * 10 pts + 20 speed bonus = 120.
export function determineBadge(totalScore: number): QuizBadgeTier {
  if (totalScore >= 100) return "GOLD";
  if (totalScore >= 70) return "SILVER";
  if (totalScore >= 40) return "BRONZE";
  return null;
}

export function badgeLabel(tier: QuizBadgeTier): string {
  switch (tier) {
    case "GOLD":
      return "Or";
    case "SILVER":
      return "Argent";
    case "BRONZE":
      return "Bronze";
    default:
      return "Aucun badge";
  }
}
