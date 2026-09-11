"use client";

import { useActionState, useState, useTransition } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Crown,
  ShoppingBag,
  X,
  ShieldCheck,
  Clock,
  Copy,
  Check,
  Smartphone,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { Alert } from "@/components/ui/misc";
import {
  createOrderAction,
  declarePaymentAction,
  getOrderInstructionsAction,
} from "@/lib/actions/commerce";
import type { ActionState } from "@/lib/actions/auth";
import { formatXof } from "@/lib/utils";

/**
 * Parcours de paiement MTN Mobile Money.
 *
 * Deux temps : l'utilisateur reçoit les instructions et la référence, puis il
 * déclare son paiement. Rien ne s'ouvre à cet instant — la confirmation est
 * une décision serveur, prise par l'administration. On le dit clairement
 * plutôt que de laisser croire à un déblocage immédiat.
 */

interface Instructions {
  reference: string;
  amountXof: number;
  listPriceXof: number;
  status: string;
  instruction: {
    steps: string[];
    numbers: { label: string; number: string; holderName: string | null; isPrimary: boolean }[];
    processingDelay: string;
    requiresDeclaration: boolean;
  } | null;
  error?: string;
}

function CopyableNumber({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(value.replace(/\s/g, ""));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="flex w-full items-center justify-between gap-3 rounded-card border border-or/25 bg-or/[0.06] px-3.5 py-3 text-left transition-colors hover:border-or/50"
      aria-label={`Copier le numéro ${value}`}
    >
      <span className="font-mono text-sm text-ivoire">{value}</span>
      <span className="flex items-center gap-1.5 text-xs text-or">
        {copied ? <Check size={14} /> : <Copy size={14} />}
        {copied ? "Copié" : "Copier"}
      </span>
    </button>
  );
}

