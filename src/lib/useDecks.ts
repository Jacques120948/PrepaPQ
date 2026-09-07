import { useContext, useMemo } from "react";
import { DecksContext, type EtatDecks } from "./DecksContext";
import type { Deck } from "./schema";

export function useDecks(): EtatDecks {
  const contexte = useContext(DecksContext);
  if (!contexte) {
    throw new Error("useDecks doit être utilisé à l'intérieur de <DecksProvider>");
  }
  return contexte;
}

export function useDeck(deckId: string | undefined): Deck | undefined {
  const { decks } = useDecks();
  return useMemo(() => decks.find((deck) => deck.id === deckId), [decks, deckId]);
}
