# ZampaStore (Nx workspace)

Monorepo Nx con:

- `frontend` (app Angular)
- `backend` (app Node/Express)
- `shared` (libreria TypeScript)

## Setup

```sh
npm install
```

## Configurazione ambiente

1) Copia il file `.env.example` in `.env` (root repo):

Windows (PowerShell):
```sh
Copy-Item .env.example .env
```

macOS/Linux:
```sh
cp .env.example .env
```

2) Compila le variabili in `.env`:
- `CLIENT_URL` e `PORT`
- `TIDB_*` (host, user, password, database)
- **TLS CA**: usa `TIDB_CA_PATH` (o `TIDB_CA_BASE64`)
- Stripe (opzionale): `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET`

## Database (TiDB/MySQL)

Script SQL disponibili:
- `backend/sql/initial.sql` (users, sessions, products, cart_items, stripe_events)
- `backend/sql/orders.sql` (orders, order_items, shipping_addresses)

Se il DB è nuovo:
```sql
SOURCE backend/sql/initial.sql;
SOURCE backend/sql/orders.sql;
```

Se il DB esiste già:
- esegui solo le parti mancanti (tabelle products/cart_items e FK su order_items.product_id).

## Stripe (opzionale)

Webhook locale (consigliato):
```sh
stripe listen --forward-to http://localhost:3333/api/payments/webhook
```

Se `stripe` non è nel PATH, usa il percorso completo al binario:
```sh
C:\\path\\to\\stripe.exe listen --forward-to http://localhost:3333/api/payments/webhook
```

L'endpoint backend è:
```
POST /api/payments/webhook
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

E2E (Cypress):
```sh
npx nx run frontend-e2e:e2e
```

E2E (Cypress) CI:
```sh
npx nx run frontend-e2e:e2e:ci
```

API Docs (Swagger):
```
http://localhost:3333/api/docs
```

## Checklist pre-deploy (locale)

```sh
npx nx format:check --base="remotes/origin/main"
```

```sh
npx nx run-many -t lint test build typecheck
```

Check totale (incluso E2E, senza cache):
```sh
npx nx run-many -t lint test typecheck build e2e --configuration=ci --skip-nx-cache
```
## Formattazione

```sh
npx nx format:write
```

## Note utili

- Alcuni target (es. `lint`/`typecheck`) sono inferiti da Nx in base a ESLint/TS e possono non comparire in `project.json`.
- `frontend:test` esegue un build reale prima dei test: il primo run puo essere lento, poi la cache Nx accelera i successivi.
- Al momento i test sono presenti solo in `frontend`: `backend` e `shared` non hanno test, quindi non esiste un target `test` per loro.
