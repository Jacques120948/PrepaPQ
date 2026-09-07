import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { deckIndexSchema, deckSchema } from "../src/lib/schema.ts";

/**
 * Vérifie tous les jeux de cartes avant publication.
 * Un jeu mal formé fait échouer ce script (code de sortie 1), donc le
 * build et la publication GitHub Pages, plutôt que d'arriver aux apprentis.
 *
 * Usage : npm run verifier
 */

const DOSSIER_DECKS = path.resolve(import.meta.dirname, "../public/decks");
const CHEMIN_INDEX = path.join(DOSSIER_DECKS, "index.json");

type Erreur = { fichier: string; message: string };

function formatterErreursZod(erreur: z.ZodError): string[] {
  return erreur.issues.map((issue) => {
    const chemin = issue.path.join(".");
    return chemin ? `${chemin} : ${issue.message}` : issue.message;
  });
}

async function chargerJson(cheminFichier: string): Promise<unknown> {
  const contenu = await readFile(cheminFichier, "utf-8");
  try {
    return JSON.parse(contenu);
  } catch (erreur) {
    throw new Error(
      `JSON invalide : ${erreur instanceof Error ? erreur.message : String(erreur)}`,
    );
  }
}

async function main() {
  const erreurs: Erreur[] = [];

  if (!existsSync(CHEMIN_INDEX)) {
    console.error(`✗ Fichier introuvable : ${path.relative(process.cwd(), CHEMIN_INDEX)}`);
    process.exit(1);
  }

  let listeFichiers: string[];
  try {
    const indexBrut = await chargerJson(CHEMIN_INDEX);
    listeFichiers = deckIndexSchema.parse(indexBrut);
  } catch (erreur) {
    if (erreur instanceof z.ZodError) {
      erreurs.push({
        fichier: "decks/index.json",
        message: formatterErreursZod(erreur).join(" ; "),
      });
    } else {
      erreurs.push({
        fichier: "decks/index.json",
        message: erreur instanceof Error ? erreur.message : String(erreur),
      });
    }
    afficherRapport(erreurs, []);
    process.exit(1);
  }

  const idsVus = new Map<string, string>();
  const decksValides: { fichier: string; deck: z.infer<typeof deckSchema> }[] = [];

  for (const nomFichier of listeFichiers) {
    const cheminFichier = path.join(DOSSIER_DECKS, nomFichier);
    if (!existsSync(cheminFichier)) {
      erreurs.push({
        fichier: nomFichier,
        message: "référencé dans index.json mais introuvable dans public/decks/",
      });
      continue;
    }

    try {
      const brut = await chargerJson(cheminFichier);
      const deck = deckSchema.parse(brut);

      const premierFichier = idsVus.get(deck.id);
      if (premierFichier !== undefined) {
        erreurs.push({
          fichier: nomFichier,
          message: `identifiant « ${deck.id} » déjà utilisé par ${premierFichier}`,
        });
      } else {
        idsVus.set(deck.id, nomFichier);
      }

      decksValides.push({ fichier: nomFichier, deck });
    } catch (erreur) {
      if (erreur instanceof z.ZodError) {
        erreurs.push({
          fichier: nomFichier,
          message: formatterErreursZod(erreur).join(" ; "),
        });
      } else {
        erreurs.push({
          fichier: nomFichier,
          message: erreur instanceof Error ? erreur.message : String(erreur),
        });
      }
    }
  }

  afficherRapport(erreurs, decksValides.map((d) => d.fichier));

  if (erreurs.length > 0) {
    process.exit(1);
  }
}

function afficherRapport(erreurs: Erreur[], fichiersValides: string[]) {
  for (const fichier of fichiersValides) {
    console.log(`✓ ${fichier}`);
  }
  for (const erreur of erreurs) {
    console.error(`✗ ${erreur.fichier} : ${erreur.message}`);
  }

  console.log("");
  if (erreurs.length === 0) {
    console.log(`${fichiersValides.length} jeu(x) validé(s) sans erreur.`);
  } else {
    console.error(
      `${erreurs.length} erreur(s) trouvée(s). Corrigez les fichiers ci-dessus avant de publier.`,
    );
  }
}

main().catch((erreur) => {
  console.error("Erreur inattendue du script de vérification :", erreur);
  process.exit(1);
});
