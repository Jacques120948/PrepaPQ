import { describe, expect, it } from "vitest";
import {
  NIVEAU_MAX,
  NIVEAU_MIN,
  carteCourante,
  demarrerSession,
  pourcentageMaitrise,
  repondre,
} from "../leitner";

describe("demarrerSession", () => {
  it("place les cartes de niveau le plus bas en tête de file", () => {
    const session = demarrerSession([3, 1, 2]);
    expect(session.file).toEqual([1, 2, 0]);
  });

  it("refuse un jeu sans carte", () => {
    expect(() => demarrerSession([])).toThrow();
  });
});

describe("repondre", () => {
  it("une carte sue monte de niveau", () => {
    const session = demarrerSession([1]);
    const resultat = repondre(session, true);
    expect(resultat.niveauCarte).toBe(2);
  });

  it("une carte ratée revient au niveau 1 et réapparaît dans la session", () => {
    const session = demarrerSession([2, 2]);
    const resultat = repondre(session, false);
    expect(resultat.niveauCarte).toBe(NIVEAU_MIN);
    expect(resultat.session.file).toContain(0);
    expect(resultat.sessionTerminee).toBe(false);
  });

  it("une carte qui atteint le niveau maximal ne revient plus dans la session", () => {
    let session = demarrerSession([NIVEAU_MAX - 1]);
    const resultat = repondre(session, true);
    expect(resultat.niveauCarte).toBe(NIVEAU_MAX);
    expect(resultat.session.file).not.toContain(0);
    expect(resultat.sessionTerminee).toBe(true);
  });

  it("la session se termine quand toutes les cartes atteignent le niveau maximal", () => {
    let session = demarrerSession([NIVEAU_MAX - 1, NIVEAU_MAX - 1]);
    let resultat = repondre(session, true);
    expect(resultat.sessionTerminee).toBe(false);
    resultat = repondre(resultat.session, true);
    expect(resultat.sessionTerminee).toBe(true);
    expect(carteCourante(resultat.session)).toBeNull();
  });

  it("refuse de répondre quand la session est déjà terminée", () => {
    const session = { file: [], niveaux: [NIVEAU_MAX] };
    expect(() => repondre(session, true)).toThrow();
  });

  it("une carte ratée puis reprise finit par sortir de la session", () => {
    let session = demarrerSession([NIVEAU_MAX - 1]);
    let resultat = repondre(session, false);
    expect(resultat.sessionTerminee).toBe(false);
    // La carte revient forcément en tête à un moment donné (file courte).
    while (!resultat.sessionTerminee) {
      resultat = repondre(resultat.session, true);
    }
    expect(resultat.session.niveaux[0]).toBe(NIVEAU_MAX);
  });
});

describe("pourcentageMaitrise", () => {
  it("vaut 0 sur un jeu tout juste commencé", () => {
    expect(pourcentageMaitrise([1, 1, 1, 1])).toBe(0);
  });

  it("vaut 100 quand toutes les cartes sont au niveau maximal", () => {
    expect(pourcentageMaitrise([NIVEAU_MAX, NIVEAU_MAX])).toBe(100);
  });

  it("calcule un pourcentage arrondi", () => {
    expect(pourcentageMaitrise([NIVEAU_MAX, 1, 1])).toBe(33);
  });
});
