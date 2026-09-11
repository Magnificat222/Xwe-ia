"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

export function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setStatus(res.ok ? "sent" : "error");
    if (res.ok) setForm({ name: "", email: "", subject: "", message: "" });
  };

  if (status === "sent") {
    return (
      <div className="rounded-xl border border-feuillage/30 bg-feuillage-soft/20 p-6 text-center">
        <p className="text-sm text-ivoire">Message envoyé — merci ! Nous vous répondrons rapidement.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ivoire-dim">Nom</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-lg border border-ivoire/15 bg-noir px-3.5 py-2.5 text-sm text-ivoire outline-none focus:border-or"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ivoire-dim">E-mail</label>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded-lg border border-ivoire/15 bg-noir px-3.5 py-2.5 text-sm text-ivoire outline-none focus:border-or"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ivoire-dim">Sujet</label>
        <select
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
          className="w-full rounded-lg border border-ivoire/15 bg-noir px-3.5 py-2.5 text-sm text-ivoire outline-none focus:border-or"
        >
          <option value="">Choisir un sujet</option>
          <option value="Signaler un bug">Signaler un bug</option>
          <option value="Question sur mon abonnement">Question sur mon abonnement</option>
          <option value="Suggestion">Suggestion</option>
          <option value="Autre">Autre</option>
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ivoire-dim">Message</label>
        <textarea
          required
          rows={5}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="Décrivez votre demande ou le bug rencontré..."
          className="w-full rounded-lg border border-ivoire/15 bg-noir px-3.5 py-2.5 text-sm text-ivoire outline-none focus:border-or"
        />
      </div>

      {status === "error" && (
        <p className="text-sm text-red-400">L'envoi a échoué. Merci de réessayer dans un instant.</p>
      )}

      <Button type="submit" disabled={status === "sending"}>
        <Send size={15} /> {status === "sending" ? "Envoi..." : "Envoyer"}
      </Button>
    </form>
  );
}
