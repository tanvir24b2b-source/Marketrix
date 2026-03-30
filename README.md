# De Markt (Marketrix)

Production-oriented internal planning dashboard built with React + Vite + TypeScript and an Express + SQLite backend.

## Features
- Auth with first-admin bootstrap, password hashing, persistent cookie session.
- Role + permission access control (UI and API route enforcement).
- Device approval flow for non-admin users.
- Modules: Dashboard, Products, Content Plan, Ads Plan, Settings.
- Settings includes Profile, User management, Role management, Device approvals.
- Ads Plan supports multi-video entries + platform-aware preview.
- AI generator card (English, Bangla, Banglish) with ad copy + SMS/WhatsApp output.

## Run
```bash
npm install
npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:4000

## Build
```bash
npm run build
```

## Env
Copy `.env.example` to `.env` and set `JWT_SECRET`.
