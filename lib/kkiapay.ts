import { kkiapay } from "@kkiapay-org/nodejs-sdk";

if (!process.env.KKIAPAY_PRIVATE_KEY || !process.env.KKIAPAY_SECRET_KEY) {
  console.warn("Clés Kkiapay manquantes — les routes de paiement échoueront.");
}

// sandbox=true tant que le compte marchand n'est pas validé en mode Live par
// Kkiapay. Passe KKIAPAY_SANDBOX=false dans .env une fois prêt pour la prod.
export const kkiapayClient = kkiapay({
  publickey: process.env.NEXT_PUBLIC_KKIAPAY_PUBLIC_KEY ?? "",
  privatekey: process.env.KKIAPAY_PRIVATE_KEY ?? "",
  secretkey: process.env.KKIAPAY_SECRET_KEY ?? "",
  sandbox: process.env.KKIAPAY_SANDBOX !== "false",
});
