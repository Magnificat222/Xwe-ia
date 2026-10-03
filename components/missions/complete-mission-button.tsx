"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CompleteMissionButton({ missionId, pathSlug }: { missionId: string; pathSlug?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleComplete = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/progress/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ missionId, pathSlug }),
      });

      if (!response.ok) {
        setLoading(false);
        return;
      }

      const { nextMissionSlug, pathSlug: confirmedPath } = await response.json();
      setDone(true);

      if (confirmedPath) {
        // Inside a path: next mission of the path, or back to the path when finished.
        router.push(
          nextMissionSlug
            ? `/missions/${nextMissionSlug}?parcours=${encodeURIComponent(confirmedPath)}`
            : `/parcours/${confirmedPath}`
        );
      } else if (nextMissionSlug) {
        router.push(`/missions/${nextMissionSlug}`);
      } else {
        router.push("/missions");
      }
      router.refresh();
    } catch {
      setLoading(false);
    }
  };

  return (
    <Button size="lg" onClick={handleComplete} disabled={loading || done}>
      <CheckCircle2 size={16} />
      {done ? "Mission terminée !" : loading ? "Enregistrement..." : "Marquer comme terminée"}
    </Button>
  );
}
