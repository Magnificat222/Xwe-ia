"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Swords } from "lucide-react";

export function ChallengeForm({ stageId }: { stageId: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setMessage(null);

    const res = await fetch("/api/quiz/duels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stageId, opponentEmail: email }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setMessage(body.error ?? "Impossible d'envoyer le défi.");
      setStatus("error");
      return;
    }

    setStatus("sent");
    setMessage("Défi envoyé ! Retrouvez-le dans « Mes défis ».");
    setEmail("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="E-mail du membre à défier"
        className="flex-1 rounded-full border border-ivoire/15 bg-noir px-4 py-2 text-sm text-ivoire outline-none focus:border-or"
      />
      <Button type="submit" variant="secondary" className="rounded-full" disabled={status === "sending"}>
        <Swords size={15} /> Défier
      </Button>
      {message && (
        <p className={`text-xs sm:self-center ${status === "error" ? "text-red-400" : "text-green-400"}`}>
          {message}
        </p>
      )}
    </form>
  );
}
