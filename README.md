# TakeOFF Driver Onboarding

A full-stack driver onboarding prototype built for the African Unicorn Software Development Internship assessment (Track A).

## Features

- Account registration & sign-in
- OTP phone verification (hashed OTP, expiry, attempt limits)
- Multi-step driver onboarding (personal, identity, vehicle, documents)
- Application review & submission with reference numbers
- Admin/reviewer dashboard (view, approve, reject)
- MongoDB Atlas persistence
- Authenticated document storage (not public URLs)

## Architecture

```
React (Vite + TypeScript) → FastAPI → MongoDB Atlas + local file storage
```

## Running locally

### Backend

1. Create a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster.
2. Create a database user and allow your IP (or `0.0.0.0/0` for demo).
3. Copy the connection string into `.env`.

```bash
cd Backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env: set MONGODB_URI to your Atlas connection string
uvicorn app.main:app --reload --port 8000
```

If port 8000 is already in use, pick another (e.g. `--port 8001`) and set `VITE_API_URL` to match.

API docs: http://localhost:8000/docs

### Frontend

```bash
cd Frontend
npm install
cp .env.example .env
npm run dev
```

App: http://localhost:5173

## Test credentials

### Admin reviewer

| Field | Value |
|---|---|
| Email | `admin@takeoff.local` |
| Password | `AdminPass123!` |
| Phone | `+263770000001` |

### Suggested driver (create via Sign up)

| Field | Value |
|---|---|
| Name | Test Driver |
| Phone | `+263770000000` |
| Email | `test.driver@example.com` |
| Password | `TestPass123!` |
| Vehicle | Toyota Corolla · `TEST 1234` |

**Development OTP:** when `ENVIRONMENT=development`, the UI shows `Development OTP: 123456`.

Upload obviously fake files (e.g. `TEST DRIVER LICENCE.pdf`) for documents.

## API overview

- `POST /api/auth/register|login|send-otp|verify-otp|resend-otp`
- `GET/PUT /api/driver/profile|identity|vehicle`
- `GET/POST/DELETE /api/documents`
- `GET /api/application` · `POST /api/application/submit`
- `GET/PATCH /api/admin/applications...`

## Technical decisions

- **FastAPI + Pydantic** — clear REST surface and validation with little boilerplate.
- **Beanie + PyMongo** — async ODM on MongoDB Atlas; collections mirror the previous relational entities.
- **Hashed passwords & OTPs** — never store plaintext secrets.
- **JWT access tokens** — simple session model (no refresh-token complexity for the prototype).
- **Local uploads + auth-gated file route** — documents are not publicly enumerable; swap `storage.py` for S3/Cloudinary in production.
- **Admin dashboard** — proves persistence end-to-end for the interview demo.

## Production notes

```
ENVIRONMENT=production
MONGODB_URI=mongodb+srv://...
MONGODB_DB=takeoff
JWT_SECRET=<long-random>
OTP_PROVIDER=twilio
OTP_API_KEY=...
CORS_ORIGINS=https://your-frontend.vercel.app
```

Frontend: `VITE_API_URL=https://your-api-url`

Suggested hosting: Vercel (frontend) · Render/Railway (backend) · MongoDB Atlas (DB).

## Limitations

- OTP SMS is simulated in development (`123456`); wire Twilio Verify for production.
- File storage is local disk; not multi-instance safe without object storage.
- No JWT refresh rotation, email notifications, or draft-resume UX beyond persisted DRAFT docs.
- Out of scope by design: booking, tracking, payments, maps, chat, AI.

## Demo checklist

1. Register → OTP (`123456`) → complete onboarding → submit → note `TO-YYYY-#####`
2. Sign in as admin → open application → Approve
3. Confirm status updates on the admin list
# Driver-Onboarding
