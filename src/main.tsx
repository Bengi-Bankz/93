
import { createRoot } from "react-dom/client";
import App from "./App.tsx";

// Mount PixiJS React app
createRoot(document.getElementById("pixi-container")!).render(<App />);

// Mount Svelte overlay
import "./main.svelte.ts";
