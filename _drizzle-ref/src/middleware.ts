import { NextResponse, type NextRequest } from "next/server";

/**
 * Garde optimiste.
 *
 * Le middleware s'exécute sur le runtime Edge : il ne peut ni interroger la
 * base ni vérifier la signature de la session. Il se contente donc de repérer
 * l'absence totale de cookie pour éviter un aller-retour serveur inutile.
 * La véritable autorisation reste faite par requireUser / requireRole côté
 * serveur, sur chaque page protégée.
 */
const PROTECTED = [
  "/tableau-de-bord",
  "/bienvenue",
  "/profil",
  "/parametres",
  "/resultats",
  "/favoris",
  "/notifications",
  "/achats",
  "/missions",
  "/admin",
];

const AUTH_ROUTES = ["/connexion", "/inscription"];

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = request.cookies.has("xwe_session");

  if (!hasSession && PROTECTED.some((route) => pathname.startsWith(route))) {
    const url = request.nextUrl.clone();
    url.pathname = "/connexion";
    url.search = `?suite=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  if (hasSession && AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
    const url = request.nextUrl.clone();
    url.pathname = "/tableau-de-bord";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // On laisse passer les fichiers statiques, l'API et les images optimisées.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|logo.png|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)"],
};
