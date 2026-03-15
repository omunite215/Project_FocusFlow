import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import gsap from "gsap";
import App from "./App";
import "./styles/index.css";
import { setupMocks } from "./mocks/mockService";

if (import.meta.env.DEV) setupMocks();

// Make all GSAP animations effectively instant for reduced-motion users
if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  gsap.globalTimeline.timeScale(100);
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
