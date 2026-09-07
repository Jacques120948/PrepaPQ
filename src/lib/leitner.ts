/**
 * Système de Leitner à trois niveaux pour la révision des cartes.
 *
 * Niveau 1 : carte pas encore sue, ou ratée — revient vite dans la session.
 * Niveau 2 : carte sue une fois — revient plus tard dans la session.
 * Niveau 3 : carte maîtrisée — ne revient plus dans la session courante.
 *
 * Le niveau de chaque carte est persisté (voir storage.ts) et sert de point
 * de départ à la session suivante : les cartes les plus faibles sont
 * présentées en premier.
 */

export const NIVEAU_MIN = 1;
export const NIVEAU_MAX = 3;

/** Décalage (nombre de cartes) avant qu'une carte revienne dans la file. */
const ECART_REINSERTION: Record<number, number> = {
  1: 2,
  2: 5,
};

export interface EtatSession {
  /** File d'attente des index de cartes restant à présenter dans la session. */
  file: number[];
  /** Niveau courant (1 à 3) par index de carte, copie de travail de la session. */
  niveaux: number[];
}

export interface ResultatReponse {
  session: EtatSession;
  niveauCarte: number;
  sessionTerminee: boolean;
}

/**
 * Démarre une session à partir des niveaux persistés : les cartes les plus
 * faibles (niveau bas) sont placées en tête de file.
 */
export function demarrerSession(niveauxInitiaux: number[]): EtatSession {
  if (niveauxInitiaux.length === 0) {
    throw new Error("un jeu doit contenir au moins une carte");
  }

  const file = niveauxInitiaux
    .map((niveau, index) => ({ niveau, index }))
    .sort((a, b) => a.niveau - b.niveau)
    .map((item) => item.index);

  return { file, niveaux: [...niveauxInitiaux] };
}

/** Index de la carte actuellement à présenter, ou null si la session est terminée. */
export function carteCourante(session: EtatSession): number | null {
  return session.file[0] ?? null;
}

function inserer(file: number[], indexCarte: number, ecart: number): number[] {
  const position = Math.min(ecart, file.length);
  return [...file.slice(0, position), indexCarte, ...file.slice(position)];
}

/**
 * Enregistre la réponse de l'apprenti pour la carte en tête de file.
 * « Je savais » fait monter le niveau et espace la réapparition.
 * « À revoir » ramène la carte au niveau 1 et la fait revenir vite.
 */
export function repondre(session: EtatSession, jeSavais: boolean): ResultatReponse {
  const [indexCarte, ...reste] = session.file;
  if (indexCarte === undefined) {
    throw new Error("la session est déjà terminée, il n'y a plus de carte à répondre");
  }

  const niveaux = [...session.niveaux];
  let file = reste;

  if (jeSavais) {
    const nouveauNiveau = Math.min(niveaux[indexCarte] + 1, NIVEAU_MAX);
    niveaux[indexCarte] = nouveauNiveau;
    if (nouveauNiveau < NIVEAU_MAX) {
      file = inserer(file, indexCarte, ECART_REINSERTION[nouveauNiveau]);
    }
  } else {
    niveaux[indexCarte] = NIVEAU_MIN;
    file = inserer(file, indexCarte, ECART_REINSERTION[NIVEAU_MIN]);
  }

  return {
    session: { file, niveaux },
    niveauCarte: niveaux[indexCarte],
    sessionTerminee: file.length === 0,
  };
}

/** Pourcentage de cartes au niveau maximal (maîtrisées), pour l'affichage sur l'accueil. */
export function pourcentageMaitrise(niveaux: number[]): number {
  if (niveaux.length === 0) return 0;
  const maitrisees = niveaux.filter((n) => n >= NIVEAU_MAX).length;
  return Math.round((maitrisees / niveaux.length) * 100);
}
