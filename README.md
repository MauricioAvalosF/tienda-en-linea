# Tienda en Línea

E-commerce platform built with Next.js + Express + Neon PostgreSQL.

## Stack

| Layer | Tech | Platform |
|-------|------|----------|
| Frontend | Next.js 14, Tailwind CSS | Vercel |
| Backend | Node.js, Express, Prisma | Railway |
| Database | PostgreSQL | Neon |
| Payments | Stripe | — |

## Structure

```
tienda-en-linea/
├── frontend/   # Next.js app → Vercel
└── backend/    # Express API → Railway
```

## Getting Started

### Backend
```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev
npm run dev
```

### Frontend
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```
