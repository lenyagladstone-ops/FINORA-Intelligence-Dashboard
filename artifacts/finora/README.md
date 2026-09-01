# FINORA Intelligence Dashboard

FINORA is a frontend-only financial intelligence prototype with editable investor onboarding, a visual pinned vision board, INR-first currency display, persona-weighted market reasoning, and a live Judge Panel.

## Run locally

Requirements: Node.js 20+ and Corepack.

```bash
corepack enable
pnpm install
PORT=5173 BASE_PATH=/ pnpm --filter @workspace/finora run dev
```

Open the local URL printed by Vite. The app stores profile details, currency preference, and vision-board pins in browser local storage.

## Included interactions

- Enter name, age band, monthly investable surplus, investing experience, and current holdings.
- Pick horizon, objective, risk budget, and an investor persona.
- Pin goals from the library, upload a personal picture, add a custom goal, and drag or arrow-rank priorities.
- Use INR by default or switch the dashboard to USD, EUR, GBP, or SGD.
- Open any market signal to compare the same event through different persona lenses.

This build uses simulated market data and does not require brokerage credentials or external services.