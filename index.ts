/// <reference types="node" />
import { existsSync, readFileSync } from "node:fs";
import { isAbsolute, resolve } from "node:path";

type ViteLikePlugin = {
  name: string;
  configResolved?: (config: { env?: Record<string, string>; root?: string }) => void;
  transformIndexHtml: (html: string) => string;
};

type EnvBannerOptions = {
  /**
   * Optionally override the environment value.
   * Falls back to import.meta.env.VITE_APP_ENV or "development".
   */
  env?: string;
  /**
   * Optional .env file path to read VITE_APP_ENV from.
   * Relative paths resolve from Vite root (or process.cwd()).
   */
  envfile?: string;
};

function normalizeEnv(input?: string): string {
  const value = input?.trim().toLowerCase();
  return value && value.length > 0 ? value : "development";
}

function readEnvValueFromFile(envFilePath: string): string | undefined {
  if (!existsSync(envFilePath)) {
    return undefined;
  }

  const raw = readFileSync(envFilePath, "utf8");
  const lines = raw.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const eqIndex = trimmed.indexOf("=");
    if (eqIndex <= 0) {
      continue;
    }

    const key = trimmed.slice(0, eqIndex).trim();
    if (key !== "VITE_APP_ENV") {
      continue;
    }

    let value = trimmed.slice(eqIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    return value;
  }

  return undefined;
}

function buildBannerHtml(selectedEnv: string): string {
  const id = "__vite_env_banner";
  const envLiteral = JSON.stringify(selectedEnv);

  return `
<script type="module">
(() => {
  const env = ${envLiteral};
  if (env === "production") return;

  const colors = {
    development: "#1d4ed8",
    staging: "#f97316",
  };

  const bannerEl = document.createElement("div");
  bannerEl.id = "${id}";
  bannerEl.textContent = env.toUpperCase();
  bannerEl.style.position = "fixed";
  bannerEl.style.top = "12px";
  bannerEl.style.right = "12px";
  bannerEl.style.zIndex = "2147483647";
  bannerEl.style.background = colors[env] || "#6b7280";
  bannerEl.style.color = "#fff";
  bannerEl.style.font = "700 12px/1.2 system-ui,-apple-system,Segoe UI,Roboto,sans-serif";
  bannerEl.style.letterSpacing = ".04em";
  bannerEl.style.padding = "6px 10px";
  bannerEl.style.borderRadius = "8px";
  bannerEl.style.boxShadow = "0 4px 6px -1px rgba(0,0,0,.12),0 2px 4px -2px rgba(0,0,0,.12)";
  bannerEl.style.cursor = "move";
  bannerEl.style.userSelect = "none";
  document.body.appendChild(bannerEl);

  const el = document.getElementById("${id}");
  if (!el) return;

  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let startLeft = 0;
  let startTop = 0;

  const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

  el.addEventListener("mousedown", (event) => {
    isDragging = true;

    const rect = el.getBoundingClientRect();
    startLeft = rect.left;
    startTop = rect.top;
    startX = event.clientX;
    startY = event.clientY;

    el.style.right = "auto";
    el.style.bottom = "auto";
    el.style.left = startLeft + "px";
    el.style.top = startTop + "px";

    event.preventDefault();
  });

  window.addEventListener("mousemove", (event) => {
    if (!isDragging) return;

    const maxLeft = Math.max(0, window.innerWidth - el.offsetWidth);
    const maxTop = Math.max(0, window.innerHeight - el.offsetHeight);
    const nextLeft = clamp(startLeft + (event.clientX - startX), 0, maxLeft);
    const nextTop = clamp(startTop + (event.clientY - startY), 0, maxTop);

    el.style.left = nextLeft + "px";
    el.style.top = nextTop + "px";
  });

  const stopDrag = () => {
    isDragging = false;
  };

  window.addEventListener("mouseup", stopDrag);
  window.addEventListener("mouseleave", stopDrag);
})();
</script>
`;
}

export default function envBanner(
  options: EnvBannerOptions = {},
): ViteLikePlugin {
  let selectedEnv = normalizeEnv(options.env);

  return {
    name: "vite-plugin-env-banner",
    configResolved(config) {
      if (options.env) {
        selectedEnv = normalizeEnv(options.env);
        return;
      }

      if (options.envfile) {
        const baseDir = config.root ?? process.cwd();
        const absolutePath = isAbsolute(options.envfile)
          ? options.envfile
          : resolve(baseDir, options.envfile);
        const fromFile = readEnvValueFromFile(absolutePath);
        selectedEnv = normalizeEnv(fromFile);
        return;
      }

      selectedEnv = normalizeEnv(config.env?.VITE_APP_ENV);
    },
    transformIndexHtml(html) {
      if (selectedEnv === "production") {
        return html;
      }

      return html.replace("</body>", `${buildBannerHtml(selectedEnv)}</body>`);
    },
  };
}
