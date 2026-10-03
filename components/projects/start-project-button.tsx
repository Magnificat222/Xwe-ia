"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function StartProjectButton({ wizardType }: { wizardType: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    setLoading(true);
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wizardType }),
    });
    if (res.ok) {
      const { project } = await res.json();
      router.push(`/projets/${project.id}`);
    } else {
      // 403 = the path of this project must be unlocked first.
      const data = await res.json().catch(() => ({}));
      if (res.status === 403 && data.pathSlug) router.push(`/parcours/${data.pathSlug}`);
      else setLoading(false);
    }
  };

  return (
    <Button size="sm" onClick={handleStart} disabled={loading}>
      {loading ? "Création..." : "Commencer"}
    </Button>
  );
}
