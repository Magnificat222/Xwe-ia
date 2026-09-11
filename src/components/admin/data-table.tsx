import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Table d'administration.
 *
 * Sur mobile, elle bascule en liste de cartes : une table à sept colonnes
 * n'est pas utilisable au pouce, et l'administration doit rester consultable
 * depuis un téléphone.
 */
export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  /** Colonne masquée sur les petits écrans. */
  secondary?: boolean;
  align?: "left" | "right";
}

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  empty = "Aucun élément.",
  title,
}: {
  columns: Column<T>[];
  rows: T[];
  empty?: string;
  title?: (row: T) => ReactNode;
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-card border border-ivoire/10 bg-noir-elevated px-4 py-8 text-center text-sm text-ivoire-dim">
        {empty}
      </div>
    );
  }

  return (
    <>
      {/* Vue table — desktop */}
      <div className="hidden overflow-x-auto rounded-card border border-ivoire/10 bg-noir-elevated lg:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ivoire/10">
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cn(
                    "px-4 py-3 font-mono text-[0.62rem] font-normal uppercase tracking-[0.16em] text-ivoire-faint",
                    column.align === "right" ? "text-right" : "text-left",
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-ivoire/6 transition-colors last:border-0 hover:bg-ivoire/[0.03]"
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      "px-4 py-3 align-middle text-ivoire-dim",
                      column.align === "right" ? "text-right" : "text-left",
                    )}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Vue cartes — mobile et tablette */}
      <ul className="space-y-2.5 lg:hidden">
        {rows.map((row) => (
          <li
            key={row.id}
            className="rounded-card border border-ivoire/10 bg-noir-elevated p-4"
          >
            {title && <div className="mb-3 text-sm text-ivoire">{title(row)}</div>}
            <dl className="space-y-2">
              {columns
                .filter((column) => !column.secondary)
                .map((column) => (
                  <div key={column.key} className="flex items-start justify-between gap-3">
                    <dt className="shrink-0 text-xs text-ivoire-faint">{column.header}</dt>
                    <dd className="min-w-0 text-right text-sm text-ivoire-dim">
                      {column.render(row)}
                    </dd>
                  </div>
                ))}
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
}
