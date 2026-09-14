"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/misc";
import {
  registerAction,
  loginAction,
  forgotPasswordAction,
  resetPasswordAction,
  type ActionState,
} from "@/lib/actions/auth";

const initial: ActionState = {};

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, initial);
  const params = useSearchParams();
  const suite = params.get("suite") ?? "";

  return (
    <form action={action} className="space-y-4" noValidate>
      <input type="hidden" name="suite" value={suite} />
      {state.error && <Alert tone="erreur">{state.error}</Alert>}
      <Input
        label="Nom"
        name="name"
        autoComplete="name"
        placeholder="Ton nom"
        required
        error={state.fieldErrors?.name}
      />
      <Input
        label="E-mail"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="toi@exemple.com"
        required
        error={state.fieldErrors?.email}
      />
      <Input
        label="Mot de passe"
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder="8 caractères minimum"
        required
        error={state.fieldErrors?.password}
        hint="Choisis un mot de passe que tu n'utilises pas ailleurs."
      />
      <Button type="submit" fullWidth size="lg" loading={pending}>
        Créer mon compte
      </Button>
      <p className="text-center text-xs leading-relaxed text-ivoire-faint">
        En créant un compte, tu acceptes nos{" "}
        <Link href="/legal/conditions" className="text-or hover:underline">
          conditions d'utilisation
        </Link>{" "}
        et notre{" "}
        <Link href="/legal/confidentialite" className="text-or hover:underline">
          politique de confidentialité
        </Link>
        .
      </p>
    </form>
  );
}

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initial);
  const params = useSearchParams();
  const suite = params.get("suite") ?? "";
  const justReset = params.get("reinitialise") === "1";

  return (
    <form action={action} className="space-y-4" noValidate>
      {justReset && (
        <Alert tone="succes">Mot de passe modifié. Tu peux te connecter.</Alert>
      )}
      {state.error && <Alert tone="erreur">{state.error}</Alert>}
      <input type="hidden" name="suite" value={suite} />
      <Input
        label="E-mail"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="toi@exemple.com"
        required
      />
      <Input
        label="Mot de passe"
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />
      <div className="flex justify-end">
        <Link
          href="/mot-de-passe-oublie"
          className="text-xs text-ivoire-dim transition-colors hover:text-or"
        >
          Mot de passe oublié ?
        </Link>
      </div>
      <Button type="submit" fullWidth size="lg" loading={pending}>
        Se connecter
      </Button>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(forgotPasswordAction, initial);

  return (
    <form action={action} className="space-y-4" noValidate>
      {state.success && <Alert tone="succes">{state.success}</Alert>}
      {state.error && <Alert tone="erreur">{state.error}</Alert>}
      <Input
        label="E-mail"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="toi@exemple.com"
        required
      />
      <Button type="submit" fullWidth size="lg" loading={pending}>
        Envoyer le lien
      </Button>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPasswordAction, initial);

  return (
    <form action={action} className="space-y-4" noValidate>
      {state.error && <Alert tone="erreur">{state.error}</Alert>}
      <input type="hidden" name="token" value={token} />
      <Input
        label="Nouveau mot de passe"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        error={state.fieldErrors?.password}
      />
      <Input
        label="Confirmer le mot de passe"
        name="confirm"
        type="password"
        autoComplete="new-password"
        required
        error={state.fieldErrors?.confirm}
      />
      <Button type="submit" fullWidth size="lg" loading={pending}>
        Réinitialiser
      </Button>
    </form>
  );
}
