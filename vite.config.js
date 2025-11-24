import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// IMPORTANT: change the base path to match your repo name (secuprison-sim)
export default defineConfig({
  plugins: [react()],
  base: "/secuprison-sim/",
});
