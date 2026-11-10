import { StrictMode } from "react";
import { Analytics } from "@vercel/analytics/react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "@fontsource/instrument-serif/400.css";
import "@fontsource/instrument-serif/400-italic.css";
import "./demos.css";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
    <Analytics />
  </StrictMode>,
);
