# AidPriority

A Social Welfare Priority Assessment System built with React, Express, and SQLite.

## Architecture

- **Frontend:** React.js + Vite
- **Backend:** Node.js + Express
- **Database:** SQLite (local file, auto-created on first run)
- **Authentication:** JWT with bcrypt password hashing, admin/social_worker roles

## Design Rule

The assessment engine produces a **recommended priority level** (HIGH / MEDIUM / LOW), but an authorized social welfare worker must make the final decision. No automatic approval or rejection.

## Quick Start

From the project root (`C:\Lamao\aidpriority`):

```bash
# Install all dependencies (root, server, client)
npm run install:all

# Start backend (port 3001) and frontend (port 5173) together
npm start
```

Or run each in its own terminal:

```bash
# Backend
cd server && node server.js

# Frontend
cd client && npm run dev
```

Open http://localhost:5173 and log in with the seeded admin account:

- **Username:** admin
- **Password:** admin123

Place `npm start` from the project root — not from `C:\Lamao`.

## Project Structure

```
aidpriority/
├── client/          # React frontend (Vite)
│   └── src/
│       ├── pages/   # Dashboard, Applicants, Assessment, Beneficiaries, Assistance, Reports, Login
│       ├── services/
│       ├── utils/assessment.js
│       └── App.jsx
├── server/          # Express backend
│   ├── database/
│   │   ├── schema.sql
│   │   └── seed.sql
│   ├── routes/
│   ├── middleware/
│   ├── db.js        # SQLite connection (promisified)
│   └── server.js    # Auto-creates schema + admin user on start
├── README.md
└── package.json
```

## Features

- User authentication (login/register, JWT, role-based access)
- Household and applicant registration
- Assessment with predefined criteria and automatic priority recommendation
- Human decision workflow (ELIGIBLE / NOT_ELIGIBLE / FOR_REVIEW / PENDING)
- Beneficiary management (requires an ELIGIBLE decision first)
- Assistance tracking and distribution history
- Dashboard statistics
- Filterable reports with CSV export and printable view

## Reset the database

Delete `aidpriority.db` in the project root — it is recreated and reseeded on the next server start.