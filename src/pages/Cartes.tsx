import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Bandeau } from "../components/Bandeau";
import { useDeck, useDecks } from "../lib/useDecks";
import {
  carteCourante,
  demarrerSession,
  pourcentageMaitrise,
  repondre,
  type EtatSession,
} from "../lib/leitner";
import { chargerProgression, sauvegarderProgression } from "../lib/storage";

export default function Cartes() {
  const { deckId } = useParams<{ deckId: string }>();
  const { chargement } = useDecks();
  const deck = useDeck(deckId);

  const [session, setSession] = useState<EtatSession | null>(null);
  const [reinitialisee, setReinitialisee] = useState(false);
  const [retournee, setRetournee] = useState(false);

  useEffect(() => {
    if (!deck) return;
    const progression = chargerProgression(deck.id, deck.version, deck.cartes.length);
    setSession(demarrerSession(progression.niveaux));
    setReinitialisee(progression.reinitialisee);
    setRetournee(false);
  }, [deck]);

  if (chargement) {
    return <Bandeau ton="info">Chargement du jeu...</Bandeau>;
  }

  if (!deck) {
    return (
      <Bandeau ton="alerte">
        Ce jeu est introuvable. <Link to="/" className="underline">Retour à l'accueil</Link>.
      </Bandeau>
    );
  }

  if (!session) {
    return <Bandeau ton="info">Chargement de votre progression...</Bandeau>;
  }

  const indexCarte = carteCourante(session);

  const repondreEtSuivant = (jeSavais: boolean) => {
    const resultat = repondre(session, jeSavais);
    setSession(resultat.session);
    sauvegarderProgression(deck.id, deck.version, resultat.session.niveaux);
    setRetournee(false);
  };

  const recommencer = () => {
    setSession(demarrerSession(session.niveaux));
    setRetournee(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-degrade-marque">{deck.titre}</h1>
        <Link to="/" className="text-sm font-medium text-bleu underline">
          Accueil
        </Link>
      </div>

      {reinitialisee && (
        <Bandeau ton="info">
          Ce jeu a été mis à jour : votre progression a été réinitialisée.
        </Bandeau>
      )}

      <div
        role="progressbar"
        aria-valuenow={pourcentageMaitrise(session.niveaux)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Cartes maîtrisées dans cette session"
        className="h-2 w-full overflow-hidden rounded-full bg-tole"
      >
        <div
          className="h-full rounded-full bg-degrade-marque"
          style={{ width: `${pourcentageMaitrise(session.niveaux)}%` }}
        />
      </div>

      {indexCarte === null ? (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-tole bg-white p-6 text-center">
          <p className="text-lg font-bold text-degrade-marque">Jeu terminé !</p>
          <p className="text-sm text-encre/70">
            Toutes les cartes de cette session sont maîtrisées. Revenez plus tard pour
            continuer à les consolider.
          </p>
          <div className="flex w-full gap-2">
            <button
              type="button"
              onClick={recommencer}
              className="min-h-11 flex-1 rounded-full bg-degrade-marque px-3 text-sm font-semibold text-papier shadow-sm"
            >
              Recommencer une session
            </button>
            <Link
              to="/"
              className="flex min-h-11 flex-1 items-center justify-center rounded-full border-2 border-violet px-3 text-sm font-semibold text-violet hover:bg-violet/10"
            >
              Accueil
            </Link>
          </div>
        </div>
      ) : (
        <>
          {!retournee ? (
            <div className="rounded-2xl bg-degrade-marque p-[3px] shadow-sm">
              <button
                type="button"
                onClick={() => setRetournee(true)}
                aria-label="Retourner la carte pour voir la réponse"
                className="flex min-h-56 w-full flex-col items-center justify-center gap-3 rounded-[1rem] bg-white p-6 text-center"
              >
                <p className="text-lg font-semibold text-encre">
                  {deck.cartes[indexCarte].recto}
                </p>
                <span className="text-xs font-medium text-encre/60">
                  Touchez la carte pour voir la réponse
                </span>
              </button>
            </div>
          ) : (
            <div className="rounded-2xl bg-degrade-marque p-[3px] shadow-sm">
              <div
                aria-live="polite"
                className="flex min-h-56 w-full flex-col items-center justify-center gap-3 rounded-[1rem] bg-white p-6 text-center"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-violet">
                  Réponse
                </p>
                <p className="text-lg font-semibold text-encre">
                  {deck.cartes[indexCarte].verso}
                </p>
              </div>
            </div>
          )}

          {retournee && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => repondreEtSuivant(false)}
                className="min-h-11 flex-1 rounded-full border-2 border-rouge px-3 text-sm font-semibold text-rouge hover:bg-rouge/10"
              >
                À revoir
              </button>
              <button
                type="button"
                onClick={() => repondreEtSuivant(true)}
                className="min-h-11 flex-1 rounded-full bg-degrade-marque px-3 text-sm font-semibold text-papier shadow-sm"
              >
                Je savais
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
