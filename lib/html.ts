// Escapes a value before it is inserted into an HTML string (e-mails, etc.).
// Covers the five characters that can open a tag or break out of an attribute.
export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Single-line version for e-mail subjects (no CR/LF header injection).
export function toSingleLine(value: unknown): string {
  return String(value ?? "").replace(/[\r\n\u2028\u2029]+/g, " ").trim();
}
