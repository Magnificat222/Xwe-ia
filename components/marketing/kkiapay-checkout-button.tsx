"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    openKkiapayWidget?: (options: Record<string, string | number>) => void;
    addSuccessListener?: (cb: (response: { transactionId: string }) => void) => void;
  }
}

const PREMIUM_AMOUNT_XOF = 7500; // ~12€ converti en Francs CFA, ajuste au besoin

export function KkiapayCheckoutButton() {
  const router = useRouter();
  const { data: session } = useSession();
  const [scriptReady, setScriptReady] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (!scriptReady || !window.addSuccessListener) return;

    window.addSuccessListener(async (response) => {
      setVerifying(true);
      try {
        const res = await fetch("/api/kkiapay/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transactionId: response.transactionId }),
        });

        if (res.ok) {
          router.push("/dashboard?upgraded=1");
        } else {
          const { error } = await res.json();
          alert(error ?? "La vérification du paiement a échoué.");
        }
      } finally {
        setVerifying(false);
      }
    });
  }, [scriptReady, router]);

  const handleClick = () => {
    if (!session?.user) {
      router.push("/register?next=premium");
      return;
    }

    window.openKkiapayWidget?.({
      amount: PREMIUM_AMOUNT_XOF,
      key: process.env.NEXT_PUBLIC_KKIAPAY_PUBLIC_KEY ?? "",
      sandbox: process.env.NEXT_PUBLIC_KKIAPAY_SANDBOX === "false" ? "false" : "true",
      data: session.user.id,
      position: "center",
      theme: "#c9a24b", // doré, cohérent avec le design Xwé IA
    });
  };

  return (
    <>
      <Script
        src="https://cdn.kkiapay.me/k.js"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
      />
      <Button className="w-full" onClick={handleClick} disabled={verifying}>
        {verifying ? "Vérification..." : `Passer Premium — ${PREMIUM_AMOUNT_XOF} FCFA/mois`}
      </Button>
    </>
  );
}
