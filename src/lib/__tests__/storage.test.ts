import { beforeEach, describe, expect, it } from "vitest";
import { NIVEAU_MAX, NIVEAU_MIN } from "../leitner";
import {
  chargerFiltreMetier,
  chargerProgression,
  effacerProgressionJeu,
  effacerProgressionLocale,
  lireAvancementJeu,
  lireDernierQuiz,
  sauvegarderFiltreMetier,
  sauvegarderProgression,
  sauvegarderResultatQuiz,
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

describe("lireAvancementJeu", () => {
  it("vaut 0 sue sur le total quand aucune progression n'existe", () => {
    expect(lireAvancementJeu("deck-1", "2026-09", 4)).toEqual({ sues: 0, total: 4 });
  });

  it("compte les cartes ayant atteint le niveau maximal", () => {
    sauvegarderProgression("deck-1", "2026-09", [NIVEAU_MAX, NIVEAU_MIN, NIVEAU_MAX, 2]);
    expect(lireAvancementJeu("deck-1", "2026-09", 4)).toEqual({ sues: 2, total: 4 });
  });

  it("ignore une progression d'une autre version", () => {
    sauvegarderProgression("deck-1", "2026-09", [NIVEAU_MAX, NIVEAU_MAX]);
    expect(lireAvancementJeu("deck-1", "2026-10", 2)).toEqual({ sues: 0, total: 2 });
  });
});

describe("résultat de quiz", () => {
  it("n'a pas de dernier résultat avant la première tentative", () => {
    expect(lireDernierQuiz("deck-1", "2026-09", 3)).toBeNull();
  });

  it("enregistre et retrouve le dernier résultat de quiz", () => {
    sauvegarderResultatQuiz("deck-1", "2026-09", 3, 8, 10);
    const resultat = lireDernierQuiz("deck-1", "2026-09", 3);
    expect(resultat?.score).toBe(8);
    expect(resultat?.total).toBe(10);
    expect(typeof resultat?.date).toBe("string");
  });

  it("n'écrase pas la progression des cartes en enregistrant un résultat de quiz", () => {
    sauvegarderProgression("deck-1", "2026-09", [NIVEAU_MAX, NIVEAU_MIN, NIVEAU_MAX]);
    sauvegarderResultatQuiz("deck-1", "2026-09", 3, 5, 10);
    expect(chargerProgression("deck-1", "2026-09", 3).niveaux).toEqual([
      NIVEAU_MAX,
      NIVEAU_MIN,
      NIVEAU_MAX,
    ]);
  });

  it("n'écrase pas le dernier résultat de quiz en enregistrant la progression des cartes", () => {
    sauvegarderResultatQuiz("deck-1", "2026-09", 3, 7, 10);
    sauvegarderProgression("deck-1", "2026-09", [NIVEAU_MAX, NIVEAU_MIN, NIVEAU_MIN]);
    expect(lireDernierQuiz("deck-1", "2026-09", 3)?.score).toBe(7);
  });

  it("efface le dernier résultat de quiz quand la version du jeu change", () => {
    sauvegarderResultatQuiz("deck-1", "2026-09", 3, 9, 10);
    expect(lireDernierQuiz("deck-1", "2026-10", 3)).toBeNull();
  });
});

describe("effacerProgressionJeu", () => {
  it("efface la progression et le dernier quiz d'un seul jeu", () => {
    sauvegarderProgression("deck-1", "2026-09", [NIVEAU_MAX, NIVEAU_MAX]);
    sauvegarderResultatQuiz("deck-1", "2026-09", 2, 6, 10);
    sauvegarderProgression("deck-2", "2026-09", [NIVEAU_MAX]);

    effacerProgressionJeu("deck-1");

    expect(lireAvancementJeu("deck-1", "2026-09", 2)).toEqual({ sues: 0, total: 2 });
    expect(lireDernierQuiz("deck-1", "2026-09", 2)).toBeNull();
    expect(lireAvancementJeu("deck-2", "2026-09", 1)).toEqual({ sues: 1, total: 1 });
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
