# Project State

## Project

AI Lead Agent is a local MVP with:

- FastAPI backend
- Next.js frontend
- SQLite database
- Gemini/OpenAI AI generation
- Gmail SMTP sending

## Current App Areas

### Public

- `/lead-portal`
  - multi-step lead intake form
  - creates lead through `POST /leads/create`
  - auto-scores immediately
  - outreach and follow-up generation continue in background
- `/lead-portal/success`
  - score-based success message
  - `Book a Call` button
- `/services`
  - public services catalog
  - pagination: 3 services per page
  - `Book Service` button on each service

### Admin

- `/admin`
  - config-file-based login
- `/dashboard`
  - protected
  - lead table, filters, pagination, mobile cards
- `/pipeline`
  - protected
- `/service-admin`
  - protected
  - create/edit/delete services

## Admin Auth

Admin credentials are stored in:

- `frontend/config/admin.config.ts`

Session handling:

- cookie name: `ai_lead_agent_admin`
- middleware protects:
  - `/dashboard`
  - `/pipeline`
  - `/service-admin`

Important files:

- `frontend/lib/auth.ts`
- `frontend/middleware.ts`
- `frontend/app/api/admin/login/route.ts`
- `frontend/app/api/admin/logout/route.ts`

## Lead Features

### Existing endpoints

- `POST /leads/upload`
- `GET /leads`
- `POST /leads/score`
- `POST /outreach/generate`
- `POST /outreach/send`
- `POST /followup/generate`
- `PATCH /leads/{lead_id}/stage`

### Added portal endpoint

- `POST /leads/create`

Request body supports:

- `name`
- `email`
- `phone`
- `company`
- `role`
- `website`
- `budget`
- `intent`

Extra lead fields added safely:

- `phone`
- `budget`
- `intent`
- `source`

Default source for portal leads:

- `portal`

## Lead Processing Logic

Portal flow behavior:

1. create lead
2. score lead immediately
3. return response quickly for portal UX
4. generate outreach + follow-up in background

Fallback behavior:

- if AI provider fails or is unavailable, scoring and messages fall back to deterministic local logic
- this prevents the portal flow from failing when Gemini/OpenAI is unstable

Key files:

- `backend/routes/leads.py`
- `backend/services/scoring_service.py`
- `backend/services/message_service.py`
- `backend/services/llm_service.py`

## Services Module

### Backend

Model:

- `backend/models/service.py`

Schema:

- `backend/schemas/service_schema.py`

Routes:

- `GET /services`
- `POST /services`
- `PUT /services/{service_id}`
- `DELETE /services/{service_id}`

Notes:

- public listing supports pagination
- default public page size is 3
- `page_size` currently allows up to 100 because the admin panel loads all services with `page_size=100`

### Frontend

Public catalog:

- `frontend/components/ServiceCatalog.tsx`
- `frontend/app/services/page.tsx`

Admin panel:

- `frontend/components/ServiceAdminPanel.tsx`
- `frontend/app/service-admin/page.tsx`

Admin-only service mutation proxies:

- `frontend/app/api/admin/services/route.ts`
- `frontend/app/api/admin/services/[serviceId]/route.ts`

Important behavior:

- service create/edit/delete now go through admin-only Next.js API routes
- public users can view services
- only admins can manage services through the app UI

## Service Admin Notes

Current service form fields:

- `title`
- `slug`
- `short_description`
- `description`
- `price`
- `currency`
- `booking_url`
- `is_active`

Important UX detail:

- slug auto-generates from title if empty
- duplicate slug returns a backend `400`
- service admin status box now shows detailed validation errors, including FastAPI `422` details

Recent bug fix:

- admin service loading used `page_size=100`
- backend originally capped at `50`
- this caused `422` on `/services?page=1&page_size=100&include_inactive=true`
- fixed by raising backend max page size to `100`

## Lead Admin UI

Admin dashboard improvements already implemented:

- pagination
- search by name/email
- filter by stage
- filter by source
- mobile card layout
- message preview panel

Key files:

- `frontend/components/AdminDashboard.tsx`
- `frontend/components/LeadTable.tsx`
- `frontend/components/LeadCards.tsx`
- `frontend/components/LeadFilters.tsx`
- `frontend/components/MessagePreview.tsx`

## Database / SQLite Notes

Leads table compatibility helper:

- `backend/database/db.py`

What it does:

- ensures added lead columns exist on older SQLite databases
- creates lead indexes for:
  - `created_at`
  - `email`
  - `stage`
  - `source`
  - `name`

Services table indexes:

- `created_at`
- `title`
- `slug`
- `is_active`

## Environment Notes

Backend env:

- root `.env`

Frontend env:

- `frontend/.env.local`

Common runtime:

- backend typically on `127.0.0.1:8001`
- frontend on `localhost:3000`

## Important Current Constraint

Services image management has not been implemented yet.

Requested next feature:

- locally managed service images
- image upload/preview in service admin
- image display on public services page
- smoke test with sample local images

## Safe Restart Commands

Backend:

```bash
cd D:\LinkedINAIAgent\ai-lead-agent\backend
uvicorn main:app --reload --host 127.0.0.1 --port 8001
```

Frontend:

```bash
cd D:\LinkedINAIAgent\ai-lead-agent\frontend
npm run dev
```
