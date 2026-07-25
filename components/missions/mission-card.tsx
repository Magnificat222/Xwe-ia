import Link from "next/link";
import { Clock } from "lucide-react";
import type { Mission } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatMinutes } from "@/lib/utils";

export function MissionCard({ mission }: { mission: Mission }) {
  return (
    <Link href={`/missions/${mission.slug}`}>
      <Card className="h-full">
        <div className="mb-3 flex items-center justify-between">
          <Badge>{mission.level.toLowerCase()}</Badge>
          {mission.isPremium && <Badge tone="gold">Premium</Badge>}
        </div>
        <h3 className="font-display text-lg text-ivoire">{mission.title}</h3>
        <p className="mt-1.5 line-clamp-2 text-sm text-ivoire-dim">{mission.description}</p>
        <p className="mt-4 flex items-center gap-1.5 text-xs text-ivoire-dim">
          <Clock size={13} /> {formatMinutes(mission.estimatedMinutes)}
        </p>
      </Card>
    </Link>
  );
}
