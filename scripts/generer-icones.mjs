// Script ponctuel : régénère le favicon et les icônes PWA à partir de
// scripts/assets/icon-source.png (l'icône d'appli fournie par l'enseignant).
// À relancer manuellement si le logo change. N'est pas utilisé au build.
import { mkdirSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const RACINE = path.resolve(import.meta.dirname, "..");
const SOURCE = path.join(RACINE, "scripts/assets/icon-source.png");
const DOSSIER_PUBLIC = path.join(RACINE, "public");
const DOSSIER_ICONES = path.join(DOSSIER_PUBLIC, "icons");

mkdirSync(DOSSIER_ICONES, { recursive: true });

async function icone(dossier, nom, taille) {
  await sharp(SOURCE).resize(taille, taille).png().toFile(path.join(dossier, nom));
  console.log(`✓ ${nom} (${taille}×${taille})`);
}

// Favicon affiché dans l'onglet du navigateur.
await icone(DOSSIER_PUBLIC, "favicon.png", 192);

// Icônes PWA (écran d'accueil une fois l'application installée).
await icone(DOSSIER_ICONES, "icon-192.png", 192);
await icone(DOSSIER_ICONES, "icon-512.png", 512);
// L'icône fournie a déjà une bonne marge intérieure autour du motif : elle
// convient telle quelle comme icône « maskable » (zone sûre centrale).
await icone(DOSSIER_ICONES, "icon-maskable-512.png", 512);

console.log("Favicon et icônes générés.");
