"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function NameForm({ initialName }: { initialName: string }) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("saving");
    setError(null);

    const res = await fetch("/api/account/name", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Impossible d'enregistrer.");
      setStatus("error");
      return;
    }

    setStatus("saved");
    router.refresh();
    setTimeout(() => setStatus("idle"), 2000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ivoire-dim">
          Pseudo
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={40}
          className="w-full rounded-lg border border-ivoire/15 bg-noir px-3.5 py-2.5 text-sm text-ivoire outline-none focus:border-or"
        />
        <p className="mt-1.5 text-xs text-ivoire-dim">
          C'est ce nom qui apparaît dans le Salon Premium et le classement de l'arène de quiz.
        </p>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <Button type="submit" size="sm" disabled={status === "saving"}>
        {status === "saving" ? "Enregistrement..." : status === "saved" ? "Enregistré" : "Enregistrer"}
      </Button>
    </form>
  );
}
