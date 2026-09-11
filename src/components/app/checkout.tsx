"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Crown, ShoppingBag, X, ShieldCheck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/misc";
import { createPaymentIntentAction } from "@/lib/actions/app";
import { formatXof } from "@/lib/utils";

/**
 * Ouverture du paiement.
 *
 * L'intention de paiement est créée côté serveur (montant recalculé en base,
 * jamais transmis par le client). Le rattachement au fournisseur Kkiapay et la
 * revérification de la transaction sont l'objet du Prompt 2 : ici, on prépare
 * l'enregistrement et on informe honnêtement l'utilisateur.
 */
export function CheckoutButton({
  kind,
  targetId,
  amountXof,
  label,
}: {
  kind: "pathway" | "premium";
  targetId?: string;
  amountXof: number;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const [intent, setIntent] = useState<{ paymentId: string; amountXof: number } | null>(null);
  const [pending, start] = useTransition();
  const reduce = useReducedMotion();

  const openCheckout = () =>
    start(async () => {
      const result = await createPaymentIntentAction(kind, targetId);
      setIntent(result);
      setOpen(true);
    });

  return (
    <>
      <Button
        fullWidth
        loading={pending}
        onClick={openCheckout}
        icon={kind === "premium" ? <Crown size={16} /> : <ShoppingBag size={16} />}
      >
        {label} · {formatXof(amountXof)}
      </Button>

      <AnimatePresence>
        {open && intent && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-end justify-center bg-noir/90 backdrop-blur-sm sm:items-center"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="Paiement"
          >
            <motion.div
              initial={reduce ? false : { y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={reduce ? { opacity: 0 } : { y: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="safe-bottom w-full max-w-md rounded-t-panel border border-ivoire/12 bg-noir-elevated p-6 sm:rounded-panel"
            >
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-or">
                    Paiement
                  </p>
                  <p className="mt-1.5 font-display text-xl text-ivoire">
                    {formatXof(intent.amountXof)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Fermer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-ivoire-dim transition-colors hover:bg-ivoire/8 hover:text-ivoire"
                >
                  <X size={18} />
                </button>
              </div>

              <Alert tone="info" title="Paiement bientôt disponible">
                Ta commande est enregistrée (référence {intent.paymentId.slice(0, 8)}). Le règlement
                par Mobile Money et carte via Kkiapay est activé dans la prochaine étape du projet.
              </Alert>

              <ul className="mt-5 space-y-2.5 text-xs text-ivoire-dim">
                <li className="flex items-center gap-2">
                  <ShieldCheck size={14} className="shrink-0 text-feuillage-vif" />
                  Le montant est calculé côté serveur : il ne peut pas être modifié depuis le
                  navigateur.
                </li>
                <li className="flex items-center gap-2">
                  <Clock size={14} className="shrink-0 text-or" />
                  Chaque transaction sera revérifiée auprès du fournisseur avant d'ouvrir l'accès.
                </li>
              </ul>

              <Button className="mt-6" variant="secondary" fullWidth onClick={() => setOpen(false)}>
                Fermer
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
