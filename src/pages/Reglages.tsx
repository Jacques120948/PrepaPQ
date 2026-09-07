import { useState } from "react";
import pkg from "../../package.json";
import { Bandeau } from "../components/Bandeau";
import { useDecks } from "../lib/useDecks";
import { effacerProgressionLocale } from "../lib/storage";

function formaterDateContenus(decks: { version: string }[]): string | null {
  if (decks.length === 0) return null;

  const versionLaPlusRecente = decks
    .map((deck) => deck.version)
    .sort()
    .at(-1)!;

  const [annee, mois] = versionLaPlusRecente.split("-").map(Number);
  const date = new Date(annee, mois - 1, 1);

  return new Intl.DateTimeFormat("fr-CH", { month: "long", year: "numeric" }).format(date);
}

export default function Reglages() {
  const { decks } = useDecks();
  const [effacee, setEffacee] = useState(false);

  const dateContenus = formaterDateContenus(decks);

  const effacer = () => {
    const confirmation = window.confirm(
      "Effacer toute votre progression sur les cartes ? Cette action ne peut pas être annulée.",
    );
    if (!confirmation) return;

    effacerProgressionLocale();
    setEffacee(true);
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-bleu-fonce">Réglages</h1>

      <section className="flex flex-col gap-2 rounded-lg border border-tole bg-white p-4">
        <h2 className="text-base font-bold text-encre">Progression</h2>
        <p className="text-sm text-encre/70">
          Votre progression est enregistrée uniquement sur cet appareil, dans ce navigateur.
        </p>
        <button
          type="button"
          onClick={effacer}
          className="min-h-11 self-start rounded-md border-2 border-rouge px-4 text-sm font-semibold text-rouge hover:bg-rouge/10"
        >
          Effacer ma progression
        </button>
        {effacee && <Bandeau ton="succes">Votre progression a été effacée.</Bandeau>}
      </section>

      <section className="flex flex-col gap-1 rounded-lg border border-tole bg-white p-4 text-sm text-encre/70">
        <p>Version de l'application : {pkg.version}</p>
        <p>Contenus à jour au : {dateContenus ?? "non disponible"}</p>
      </section>
    </div>
  );
}
