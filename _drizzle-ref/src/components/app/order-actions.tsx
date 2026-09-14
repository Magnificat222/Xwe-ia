"use client";

import { useActionState, useState, useTransition } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X, Copy, Check, Smartphone, Clock, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { Alert } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import {
  cancelOrderAction,
  declarePaymentAction,
  getOrderInstructionsAction,
} from "@/lib/actions/commerce";
import type { ActionState } from "@/lib/actions/auth";
import { formatXof } from "@/lib/utils";

/**
 * Reprise d'une commande déjà ouverte.
 *
 * Distinct de CheckoutButton : ici la commande existe, on ne fait que
 * réafficher ses instructions. Cela évite de multiplier les références pour
 * un même achat, ce qui compliquerait la vérification côté administration.
 */
export function ResumeOrderButton({
  orderId,
  reference,
  amountXof,
}: {
  orderId: string;
  reference: string;
  amountXof: number;
}) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<Awaited<ReturnType<typeof getOrderInstructionsAction>>>(null);
  const [step, setStep] = useState<"instructions" | "declare" | "done">("instructions");
  const [pending, start] = useTransition();
  const [copied, setCopied] = useState(false);
  const reduce = useReducedMotion();

  const [declareState, declareAction, declaring] = useActionState<ActionState, FormData>(
    declarePaymentAction,
    {},
  );

  if (declareState.success && step !== "done") setStep("done");

  const openSheet = () =>
    start(async () => {
      const instructions = await getOrderInstructionsAction(orderId);
      setData(instructions);
      setStep("instructions");
      setOpen(true);
    });

  return (
    <>
      <Button size="sm" loading={pending} onClick={openSheet}>
        Reprendre le paiement
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-end justify-center overflow-y-auto bg-noir/90 backdrop-blur-sm sm:items-center"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label={`Paiement de la commande ${reference}`}
          >
            <motion.div
              initial={reduce ? false : { y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={reduce ? { opacity: 0 } : { y: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="safe-bottom my-auto w-full max-w-md rounded-t-panel border border-ivoire/12 bg-noir-elevated p-6 sm:rounded-panel"
            >
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-or">
                    Commande {reference}
                  </p>
                  <p className="mt-1.5 font-display text-xl text-ivoire">{formatXof(amountXof)}</p>
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

              {step === "instructions" && data?.instruction && (
                <div className="space-y-5">
                  <div>
                    <p className="mb-2 flex items-center gap-1.5 text-xs text-ivoire-dim">
                      <Smartphone size={13} className="text-or" /> Numéro de paiement
                    </p>
                    <div className="space-y-2">
                      {data.instruction.numbers.map((n) => (
                        <button
                          key={n.number}
                          type="button"
                          onClick={() => {
                            navigator.clipboard?.writeText(n.number.replace(/\s/g, ""));
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          }}
                          className="flex w-full items-center justify-between gap-3 rounded-card border border-or/25 bg-or/[0.06] px-3.5 py-3 transition-colors hover:border-or/50"
                        >
                          <span className="font-mono text-sm text-ivoire">{n.number}</span>
                          <span className="flex items-center gap-1.5 text-xs text-or">
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                            {copied ? "Copié" : "Copier"}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-card border border-braise/30 bg-braise/[0.08] px-3.5 py-3 text-center">
                    <p className="font-mono text-lg tracking-wider text-braise-vif">{reference}</p>
                    <p className="mt-1 text-[0.7rem] text-ivoire-dim">
                      À inscrire dans le motif du transfert
                    </p>
                  </div>

                  <p className="flex items-center gap-2 text-[0.7rem] text-ivoire-faint">
                    <Clock size={13} className="shrink-0 text-or" />
                    {data.instruction.processingDelay}
                  </p>

                  <Button fullWidth onClick={() => setStep("declare")}>
                    J'ai payé, je déclare
                  </Button>
                </div>
              )}

              {step === "declare" && (
                <form action={declareAction} className="space-y-4">
                  <input type="hidden" name="orderId" value={orderId} />
                  {declareState.error && <Alert tone="erreur">{declareState.error}</Alert>}

                  <Input
                    name="payerNumber"
                    label="Numéro utilisé pour payer"
                    inputMode="tel"
                    required
                    error={declareState.fieldErrors?.payerNumber}
                  />
                  <Input
                    name="declaredAmountXof"
                    label="Montant envoyé (FCFA)"
                    inputMode="numeric"
                    defaultValue={amountXof}
                    required
                    error={declareState.fieldErrors?.declaredAmountXof}
                  />
                  <Input
                    name="declaredReference"
                    label="Identifiant de la transaction"
                    placeholder="Reçu par SMS"
                    required
                    error={declareState.fieldErrors?.declaredReference}
                  />

                  <div className="flex gap-2.5">
                    <Button type="button" variant="secondary" onClick={() => setStep("instructions")}>
                      Retour
                    </Button>
                    <Button type="submit" fullWidth loading={declaring}>
                      Envoyer
                    </Button>
                  </div>
                </form>
              )}

              {step === "done" && (
                <div className="space-y-5">
                  <Alert tone="succes" title="Déclaration enregistrée">
                    {declareState.success}
                  </Alert>
                  <Button fullWidth variant="secondary" onClick={() => setOpen(false)}>
                    Fermer
                  </Button>
                </div>
              )}

              {!data && (
                <div className="space-y-2.5">
                  <div className="skeleton h-16 rounded-card" />
                  <div className="skeleton h-12 rounded-card" />
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function CancelOrderButton({ orderId }: { orderId: string }) {
  const [pending, start] = useTransition();
  const { push } = useToast();

  return (
    <Button
      size="sm"
      variant="ghost"
      loading={pending}
      icon={<Ban size={14} />}
      onClick={() => {
        if (!confirm("Annuler cette commande ?")) return;
        start(async () => {
          const result = await cancelOrderAction(orderId);
          push(result.error ?? result.success ?? "", result.error ? "erreur" : "succes");
        });
      }}
    >
      Annuler
    </Button>
  );
}
