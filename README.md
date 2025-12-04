## Personal Net-Worth Web Application

Production-ready personal net-worth tracker built with **Node.js + Express**, **SQLite + Prisma**, and a responsive **HTML/CSS/JS** frontend using **Chart.js** for charts.

### Tech Stack

- **Backend**: Node.js, Express, JWT auth, Prisma ORM (SQLite)
- **Database**: SQLite (single file `dev.db` in project root by default)
- **Frontend**: Vanilla HTML, CSS (mobile-first, responsive), JavaScript
- **Charts**: Chart.js via CDN

### Features

- Email + password authentication (register, login, logout, change password)
- Transactions: income/expense, categories + subcategories, search & filters
- Assets & liabilities with live **net-worth = assets – liabilities**
- Dashboards:
  - Overall net worth cards and recent transactions
  - Net worth time-series
  - Income vs expense overview
  - Monthly analysis (income, expenses, savings)
  - Top spending categories
- Fully responsive:
  - **Mobile (≤ 480px)**: bottom navigation, vertical layout
  - **Tablet (481–1024px)**: wider content, stacked cards
  - **Desktop (≥ 1025px)**: sidebar navigation + wide charts

---

## Getting Started

### 1. Install dependencies

From the project root (`finance software`):

```bash
npm install
```

### 2. Configure database

The Prisma schema is configured for SQLite and expects `DATABASE_URL` to be set. For local development you can rely on the default:

- Prisma will read `DATABASE_URL` from your environment (e.g. a local `.env` file).
- Recommended value:

```bash
DATABASE_URL="file:./dev.db"
```

Create a `.env` file in the project root and add that line, or export it in your shell before running Prisma commands.

### 3. Run migrations & generate Prisma client

```bash
npx prisma migrate dev --name init
npx prisma generate
```

This will create the SQLite file (e.g. `dev.db`) and apply the schema.

### 4. Run the server

```bash
npm run dev
```

The app will start on `http://localhost:3000` by default.

---

## Application Structure

- `src/server.js` – Express app bootstrap, static file serving, main routing
- `src/config/env.js` – configuration (port, DB URL, JWT secret)
- `src/utils/prisma.js` – Prisma client singleton
- `src/utils/password.js` – password hashing helpers
- `src/middleware/auth.js` – JWT auth, cookie helpers, `requireAuth`
- `src/middleware/validation.js` – simple validation & pagination helpers
- `src/routes`:
  - `auth.js` – `/api/auth/register`, `/login`, `/logout`, `/me`, `/change-password`
  - `categories.js` – `/api/categories`, `/api/subcategories`
  - `transactions.js` – `/api/transactions` CRUD, filters, search
  - `assets.js` – `/api/assets`, `/api/liabilities`
  - `dashboard.js` – `/api/dashboard/*` analytics & summaries
- `prisma/schema.prisma` – SQLite datasource + models
- `public/` – static frontend (HTML/CSS/JS)

---

## Frontend Pages

All pages are served statically from `public/`:

- `index.html` – Login & Register screen
- `dashboard.html` – Overall dashboard (net worth, assets, liabilities, charts, recent transactions)
- `transactions.html` – Transactions list with filters (date, type, category, text search) and inline add/edit form
- `assets.html` – Assets & liabilities management with totals and computed net worth
- `analysis.html` – Monthly charts for income vs expenses, savings, and top 5 spending categories
- `settings.html` – Account info and password change form

Shared styles and scripts:

- CSS:
  - `css/base.css` – reset, colors, typography, background
  - `css/layout.css` – responsive layout, sidebar, bottom nav, grid utilities
  - `css/components.css` – cards, tables, buttons, chips, form fields
  - `css/pages.css` – auth screen and page-specific tweaks
- JS:
  - `js/api.js` – `fetch` wrapper with JSON + auth handling
  - `js/ui.js` – nav highlighting and small UI helpers
  - `js/auth.js` – login/register switching and form handling
  - `js/dashboard.js` – dashboard data + net worth & income/expense charts
  - `js/transactions.js` – transactions table, filters, add/edit/delete
  - `js/assets.js` – assets/liabilities CRUD and totals computation
  - `js/analysis.js` – monthly income/expenses/savings + top category charts
  - `js/settings.js` – current user display and change-password flow

---

## API Overview

All endpoints return JSON. Authenticated routes require the auth cookie set by login/register.

- `POST /api/auth/register` – `{ email, password }`
- `POST /api/auth/login` – `{ email, password }`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/auth/change-password` – `{ currentPassword, newPassword }`

- `GET /api/categories`
- `POST /api/categories`
- `PUT /api/categories/:id`
- `DELETE /api/categories/:id`

- `GET /api/subcategories?categoryId=...`
- `POST /api/subcategories`
- `PUT /api/subcategories/:id`
- `DELETE /api/subcategories/:id`

- `GET /api/transactions?startDate&endDate&type&categoryId&search&page&pageSize`
- `POST /api/transactions`
- `PUT /api/transactions/:id`
- `DELETE /api/transactions/:id`

- `GET /api/assets`
- `POST /api/assets`
- `PUT /api/assets/:id`
- `DELETE /api/assets/:id`

- `GET /api/liabilities`
- `POST /api/liabilities`
- `PUT /api/liabilities/:id`
- `DELETE /api/liabilities/:id`

- `GET /api/dashboard/summary` – net worth, totals, recent transactions
- `GET /api/dashboard/net-worth-series` – 12‑month net-worth series (for chart)
- `GET /api/dashboard/monthly?year=YYYY` – monthly income/expenses/savings
- `GET /api/dashboard/top-categories?startDate&endDate&limit` – top expense categories

---

## Responsive Design

- Mobile-first styles with flexbox and CSS grid.
- Key breakpoints:
  - `≤ 480px`: bottom nav, stacked cards and charts
  - `481–1024px`: wider content, denser layout
  - `≥ 1025px`: persistent sidebar navigation and multi-column dashboard
- Charts use Chart.js with `responsive: true` and `maintainAspectRatio: false` to auto-resize with their containers.

---

## Notes & Production Tips

- Use a stronger `JWT_SECRET` via environment variable in production.
- Serve the app behind HTTPS and set cookies with `secure: true`.
- You can switch Prisma to PostgreSQL by updating `datasource db` in `schema.prisma` and `DATABASE_URL`, then running new migrations.


