"use client";

import { useState } from "react";
import { FormField } from "@/components/shared/auth-slider";
import { Button } from "@/components/ui/button";

export function PasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("saving");
    setError(null);

    const res = await fetch("/api/account/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Impossible de changer le mot de passe.");
      setStatus("error");
      return;
    }

    setStatus("saved");
    setCurrentPassword("");
    setNewPassword("");
    setTimeout(() => setStatus("idle"), 2000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {hasPassword && (
        <FormField
          label="Mot de passe actuel"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
      )}
      <FormField
        label={hasPassword ? "Nouveau mot de passe" : "Choisir un mot de passe"}
        type="password"
        placeholder="8 caractères minimum"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <Button type="submit" size="sm" disabled={status === "saving"}>
        {status === "saving" ? "Enregistrement..." : status === "saved" ? "Mot de passe changé" : "Changer le mot de passe"}
      </Button>
    </form>
  );
}
