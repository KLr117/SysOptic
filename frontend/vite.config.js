import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
    server: {
    open: true, // 👈 Esto hace que se abra automáticamente en el navegador
  },
});
