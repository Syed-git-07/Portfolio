import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/manrope";
import "@fontsource-variable/dm-sans";
import Portfolio from "./portfolio/Portfolio.jsx";

// Decide once per document, before the first React layout or browser scroll restoration.
if (
  (!location.hash || location.hash === "#home") &&
  performance.getEntriesByType("navigation")[0]?.type !== "back_forward" &&
  !matchMedia("(prefers-reduced-motion: reduce)").matches
) {
  document.documentElement.dataset.homeOpening = "";
  history.scrollRestoration = "manual";
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Portfolio />
  </StrictMode>,
);
