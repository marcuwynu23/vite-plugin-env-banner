import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import envBanner from "@marcuwynu23/vite-plugin-env-banner";

export default defineConfig({
  plugins: [
    react(),
    envBanner({
      envfile: ".env.local",
    }),
  ],
});