export function CheckoutButton({
  kind,
  targetSlug,
  amountXof,
  listPriceXof,
  label,
}: {
  kind: "pathway" | "premium";
  targetSlug?: string;
  amountXof: number;
  /** Tarif avant remise, pour afficher le prix barré. */
  listPriceXof?: number;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<Instructions | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"instructions" | "declare" | "done">("instructions");
  const [pending, start] = useTransition();
  const reduce = useReducedMotion();

  const [declareState, declareAction, declaring] = useActionState<ActionState, FormData>(
    declarePaymentAction,
    {},
  );
  const [orderId, setOrderId] = useState<string | null>(null);

  const openCheckout = () =>
    start(async () => {
      setError(null);
      const created = await createOrderAction(kind, targetSlug);
      if (!created.ok || !created.orderId) {
        setError(created.error ?? "Impossible de créer la commande.");
        setOpen(true);
        return;
      }
      setOrderId(created.orderId);
      const instructions = await getOrderInstructionsAction(created.orderId);
      setData(instructions);
      setStep("instructions");
      setOpen(true);
    });

  // La déclaration a abouti : on bascule sur l'écran de confirmation.
  if (declareState.success && step !== "done") setStep("done");

  const discounted = listPriceXof !== undefined && listPriceXof > amountXof;

  return (
    <>
      <Button
        fullWidth
        loading={pending}
        onClick={openCheckout}
        icon={kind === "premium" ? <Crown size={16} /> : <ShoppingBag size={16} />}
      >
        {label} · {formatXof(amountXof)}
        {discounted && (
          <span className="ml-1.5 text-xs line-through opacity-60">{formatXof(listPriceXof)}</span>
        )}
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
            aria-label="Paiement Mobile Money"
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
                    {step === "done" ? "Déclaration reçue" : "Paiement Mobile Money"}
                  </p>
                  <p className="mt-1.5 font-display text-xl text-ivoire">
                    {data ? formatXof(data.amountXof) : formatXof(amountXof)}
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

              {error && <Alert tone="erreur">{error}</Alert>}
              {data?.error && <Alert tone="erreur">{data.error}</Alert>}

              {/* Étape 1 — instructions de paiement */}
              {step === "instructions" && data?.instruction && (
                <div className="space-y-5">
                  <div>
                    <p className="mb-2 text-xs text-ivoire-dim">Référence de ta commande</p>
                    <div className="rounded-card border border-braise/30 bg-braise/[0.08] px-3.5 py-3 text-center">
                      <p className="font-mono text-lg tracking-wider text-braise-vif">
                        {data.reference}
                      </p>
                      <p className="mt-1 text-[0.7rem] text-ivoire-dim">
                        À inscrire dans le motif du transfert
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 flex items-center gap-1.5 text-xs text-ivoire-dim">
                      <Smartphone size={13} className="text-or" />
                      {data.instruction.numbers.length > 1
                        ? "Envoie à l'un de ces numéros"
                        : "Envoie à ce numéro"}
                    </p>
                    <div className="space-y-2">
                      {data.instruction.numbers.map((n) => (
                        <div key={n.number}>
                          <CopyableNumber value={n.number} />
                          <p className="mt-1 px-1 text-[0.7rem] text-ivoire-faint">
                            {n.label}
                            {n.holderName ? ` · ${n.holderName}` : ""}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <ol className="space-y-2 text-xs leading-relaxed text-ivoire-dim">
                    {data.instruction.steps.map((s, i) => (
                      <li key={s} className="flex gap-2.5">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-or/12 font-mono text-[0.65rem] text-or">
                          {i + 1}
                        </span>
                        {s}
                      </li>
                    ))}
                  </ol>

                  <p className="flex items-center gap-2 text-[0.7rem] text-ivoire-faint">
                    <Clock size={13} className="shrink-0 text-or" />
                    {data.instruction.processingDelay}
                  </p>

                  <Button fullWidth onClick={() => setStep("declare")} icon={<ArrowRight size={16} />}>
                    J'ai payé, je déclare
                  </Button>
                </div>
              )}

              {/* Étape 2 — déclaration */}
              {step === "declare" && (
                <form action={declareAction} className="space-y-4">
                  <input type="hidden" name="orderId" value={orderId ?? ""} />

                  <p className="text-xs leading-relaxed text-ivoire-dim">
                    Renseigne les informations du transfert. Nous vérifions, puis ton accès s'ouvre.
                  </p>

                  {declareState.error && <Alert tone="erreur">{declareState.error}</Alert>}

                  <Input
                    name="payerNumber"
                    label="Numéro utilisé pour payer"
                    placeholder="Ex : 01 97 00 00 00"
                    inputMode="tel"
                    required
                    error={declareState.fieldErrors?.payerNumber}
                  />
                  <Input
                    name="declaredAmountXof"
                    label="Montant envoyé (FCFA)"
                    inputMode="numeric"
                    defaultValue={data?.amountXof ?? amountXof}
                    required
                    error={declareState.fieldErrors?.declaredAmountXof}
                  />
                  <Input
                    name="declaredReference"
                    label="Identifiant de la transaction"
                    placeholder="Reçu par SMS après le transfert"
                    required
                    error={declareState.fieldErrors?.declaredReference}
                  />

                  <div className="flex gap-2.5">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setStep("instructions")}
                    >
                      Retour
                    </Button>
                    <Button type="submit" fullWidth loading={declaring}>
                      Envoyer ma déclaration
                    </Button>
                  </div>
                </form>
              )}

              {/* Étape 3 — confirmation de réception */}
              {step === "done" && (
                <div className="space-y-5">
                  <Alert tone="succes" title="Déclaration enregistrée">
                    {declareState.success}
                  </Alert>
                  <ul className="space-y-2.5 text-xs text-ivoire-dim">
                    <li className="flex items-center gap-2">
                      <ShieldCheck size={14} className="shrink-0 text-feuillage-vif" />
                      Le montant est calculé côté serveur : il ne peut pas être modifié depuis le
                      navigateur.
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock size={14} className="shrink-0 text-or" />
                      Tu recevras une notification dès la validation.
                    </li>
                  </ul>
                  <Button fullWidth variant="secondary" onClick={() => setOpen(false)}>
                    Fermer
                  </Button>
                </div>
              )}

              {!data && !error && step === "instructions" && (
                <div className="space-y-2.5">
                  <div className="skeleton h-16 rounded-card" />
                  <div className="skeleton h-12 rounded-card" />
                  <div className="skeleton h-24 rounded-card" />
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
