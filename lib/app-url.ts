// URL publique du site, utilisée dans les liens envoyés par e-mail.
// Ordre : AUTH_URL (variable documentée dans .env.example), puis NEXTAUTH_URL
// (ancien nom), puis NEXT_PUBLIC_APP_URL, puis l'URL de déploiement Vercel.
export function getBaseUrl(): string {
  const explicit = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL;
  if (explicit) return explicit.replace(/\/+$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
