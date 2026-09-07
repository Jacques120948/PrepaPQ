import { deckIndexSchema, deckSchema, type Deck } from "./schema";

/**
 * Point d'entrée unique pour charger les jeux de cartes.
 *
 * Toute évolution future de la source des contenus (par exemple une
 * variante où l'apprenti photographie une page de cours) doit passer par
 * cette fonction, pour ne pas impacter le reste de l'application.
 */

const BASE = import.meta.env.BASE_URL;

export interface ErreurChargementJeu {
  fichier: string;
  message: string;
}

export interface ResultatChargementDecks {
  decks: Deck[];
  erreurs: ErreurChargementJeu[];
}

async function recupererJson(chemin: string): Promise<unknown> {
  const reponse = await fetch(chemin);
  if (!reponse.ok) {
    throw new Error(`réponse HTTP ${reponse.status}`);
  }
  return reponse.json();
}

/**
 * Charge et valide tous les jeux listés dans public/decks/index.json.
 * Un jeu mal formé est écarté (avec une erreur associée) plutôt que de
 * faire planter toute l'application : ce cas ne devrait de toute façon
 * jamais se produire en production, `npm run verifier` l'interdisant
 * avant publication.
 */
export async function chargerJeux(): Promise<ResultatChargementDecks> {
  const erreurs: ErreurChargementJeu[] = [];

  let listeFichiers: string[];
  try {
    const indexBrut = await recupererJson(`${BASE}decks/index.json`);
    listeFichiers = deckIndexSchema.parse(indexBrut);
  } catch (erreur) {
    return {
      decks: [],
      erreurs: [
        {
          fichier: "decks/index.json",
          message: erreur instanceof Error ? erreur.message : String(erreur),
        },
      ],
    };
  }

  const decks: Deck[] = [];

  await Promise.all(
    listeFichiers.map(async (nomFichier) => {
      try {
        const brut = await recupererJson(`${BASE}decks/${nomFichier}`);
        decks.push(deckSchema.parse(brut));
      } catch (erreur) {
        erreurs.push({
          fichier: nomFichier,
          message: erreur instanceof Error ? erreur.message : String(erreur),
        });
      }
    }),
  );

  decks.sort((a, b) => a.titre.localeCompare(b.titre, "fr"));

  return { decks, erreurs };
}
