import { defineConfig, loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  // 🔹 Cargar variables según el modo (development / production)
  const env = loadEnv(mode, process.cwd(), "");

  console.log("🌍 VITE_API_URL cargada:", env.VITE_API_URL);

  return {
    plugins: [tailwindcss()],
    define: {
      "import.meta.env.VITE_API_URL": JSON.stringify(env.VITE_API_URL),
      "import.meta.env.VITE_ASSET_URL": JSON.stringify(env.VITE_ASSET_URL),
    },
    server: {
      open: true,
    },
  };
});
