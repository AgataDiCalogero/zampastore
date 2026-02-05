🐾 Zampastore - E-commerce Full Stack Moderno

Progetto Finale Master Full Stack Development - Start2Impact University

Un'architettura Enterprise-grade per un e-commerce scalabile, costruito con le best practices del 2024/2025.
Deployment: Full Serverless su Vercel con Database TiDB Cloud.

🌟 Visione del Progetto

Zampastore è una simulazione di un ambiente di produzione reale. L'obiettivo è stato abbandonare l'architettura monolitica classica a favore di un approccio Monorepo modulare con Nx, separando chiaramente le responsabilità tra feature, UI e logica di business.

Key Features

Architettura a Librerie: Il codice è organizzato in librerie verticali riutilizzabili (libs/auth, libs/products, libs/cart) per garantire manutenibilità e scalabilità.

Angular Moderno: Utilizzo intensivo di Standalone Components, Signals per la gestione reattiva dello stato (senza overhead di Zone.js) e il nuovo Control Flow (@if, @for).

Backend Serverless: API RESTful in Node.js/Express ottimizzate per l'esecuzione in ambiente Serverless su Vercel, garantendo costi ridotti e scaling automatico.

Database Distribuito: Persistenza dati affidata a TiDB (MySQL compatible), un database NewSQL cloud-native per performance elevate.

Sicurezza & Qualità: Autenticazione JWT (HttpOnly Cookies), protezione CSRF, Rate Limiting e validazione rigida dei dati con Zod.

🛠️ Tech Stack

Frontend (apps/frontend)

Framework: Angular 17+

Styling: Tailwind CSS + PrimeNG (per componenti UI complessi).

State Management: Angular Signals (nativo).

Architecture: Pattern Smart (Feature) vs Dumb (UI) Components.

Backend (apps/backend)

Runtime: Node.js (adattato per Vercel Serverless Functions).

Framework: Express.js.

Database: TiDB Cloud (Protocollo MySQL).

ORM: Drizzle ORM (Type-safe SQL).

Tooling & DevOps

Monorepo: Nx Workspace.

Testing: Cypress (E2E).

CI/CD: GitHub Actions & Vercel.

🚀 Guida all'Installazione

Prerequisiti

Node.js (v20 o superiore)

Account TiDB Cloud (o un database MySQL locale per lo sviluppo offline).

1. Clona la repository

git clone https://github.com/agatadicalogero/zampastore.git
cd zampastore

2. Installazione Dipendenze

npm install

3. Configurazione Variabili d'Ambiente

Crea un file .env nella root del progetto (non committarlo mai!):

# URL di connessione a TiDB (o MySQL locale)

# Esempio TiDB: mysql://user:password@gateway.tidb.cloud:4000/zampastore?ssl={"minVersion":"TLSv1.2"}

DATABASE_URL="la_tua_stringa_di_connessione"

# Chiave segreta per la firma dei token JWT

JWT_SECRET="una_stringa_molto_lunga_e_segreta"

# Porta per il server locale (default 3000)

PORT=3000

4. Setup Database

Esegui le migrazioni Drizzle per creare le tabelle nel database e popolarlo con dati di test:

# Esegue le migrazioni

npx nx run backend:db-migrate

# Popola il DB con prodotti e utenti di prova

npx nx run backend:db-seed

5. Avvio Sviluppo Locale

Lancia frontend e backend in parallelo con un unico comando:

```bash
npm run start:all
```

Questo avvierà:

- Backend API: http://localhost:3000
- Frontend: http://localhost:4200 (attende che il backend sia pronto)

🧪 Testing

Il progetto include una suite di test End-to-End con Cypress per verificare i flussi critici (es. acquisto, login).

# Esegui i test E2E in modalità headless

npx nx e2e frontend-e2e

📂 Struttura del Codice (Nx Monorepo)

zampastore/
├── apps/
│ ├── frontend/ # SPA Angular
│ └── backend/ # API Express (Serverless entry point)
├── libs/
│ ├── auth/ # Login, Register, Guards, Interceptors
│ ├── cart/ # Logica del carrello e gestione stato
│ ├── products/ # Catalogo prodotti e dettagli
│ ├── orders/ # Gestione ordini utente
│ └── ui/ # Componenti riutilizzabili (Card, Bottoni)
└── tools/ # Configurazioni Nx

👩💻 Autore

Agata Di Calogero

Full Stack Developer

LinkedIn | GitHub

Progetto sviluppato come tesi finale per il Master in Full Stack Development - Start2Impact University.
