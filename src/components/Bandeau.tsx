import type { ReactNode } from "react";

type ToneBandeau = "info" | "succes" | "alerte";

const STYLES: Record<ToneBandeau, string> = {
  info: "bg-tole text-encre border-encre/20",
  succes: "bg-bleu/10 text-bleu-fonce border-bleu/30",
  alerte: "bg-rouge/10 text-rouge border-rouge/30",
};

interface BandeauProps {
  ton?: ToneBandeau;
  children: ReactNode;
  action?: ReactNode;
}

/** Message d'état explicite : dit ce qui se passe et, si possible, quoi faire. */
export function Bandeau({ ton = "info", children, action }: BandeauProps) {
  return (
    <div
      role="status"
      className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm ${STYLES[ton]}`}
    >
      <p className="font-medium">{children}</p>
      {action}
    </div>
  );
}
