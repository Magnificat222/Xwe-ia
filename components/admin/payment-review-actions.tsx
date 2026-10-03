"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { approvePaymentAction, rejectPaymentAction } from "@/lib/actions/payments-admin";

export function PaymentReviewActions({ requestId, summary }: { requestId: string; summary: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  function approve() {
    if (!window.confirm(`Confirmer que le paiement est bien reçu ?\n\n${summary}`)) return;
    setError(null);
    startTransition(async () => {
      const res = await approvePaymentAction(requestId);
      if (!res.ok) setError(res.error);
      router.refresh();
    });
  }

  function reject() {
    setError(null);
    startTransition(async () => {
      const res = await rejectPaymentAction(requestId, reason);
      if (!res.ok) return setError(res.error);
      setRejecting(false);
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      {!rejecting ? (
        <div className="flex gap-2">
          <Button size="sm" onClick={approve} disabled={isPending}>Approuver</Button>
          <Button size="sm" variant="secondary" onClick={() => setRejecting(true)} disabled={isPending}>Refuser</Button>
        </div>
      ) : (
        <div className="space-y-2">
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Motif du refus (visible par l'utilisateur)"
            className="w-full rounded-lg border border-ivoire/15 bg-noir px-3 py-2 text-sm text-ivoire outline-none focus:border-or"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={reject} disabled={isPending || reason.trim().length < 3}>Confirmer le refus</Button>
            <Button size="sm" variant="ghost" onClick={() => setRejecting(false)}>Annuler</Button>
          </div>
        </div>
      )}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
