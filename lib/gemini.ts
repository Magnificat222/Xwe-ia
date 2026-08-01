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

export interface QuizQuestionData {
  question: string;
  options: string[]; // exactly 4
  correctIndex: number; // 0-3
  explanation: string;
}

const QUIZ_SYSTEM_INSTRUCTION = `Tu es un générateur de quiz pour Xwé IA, une plateforme
d'apprentissage de l'IA appliquée au business, au marketing, aux études et à la
productivité. Tu génères des questions à choix multiples originales, précises et
factuellement correctes, en français, adaptées au niveau demandé. Varie la
formulation et les angles à chaque génération pour ne jamais répéter les mêmes
questions. Réponds UNIQUEMENT avec un tableau JSON valide, sans texte avant ni
après, sans balises markdown, au format exact suivant :
[{"question": "...", "options": ["...", "...", "...", "..."], "correctIndex": 0, "explanation": "..."}]
Chaque question a exactement 4 options, correctIndex est l'index (0 à 3) de la
bonne réponse, et explanation est une phrase courte justifiant la réponse.`;

// Falls back to a small built-in question bank if Gemini is unavailable or
// returns something unparseable, so the quiz never hard-fails for the user.
const FALLBACK_QUESTIONS: QuizQuestionData[] = [
  {
    question: "Que signifie l'acronyme « IA » ?",
    options: ["Intelligence Artificielle", "Interface Automatisée", "Information Analytique", "Interaction Adaptative"],
    correctIndex: 0,
    explanation: "IA signifie Intelligence Artificielle.",
  },
  {
    question: "Qu'est-ce qu'un prompt, dans le contexte de l'IA générative ?",
    options: [
      "Un bug du modèle",
      "L'instruction ou la question donnée à l'IA",
      "Le nom du modèle utilisé",
      "Une mise à jour du logiciel",
    ],
    correctIndex: 1,
    explanation: "Un prompt est l'instruction fournie à l'IA pour orienter sa réponse.",
  },
];

export async function generateQuizQuestions(
  topic: string,
  level: string,
  count: number
): Promise<QuizQuestionData[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return fallbackSet(count);

  try {
    const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: QUIZ_SYSTEM_INSTRUCTION }] },
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Génère exactement ${count} questions de niveau ${level} sur le thème : "${topic}".`,
              },
            ],
          },
        ],
        generationConfig: { temperature: 0.9 },
      }),
    });

    if (!res.ok) return fallbackSet(count);

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof text !== "string") return fallbackSet(count);

    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    if (
      !Array.isArray(parsed) ||
      parsed.length === 0 ||
      !parsed.every(
        (q) =>
          typeof q.question === "string" &&
          Array.isArray(q.options) &&
          q.options.length === 4 &&
          typeof q.correctIndex === "number" &&
          typeof q.explanation === "string"
      )
    ) {
      return fallbackSet(count);
    }

    return parsed.slice(0, count);
  } catch {
    return fallbackSet(count);
  }
}

function fallbackSet(count: number): QuizQuestionData[] {
  const result: QuizQuestionData[] = [];
  for (let i = 0; i < count; i++) {
    result.push(FALLBACK_QUESTIONS[i % FALLBACK_QUESTIONS.length]);
  }
  return result;
}
