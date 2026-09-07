import { useEffect, useState } from "react";

/** Suit l'état de connexion du navigateur, pour afficher le mode hors ligne. */
export function useEnLigne(): boolean {
  const [enLigne, setEnLigne] = useState(() => navigator.onLine);

  useEffect(() => {
    const surConnexion = () => setEnLigne(true);
    const surDeconnexion = () => setEnLigne(false);

    window.addEventListener("online", surConnexion);
    window.addEventListener("offline", surDeconnexion);

    return () => {
      window.removeEventListener("online", surConnexion);
      window.removeEventListener("offline", surDeconnexion);
    };
  }, []);

  return enLigne;
}
