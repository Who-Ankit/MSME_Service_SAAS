# AI Lead Agent

AI Lead Agent is a local MVP for lead qualification, outreach generation, follow-up generation, and pipeline tracking.

It includes:

- a FastAPI backend
- a Next.js frontend
- a SQLite database
- Gemini or OpenAI for AI scoring and message generation
- Gmail SMTP for real email sending

## What It Does

This project lets you:

- upload leads from a CSV file
- store them in SQLite
- score each lead with AI
- generate a personalized cold email
- generate a personalized LinkedIn message
- generate a follow-up message
- visualize leads in a simple pipeline board
- send the generated email through Gmail SMTP

Important:

- the app can send real emails through Gmail SMTP
- the app does not send LinkedIn messages
- LinkedIn content is generated only for manual use

## Project Structure

```text
ai-lead-agent/
|-- .env
|-- README.md
|-- backend/
|   |-- main.py
|   |-- requirements.txt
|   |-- database/
|   |-- models/
|   |-- routes/
|   |-- schemas/
|   `-- services/
`-- frontend/
    |-- .env.local
    |-- app/
    |-- components/
    `-- lib/
```

## Tech Stack

### Backend

- FastAPI
- SQLAlchemy
- Pydantic
- Uvicorn
- SQLite

### Frontend

- Next.js App Router
- Tailwind CSS
- Axios

### AI

- Gemini
- OpenAI

### Email

- Gmail SMTP

## Core Features Implemented

### Lead Upload

- `POST /leads/upload`
- accepts CSV files
- parses rows with `name`, `email`, `company`, `role`, `website`
- stores valid rows in SQLite

### Lead Listing

- `GET /leads`
- returns all leads with score, stage, and generated messages

### Lead Scoring

- `POST /leads/score`
- input: `lead_id`
- returns:

```json
{
  "lead_id": 1,
  "score": 90,
  "reason": "Decision-making role suggests strong buying influence."
}
```

### Outreach Generation

- `POST /outreach/generate`
- input: `lead_id`
- generates:
  - `email_message`
  - `linkedin_message`
- updates lead stage to `Contacted`

### Email Sending

- `POST /outreach/send`
- input: `lead_id`
- sends the generated `email_message` using Gmail SMTP
- requires SMTP env vars to be configured

### Follow-up Generation

- `POST /followup/generate`
- input: `lead_id`
- generates `followup_message`

### Pipeline Management

- `PATCH /leads/{lead_id}/stage`
- supported stages:
  - `New`
  - `Contacted`
  - `Replied`
  - `Converted`

## Database Schema

The `Lead` model includes:

- `id`
- `name`
- `email`
- `company`
- `role`
- `website`
- `score`
- `score_reason`
- `stage`
- `email_message`
- `linkedin_message`
- `followup_message`
- `created_at`

## AI Flow

The AI logic runs in the backend.

Main files:

- [llm_service.py](D:/LinkedINAIAgent/ai-lead-agent/backend/services/llm_service.py)
- [scoring_service.py](D:/LinkedINAIAgent/ai-lead-agent/backend/services/scoring_service.py)
- [message_service.py](D:/LinkedINAIAgent/ai-lead-agent/backend/services/message_service.py)

Flow:

1. frontend button calls a backend API route
2. backend loads the lead from SQLite
3. backend builds the prompt
4. backend sends the prompt to Gemini or OpenAI
5. backend stores the generated result
6. frontend displays the saved output

### Supported Providers

#### Gemini

- set `LLM_PROVIDER=gemini`
- set `GEMINI_API_KEY`
- set `LLM_MODEL=model/gemini-2.5-flash` or `gemini-2.5-flash`

#### OpenAI

- set `LLM_PROVIDER=openai`
- set `OPENAI_API_KEY`
- optionally set `LLM_MODEL`

### Fallback Behavior

If no valid AI key is configured, the app still works with built-in fallback scoring and message generation.

That means:

- the UI still works
- the API still works
- generated content is mock but usable for local testing

## Gmail SMTP Flow

Real email sending is handled in:

- [email_service.py](D:/LinkedINAIAgent/ai-lead-agent/backend/services/email_service.py)

When you click `Send Email` in the dashboard:

1. the frontend calls `POST /outreach/send`
2. the backend loads the lead
3. the backend checks that `email_message` exists
4. the backend sends the email through Gmail SMTP
5. the lead remains in the pipeline and the UI refreshes

Important:

- this sends a real email
- it uses the generated `email_message` as the email body
- the email subject is generated as `Quick idea for {company}`

## Environment Variables

### Root Backend Env

Update [`.env`](D:/LinkedINAIAgent/ai-lead-agent/.env):

```env
LLM_PROVIDER=gemini
LLM_MODEL=model/gemini-2.5-flash
GEMINI_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key
DATABASE_URL=sqlite:///./leads.db
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8001
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_16_char_app_password
FROM_EMAIL=your_email@gmail.com
```

Notes:

- `SMTP_PASSWORD` must be a Google App Password, not your normal Gmail password
- `FROM_EMAIL` should typically match `SMTP_USERNAME`
- backend runs on `8001` in this project setup

### Frontend Env

The frontend uses [frontend/.env.local](D:/LinkedINAIAgent/ai-lead-agent/frontend/.env.local):

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8001
```

This is important because Next.js reads `NEXT_PUBLIC_*` env vars from the frontend app at startup time.

## How To Run

Open two terminals.

### Terminal 1: Backend

```bash
cd D:\LinkedINAIAgent\ai-lead-agent\backend
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8001
```

