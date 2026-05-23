# DevPulse API

> Internal Tech Issue & Feature Tracker — a collaborative platform for software teams to report bugs, suggest features, and coordinate resolutions.

**Live URL:** `https://devpulse-api.your-deployment.com`  
**GitHub:** `https://github.com/yourusername/devpulse`

---

## Features

- JWT-based authentication with role-based access control (`contributor` / `maintainer`)
- Create, read, update, and delete bug reports and feature requests
- Filter and sort issues by type, status, and date
- Modular TypeScript architecture (`controller` / `service` / `interface` / `route`)
- Raw SQL with PostgreSQL — no ORMs or query builders
- Secure password hashing with bcryptjs

---

## Tech Stack

| Technology | Purpose |
|---|---|
| Node.js 24.x | Runtime |
| TypeScript | Type safety |
| Express.js | HTTP framework |
| PostgreSQL | Relational database |
| `pg` | Native PostgreSQL driver |
| `bcryptjs` | Password hashing |
| `jsonwebtoken` | JWT auth tokens |
| `http-status-codes` | Status code constants |

---

## Local Setup

### 1. Clone & install

```bash
git clone https://github.com/yourusername/devpulse.git
cd devpulse
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=3000
DATABASE_URL=postgresql://user:password@host:5432/devpulse
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
```

### 3. Initialise the database

```bash
npm run db:init
```

### 4. Start the development server

```bash
npm run dev
```

---

## API Endpoints

### Auth

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Public | Register a new user |
| `POST` | `/api/auth/login` | Public | Login and receive JWT |

### Issues

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/issues` | Authenticated | Create a new issue |
| `GET` | `/api/issues` | Public | Get all issues (with filters) |
| `GET` | `/api/issues/:id` | Public | Get a single issue |
| `PATCH` | `/api/issues/:id` | Authenticated | Update an issue |
| `DELETE` | `/api/issues/:id` | Maintainer only | Delete an issue |

#### Query Parameters for `GET /api/issues`

| Param | Values | Default |
|---|---|---|
| `sort` | `newest`, `oldest` | `newest` |
| `type` | `bug`, `feature_request` | — |
| `status` | `open`, `in_progress`, `resolved` | — |

#### Authorization Header

```
Authorization: <JWT_TOKEN>
```

---

## Database Schema

### `users`

| Column | Type | Notes |
|---|---|---|
| `id` | `SERIAL PRIMARY KEY` | Auto-increment |
| `name` | `VARCHAR(255) NOT NULL` | Display name |
| `email` | `VARCHAR(255) UNIQUE NOT NULL` | Login address |
| `password` | `VARCHAR(255) NOT NULL` | Bcrypt hash, never returned |
| `role` | `VARCHAR(20) DEFAULT 'contributor'` | `contributor` or `maintainer` |
| `created_at` | `TIMESTAMPTZ DEFAULT NOW()` | Auto-set on insert |
| `updated_at` | `TIMESTAMPTZ DEFAULT NOW()` | Auto-refreshed on update |

### `issues`

| Column | Type | Notes |
|---|---|---|
| `id` | `SERIAL PRIMARY KEY` | Auto-increment |
| `title` | `VARCHAR(150) NOT NULL` | Max 150 characters |
| `description` | `TEXT NOT NULL` | Min 20 characters |
| `type` | `VARCHAR(20) NOT NULL` | `bug` or `feature_request` |
| `status` | `VARCHAR(20) DEFAULT 'open'` | `open`, `in_progress`, `resolved` |
| `reporter_id` | `INTEGER NOT NULL` | References `users.id` (app-level validation) |
| `created_at` | `TIMESTAMPTZ DEFAULT NOW()` | Auto-set on insert |
| `updated_at` | `TIMESTAMPTZ DEFAULT NOW()` | Auto-refreshed on update |

---

## Project Structure

```
src/
├── config/
│   ├── db.ts               # PostgreSQL pool
│   └── db.init.ts          # Table creation script
├── middleware/
│   ├── auth.middleware.ts  # JWT authenticate + requireRole
│   └── error.middleware.ts # Global error handler + 404
├── modules/
│   ├── auth/
│   │   ├── auth.interface.ts  # User, JWT, request body types
│   │   ├── auth.service.ts    # signupUser, loginUser
│   │   ├── auth.controller.ts # HTTP handlers
│   │   └── auth.route.ts      # Express router
│   └── issues/
│       ├── issues.interface.ts  # Issue types and filters
│       ├── issues.service.ts    # CRUD business logic
│       ├── issues.controller.ts # HTTP handlers
│       └── issues.route.ts      # Express router
├── utils/
│   ├── db.helpers.ts  # query, queryOne, queryMany
│   ├── jwt.ts         # signToken, verifyToken
│   ├── response.ts    # sendSuccess, sendError
│   └── types.ts       # Re-exports from module interfaces
├── app.ts             # Express app setup
└── index.ts           # Server entry point
```
