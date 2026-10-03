"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

// The price is only displayed here; the server reads the real cost itself.
export function UnlockPathButton({ slug, creditCost }: { slug: string; creditCost: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsCredits, setNeedsCredits] = useState(false);

  async function unlock() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/parcours/${slug}/unlock`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Impossible de débloquer ce parcours.");
      setNeedsCredits(data.code === "INSUFFICIENT_CREDITS");
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <Button size="lg" onClick={unlock} disabled={loading}>
        {loading ? "Déblocage…" : `Débloquer pour ${creditCost} Xwé Crédits`}
      </Button>
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      {needsCredits && (
        <a href="/credits" className="mt-2 inline-block text-sm text-or">Acheter des Xwé Crédits →</a>
      )}
    </div>
  );
}
