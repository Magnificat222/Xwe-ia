"use client";

import { useActionState, useEffect } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Checkbox } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { updateAiQuotaAction } from "@/lib/actions/admin-commerce";
import type { ActionState } from "@/lib/actions/auth";

const EMPTY: ActionState = {};

export function QuotaForm({
  id,
  dailyLimit,
  monthlyLimit,
  isEnabled,
}: {
  id: string;
  dailyLimit: number;
  monthlyLimit: number;
  isEnabled: boolean;
}) {
  const [state, action, pending] = useActionState(updateAiQuotaAction, EMPTY);
  const { push } = useToast();

  useEffect(() => {
    if (state.success) push(state.success, "succes");
    if (state.error) push(state.error, "erreur");
  }, [state, push]);

  return (
    <form action={action} className="grid gap-3 sm:grid-cols-[7rem_7rem_1fr_auto] sm:items-end">
      <input type="hidden" name="id" value={id} />
      <Input
        label="Par jour"
        name="dailyLimit"
        type="number"
        min={0}
        inputMode="numeric"
        defaultValue={dailyLimit}
        error={state.fieldErrors?.dailyLimit}
      />
      <Input
        label="Par mois"
        name="monthlyLimit"
        type="number"
        min={0}
        inputMode="numeric"
        defaultValue={monthlyLimit}
        error={state.fieldErrors?.monthlyLimit}
      />
      <Checkbox name="isEnabled" defaultChecked={isEnabled} label="Fonction active" />
      <Button type="submit" size="sm" loading={pending} icon={<Save size={14} />}>
        Enregistrer
      </Button>
    </form>
  );
}
