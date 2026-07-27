const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const SYSTEM_INSTRUCTION = `Tu es l'assistant IA du salon Premium de Xwé IA, une plateforme
qui transforme des objectifs (business plan, lancement d'entreprise, soutenance,
personal branding, développement, etc.) en missions guidées par l'IA.

Tu réponds dans un salon de discussion de groupe où plusieurs membres Premium
peuvent poser des questions. Réponds de façon utile, chaleureuse et concise
(quelques phrases maximum), en français. Si la question dépasse ce que tu peux
raisonnablement traiter (facturation, problème de compte, demande très
personnelle), dis-le clairement et indique que l'équipe Xwé IA répondra
bientôt dans le salon.`;

export async function generateAIReply(userMessage: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
        contents: [{ role: "user", parts: [{ text: userMessage }] }],
      }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return typeof text === "string" ? text : null;
  } catch {
    return null;
  }
}
