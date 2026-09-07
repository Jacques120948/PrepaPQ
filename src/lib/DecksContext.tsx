import { createContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { chargerJeux, type ErreurChargementJeu } from "./decks";
import type { Deck } from "./schema";

export interface EtatDecks {
  chargement: boolean;
  decks: Deck[];
  erreurs: ErreurChargementJeu[];
}

export const DecksContext = createContext<EtatDecks | null>(null);

export function DecksProvider({ children }: { children: ReactNode }) {
  const [etat, setEtat] = useState<EtatDecks>({
    chargement: true,
    decks: [],
    erreurs: [],
  });

  useEffect(() => {
    let annule = false;

    chargerJeux().then(({ decks, erreurs }) => {
      if (!annule) {
        setEtat({ chargement: false, decks, erreurs });
      }
    });

    return () => {
      annule = true;
    };
  }, []);

  const valeur = useMemo(() => etat, [etat]);

  return <DecksContext.Provider value={valeur}>{children}</DecksContext.Provider>;
}
