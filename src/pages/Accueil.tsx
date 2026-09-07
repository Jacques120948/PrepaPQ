import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bandeau } from "../components/Bandeau";
import { useDecks } from "../lib/useDecks";
import {
  chargerFiltreMetier,
  lirePourcentageMaitrise,
  sauvegarderFiltreMetier,
  type FiltreMetier,
} from "../lib/storage";
import type { Deck, Metier } from "../lib/schema";

const LIBELLE_METIER: Record<Metier, string> = {
  tolier: "Tôlier",
  peintre: "Peintre",
};

const FILTRES: { valeur: FiltreMetier; libelle: string }[] = [
  { valeur: "tous", libelle: "Tous" },
  { valeur: "tolier", libelle: "Tôlier" },
  { valeur: "peintre", libelle: "Peintre" },
];

export default function Accueil() {
  const { chargement, decks, erreurs } = useDecks();
  const [filtre, setFiltre] = useState<FiltreMetier>(() => chargerFiltreMetier());

  useEffect(() => {
    sauvegarderFiltreMetier(filtre);
  }, [filtre]);

  const decksFiltres = decks.filter((deck) => filtre === "tous" || deck.metier === filtre);

  const groupes: { metier: Metier; decks: Deck[] }[] = (["tolier", "peintre"] as const)
    .map((metier) => ({ metier, decks: decksFiltres.filter((d) => d.metier === metier) }))
    .filter((groupe) => groupe.decks.length > 0);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-bleu-fonce">Vos jeux de révision</h1>

      <div role="group" aria-label="Filtrer par métier" className="flex gap-2">
        {FILTRES.map(({ valeur, libelle }) => {
          const actif = filtre === valeur;
          return (
            <button
              key={valeur}
              type="button"
              aria-pressed={actif}
              onClick={() => setFiltre(valeur)}
              className={`min-h-11 flex-1 rounded-md border px-3 text-sm font-semibold transition-colors ${
                actif
                  ? "border-bleu bg-bleu text-papier"
                  : "border-tole bg-white text-encre hover:border-bleu"
              }`}
            >
              {libelle}
            </button>
          );
        })}
      </div>

      {erreurs.length > 0 && (
        <Bandeau ton="alerte">
          Certains contenus n'ont pas pu être chargés ({erreurs.length}). Les autres jeux
          restent disponibles ci-dessous.
        </Bandeau>
      )}

      {chargement && <Bandeau ton="info">Chargement des jeux de révision...</Bandeau>}

      {!chargement && decks.length === 0 && erreurs.length === 0 && (
        <Bandeau ton="info">Aucun jeu n'est disponible pour l'instant.</Bandeau>
      )}

      {!chargement && decks.length > 0 && decksFiltres.length === 0 && (
        <Bandeau ton="info">Aucun jeu ne correspond à ce filtre pour le moment.</Bandeau>
      )}

      {groupes.map((groupe) => (
        <section key={groupe.metier} className="flex flex-col gap-3">
          <h2 className="text-lg font-bold text-encre">{LIBELLE_METIER[groupe.metier]}</h2>
          <ul className="flex flex-col gap-3">
            {groupe.decks.map((deck) => (
              <li key={deck.id}>
                <CarteJeu deck={deck} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function CarteJeu({ deck }: { deck: Deck }) {
  const avancement = lirePourcentageMaitrise(deck.id, deck.version, deck.cartes.length);
  const premierLancement = avancement === 0;

  return (
    <article className="rounded-lg border border-tole bg-white p-4 shadow-sm">
      <h3 className="text-base font-bold text-encre">{deck.titre}</h3>
      <p className="mt-0.5 text-sm text-encre/70">
        {deck.module} · {deck.cartes.length} carte{deck.cartes.length > 1 ? "s" : ""}
      </p>

      <div className="mt-3">
        <div
          role="progressbar"
          aria-valuenow={avancement}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Avancement du jeu ${deck.titre}`}
          className="h-2 w-full overflow-hidden rounded-full bg-tole"
        >
          <div className="h-full rounded-full bg-bleu" style={{ width: `${avancement}%` }} />
        </div>
        <p className="mt-1 text-xs text-encre/70">
          {premierLancement ? "Pas encore commencé" : `${avancement} % maîtrisé`}
        </p>
      </div>

      <div className="mt-3 flex gap-2">
        <Link
          to={`/jeu/${deck.id}/cartes`}
          className="flex min-h-11 flex-1 items-center justify-center rounded-md bg-bleu px-3 text-sm font-semibold text-papier hover:bg-bleu-fonce"
        >
          Cartes
        </Link>
        <Link
          to={`/jeu/${deck.id}/quiz`}
          className="flex min-h-11 flex-1 items-center justify-center rounded-md border border-bleu px-3 text-sm font-semibold text-bleu hover:bg-bleu/10"
        >
          Quiz
        </Link>
      </div>
    </article>
  );
}
