# ZampaStore (Nx workspace)

Monorepo Nx con:

- `frontend` (app Angular)
- `backend` (app Node/Express)
- `shared` (libreria TypeScript)

## Setup

```sh
npm install
```

## Comandi principali

Dev server (frontend):
```sh
npx nx serve frontend
```

Dev server (backend):
```sh
npx nx serve backend
```

Lint frontend:
```sh
npx nx lint frontend
```

Test frontend:
```sh
npx nx test frontend
```

Typecheck frontend:
```sh
npx nx typecheck frontend
```

Lint backend:
```sh
npx nx lint backend
```

Typecheck backend:
```sh
npx nx typecheck backend
```

Lint shared:
```sh
npx nx lint shared
```

Typecheck shared:
```sh
npx nx typecheck shared
```

Build frontend:
```sh
npx nx build frontend
```

Build backend:
```sh
npx nx build backend
```

Build shared:
```sh
npx nx build shared
```

E2E (Playwright) - install browser:
```sh
npx playwright install
```

E2E (Playwright):
```sh
npx nx run frontend-e2e:e2e
```

E2E (Playwright) CI:
```sh
npx nx run frontend-e2e:e2e:ci
```

## Checklist pre-deploy (locale)

```sh
npx nx format:check --base="remotes/origin/main"
```

```sh
npx nx run-many -t lint test build typecheck
```
## Formattazione

```sh
npx nx format:write
```

## Note utili

- Alcuni target (es. `lint`/`typecheck`) sono inferiti da Nx in base a ESLint/TS e possono non comparire in `project.json`.
- `frontend:test` esegue un build reale prima dei test: il primo run puo essere lento, poi la cache Nx accelera i successivi.
- Al momento i test sono presenti solo in `frontend`: `backend` e `shared` non hanno test, quindi non esiste un target `test` per loro.
