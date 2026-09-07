import { describe, expect, it } from "vitest";
import { calculerNote } from "../grade";

describe("calculerNote", () => {
  it("donne 6 pour un sans-faute", () => {
    expect(calculerNote(10, 10)).toEqual({ note: 6, couleur: "bleu" });
  });

  it("donne 1 pour zéro bonne réponse", () => {
    expect(calculerNote(0, 10)).toEqual({ note: 1, couleur: "rouge" });
  });

  it("applique la formule points/total×5+1 arrondie à une décimale", () => {
    // 7/10 * 5 + 1 = 4.5
    expect(calculerNote(7, 10)).toEqual({ note: 4.5, couleur: "bleu" });
  });

  it("arrondit à une décimale sur un total qui ne tombe pas juste", () => {
    // 2/3 * 5 + 1 = 4.333... -> 4.3
    expect(calculerNote(2, 3).note).toBeCloseTo(4.3, 5);
  });

  it("classe en bleu à partir de 4 pile", () => {
    // 3/5 * 5 + 1 = 4
    expect(calculerNote(3, 5)).toEqual({ note: 4, couleur: "bleu" });
  });

  it("classe en rouge juste en dessous de 4", () => {
    // 2.9/5 * 5 + 1 = 3.9
    expect(calculerNote(2.9, 5).couleur).toBe("rouge");
  });

  it("rejette un total nul ou négatif", () => {
    expect(() => calculerNote(0, 0)).toThrow();
    expect(() => calculerNote(0, -1)).toThrow();
  });

  it("rejette des points hors de la plage [0, total]", () => {
    expect(() => calculerNote(-1, 10)).toThrow();
    expect(() => calculerNote(11, 10)).toThrow();
  });
});
