import { Fragment } from "react";

/**
 * Rendu Markdown minimal, volontairement sans dépendance.
 *
 * Les livrables sont générés par Xwé IA à partir des réponses de
 * l'utilisateur : on n'a besoin que des titres, listes, gras et paragraphes.
 * Rien n'est interprété comme du HTML, donc aucune injection possible.
 */
export function Markdown({ content }: { content: string }) {
  const blocks = content.split("\n");
  const nodes: React.ReactNode[] = [];
  let list: string[] = [];

  const flushList = (key: string) => {
    if (list.length === 0) return;
    nodes.push(
      <ul key={key} className="my-3 space-y-1.5 pl-5">
        {list.map((item, i) => (
          <li key={i} className="list-disc text-sm leading-relaxed text-ivoire-dim marker:text-or">
            {inline(item)}
          </li>
        ))}
      </ul>,
    );
    list = [];
  };

  blocks.forEach((line, index) => {
    const key = `b-${index}`;

    if (line.startsWith("- ") || line.startsWith("* ")) {
      list.push(line.slice(2));
      return;
    }
    flushList(`l-${index}`);

    if (line.startsWith("### ")) {
      nodes.push(
        <h4 key={key} className="mt-5 font-display text-sm text-ivoire">
          {inline(line.slice(4))}
        </h4>,
      );
    } else if (line.startsWith("## ")) {
      nodes.push(
        <h3 key={key} className="mt-6 border-l-2 border-or/50 pl-3 font-display text-base text-ivoire">
          {inline(line.slice(3))}
        </h3>,
      );
    } else if (line.startsWith("# ")) {
      nodes.push(
        <h2 key={key} className="mt-2 font-display text-lg text-ivoire">
          {inline(line.slice(2))}
        </h2>,
      );
    } else if (line.trim() === "") {
      // Ligne vide : le rythme vient des marges, on n'ajoute rien.
    } else {
      nodes.push(
        <p key={key} className="my-2.5 whitespace-pre-wrap text-sm leading-relaxed text-ivoire-dim">
          {inline(line)}
        </p>,
      );
    }
  });

  flushList("l-end");

  return <div className="max-w-none">{nodes}</div>;
}

/** Gras `**texte**` uniquement — suffisant pour nos livrables. */
function inline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-medium text-ivoire">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}
