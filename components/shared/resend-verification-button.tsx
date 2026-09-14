"use client";

import { useState } from "react";
import { Mail } from "lucide-react";

export function ResendVerificationButton() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleClick = async () => {
    setStatus("sending");
    const res = await fetch("/api/account/resend-verification", { method: "POST" });
    setStatus(res.ok ? "sent" : "error");
  };

  if (status === "sent") {
    return <p className="text-xs text-feuillage">E-mail envoyé — vérifiez votre boîte de réception.</p>;
  }

  return (
    <button
      onClick={handleClick}
      disabled={status === "sending"}
      className="inline-flex items-center gap-1.5 text-xs font-medium text-or hover:underline disabled:opacity-50"
    >
      <Mail size={12} />
      {status === "sending" ? "Envoi..." : status === "error" ? "Échec — réessayer" : "Renvoyer l'e-mail de confirmation"}
    </button>
  );
}
