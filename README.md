# AidPriority

A Social Welfare Priority Assessment System built with React, Express, and SQLite.

## Architecture

- **Frontend:** React.js + Vite
- **Backend:** Node.js + Express
- **Database:** SQLite
- **Authentication:** JWT with bcrypt password hashing, admin/social_worker roles

## Design Rule

The assessment engine produces a **recommended priority level** (HIGH / MEDIUM / LOW), but an authorized social welfare worker must make the final decision. No automatic approval or rejection.

## Quick Start

```bash
# Install server and client dependencies
cd server && npm install
cd ../client && npm install

# Start the backend
cd server && node server.js

# Start the frontend (in another terminal)
cd client && npm run dev

# Open http://localhost:5173
# Login: admin / admin123
```

## Project Structure

```
aidpriority/
├── client/          # React frontend (Vite)
├── server/          # Express backend
│   ├── database/
│   │   ├── schema.sql
│   │   └── seed.sql
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── db.js
│   └── server.js
├── README.md
└── package.json
```

## Features

- User authentication (login/register, JWT, role-based access)
- Household and applicant registration
- Assessment with predefined criteria and automatic priority recommendation
- Human decision workflow (ELIGIBLE / NOT_ELIGIBLE / FOR_REVIEW / PENDING)
- Beneficiary management
- Assistance tracking and distribution history
- Dashboard statistics
- Filterable reports with CSV export and printable view
