# Personal Finance Management System

A comprehensive personal finance management application built with a modern tech stack, featuring transaction tracking, asset/liability management, and insightful financial analytics.

## 🚀 Features

### Authentication & User Management
- Secure email/password authentication with JWT
- User registration and profile management
- Password change and reset functionality

### Transaction Management
- Track income and expenses with categories
- Categorize transactions with custom categories and subcategories
- Advanced search and filtering capabilities
- Transaction history with detailed views

### Asset & Liability Tracking
- Monitor all financial assets (savings, investments, property)
- Track liabilities (loans, credit cards, mortgages)
- Real-time net worth calculation

### Financial Analytics
- Interactive dashboards with Chart.js visualizations
- Income vs. expense analysis
- Monthly and yearly financial summaries
- Spending patterns and category-wise breakdowns
- Custom date range reporting

### Responsive Design
- Mobile-first approach for all devices
- Adaptive layouts for different screen sizes
- Intuitive navigation and user experience

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js with Express.js
- **Authentication**: JWT (JSON Web Tokens)
- **ORM**: Prisma
- **API**: RESTful API design
- **Security**: Helmet, CORS, rate limiting

### Database
- **Primary Database**: SQLite (file-based for easy setup)
- **Migrations**: Prisma Migrate
- **Data Modeling**: Type-safe with Prisma schema

### Frontend
- **Core**: Vanilla JavaScript (ES6+)
- **Styling**: Custom CSS with responsive design
- **Charts**: Chart.js for data visualization
- **UI/UX**: Mobile-first, accessible components

### Development Tools
- **Package Manager**: npm
- **Environment Management**: dotenv
- **API Testing**: Included test scripts
- **Code Quality**: ESLint, Prettier (recommended)

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm (v7 or later)
- SQLite (included with Node.js)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/personal-finance-app.git
   cd personal-finance-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory with the following variables:
   ```env
   PORT=3000
   JWT_SECRET=your_jwt_secret_key
   DATABASE_URL="file:./dev.db"
   NODE_ENV=development
   ```

4. **Initialize the database**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`

### Development

- **Run in development mode**: `npm run dev`
- **Build for production**: `npm run build`
- **Start production server**: `npm start`
- **Run database migrations**: `npm run prisma:migrate:deploy`

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


