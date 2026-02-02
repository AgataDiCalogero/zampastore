---
description: Setup database and run all checks before committing
---

# Database Sync & Full Check Workflow

// turbo-all

## Pre-requisites

Make sure you have a terminal open in the project root: `c:\Users\agata\PROGETTI\ESERCITAZIONI\zampastore`

## Step 1: Reset Database (only if schema changed)

```bash
npx tsx backend\src\db\reset.ts
```

## Step 2: Push Schema to TiDB

```bash
npx drizzle-kit push
```

When prompted, select "No, add the constraint without truncating the table" unless you want to clear data.

## Step 3: Build Backend (verify no compile errors)

```bash
npx nx run backend:build --skip-nx-cache
```

## Step 4: Run Full CI Checks

```bash
npx nx run-many -t lint test typecheck build e2e --configuration=ci --skip-nx-cache
```

## Troubleshooting

### E2E fails with "Nessun prodotto disponibile"

The database is empty. The backend auto-seeds products on startup. Make sure:

1. Tables exist (Step 2 completed)
2. Backend has started at least once

### Build fails with "ProductWithStock not found"

Run Step 3 first to verify the TypeScript compiles.

### Foreign Key errors on drizzle-kit push

Run Step 1 to clear the database, then Step 2.
