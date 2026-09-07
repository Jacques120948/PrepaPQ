import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App.tsx";
import { DecksProvider } from "./lib/DecksContext.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HashRouter>
      <DecksProvider>
        <App />
      </DecksProvider>
    </HashRouter>
  </StrictMode>,
);
