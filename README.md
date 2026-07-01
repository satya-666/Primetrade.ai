# Task Manager

Full-stack task management application with JWT auth, PostgreSQL persistence, and a minimal React frontend.

## Tech Stack

- **Backend:** Node.js, Express, TypeScript, Prisma ORM, PostgreSQL
- **Auth:** JWT (access + refresh tokens), bcrypt password hashing
- **Frontend:** React 18, Vite, TypeScript, plain CSS
- **Docs:** Swagger (OpenAPI) auto-generated from route annotations

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm

## Setup

### 1. Clone and install

```bash
# Backend
cd backend
cp .env.example .env   # Edit .env with your DB credentials
npm install
npx prisma db push
npx tsx prisma/seed.ts

# Frontend
cd ../frontend
npm install
```

### 2. Environment Variables (backend/.env)

| Variable                | Description                  | Default                                    |
|-------------------------|------------------------------|--------------------------------------------|
| `DATABASE_URL`          | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/task_manager` |
| `JWT_SECRET`            | JWT signing secret           | (required)                                 |
| `JWT_ACCESS_EXPIRES_IN` | Access token TTL             | `15m`                                      |
| `JWT_REFRESH_EXPIRES_IN`| Refresh token TTL            | `7d`                                       |
| `PORT`                  | Server port                  | `3000`                                     |

### 3. Run

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

- Backend: http://localhost:3000
- Swagger docs: http://localhost:3000/api/docs
- Frontend: http://localhost:5173

### 4. Seed Users

Run `npx tsx prisma/seed.ts` (after `npx prisma db push`) to create:

| Email               | Password      | Role  |
|---------------------|---------------|-------|
| admin@example.com   | password123   | admin |
| user@example.com    | password123   | user  |

### 5. Database Migrations

```bash
cd backend
npx prisma db push          # Push schema changes without migration history
npx prisma migrate dev      # Create and apply a new migration
npx prisma studio           # Open Prisma Studio GUI
```

## API Endpoints

All endpoints prefixed with `/api/v1`.

### Auth
| Method | Path              | Auth     | Description          |
|--------|-------------------|----------|----------------------|
| POST   | /auth/register    | No       | Register new user    |
| POST   | /auth/login       | No       | Login                |
| POST   | /auth/refresh     | No       | Refresh access token |
| POST   | /auth/logout      | Yes      | Logout               |

### Tasks
| Method | Path              | Auth     | Description                        |
|--------|-------------------|----------|------------------------------------|
| GET    | /tasks            | Yes      | User sees own; admin sees all      |
| POST   | /tasks            | Yes      | Create task                        |
| PUT    | /tasks/:id        | Yes      | Update task (owner or admin)       |
| DELETE | /tasks/:id        | Yes      | Delete task (owner or admin)       |

## Project Structure

```
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── seed.ts          # Seed script
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/       # auth, validation, error handler
│   │   ├── routes/          # Express routes + Swagger annotations
│   │   ├── schemas/         # Zod validation schemas
│   │   ├── utils/           # JWT helpers, Prisma client
│   │   ├── swagger.ts       # Swagger config
│   │   └── index.ts         # App entry point
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # TaskForm, Toast
│   │   ├── pages/           # Login, Register, Dashboard
│   │   ├── hooks/           # useAuth
│   │   ├── utils/           # API client
│   │   ├── App.tsx          # Routes and auth guards
│   │   └── main.tsx         # Entry point
│   ├── index.html
│   └── package.json
├── README.md
└── SCALABILITY.md
```
# Primetrade.ai
