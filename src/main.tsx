import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// TEMP: global error hooks to identify "null" / "Load failed" (DEV only)
if (import.meta.env.DEV) {
  window.addEventListener(
    "error",
    (e: any) => {
      console.log("[window.error]", {
        message: e?.message,
        filename: e?.filename,
        lineno: e?.lineno,
        colno: e?.colno,
        error: e?.error,
        target: (e?.target && (e.target.src || e.target.href)) || null,
      });
    },
    true
  );

  window.addEventListener("unhandledrejection", (e: any) => {
    console.log("[unhandledrejection]", e?.reason);
    // Optional: keep console cleaner on some browsers
    // e.preventDefault?.();
  });
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

/**
 * Enable Eruda only when URL has ?eruda=1 (DEV only)
 * Example: https://xxx.app.github.dev/?eruda=1
 */
if (import.meta.env.DEV) {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get("eruda") === "1") {
      import("eruda")
        .then((m) => m.default.init())
        .catch((err) => console.warn("Eruda failed to load:", err));
    }
  } catch {
    // do nothing
  }
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
