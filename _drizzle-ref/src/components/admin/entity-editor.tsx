"use client";

import { useActionState, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Plus, X, Pencil, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/misc";
import type { ActionState } from "@/lib/actions/auth";

/**
 * Éditeur générique en panneau latéral.
 *
 * Toutes les entités administrables (objectif, parcours, mission, outil…)
 * partagent la même mécanique : un formulaire, une action serveur, un état.
 * Seuls les champs changent — ils sont passés en `children`.
 */
export function EntityEditor({
  action,
  trigger,
  title,
  description,
  children,
  wide = false,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  trigger?: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
  wide?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, {});
  const reduce = useReducedMotion();

  return (
    <>
      <span onClick={() => setOpen(true)}>
        {trigger ?? (
          <Button size="sm" icon={<Plus size={15} />}>
            Ajouter
          </Button>
        )}
      </span>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[90]"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              aria-label="Fermer"
              onClick={() => setOpen(false)}
              className="absolute inset-0 cursor-default bg-noir/85 backdrop-blur-sm"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={title}
              initial={reduce ? false : { x: "100%" }}
              animate={{ x: 0 }}
              exit={reduce ? { opacity: 0 } : { x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className={`absolute inset-y-0 right-0 flex w-full flex-col border-l border-ivoire/12 bg-noir-elevated ${
                wide ? "sm:max-w-2xl" : "sm:max-w-lg"
              }`}
            >
              <header className="flex items-start justify-between gap-4 border-b border-ivoire/8 px-5 py-4">
                <div>
                  <h2 className="font-display text-lg text-ivoire">{title}</h2>
                  {description && (
                    <p className="mt-1 text-xs text-ivoire-dim">{description}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Fermer le panneau"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ivoire-dim transition-colors hover:bg-ivoire/8 hover:text-ivoire"
                >
                  <X size={18} />
                </button>
              </header>

              <form action={formAction} className="flex min-h-0 flex-1 flex-col">
                <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
                  {state.error && <Alert tone="erreur">{state.error}</Alert>}
                  {state.success && <Alert tone="succes">{state.success}</Alert>}
                  {/* Les champs reçoivent les erreurs par nom via data-error. */}
                  <EditorErrors errors={state.fieldErrors} />
                  {children}
                </div>

                <footer className="safe-bottom flex gap-2.5 border-t border-ivoire/8 px-5 py-4">
                  <Button type="submit" loading={pending} icon={<Save size={16} />}>
                    Enregistrer
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                    Annuler
                  </Button>
                </footer>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function EditorErrors({ errors }: { errors?: Record<string, string> }) {
  if (!errors || Object.keys(errors).length === 0) return null;
  return (
    <Alert tone="erreur" title="Corrige ces champs">
      <ul className="space-y-1">
        {Object.entries(errors).map(([field, message]) => (
          <li key={field}>
            <span className="font-mono text-xs">{field}</span> — {message}
          </li>
        ))}
      </ul>
    </Alert>
  );
}

/** Déclencheur « modifier » compact, pour les lignes de table. */
export function EditTrigger() {
  return (
    <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-ivoire-dim transition-colors hover:bg-or/10 hover:text-or">
      <Pencil size={15} />
    </span>
  );
}
