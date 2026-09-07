import { beforeEach, describe, expect, it } from "vitest";
import { NIVEAU_MIN } from "../leitner";
import {
  chargerFiltreMetier,
  chargerProgression,
  effacerProgressionLocale,
  sauvegarderFiltreMetier,
  sauvegarderProgression,
} from "../storage";

beforeEach(() => {
  window.localStorage.clear();
});

describe("chargerProgression", () => {
  it("crée une progression fraîche au premier lancement, sans la signaler comme réinitialisation", () => {
    const resultat = chargerProgression("deck-1", "2026-09", 3);
    expect(resultat.niveaux).toEqual([NIVEAU_MIN, NIVEAU_MIN, NIVEAU_MIN]);
    expect(resultat.reinitialisee).toBe(false);
  });

  it("retrouve la progression sauvegardée pour la même version", () => {
    sauvegarderProgression("deck-1", "2026-09", [2, 3, 1]);
    const resultat = chargerProgression("deck-1", "2026-09", 3);
    expect(resultat.niveaux).toEqual([2, 3, 1]);
    expect(resultat.reinitialisee).toBe(false);
  });

  it("réinitialise et le signale quand la version du jeu change", () => {
    sauvegarderProgression("deck-1", "2026-09", [3, 3, 3]);
    const resultat = chargerProgression("deck-1", "2026-10", 3);
    expect(resultat.niveaux).toEqual([NIVEAU_MIN, NIVEAU_MIN, NIVEAU_MIN]);
    expect(resultat.reinitialisee).toBe(true);
  });

  it("réinitialise si le nombre de cartes ne correspond plus à la progression stockée", () => {
    sauvegarderProgression("deck-1", "2026-09", [3, 3]);
    const resultat = chargerProgression("deck-1", "2026-09", 4);
    expect(resultat.niveaux).toHaveLength(4);
    expect(resultat.reinitialisee).toBe(true);
  });

  it("n'affecte pas la progression d'un autre jeu", () => {
    sauvegarderProgression("deck-1", "2026-09", [3, 3]);
    const resultat = chargerProgression("deck-2", "2026-09", 2);
    expect(resultat.niveaux).toEqual([NIVEAU_MIN, NIVEAU_MIN]);
    expect(resultat.reinitialisee).toBe(false);
  });
});

describe("filtre métier", () => {
  it("vaut « tous » par défaut", () => {
    expect(chargerFiltreMetier()).toBe("tous");
  });

  it("retrouve le filtre sauvegardé", () => {
    sauvegarderFiltreMetier("tolier");
    expect(chargerFiltreMetier()).toBe("tolier");
  });
});

describe("effacerProgressionLocale", () => {
  it("efface toute la progression et les préférences", () => {
    sauvegarderProgression("deck-1", "2026-09", [3, 3]);
    sauvegarderFiltreMetier("peintre");

    effacerProgressionLocale();

    expect(chargerProgression("deck-1", "2026-09", 2).niveaux).toEqual([
      NIVEAU_MIN,
      NIVEAU_MIN,
    ]);
    expect(chargerFiltreMetier()).toBe("tous");
  });
});
