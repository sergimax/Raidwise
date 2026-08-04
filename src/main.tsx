import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AppThemeProvider } from "./components/app-theme-provider/index.tsx";
import "./index.css";
import "./theme/links.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppThemeProvider>
      <App />
    </AppThemeProvider>
  </StrictMode>,
);
