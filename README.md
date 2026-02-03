# ZampaStore 🐾

ZampaStore è un e-commerce moderno e scalabile dedicato al benessere di cani e gatti.
Realizzato come **Enterprise Monorepo** con Nx, dimostra un'architettura **Full Stack** avanzata (Angular 17+ & Node.js).

![ZampaStore Preview](https://via.placeholder.com/1200x600?text=ZampaStore+Preview)
_(Sostituire con screenshot reale)_

## 🚀 Tech Stack

### Frontend

- **Framework**: Angular 17+ (Signals, Standalone Components, @defer)
- **Styling**: PrimeNG + Tailwind CSS (Utility-first)
- **State Management**: Reactive State with Signals & RxJS
- **Performance**: OnPush Strategy, Lazy Loading

### Backend

- **Runtime**: Node.js (Express)
- **Database**: MySQL con Drizzle ORM
- **Security**: Helmet, Rate Limiting, Zod Validation, CSRF Protection
- **Architecture**: Service-Repository Pattern, Centralized Error Handling

### Tooling

- **Monorepo**: Nx
- **Testing**: Cypress (E2E), Vitest (Unit)
- **CI/CD**: Ready for GitHub Actions

## 🛠️ Installazione

1. **Clona il repository**:

   ```bash
   git clone https://github.com/tuo-user/zampastore.git
   cd zampastore
   ```

2. **Installa le dipendenze**:

   ```bash
   npm install
   ```

   _Nota: Cypress è bloccato alla versione 13.6.0 per compatibilità Windows._

3. **Configura l'ambiente**:
   Copia `.env.example` in `.env` e configura le credenziali del database.

   ```bash
   cp .env.example .env
   ```

4. **Avvia il Database**:
   Assicurati di avere un'istanza MySQL in esecuzione.
   ```bash
   # Push dello schema
   npx nx run backend:db-push
   # Seed dei dati iniziali
   npx nx run backend:db-seed
   ```

## ▶️ Avvio Sviluppo

Per avviare **Frontend** e **Backend** in parallelo:

```bash
npm run dev
```

- **Frontend**: http://localhost:4200
- **Backend**: http://localhost:3333/api
- **Swagger Docs**: http://localhost:3333/api/docs

## 🔐 Credenziali di Test

| Ruolo      | Email          | Password |
| ---------- | -------------- | -------- |
| **Utente** | user@zampa.it  | 123456   |
| **Admin**  | admin@zampa.it | 123456   |

## 🧪 Testing

Esegui i test Unitari:

```bash
npx nx test
```

Esegui i test E2E (richiede server attivo):

```bash
npm run e2e:local
```

### 🏁 Check Finale (Mega Check)

Per verificare che tutto sia perfetto prima di un commit (Lint, Test, Typecheck, Build, E2E):

```bash
npx nx run-many -t lint test typecheck build e2e --configuration=ci --skip-nx-cache
```

## 📐 Architettura

Il progetto segue la struttura **Nx Enterprise Monorepo**:

- **apps/frontend**: Applicazione Angular principale.
- **apps/backend**: API REST Node.js.
- **libs/**: Logica di business riutilizzabile, divisa in:
  - `feature`: Componenti intelligenti e pagine.
  - `ui`: Componenti di presentazione (dumb).
  - `data-access`: Servizi API, State management e Tipi.

---

Developed with ❤️ by [Agata]
