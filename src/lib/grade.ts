/**
 * Barème suisse : note = points / total × 5 + 1, arrondie à une décimale.
 * Note ≥ 4 : bleu (suffisant). Note < 4 : rouge (insuffisant).
 */

export interface ResultatNote {
  note: number;
  couleur: "bleu" | "rouge";
}

export function calculerNote(points: number, total: number): ResultatNote {
  if (total <= 0) {
    throw new Error("le total de points doit être strictement positif");
  }
  if (points < 0 || points > total) {
    throw new Error("le nombre de points doit être compris entre 0 et le total");
  }

  const noteBrute = (points / total) * 5 + 1;
  const note = Math.round(noteBrute * 10) / 10;

  return {
    note,
    couleur: note >= 4 ? "bleu" : "rouge",
  };
}
