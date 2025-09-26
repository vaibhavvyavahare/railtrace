AI_connector
============

Node/Express service that:
- Fetches vendor/lot/batch data from existing Postgres DB
- Generates summaries using Gemini (stub) and stores in `summary_reports`
- Detects maintenance alerts and stores in `maintenance_alerts`
- Exposes APIs to retrieve summaries and alerts

Setup
-----
1. Create `.env` in this folder:

```
DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DB
DB_SSL=false
AI_CONNECTOR_PORT=5055
GEMINI_API_KEY=your_key_here
```

2. Install and run:

```
npm i
npm run dev
```

Database
--------
Apply schema for AI tables (run after base schema in project root):

```
psql "$DATABASE_URL" -f ../sql/ai_connector_tables.sql
```

APIs
----
- GET `/health` → service and DB check
- GET `/api/reports?vendor_id=V-001&lot_id=...&batch_id=...&limit=50`
- POST `/api/reports/generate` → placeholder enqueue
- GET `/api/alerts?vendor_id=V-001&status=open&limit=50`

Services
--------
- `services/summarization.js` vendor/lot/batch level generation using Gemini stub
- `services/alerts.js` heuristic-based maintenance alert generation

Notes
-----
- Replace `services/gemini.js` with actual Gemini SDK calls.
- Make sure base tables from `database.sql` exist in the same database.


