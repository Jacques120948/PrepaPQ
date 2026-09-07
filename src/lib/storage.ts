import { NIVEAU_MAX, NIVEAU_MIN } from "./leitner";
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

export interface DernierQuiz {
  score: number;
  total: number;
  /** Date ISO de la dernière tentative de quiz. */
  date: string;
}

interface ProgressionStockee {
  version: string;
  niveaux: number[];
  dernierQuiz?: DernierQuiz;
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

/** Lit la progression stockée, seulement si elle correspond à la version et au nombre de cartes actuels du jeu. */
function lireProgressionValide(
  deckId: string,
  version: string,
  nombreCartes: number,
): ProgressionStockee | null {
  const stockee = lireJson<ProgressionStockee>(cleProgression(deckId));
  const estValide =
    stockee !== null &&
    stockee.version === version &&
    Array.isArray(stockee.niveaux) &&
    stockee.niveaux.length === nombreCartes;
  return estValide ? stockee : null;
}

/**
 * Charge la progression d'un jeu. Si aucune progression n'existe encore,
 * elle est créée au niveau minimal. Si la version du jeu a changé depuis
 * la dernière visite (ou si le nombre de cartes a changé), la progression
 * est réinitialisée — y compris le dernier résultat de quiz — et
 * `reinitialisee` vaut `true` pour que l'interface en informe l'apprenti.
 */
export function chargerProgression(
  deckId: string,
  version: string,
  nombreCartes: number,
): ProgressionChargee {
  const stockeeBrute = lireJson<ProgressionStockee>(cleProgression(deckId));
  const stockee = lireProgressionValide(deckId, version, nombreCartes);

  if (stockee) {
    return { niveaux: stockee.niveaux, reinitialisee: false };
  }

  const niveaux = new Array(nombreCartes).fill(NIVEAU_MIN);
  const aEteReinitialisee = stockeeBrute !== null;

  ecrireJson(cleProgression(deckId), { version, niveaux } satisfies ProgressionStockee);

  return { niveaux, reinitialisee: aEteReinitialisee };
}

/**
 * Lecture seule, sans effet de bord : utilisé pour afficher l'avancement
 * sur l'accueil sans créer/écrire de progression pour des jeux jamais
 * ouverts par l'apprenti. Retourne le nombre de cartes sues (niveau
 * maximal atteint) sur le total de cartes du jeu.
 */
export function lireAvancementJeu(
  deckId: string,
  version: string,
  nombreCartes: number,
): { sues: number; total: number } {
  const stockee = lireProgressionValide(deckId, version, nombreCartes);
  const sues = stockee ? stockee.niveaux.filter((niveau) => niveau >= NIVEAU_MAX).length : 0;
  return { sues, total: nombreCartes };
}

/** Enregistre la progression des cartes, sans écraser le dernier résultat de quiz déjà enregistré. */
export function sauvegarderProgression(
  deckId: string,
  version: string,
  niveaux: number[],
): void {
  const existante = lireProgressionValide(deckId, version, niveaux.length);
  ecrireJson(cleProgression(deckId), {
    version,
    niveaux,
    dernierQuiz: existante?.dernierQuiz,
  } satisfies ProgressionStockee);
}

/** Enregistre le résultat du dernier quiz effectué sur ce jeu, sans écraser la progression des cartes. */
export function sauvegarderResultatQuiz(
  deckId: string,
  version: string,
  nombreCartes: number,
  score: number,
  total: number,
): void {
  const existante = lireProgressionValide(deckId, version, nombreCartes);
  const niveaux = existante?.niveaux ?? new Array(nombreCartes).fill(NIVEAU_MIN);
  const dernierQuiz: DernierQuiz = { score, total, date: new Date().toISOString() };

  ecrireJson(cleProgression(deckId), { version, niveaux, dernierQuiz } satisfies ProgressionStockee);
}

/** Lecture seule du dernier résultat de quiz enregistré pour ce jeu, s'il existe et correspond à la version actuelle. */
export function lireDernierQuiz(
  deckId: string,
  version: string,
  nombreCartes: number,
): DernierQuiz | null {
  return lireProgressionValide(deckId, version, nombreCartes)?.dernierQuiz ?? null;
}

export type FiltreMetier = Metier | "tous";

export function chargerFiltreMetier(): FiltreMetier {
  const valeur = lireJson<FiltreMetier>(CLE_FILTRE_METIER);
  return valeur === "tolier" || valeur === "peintre" ? valeur : "tous";
}

export function sauvegarderFiltreMetier(filtre: FiltreMetier): void {
  ecrireJson(CLE_FILTRE_METIER, filtre);
}

/** Efface la progression (cartes et dernier quiz) d'un seul jeu. */
export function effacerProgressionJeu(deckId: string): void {
  try {
    window.localStorage.removeItem(cleProgression(deckId));
  } catch {
    // Rien à faire si le stockage est indisponible.
  }
}

/** Efface toute la progression et les préférences locales de l'apprenti, pour tous les jeux. */
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
