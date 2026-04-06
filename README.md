# @marcuwynu23/vite-plugin-env-banner

A lightweight Vite plugin that injects a floating, draggable environment badge into your app so non-production builds are always clearly visible.

The banner is intentionally disabled when the resolved environment is `production`.

## Why use this plugin

- Reduce deployment mistakes by making environment context obvious.
- Keep QA/UAT demos clear with visible `DEVELOPMENT` / `STAGING` labels.
- Move the badge anywhere on screen when it overlaps UI controls.
- Use zero runtime dependencies.

## Features

- Uses Vite's `transformIndexHtml` to inject the banner.
- Draggable banner implemented with vanilla JavaScript.
- Built-in color mapping:
  - `development` -> blue
  - `staging` -> orange
  - any other non-production value -> gray
- Defaults to `development` when no value is resolved.
- Skips injection entirely for `production`.
- Supports explicit env source via `env` or `envfile`.

## Installation

```bash
npm install @marcuwynu23/vite-plugin-env-banner
```

## Quick Start

```ts
import { defineConfig } from "vite";
import envBanner from "@marcuwynu23/vite-plugin-env-banner";

export default defineConfig({
  plugins: [envBanner()],
});
```

## Configuration

```ts
envBanner({
  env: "staging",
  envfile: "./config/.env.staging",
});
```

### Options

| Option | Type | Required | Description |
| --- | --- | --- | --- |
| `env` | `string` | No | Hard override for the environment value (`production`, `staging`, etc.). |
| `envfile` | `string` | No | Path to a specific env file to read `VITE_APP_ENV` from. Relative paths resolve from Vite root. |

### Resolution precedence

The plugin resolves the final environment in this order:

1. `env` option
2. `envfile` value (`VITE_APP_ENV` key inside that file)
3. Vite resolved env (`VITE_APP_ENV`)
4. fallback: `development`

## Environment Example

`.env`:

```env
VITE_APP_ENV=development
```

When `VITE_APP_ENV=production`, the plugin returns HTML unchanged and injects nothing.

## Example Project

A runnable Vite + React sample is included in `example-react`.

```bash
cd example-react
npm install
npm run dev
```

## License

MIT
