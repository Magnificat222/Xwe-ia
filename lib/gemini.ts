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
formulation, les angles et les exemples à chaque génération : ne repose jamais
sur un jeu fixe de questions, invente-en de nouvelles à chaque appel. Réponds
UNIQUEMENT avec un tableau JSON valide, sans texte avant ni après, sans balises
markdown, au format exact suivant :
[{"question": "...", "options": ["...", "...", "...", "..."], "correctIndex": 0, "explanation": "..."}]
Chaque question a exactement 4 options, correctIndex est l'index (0 à 3) de la
bonne réponse, et explanation est une phrase courte justifiant la réponse.`;

// Falls back to a small built-in question bank if Gemini is unavailable or
// returns something unparseable, so the quiz never hard-fails for the user.
// Kept deliberately varied (10 questions) so a fallback run doesn't feel
// like "always the same 2 questions" while the real cause gets fixed.
const FALLBACK_QUESTIONS: QuizQuestionData[] = [
  {
    question: "Que signifie l'acronyme « IA » ?",
    options: ["Intelligence Artificielle", "Interface Automatisée", "Information Analytique", "Interaction Adaptative"],
    correctIndex: 0,
    explanation: "IA signifie Intelligence Artificielle.",
  },
  {
    question: "Qu'est-ce qu'un prompt, dans le contexte de l'IA générative ?",
    options: ["Un bug du modèle", "L'instruction ou la question donnée à l'IA", "Le nom du modèle utilisé", "Une mise à jour du logiciel"],
    correctIndex: 1,
    explanation: "Un prompt est l'instruction fournie à l'IA pour orienter sa réponse.",
  },
  {
    question: "Que veut dire « LLM » ?",
    options: ["Large Language Model", "Logical Learning Machine", "Linked Language Memory", "Local Language Module"],
    correctIndex: 0,
    explanation: "LLM signifie « Large Language Model », un grand modèle de langage.",
  },
  {
    question: "Qu'est-ce qu'une hallucination, pour une IA générative ?",
    options: ["Un bug d'affichage", "Une réponse fausse présentée avec assurance", "Une panne de serveur", "Un message d'erreur"],
    correctIndex: 1,
    explanation: "Une hallucination est une information incorrecte générée par l'IA de façon convaincante.",
  },
  {
    question: "Quel est l'intérêt principal du « prompt engineering » ?",
    options: ["Programmer l'IA en Python", "Obtenir de meilleures réponses en formulant mieux la demande", "Installer l'IA sur un serveur", "Créer une base de données"],
    correctIndex: 1,
    explanation: "Le prompt engineering consiste à formuler ses instructions pour obtenir de meilleurs résultats.",
  },
  {
    question: "Qu'est-ce qu'un agent IA autonome ?",
    options: ["Un chatbot simple", "Une IA capable d'enchaîner des actions vers un objectif sans supervision constante", "Un antivirus", "Un langage de programmation"],
    correctIndex: 1,
    explanation: "Un agent autonome peut planifier et exécuter plusieurs étapes pour atteindre un objectif donné.",
  },
  {
    question: "Que permet le « fine-tuning » d'un modèle d'IA ?",
    options: ["Le rendre plus rapide à démarrer", "L'adapter à un usage ou un jeu de données spécifique", "Réduire sa taille de stockage", "Changer sa licence"],
    correctIndex: 1,
    explanation: "Le fine-tuning ré-entraîne un modèle existant sur des données ciblées pour l'adapter à un usage précis.",
  },
  {
    question: "Dans le contexte de l'IA, que désigne le « contexte » (context window) ?",
    options: ["L'historique visible que l'IA peut prendre en compte dans une conversation", "Le thème visuel de l'interface", "Le fuseau horaire du serveur", "La langue par défaut"],
    correctIndex: 0,
    explanation: "La fenêtre de contexte est la quantité de texte que le modèle peut « voir » à un instant donné.",
  },
  {
    question: "Qu'est-ce que le « prompt chaining » ?",
    options: ["Envoyer le même prompt plusieurs fois", "Enchaîner plusieurs prompts, chacun s'appuyant sur le résultat du précédent", "Chiffrer un prompt", "Traduire un prompt automatiquement"],
    correctIndex: 1,
    explanation: "Le prompt chaining décompose une tâche complexe en plusieurs étapes de prompts liés entre eux.",
  },
  {
    question: "Pourquoi est-il recommandé de vérifier les réponses d'une IA générative ?",
    options: ["Parce qu'elle peut halluciner ou se tromper avec assurance", "Parce qu'elle répond toujours au hasard", "Parce qu'elle ne comprend jamais la question", "Ce n'est pas nécessaire"],
    correctIndex: 0,
    explanation: "Une IA générative peut produire des erreurs factuelles de façon convaincante, d'où l'importance de vérifier.",
  },
];

export async function generateQuizQuestions(
  topic: string,
  level: string,
  count: number
): Promise<QuizQuestionData[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("[quiz] GEMINI_API_KEY manquante — utilisation du secours.");
    return fallbackSet(count);
  }

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
                text: `Génère exactement ${count} questions de niveau ${level} sur le thème : "${topic}". Assure-toi qu'elles soient différentes de questions génériques déjà vues — sois créatif dans les angles abordés.`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.9,
          responseMimeType: "application/json",
          maxOutputTokens: 4096,
          // gemini-2.5-flash "thinks" by default, which can eat the whole
          // token budget on internal reasoning before writing the actual
          // JSON — starving the real output on a request this size. This
          // task doesn't need step-by-step reasoning, so we turn it off.
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    });

    if (!res.ok) {
      console.error("[quiz] Réponse Gemini non OK:", res.status, await res.text().catch(() => ""));
      return fallbackSet(count);
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof text !== "string" || text.trim() === "") {
      console.error("[quiz] Texte Gemini vide ou absent:", JSON.stringify(data).slice(0, 500));
      return fallbackSet(count);
    }

    const parsed = parseQuestionsJson(text);
    if (!parsed) {
      console.error("[quiz] Impossible de parser le JSON de Gemini:", text.slice(0, 500));
      return fallbackSet(count);
    }

    return parsed.slice(0, count);
  } catch (err) {
    console.error("[quiz] Erreur lors de l'appel Gemini:", err);
    return fallbackSet(count);
  }
}

function parseQuestionsJson(rawText: string): QuizQuestionData[] | null {
  let text = rawText.trim().replace(/```json|```/g, "").trim();

  // If the model added any stray prose around the array despite
  // instructions, extract just the [ ... ] portion.
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start !== -1 && end !== -1 && end > start) {
    text = text.slice(start, end + 1);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }

  if (!Array.isArray(parsed) || parsed.length === 0) return null;

  const normalized: QuizQuestionData[] = [];
  for (const item of parsed) {
    if (
      !item ||
      typeof item.question !== "string" ||
      !Array.isArray(item.options) ||
      item.options.length !== 4 ||
      !item.options.every((o: unknown) => typeof o === "string") ||
      typeof item.explanation !== "string"
    ) {
      return null;
    }
    const correctIndex = Number(item.correctIndex);
    if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex > 3) {
      return null;
    }
    normalized.push({
      question: item.question,
      options: item.options,
      correctIndex,
      explanation: item.explanation,
    });
  }

  return normalized;
}

function fallbackSet(count: number): QuizQuestionData[] {
  const shuffled = [...FALLBACK_QUESTIONS].sort(() => Math.random() - 0.5);
  const result: QuizQuestionData[] = [];
  for (let i = 0; i < count; i++) {
    result.push(shuffled[i % shuffled.length]);
  }
  return result;
}
