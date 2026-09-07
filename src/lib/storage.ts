import { NIVEAU_MIN, pourcentageMaitrise } from "./leitner";
import type { Metier } from "./schema";

/**
 * Toutes les données de l'application vivent dans le localStorage du
 * navigateur de l'apprenti : aucune donnée personnelle, aucun compte,
 * rien n'est envoyé où que ce soit.
 */

const PREFIXE = "prepapq:";
const CLE_FILTRE_METIER = `${PREFIXE}filtre-metier`;

function cleProgression(deckId: string): string {
  return `${PREFIXE}progression:${deckId}`;
}

interface ProgressionStockee {
  version: string;
  niveaux: number[];
}

export interface ProgressionChargee {
  niveaux: number[];
  reinitialisee: boolean;
}

function lireJson<T>(cle: string): T | null {
  try {
    const brut = window.localStorage.getItem(cle);
    if (!brut) return null;
    return JSON.parse(brut) as T;
  } catch {
    return null;
  }
}

function ecrireJson(cle: string, valeur: unknown): void {
  try {
    window.localStorage.setItem(cle, JSON.stringify(valeur));
  } catch {
    // Stockage indisponible (navigation privée, quota atteint...) :
    // l'application reste utilisable, seule la progression ne sera pas gardée.
  }
}

/**
 * Charge la progression d'un jeu. Si aucune progression n'existe encore,
 * elle est créée au niveau minimal. Si la version du jeu a changé depuis
 * la dernière visite, la progression est réinitialisée et `reinitialisee`
 * vaut `true` pour que l'interface en informe l'apprenti.
 */
export function chargerProgression(
  deckId: string,
  version: string,
  nombreCartes: number,
): ProgressionChargee {
  const stockee = lireJson<ProgressionStockee>(cleProgression(deckId));

  const estValide =
    stockee !== null &&
    stockee.version === version &&
    Array.isArray(stockee.niveaux) &&
    stockee.niveaux.length === nombreCartes;

  if (estValide) {
    return { niveaux: stockee!.niveaux, reinitialisee: false };
  }

  const niveaux = new Array(nombreCartes).fill(NIVEAU_MIN);
  const aEteReinitialisee = stockee !== null;

  ecrireJson(cleProgression(deckId), { version, niveaux } satisfies ProgressionStockee);

  return { niveaux, reinitialisee: aEteReinitialisee };
}

/**
 * Lecture seule, sans effet de bord : utilisé pour afficher l'avancement
 * sur l'accueil sans créer/écrire de progression pour des jeux jamais
 * ouverts par l'apprenti.
 */
export function lirePourcentageMaitrise(
  deckId: string,
  version: string,
  nombreCartes: number,
): number {
  const stockee = lireJson<ProgressionStockee>(cleProgression(deckId));

  const estValide =
    stockee !== null &&
    stockee.version === version &&
    Array.isArray(stockee.niveaux) &&
    stockee.niveaux.length === nombreCartes;

  return estValide ? pourcentageMaitrise(stockee!.niveaux) : 0;
}

export function sauvegarderProgression(
  deckId: string,
  version: string,
  niveaux: number[],
): void {
  ecrireJson(cleProgression(deckId), { version, niveaux } satisfies ProgressionStockee);
}

export type FiltreMetier = Metier | "tous";

export function chargerFiltreMetier(): FiltreMetier {
  const valeur = lireJson<FiltreMetier>(CLE_FILTRE_METIER);
  return valeur === "tolier" || valeur === "peintre" ? valeur : "tous";
}

export function sauvegarderFiltreMetier(filtre: FiltreMetier): void {
  ecrireJson(CLE_FILTRE_METIER, filtre);
}

/** Efface toute la progression et les préférences locales de l'apprenti. */
export function effacerProgressionLocale(): void {
  try {
    const cles = Object.keys(window.localStorage).filter((cle) => cle.startsWith(PREFIXE));
    for (const cle of cles) {
      window.localStorage.removeItem(cle);
    }
  } catch {
    // Rien à faire si le stockage est indisponible.
  }
}
