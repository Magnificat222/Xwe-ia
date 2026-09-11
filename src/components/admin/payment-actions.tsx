"use client";

import { useTransition } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { markPaymentPaidAction } from "@/lib/actions/admin";

export function ConfirmPaymentButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  const { push } = useToast();

  return (
    <Button
      size="sm"
      variant="secondary"
      loading={pending}
      icon={<Check size={14} />}
      onClick={() => {
        if (!confirm("Valider ce paiement et ouvrir l'accès correspondant ?")) return;
        start(async () => {
          const result = await markPaymentPaidAction(id);
          if (result.error) push(result.error, "erreur");
          else if (result.success) push(result.success, "succes");
        });
      }}
    >
      Valider
    </Button>
  );
}
