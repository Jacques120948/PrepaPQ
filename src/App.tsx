import { useRegisterSW } from "virtual:pwa-register/react";
import { Link, Route, Routes } from "react-router-dom";
import { Bandeau } from "./components/Bandeau";
import { useEnLigne } from "./lib/useEnLigne";
import Accueil from "./pages/Accueil";
import Cartes from "./pages/Cartes";
import Quiz from "./pages/Quiz";
import Reglages from "./pages/Reglages";

function App() {
  const enLigne = useEnLigne();
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  return (
    <div className="mx-auto flex min-h-svh max-w-2xl flex-col bg-papier">
      <header className="flex items-center justify-between border-b border-tole bg-bleu px-4 py-3 text-papier">
        <Link to="/" className="text-xl font-bold tracking-tight">
          PrépaPQ
        </Link>
        <Link
          to="/reglages"
          className="flex min-h-11 min-w-11 items-center justify-center rounded-md px-3 text-sm font-medium hover:bg-bleu-fonce"
        >
          Réglages
        </Link>
      </header>

      <div className="flex flex-col gap-2 px-4 pt-3">
        {!enLigne && (
          <Bandeau ton="info">
            Mode hors ligne actif : vous utilisez les contenus déjà enregistrés sur cet
            appareil.
          </Bandeau>
        )}
        {needRefresh && (
          <Bandeau
            ton="succes"
            action={
              <button
                type="button"
                onClick={() => updateServiceWorker(true)}
                className="min-h-9 rounded-md bg-bleu px-3 text-sm font-semibold text-papier hover:bg-bleu-fonce"
              >
                Actualiser
              </button>
            }
          >
            De nouveaux contenus sont disponibles.
          </Bandeau>
        )}
      </div>

      <main className="flex-1 px-4 py-4">
        <Routes>
          <Route path="/" element={<Accueil />} />
          <Route path="/jeu/:deckId/cartes" element={<Cartes />} />
          <Route path="/jeu/:deckId/quiz" element={<Quiz />} />
          <Route path="/reglages" element={<Reglages />} />
          <Route
            path="*"
            element={
              <Bandeau ton="alerte">
                Page introuvable. <Link to="/" className="underline">Retour à l'accueil</Link>.
              </Bandeau>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
