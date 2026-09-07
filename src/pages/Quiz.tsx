import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Bandeau } from "../components/Bandeau";
import { useDeck, useDecks } from "../lib/useDecks";
import { calculerNote } from "../lib/grade";
import { sauvegarderResultatQuiz } from "../lib/storage";

export default function Quiz() {
  const { deckId } = useParams<{ deckId: string }>();
  const { chargement } = useDecks();
  const deck = useDeck(deckId);

  const [indicesActifs, setIndicesActifs] = useState<number[]>([]);
  const [position, setPosition] = useState(0);
  const [selection, setSelection] = useState<number | null>(null);
  const [corrections, setCorrections] = useState<boolean[]>([]);
  const [resultatEnregistre, setResultatEnregistre] = useState(false);

  useEffect(() => {
    if (!deck) return;
    setIndicesActifs(deck.quiz.map((_, index) => index));
    setPosition(0);
    setSelection(null);
    setCorrections([]);
    setResultatEnregistre(false);
  }, [deck]);

  useEffect(() => {
    if (!deck) return;
    const terminee = indicesActifs.length > 0 && position >= indicesActifs.length;
    if (!terminee || resultatEnregistre) return;

    const score = corrections.filter(Boolean).length;
    sauvegarderResultatQuiz(deck.id, deck.version, deck.cartes.length, score, indicesActifs.length);
    setResultatEnregistre(true);
  }, [deck, position, indicesActifs, corrections, resultatEnregistre]);

  if (chargement) {
    return <Bandeau ton="info">Chargement du quiz...</Bandeau>;
  }

  if (!deck) {
    return (
      <Bandeau ton="alerte">
        Ce jeu est introuvable. <Link to="/" className="underline">Retour à l'accueil</Link>.
      </Bandeau>
    );
  }

  if (indicesActifs.length === 0) {
    return <Bandeau ton="info">Préparation du quiz...</Bandeau>;
  }

  const choisir = (optionIndex: number) => {
    if (selection !== null) return;
    setSelection(optionIndex);
    const question = deck.quiz[indicesActifs[position]];
    setCorrections((prev) => [...prev, optionIndex === question.reponse]);
  };

  const suivante = () => {
    setPosition((p) => p + 1);
    setSelection(null);
  };

  const recommencerTout = () => {
    setIndicesActifs(deck.quiz.map((_, index) => index));
    setPosition(0);
    setSelection(null);
    setCorrections([]);
    setResultatEnregistre(false);
  };

  const refaireRatees = (ratees: number[]) => {
    setIndicesActifs(ratees);
    setPosition(0);
    setSelection(null);
    setCorrections([]);
    setResultatEnregistre(false);
  };

  const terminee = position >= indicesActifs.length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-bleu-fonce">{deck.titre}</h1>
        <Link to="/" className="text-sm font-medium text-bleu underline">
          Accueil
        </Link>
      </div>

      {!terminee ? (
        <QuestionCourante
          numero={position + 1}
          total={indicesActifs.length}
          question={deck.quiz[indicesActifs[position]]}
          selection={selection}
          onChoisir={choisir}
          onSuivante={suivante}
          derniere={position === indicesActifs.length - 1}
        />
      ) : (
        <Resultats
          score={corrections.filter(Boolean).length}
          total={indicesActifs.length}
          ratees={indicesActifs.filter((_, i) => !corrections[i])}
          onRefaireRatees={refaireRatees}
          onRecommencerTout={recommencerTout}
        />
      )}
    </div>
  );
}

interface QuestionCouranteProps {
  numero: number;
  total: number;
  question: { question: string; options: string[]; reponse: number; explication: string };
  selection: number | null;
  onChoisir: (index: number) => void;
  onSuivante: () => void;
  derniere: boolean;
}

function QuestionCourante({
  numero,
  total,
  question,
  selection,
  onChoisir,
  onSuivante,
  derniere,
}: QuestionCouranteProps) {
  const aRepondu = selection !== null;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-medium text-encre/60">
        Question {numero} sur {total}
      </p>
      <p className="text-lg font-semibold text-encre">{question.question}</p>

      <div className="flex flex-col gap-2" role="radiogroup" aria-label={question.question}>
        {question.options.map((option, index) => {
          const estLaBonneReponse = index === question.reponse;
          const estSelectionnee = index === selection;

          let style = "border-tole bg-white hover:border-bleu";
          if (aRepondu && estLaBonneReponse) {
            style = "border-bleu bg-bleu/10";
          } else if (aRepondu && estSelectionnee && !estLaBonneReponse) {
            style = "border-rouge bg-rouge/10";
          }

          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={estSelectionnee}
              disabled={aRepondu}
              onClick={() => onChoisir(index)}
              className={`min-h-11 rounded-md border-2 px-4 py-2 text-left text-sm font-medium text-encre ${style}`}
            >
              {aRepondu && estLaBonneReponse ? "✓ " : null}
              {aRepondu && estSelectionnee && !estLaBonneReponse ? "✗ " : null}
              {option}
            </button>
          );
        })}
      </div>

      {aRepondu && (
        <div aria-live="polite" className="flex flex-col gap-3">
          <Bandeau ton={selection === question.reponse ? "succes" : "alerte"}>
            {selection === question.reponse ? "Bonne réponse. " : "Ce n'est pas la bonne réponse. "}
            {question.explication}
          </Bandeau>
          <button
            type="button"
            onClick={onSuivante}
            className="min-h-11 rounded-md bg-bleu px-3 text-sm font-semibold text-papier hover:bg-bleu-fonce"
          >
            {derniere ? "Voir les résultats" : "Question suivante"}
          </button>
        </div>
      )}
    </div>
  );
}

interface ResultatsProps {
  score: number;
  total: number;
  ratees: number[];
  onRefaireRatees: (ratees: number[]) => void;
  onRecommencerTout: () => void;
}

function Resultats({ score, total, ratees, onRefaireRatees, onRecommencerTout }: ResultatsProps) {
  const { note, couleur } = calculerNote(score, total);

  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-tole bg-white p-6 text-center">
      <p className="text-lg font-bold text-bleu-fonce">Quiz terminé</p>
      <p className="text-sm text-encre/70">
        {score} bonne{score > 1 ? "s" : ""} réponse{score > 1 ? "s" : ""} sur {total}
      </p>
      <p
        className={`text-4xl font-bold ${couleur === "bleu" ? "text-bleu" : "text-rouge"}`}
        aria-label={`Note : ${note} sur 6`}
      >
        {note}
      </p>

      <div className="flex w-full flex-col gap-2">
        {ratees.length > 0 && (
          <button
            type="button"
            onClick={() => onRefaireRatees(ratees)}
            className="min-h-11 rounded-md border-2 border-rouge px-3 text-sm font-semibold text-rouge hover:bg-rouge/10"
          >
            Refaire les {ratees.length} question{ratees.length > 1 ? "s" : ""} ratée
            {ratees.length > 1 ? "s" : ""}
          </button>
        )}
        <button
          type="button"
          onClick={onRecommencerTout}
          className="min-h-11 rounded-md bg-bleu px-3 text-sm font-semibold text-papier hover:bg-bleu-fonce"
        >
          Recommencer tout le quiz
        </button>
        <Link
          to="/"
          className="flex min-h-11 items-center justify-center rounded-md border border-tole px-3 text-sm font-semibold text-encre hover:border-bleu"
        >
          Accueil
        </Link>
      </div>
    </div>
  );
}
