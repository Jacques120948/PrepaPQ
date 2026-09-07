// Script ponctuel : régénère les icônes PWA à partir de public/favicon.svg.
// À relancer manuellement si le logo change. N'est pas utilisé au build.
import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const RACINE = path.resolve(import.meta.dirname, "..");
const SVG = readFileSync(path.join(RACINE, "public/favicon.svg"));
const DOSSIER_ICONES = path.join(RACINE, "public/icons");

mkdirSync(DOSSIER_ICONES, { recursive: true });

async function icone(nom, taille, { marge = 0, fond } = {}) {
  const zoneUtile = taille - marge * 2;
  const base = sharp(SVG).resize(zoneUtile, zoneUtile);

  const image = fond
    ? base.extend({
        top: marge,
        bottom: marge,
        left: marge,
        right: marge,
        background: fond,
      })
    : base;

  await image.png().toFile(path.join(DOSSIER_ICONES, nom));
  console.log(`✓ ${nom}`);
}

await icone("icon-192.png", 192);
await icone("icon-512.png", 512);
// Icône maskable : le logo doit tenir dans la zone sûre centrale (~80%),
// avec un fond bleu qui remplit tout le cadre.
await icone("icon-maskable-512.png", 512, { marge: 51, fond: "#1F4E79" });

console.log("Icônes générées dans public/icons/");
