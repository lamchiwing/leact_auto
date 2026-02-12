import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

/**
 * Enable Eruda only when URL has ?eruda=1
 * Example: https://xxx.app.github.dev/?eruda=1
 */
try {
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    if (params.get("eruda") === "1") {
      import("eruda")
        .then((m) => m.default.init())
        .catch((err) => {
          // Avoid noisy console errors if eruda fails to load
          console.warn("Eruda failed to load:", err);
        });
    }
  }
} catch (e) {
  // do nothing
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
