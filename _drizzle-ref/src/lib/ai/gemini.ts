import "server-only";

import type { AiProvider, AiRequest, AiResponse } from "./provider";
import { estimateTokens } from "./provider";

/**
 * Fournisseur Google Gemini.
 *
 * Actif uniquement si GEMINI_API_KEY est défini côté serveur. Le modèle est
 * lui aussi configurable : on ne fige pas une version qui sera retirée un
 * jour, contrairement à l'ancien code qui épinglait un modèle inexistant.
 *
 *   GEMINI_API_KEY=…
 *   GEMINI_MODEL=gemini-2.0-flash   (facultatif)
 */
export class GeminiProvider implements AiProvider {
  readonly id = "gemini";
  readonly label = "Google Gemini";

  get isConfigured(): boolean {
    return Boolean(process.env.GEMINI_API_KEY);
  }

  private get model(): string {
    return process.env.GEMINI_MODEL ?? "gemini-2.0-flash";
  }

  async complete(request: AiRequest): Promise<AiResponse> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return this.failure("Fournisseur non configuré.", request);
    }

    const system = request.messages
      .filter((m) => m.role === "system")
      .map((m) => m.content)
      .join("\n");
    const user = request.messages
      .filter((m) => m.role === "user")
      .map((m) => m.content)
      .join("\n\n");

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
          body: JSON.stringify({
            systemInstruction: system ? { parts: [{ text: system }] } : undefined,
            contents: [{ role: "user", parts: [{ text: user }] }],
            generationConfig: {
              temperature: request.temperature ?? 0.7,
              maxOutputTokens: request.maxOutputTokens ?? 1024,
            },
          }),
          cache: "no-store",
          // Un appel IA ne doit jamais bloquer une mission indéfiniment.
          signal: AbortSignal.timeout(25_000),
        },
      );

      if (!response.ok) {
        return this.failure(`Service indisponible (${response.status}).`, request);
      }

      const data = (await response.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
        usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number };
      };

      const text =
        data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";

      if (!text.trim()) return this.failure("Réponse vide.", request);

      return {
        ok: true,
        text,
        model: this.model,
        inputTokens: data.usageMetadata?.promptTokenCount ?? estimateTokens(user),
        outputTokens: data.usageMetadata?.candidatesTokenCount ?? estimateTokens(text),
        offline: false,
      };
    } catch (error) {
      const reason = error instanceof Error && error.name === "TimeoutError" ? "Délai dépassé." : "Service injoignable.";
      return this.failure(reason, request);
    }
  }

  private failure(error: string, request: AiRequest): AiResponse {
    return {
      ok: false,
      text: "",
      model: this.model,
      inputTokens: estimateTokens(request.messages.map((m) => m.content).join(" ")),
      outputTokens: 0,
      offline: false,
      error,
    };
  }
}
