# 🐾 ZampaStore

![CI](https://github.com/agatadicalogero/zampastore/actions/workflows/ci.yml/badge.svg)
![Angular](https://img.shields.io/badge/Angular-Standalone%20%7C%20Signals-DD0031?logo=angular&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)
![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-C5F74F?logo=drizzle&logoColor=111111)
![TiDB](https://img.shields.io/badge/TiDB-Serverless-1A73E8)
![Nx](https://img.shields.io/badge/Nx-Monorepo-143055?logo=nx&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-Test%20Mode-635BFF?logo=stripe&logoColor=white)

## 📖 Descrizione del Progetto

**ZampaStore** è un e-commerce full-stack per prodotti dedicati ad animali domestici, sviluppato come **progetto finale di Master**.

L'applicazione implementa un flusso completo:
- catalogo prodotti
- autenticazione utente
- carrello
- checkout con Stripe
- storico ordini

Il progetto è costruito con un approccio professionale su **Nx Monorepo**, separando chiaramente frontend, backend e contratti condivisi.

## ✨ Features Principali

- Autenticazione con **cookie HttpOnly** e gestione sessione lato server
- Protezione **CSRF** (cookie + header `x-csrf-token`) sulle operazioni sensibili
- Rate limiting dedicato per traffico globale, auth e checkout
- Catalogo prodotti con dettaglio prodotto e gestione stato UI moderna
- Carrello con aggiornamento quantità e rimozione elementi
- Checkout con creazione ordine e redirect a Stripe Checkout (test mode)
- Webhook Stripe con deduplica eventi (`stripe_events`)
- Storico ordini e dettaglio ordine per utente autenticato
- OpenAPI/Swagger disponibile per la REST API
- Test setup con **Cypress E2E**, unit test e linting via Nx

## 🏗️ Architettura e Scelte Tecniche

Il repository adotta una struttura enterprise-oriented, focalizzata su scalabilità e manutenzione.

### 1) Nx Monorepo + Domain Isolation

```text
zampastore/
├── frontend/                  # Angular SPA
├── backend/                   # Express REST API
├── libs/
│   ├── auth/                  # scope:auth (feature + data-access)
│   ├── cart/                  # scope:cart (feature + data-access)
│   ├── checkout/              # scope:checkout (feature + data-access)
│   ├── orders/                # scope:orders (feature + data-access)
│   ├── products/              # scope:products (feature + data-access)
│   ├── home/                  # scope:home
│   ├── payment/               # payment data-access
│   └── ui/                    # componenti/servizi UI condivisi
├── shared/                    # DTO e contratti condivisi FE/BE
└── api/[...all].ts            # entrypoint serverless per Vercel
```

Le librerie sono organizzate per dominio (`scope:*`) e tipo (`feature`, `data-access`, `shared`) con boundary chiari.

### 2) Type-Safety End-to-End con libreria `shared`

I contratti API (`AuthResponse`, `Product`, `CartDto`, `OrderDetail`, `CreateCheckoutSessionResponse`, ecc.) sono centralizzati in `shared/src/lib/*` e importati sia da frontend che backend.

Risultato:
- meno duplicazione
- meno mismatch nei payload
- refactor più sicuri

### 3) Frontend moderno (Angular)

- Standalone components
- Nuova sintassi template (`@if`, `@for`)
- Stato UI con **Signals**, `computed`, `effect`
- Router con lazy loading e guard funzionali (`CanActivateFn`)
- Interceptor HTTP per `withCredentials` + CSRF header injection

### 4) Backend robusto (Express + Drizzle)

- Middleware di sicurezza: `helmet`, `cors`, `cookie-parser`
- Rate limit con policy dedicate (`rateLimiter`, `authLimiter`, `checkoutLimiter`)
- Validazione input con **Zod**
- Error handling centralizzato (`AppError` + `errorHandler`)
- Accesso DB via **Drizzle ORM** su TiDB (MySQL compatible)
- Stripe webhook handling con verifica firma e deduplica eventi

## ⚠️ Disclaimer per l'Esaminatore

Questo progetto è stato sviluppato a **scopo didattico** (Progetto Finale Master).

- Usa un database di test (TiDB serverless).
- Usa Stripe in **test mode**.
- Include dati seed/mock per simulare un contesto realistico.

Per testare il checkout Stripe, puoi usare queste carte:

| Scenario | Numero carta |
| --- | --- |
| Pagamento riuscito | `4242 4242 4242 4242` |
| Pagamento rifiutato | `4000 0000 0000 9995` |
| 3D Secure richiesto | `4000 0025 0000 3155` |

Per tutti i test Stripe:
- scadenza futura (es. `12/34`)
- CVC qualsiasi (es. `123`)
- CAP qualsiasi valido

## 🛠️ Come avviare il progetto in locale

### Requisiti

- Node.js 20+ (consigliato)
- npm 10+

### 1) Installazione dipendenze

```bash
npm install
```

### 2) Setup variabili d'ambiente

```bash
cp .env.example .env
```

Compila `.env` con i tuoi valori (TiDB, Stripe, URL client).  
Riferimento: `.env.example`.

### 3) Allineamento schema database

```bash
nx run backend:db-push
```

### 4) Avvio backend e frontend

Terminale 1:

```bash
nx serve backend
```

Terminale 2:

```bash
nx serve frontend
```

In alternativa:

```bash
npm run start:all
```

### 5) URL locali utili

- Frontend: `http://localhost:4200`
- API: `http://localhost:3333/api`
- Swagger: `http://localhost:3333/api/docs`

## 🌐 Live Demo

Deploy (Vercel): **[inserire link qui](https://example.vercel.app)**

---

Sviluppato da **Agata Di Calogero**  
Progetto Finale - Master in Full Stack Development
