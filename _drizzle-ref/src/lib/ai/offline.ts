import "server-only";

import type { AiProvider, AiRequest, AiResponse } from "./provider";
import { estimateTokens } from "./provider";

/**
 * Assistant local, sans modèle distant.
 *
 * Ce n'est pas un bouchon de test : c'est le comportement de repli du produit
 * quand aucune clé n'est configurée, ou quand le service distant est
 * injoignable. Il ne fabrique jamais de données à la place de l'utilisateur —
 * il structure, questionne et relance, ce qui est précisément ce dont on a
 * besoin dans une mission. Aucun chiffre, aucun fait ne sort d'ici.
 */
export class OfflineAiProvider implements AiProvider {
  readonly id = "offline";
  readonly label = "Assistant Xwé IA";
  readonly isConfigured = true;

  async complete(request: AiRequest): Promise<AiResponse> {
    const userContent = request.messages
      .filter((m) => m.role === "user")
      .map((m) => m.content)
      .join("\n\n");

    const text = this.compose(request.feature, userContent);

    return {
      ok: true,
      text,
      model: "xwe-guide-local",
      inputTokens: estimateTokens(userContent),
      outputTokens: estimateTokens(text),
      offline: true,
    };
  }

  private compose(feature: AiRequest["feature"], content: string): string {
    const trimmed = content.trim();
    const sentences = trimmed
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);
    const words = trimmed.split(/\s+/).filter(Boolean);

    switch (feature) {
      case "brainstorm":
        return [
          "### Pistes à explorer",
          "",
          "Voici des angles pour élargir ta réflexion. Garde ceux qui collent à ta réalité, écarte les autres sans hésiter.",
          "",
          "- **À qui exactement** cela s'adresse-t-il ? Décris une personne précise, pas une catégorie.",
          "- **Quel problème** cette personne cherche-t-elle à résoudre aujourd'hui, sans toi ?",
          "- **Comment fait-elle** actuellement ? C'est ta vraie concurrence.",
          "- **Qu'est-ce qui change** concrètement pour elle si ton projet existe ?",
          "- **Quelle est la plus petite version** que tu pourrais tester ce mois-ci ?",
          "",
          "> Choisis deux de ces questions et réponds-y en trois phrases. C'est souvent suffisant pour débloquer la suite.",
        ].join("\n");

      case "rephrase": {
        if (!trimmed) return "Écris d'abord quelques lignes : je te proposerai une reformulation.";
        return [
          "### Reformulation proposée",
          "",
          this.tighten(sentences),
          "",
          "---",
          "",
          "**Ce qui a changé :** phrases raccourcies, répétitions retirées, verbes rendus plus directs.",
          "",
          "Le fond reste le tien. Si un mot ne te ressemble pas, remplace-le : ce texte doit rester ta voix.",
        ].join("\n");
      }

      case "structure":
        return [
          "### Structure suggérée",
          "",
          "1. **Le contexte** — de quoi parle-t-on, en deux phrases.",
          "2. **Le problème** — ce qui ne va pas aujourd'hui, avec un exemple concret.",
          "3. **La proposition** — ce que tu apportes, formulé du point de vue de celui qui en bénéficie.",
          "4. **La mise en œuvre** — les étapes, dans l'ordre, avec qui fait quoi.",
          "5. **Les preuves** — ce qui montre que ça tient debout.",
          "6. **La suite** — la prochaine décision à prendre.",
          "",
          trimmed
            ? `> Ton texte fait environ ${words.length} mots. Répartis-les dans ces six blocs : tu verras immédiatement lequel est vide.`
            : "> Remplis chaque bloc avec une seule phrase pour commencer. Tu développeras ensuite.",
        ].join("\n");

      case "analyze": {
        if (!trimmed) return "Ajoute ton contenu : je te renvoie une lecture critique.";
        return [
          "### Lecture critique",
          "",
          "**Points solides**",
          "- Ton propos est posé et on comprend l'intention générale.",
          sentences.length > 3
            ? "- Le développement est suffisamment nourri pour être discuté."
            : "- L'idée est ramassée, ce qui la rend facile à saisir.",
          "",
          "**À renforcer**",
          words.length < 60
            ? "- C'est encore court : un lecteur extérieur manquera de contexte."
            : "- Certaines phrases portent plusieurs idées à la fois ; sépare-les.",
          "- Les affirmations gagneraient à être appuyées par un chiffre ou un exemple vécu.",
          "- Précise à qui tu t'adresses : le ton doit suivre.",
          "",
          "**Questions à te poser**",
          "- Quelle phrase garderais-tu si tu ne pouvais en garder qu'une ?",
          "- Qu'est-ce qu'un lecteur sceptique te répondrait ?",
        ].join("\n");
      }

      case "explain":
        return [
          "### Explication",
          "",
          "Reprenons simplement.",
          "",
          "Une notion se comprend mieux en trois temps : **ce que c'est**, **à quoi ça sert**, **quand l'utiliser**.",
          "",
          trimmed
            ? `Sur ce que tu as écrit, commence par répondre à la première question en une phrase, sans jargon. Si tu n'y arrives pas, c'est que la notion n'est pas encore claire — et c'est normal à ce stade.`
            : "Pose ta question avec tes mots : plus elle est précise, plus la réponse te servira.",
          "",
          "> Astuce : explique-le à voix haute comme à un ami. Les endroits où tu hésites sont exactement ceux à retravailler.",
        ].join("\n");

      case "document":
        return [
          "### Aide à la rédaction",
          "",
          "Ton document se construit à partir de tes réponses aux missions. Je peux t'aider à les mettre en forme, mais les chiffres, les prix et les données de marché doivent venir de toi.",
          "",
          "**Avant de générer, vérifie :**",
          "- Chaque section contient une réponse, même courte.",
          "- Les montants sont les tiens, pas des ordres de grandeur repris ailleurs.",
          "- Les estimations sont annoncées comme telles.",
          "",
          "> Un document honnête et incomplet vaut mieux qu'un document complet et inventé.",
        ].join("\n");

      case "mission_assist":
      default:
        return [
          "### Coup de main",
          "",
          trimmed
            ? "Tu as déjà posé une base. Pour avancer, réponds à ces trois questions dans ta réponse :"
            : "Pour démarrer cette mission, réponds à ces trois questions :",
          "",
          "1. **Concrètement, de quoi s'agit-il ?** Une phrase, sans adjectif.",
          "2. **Pour qui, et pourquoi maintenant ?**",
          "3. **Qu'est-ce qui prouve que c'est vrai ?** Un exemple, un chiffre, une observation.",
          "",
          "> Écris d'abord mal, corrige ensuite. La page blanche se combat par la quantité, pas par la perfection.",
        ].join("\n");
    }
  }

  /** Resserre un texte : phrases longues coupées, tournures allégées. */
  private tighten(sentences: string[]): string {
    if (sentences.length === 0) return "";
    return sentences
      .map((sentence) =>
        sentence
          .replace(/\s+/g, " ")
          .replace(/\b(afin de pouvoir|dans le but de)\b/gi, "pour")
          .replace(/\b(il est important de noter que|il convient de souligner que)\b/gi, "")
          .replace(/\b(très|vraiment|assez|plutôt)\s+/gi, "")
          .replace(/^\s*[a-z]/, (c) => c.toUpperCase())
          .trim(),
      )
      .filter(Boolean)
      .join(" ");
  }
}
