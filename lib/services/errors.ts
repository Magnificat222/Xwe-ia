// Typed errors for the business services (credits, payments, path access).
// Route handlers turn them into clean HTTP responses with `toErrorResponse`.
import { NextResponse } from "next/server";

export class ServiceError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number = 400
  ) {
    super(message);
    this.name = "ServiceError";
  }
}

export function toErrorResponse(error: unknown) {
  if (error instanceof ServiceError) {
    return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
  }
  console.error("[service] unexpected error", error);
  return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
}

// Prisma unique-constraint violation, without importing the Prisma namespace
// (keeps this file usable from any runtime).
export function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { code?: string }).code === "P2002"
  );
}
