"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, X, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import {
  confirmOrderAction,
  rejectOrderAction,
  reviewOrderAction,
} from "@/lib/actions/admin-commerce";

/**
 * Traitement d'une commande.
 *
 * Confirmer ouvre un accès payant : l'action est donc précédée d'une
 * confirmation explicite rappelant le montant, pour éviter le clic réflexe.
 * Refuser et mettre en vérification exigent un motif, qui part à l'utilisateur.
 */
export function OrderActions({
  orderId,
  reference,
  amountLabel,
  declaredAmountLabel,
  mismatch,
}: {
  orderId: string;
  reference: string;
  amountLabel: string;
  declaredAmountLabel?: string;
  /** Vrai si le montant déclaré diffère du montant dû. */
  mismatch?: boolean;
}) {
  const [dialog, setDialog] = useState<"reject" | "review" | null>(null);
  const [reason, setReason] = useState("");
  const [pending, start] = useTransition();
  const { push } = useToast();
  const reduce = useReducedMotion();

  const run = (fn: () => Promise<{ error?: string; success?: string }>) =>
    start(async () => {
      const result = await fn();
      push(result.error ?? result.success ?? "", result.error ? "erreur" : "succes");
      setDialog(null);
      setReason("");
    });

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          loading={pending}
          icon={<Check size={14} />}
          onClick={() => {
            const warning = mismatch
              ? `\n\nATTENTION : le montant déclaré (${declaredAmountLabel}) diffère du montant dû (${amountLabel}).`
              : "";
            if (
              !confirm(
                `Confirmer la commande ${reference} pour ${amountLabel} ?${warning}\n\nL'accès sera ouvert immédiatement.`,
              )
            ) {
              return;
            }
            run(() => confirmOrderAction(orderId));
          }}
        >
          Confirmer
        </Button>
        <Button
          size="sm"
          variant="secondary"
          icon={<Search size={14} />}
          onClick={() => setDialog("review")}
        >
          Vérifier
        </Button>
        <Button
          size="sm"
          variant="danger"
          icon={<X size={14} />}
          onClick={() => setDialog("reject")}
        >
          Refuser
        </Button>
      </div>

      <AnimatePresence>
        {dialog && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-end justify-center bg-noir/90 backdrop-blur-sm sm:items-center"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              initial={reduce ? false : { y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={reduce ? { opacity: 0 } : { y: 30, opacity: 0 }}
              className="safe-bottom w-full max-w-md rounded-t-panel border border-ivoire/12 bg-noir-elevated p-6 sm:rounded-panel"
            >
              <p className="font-display text-lg text-ivoire">
                {dialog === "reject" ? "Refuser la commande" : "Demander une vérification"}
              </p>
              <p className="mt-1.5 text-sm text-ivoire-dim">
                {dialog === "reject"
                  ? "Le motif sera envoyé à l'utilisateur. Sois précis et courtois."
                  : "Explique ce qui doit être vérifié. L'utilisateur en sera informé."}
              </p>

              <div className="mt-4">
                <Textarea
                  label="Motif"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  placeholder={
                    dialog === "reject"
                      ? "Ex : aucun transfert reçu avec cette référence."
                      : "Ex : le montant reçu ne correspond pas au montant dû."
                  }
                />
              </div>

              <div className="mt-5 flex gap-2.5">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setDialog(null);
                    setReason("");
                  }}
                >
                  Annuler
                </Button>
                <Button
                  fullWidth
                  variant={dialog === "reject" ? "danger" : "primary"}
                  loading={pending}
                  icon={pending ? <Loader2 size={14} /> : undefined}
                  onClick={() =>
                    run(() =>
                      dialog === "reject"
                        ? rejectOrderAction(orderId, reason)
                        : reviewOrderAction(orderId, reason),
                    )
                  }
                >
                  {dialog === "reject" ? "Refuser" : "Envoyer"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
