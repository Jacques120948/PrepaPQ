import { describe, expect, it } from "vitest";
import { deckSchema, deckIndexSchema } from "../schema";

const deckValide = {
  id: "tolier-pq-redressage",
  titre: "Redressage et débosselage",
  metier: "tolier",
  annee: 4,
  module: "Préparation PQ",
  version: "2026-09",
  cartes: [{ recto: "Question ?", verso: "Réponse." }],
  quiz: [
    {
      question: "Une question ?",
      options: ["a", "b", "c", "d"],
      reponse: 0,
      explication: "Une explication.",
    },
  ],
};

describe("deckSchema", () => {
  it("accepte un jeu bien formé", () => {
    const resultat = deckSchema.safeParse(deckValide);
    expect(resultat.success).toBe(true);
  });

  it("rejette un identifiant mal formé", () => {
    const resultat = deckSchema.safeParse({ ...deckValide, id: "Mauvais_ID" });
    expect(resultat.success).toBe(false);
  });

  it("rejette un métier inconnu", () => {
    const resultat = deckSchema.safeParse({ ...deckValide, metier: "soudeur" });
    expect(resultat.success).toBe(false);
  });

  it("rejette une année hors de la plage 1-4", () => {
    const resultat = deckSchema.safeParse({ ...deckValide, annee: 5 });
    expect(resultat.success).toBe(false);
  });

  it("rejette une version qui ne suit pas le format AAAA-MM", () => {
    const resultat = deckSchema.safeParse({ ...deckValide, version: "2026" });
    expect(resultat.success).toBe(false);
  });

  it("rejette un jeu sans carte", () => {
    const resultat = deckSchema.safeParse({ ...deckValide, cartes: [] });
    expect(resultat.success).toBe(false);
  });

  it("rejette un jeu sans question de quiz", () => {
    const resultat = deckSchema.safeParse({ ...deckValide, quiz: [] });
    expect(resultat.success).toBe(false);
  });

  it("rejette un index de réponse en dehors des options", () => {
    const resultat = deckSchema.safeParse({
      ...deckValide,
      quiz: [{ ...deckValide.quiz[0], reponse: 9 }],
    });
    expect(resultat.success).toBe(false);
  });

  it("rejette des cartes en double (même recto, insensible à la casse)", () => {
    const resultat = deckSchema.safeParse({
      ...deckValide,
      cartes: [
        { recto: "Terme A", verso: "X" },
        { recto: "terme a", verso: "Y" },
      ],
    });
    expect(resultat.success).toBe(false);
  });

  it("rejette des questions de quiz en double", () => {
    const resultat = deckSchema.safeParse({
      ...deckValide,
      quiz: [deckValide.quiz[0], { ...deckValide.quiz[0] }],
    });
    expect(resultat.success).toBe(false);
  });
});

describe("deckIndexSchema", () => {
  it("accepte une liste de noms de fichiers", () => {
    expect(deckIndexSchema.safeParse(["a.json", "b.json"]).success).toBe(true);
  });

  it("rejette une liste vide", () => {
    expect(deckIndexSchema.safeParse([]).success).toBe(false);
  });
});
