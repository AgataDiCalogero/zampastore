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

```sh
# dev server
npx nx serve frontend
npx nx serve backend

# lint, test, typecheck
npx nx lint frontend
npx nx test frontend
npx nx typecheck frontend
npx nx lint backend
npx nx typecheck backend
npx nx lint shared
npx nx typecheck shared

# build
npx nx build frontend
npx nx build backend
npx nx build shared

# esegui lo stesso target su piu progetti
npx nx run-many -t lint test build typecheck
npx nx affected -t lint test build typecheck
```

## Checklist pre-deploy (locale)

```sh
npx nx format:check --base="remotes/origin/main"
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