Backend URL:

- [http://127.0.0.1:8001](http://127.0.0.1:8001)

### Terminal 2: Frontend

```bash
cd D:\LinkedINAIAgent\ai-lead-agent\frontend
npm install
npm run dev
```

Frontend URL:

- [http://localhost:3000](http://localhost:3000)

## How To Use The App

1. start backend
2. start frontend
3. open the dashboard in the browser
4. upload a CSV file
5. click `Score`
6. click `Generate Message`
7. click `Generate Follow-up`
8. click `Send Email` if Gmail SMTP is configured
9. open the `Pipeline` page to move leads across stages

## Sample CSV

Use this as [sample.csv](D:/LinkedINAIAgent/ai-lead-agent/sample.csv):

```csv
name,email,company,role,website
Jane Doe,jane@example.com,Acme,Founder,https://acme.com
John Smith,john@example.com,Globex,Sales Director,https://globex.com
Sara Lee,sara@example.com,Initech,Head of Growth,https://initech.com
```

For SMTP testing, it is safer to temporarily use your own email address as the lead email first.

Example:

```csv
name,email,company,role,website
Test Lead,your_email@gmail.com,Test Company,Founder,https://example.com
```

## Manual API Testing

### Upload CSV

```powershell
curl.exe -X POST -F "file=@D:\LinkedINAIAgent\ai-lead-agent\sample.csv" http://127.0.0.1:8001/leads/upload
```

### Get Leads

```powershell
curl.exe http://127.0.0.1:8001/leads
```

### Score Lead 1

```powershell
curl.exe -X POST http://127.0.0.1:8001/leads/score ^
  -H "Content-Type: application/json" ^
  -d "{\"lead_id\":1}"
```

### Generate Outreach for Lead 1

```powershell
curl.exe -X POST http://127.0.0.1:8001/outreach/generate ^
  -H "Content-Type: application/json" ^
  -d "{\"lead_id\":1}"
```

### Send Email for Lead 1

```powershell
curl.exe -X POST http://127.0.0.1:8001/outreach/send ^
  -H "Content-Type: application/json" ^
  -d "{\"lead_id\":1}"
```

### Generate Follow-up for Lead 1

```powershell
curl.exe -X POST http://127.0.0.1:8001/followup/generate ^
  -H "Content-Type: application/json" ^
  -d "{\"lead_id\":1}"
```

### Update Stage

```powershell
curl.exe -X PATCH http://127.0.0.1:8001/leads/1/stage ^
  -H "Content-Type: application/json" ^
  -d "{\"stage\":\"Replied\"}"
```

## Frontend Components

Main frontend files:

- [Dashboard page](D:/LinkedINAIAgent/ai-lead-agent/frontend/app/page.tsx)
- [Pipeline page](D:/LinkedINAIAgent/ai-lead-agent/frontend/app/pipeline/page.tsx)
- [LeadTable](D:/LinkedINAIAgent/ai-lead-agent/frontend/components/LeadTable.tsx)
- [PipelineBoard](D:/LinkedINAIAgent/ai-lead-agent/frontend/components/PipelineBoard.tsx)
- [MessagePreview](D:/LinkedINAIAgent/ai-lead-agent/frontend/components/MessagePreview.tsx)
- [API client](D:/LinkedINAIAgent/ai-lead-agent/frontend/lib/api.ts)

## What Was Verified

The following checks were completed during development:

- backend Python syntax check passed
- frontend production build passed with `npm run build`
- backend root endpoint responded successfully
- lead upload worked
- lead listing worked
- lead scoring worked
- outreach generation worked
- follow-up generation worked
- stage updates worked

Gmail SMTP code was added, but live email sending depends on your real Gmail credentials and App Password.

## Known Notes

- if port `8000` is blocked on your machine, use `8001` as configured
- the frontend must be restarted after changing `frontend/.env.local`
- changing only the root `.env` is not enough for Next.js browser env vars
- LinkedIn messaging is generated only, not sent automatically

## Main Backend Files

- [main.py](D:/LinkedINAIAgent/ai-lead-agent/backend/main.py)
- [db.py](D:/LinkedINAIAgent/ai-lead-agent/backend/database/db.py)
- [lead.py](D:/LinkedINAIAgent/ai-lead-agent/backend/models/lead.py)
- [lead_schema.py](D:/LinkedINAIAgent/ai-lead-agent/backend/schemas/lead_schema.py)
- [leads.py](D:/LinkedINAIAgent/ai-lead-agent/backend/routes/leads.py)
- [scoring.py](D:/LinkedINAIAgent/ai-lead-agent/backend/routes/scoring.py)
- [outreach.py](D:/LinkedINAIAgent/ai-lead-agent/backend/routes/outreach.py)
- [followup.py](D:/LinkedINAIAgent/ai-lead-agent/backend/routes/followup.py)
- [llm_service.py](D:/LinkedINAIAgent/ai-lead-agent/backend/services/llm_service.py)
- [scoring_service.py](D:/LinkedINAIAgent/ai-lead-agent/backend/services/scoring_service.py)
- [message_service.py](D:/LinkedINAIAgent/ai-lead-agent/backend/services/message_service.py)
- [email_service.py](D:/LinkedINAIAgent/ai-lead-agent/backend/services/email_service.py)

## Summary

This project is now a working local MVP for:

- lead upload
- AI scoring
- AI outreach generation
- follow-up generation
- visual pipeline management
- Gmail SMTP email sending

It is set up to run locally with Gemini by default and can be switched to OpenAI when needed.
