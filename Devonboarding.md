# Developer onboarding

This is a full-stack **TakeOFF driver onboarding** prototype (African Unicorn internship, Track A). Drivers register, verify a phone, complete a multi-step application, and submit it. Admins review, approve, or reject.

```text
React (Vite + TypeScript)  →  FastAPI  →  MongoDB + local file storage
   Frontend/                      Backend/         Atlas or local Mongo
```

There is no Docker setup. Run the API and the Vite app as two processes.

---

## What you need

| Tool                     | Notes                                                                                            |
| ------------------------ | ------------------------------------------------------------------------------------------------ |
| Python 3.10+             | Backend. Create a venv in `Backend/.venv`.                                                       |
| Node.js 18+ (22 is fine) | Frontend. `npm` ships with it.                                                                   |
| MongoDB                  | A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster, or MongoDB running locally. |
| Git                      | Clone this repo.                                                                                 |

Optional: [Trunk](https://docs.trunk.io) if you want the same linters as `.trunk/trunk.yaml` (ruff, black, prettier, oxlint, etc.). Frontend lint also works with `npm run lint` (oxlint).

---

## Repo layout

```text
.
├── Backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app, CORS, lifespan (connect + seed)
│   │   ├── api/                 # HTTP routers
│   │   ├── core/                # settings + JWT / password hashing
│   │   ├── db/                  # Mongo connection + demo seed
│   │   ├── models/              # Beanie documents (Mongo collections)
│   │   ├── schemas/             # Pydantic request/response models
│   │   └── services/            # OTP, uploads, submit, profile hydrate
│   ├── uploads/                 # Local document files (gitignored)
│   ├── requirements.txt
│   └── .env.example
├── Frontend/
│   ├── src/
│   │   ├── api/client.ts        # Axios client + shared types
│   │   ├── context/AuthContext.tsx
│   │   ├── lib/                 # routes, onboarding guards, labels
│   │   ├── pages/
│   │   └── components/
│   └── .env.example
├── README.md
└── Devonboarding.md             # this file
```

---

## 1. Backend setup

```bash
cd Backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Edit `Backend/.env`. At minimum set a working `MONGODB_URI`.

### Environment variables

| Variable             | Default / example                                        | What it does                                                                             |
| -------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `ENVIRONMENT`        | `development`                                            | `development` / `dev` / `local` enables the fixed OTP `123456` and returns it to the UI. |
| `MONGODB_URI`        | Atlas `mongodb+srv://...` or `mongodb://localhost:27017` | Connection string.                                                                       |
| `MONGODB_DB`         | `takeoff`                                                | Database name.                                                                           |
| `JWT_SECRET`         | `change-me-to-a-long-random-secret`                      | Signs access tokens. Changing it logs everyone out.                                      |
| `JWT_ALGORITHM`      | `HS256`                                                  | Leave as-is.                                                                             |
| `JWT_EXPIRE_MINUTES` | `1440`                                                   | Token lifetime (24h).                                                                    |
| `UPLOAD_DIR`         | `./uploads`                                              | Relative to the process cwd (usually `Backend/`).                                        |
| `MAX_UPLOAD_MB`      | `5`                                                      | Max document size.                                                                       |
| `OTP_PROVIDER`       | `development`                                            | Keep `development` locally. Production would be something like `twilio`.                 |
| `OTP_API_KEY`        | empty                                                    | Unused in development.                                                                   |
| `OTP_EXPIRY_MINUTES` | `5`                                                      | How long a code is valid.                                                                |
| `OTP_MAX_ATTEMPTS`   | `5`                                                      | Wrong guesses before the user must request a new code.                                   |
| `ADMIN_EMAIL`        | `admin@takeoff.local`                                    | Seeded admin email (only used if that user does not already exist).                      |
| `ADMIN_PASSWORD`     | `AdminPass123!`                                          | Seeded admin password.                                                                   |
| `ADMIN_PHONE`        | `+263770000001`                                          | Seeded admin phone.                                                                      |
| `CORS_ORIGINS`       | `http://localhost:5173,http://127.0.0.1:5173`            | Comma-separated. Must include the Vite origin.                                           |

`.env` is gitignored. Do not commit real secrets.

### MongoDB Atlas

1. Create a free cluster.
2. **Database Access** — create a user.
3. **Network Access** — allow your IP, or `0.0.0.0/0` for a short-lived demo.
4. Paste the `mongodb+srv://...` string into `MONGODB_URI`.

If Atlas TLS/network fails on your machine, run Mongo locally and use:

```env
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=takeoff
```

`.env.example` may already contain a shared demo Atlas URI. If you use it, your IP still has to be allowed on that cluster.

### Start the API

From `Backend/` with the venv active:

```bash
uvicorn app.main:app --reload --port 8000
```

On startup the API:

1. Connects to Mongo and initialises Beanie models.
2. Creates `uploads/` if missing.
3. Seeds demo users (idempotent — existing emails are left alone).

Check:

- Health: [http://localhost:8000/api/health](http://localhost:8000/api/health)
- Swagger: [http://localhost:8000/docs](http://localhost:8000/docs)

If port 8000 is taken, use another port and point `VITE_API_URL` at it.

Re-run seed without restarting:

```bash
cd Backend
source .venv/bin/activate
python -m app.db.seed
```

---

## 2. Frontend setup

```bash
cd Frontend
npm install
cp .env.example .env
npm run dev
```

App: [http://localhost:5173](http://localhost:5173)

| Variable       | Default                 | What it does                                    |
| -------------- | ----------------------- | ----------------------------------------------- |
| `VITE_API_URL` | `http://localhost:8000` | FastAPI origin. Restart Vite after changing it. |

Auth token is stored in `localStorage` under the key `token`. Axios attaches `Authorization: Bearer <token>` on every request (`Frontend/src/api/client.ts`).

---

## Test accounts

Seeded on API startup from `Backend/app/db/seed.py`. Sign in with **email or phone** plus password.

All seeded drivers are already **phone-verified**, so they skip OTP.

### Admin reviewer

Use this for `/admin`.

| Field    | Value                 |
| -------- | --------------------- |
| Role     | `ADMIN`               |
| Email    | `admin@takeoff.local` |
| Phone    | `+263770000001`       |
| Password | `AdminPass123!`       |
| Lands on | `/admin`              |

### Demo drivers

Shared password for all four: **`DriverPass123!`**

| Name          | Email                        | Phone           | Application            | What to use them for                                                                             |
| ------------- | ---------------------------- | --------------- | ---------------------- | ------------------------------------------------------------------------------------------------ |
| Tendai Moyo   | `tendai.moyo@takeoff.demo`   | `+263771100001` | **Approved**           | Happy path after approval. Dashboard with mock rides.                                            |
| Chiedza Ncube | `chiedza.ncube@takeoff.demo` | `+263771100002` | **Pending review**     | Admin approve/reject. Driver sees submitted state.                                               |
| Farai Dube    | `farai.dube@takeoff.demo`    | `+263771100003` | **Rejected**           | Rejection reason: _Insurance document is expired. Please upload a current policy._ Can resubmit. |
| Rudo Sibanda  | `rudo.sibanda@takeoff.demo`  | `+263771100004` | **Draft** (incomplete) | Continue onboarding from personal details.                                                       |

Seeded profile extras (complete drivers only):

| Driver  | City     | Identity                     | Vehicle                                 |
| ------- | -------- | ---------------------------- | --------------------------------------- |
| Tendai  | Harare   | National ID `63-112233-A-12` | Toyota Corolla 2018, `ABC 1234`, owned  |
| Chiedza | Bulawayo | National ID `08-445566-B-08` | Honda CB125 2021, `DEF 5678`, owned     |
| Farai   | Gweru    | Passport `FN1234567`         | Nissan NP300 2016, `GHI 9012`, financed |

Complete seeded applications also get placeholder PDFs for every required document type.

### Development OTP

When `ENVIRONMENT=development` and `OTP_PROVIDER=development`:

- The code is always **`123456`**.
- `POST /api/auth/send-otp` returns `development_otp`, and the verify page shows **Development OTP: 123456**.

Seeded accounts skip this. New registrations do not.

OTP rules: 5-minute expiry, 5 wrong attempts, then request a new code. Codes are stored hashed, never plaintext.

---

## Product flows

### Driver (new account)

1. `/register` — first name, email, phone, password (min 8 chars). Email and phone must be unique.
2. `/verify` — 6-digit OTP.
3. `/onboarding/personal` — name, DOB, gender, address, city.
4. `/onboarding/identity` — type (`NATIONAL_ID` / `PASSPORT` / `DRIVERS_LICENCE`), number, expiry, identity document upload.
5. `/onboarding/vehicle` — type, make, model, year (1980–2100), registration, colour, ownership.
6. `/onboarding/documents` — five required files (PDF / JPG / JPEG / PNG, max 5 MB).
7. `/onboarding/review` — submit. Gets a reference like `TO-2026-00001`.
8. `/onboarding/submitted` — confirmation.
9. `/dashboard` — after the application is no longer `DRAFT`. Ride board is **mock data** in `Frontend/src/data/rides.ts` (not a real booking API).

### Routing rules

Implemented in `Frontend/src/lib/routes.ts`, `ProtectedRoute.tsx`, and `OnboardingGuard.tsx`.

| After login                             | Destination                                             |
| --------------------------------------- | ------------------------------------------------------- |
| Admin                                   | `/admin`                                                |
| Driver, phone not verified              | `/verify`                                               |
| Driver, `application_status === DRAFT`  | `/onboarding/personal` (then the first incomplete step) |
| Driver, submitted / approved / rejected | `/dashboard`                                            |

Onboarding is sequential. You cannot skip ahead. If status is `PENDING_REVIEW`, `APPROVED`, or `REJECTED`, only `/onboarding/review` and `/onboarding/submitted` are allowed among onboarding routes.

Rejected applications **can be resubmitted** (`DRAFT` and `REJECTED` are allowed in `submit_application`). Admin can only approve/reject while status is `PENDING_REVIEW`. Rejection requires a reason.

### Admin

- `/admin` — list all applications.
- `/admin/applications/:id` — full packet + approve / reject.

Non-admins hitting `/admin` are sent home.

---

## Domain model

Mongo collections (Beanie models in `Backend/app/models/`):

| Collection               | Model                  | Notes                                                      |
| ------------------------ | ---------------------- | ---------------------------------------------------------- |
| `users`                  | `User`                 | Unique `email` and `phone`. Roles: `DRIVER`, `ADMIN`.      |
| `driver_profiles`        | `DriverProfile`        | One per user (`user_id` unique).                           |
| `identity_verifications` | `IdentityVerification` | One per driver profile.                                    |
| `vehicles`               | `Vehicle`              | One per driver profile.                                    |
| `documents`              | `Document`             | One row per type per driver (re-upload replaces the file). |
| `applications`           | `Application`          | One per driver. Unique `reference_number` when set.        |
| `otp_verifications`      | `OtpVerification`      | Hashed code, expiry, attempt count.                        |

### Enums (`Backend/app/models/enums.py`)

**Application status:** `DRAFT` → `PENDING_REVIEW` → `APPROVED` or `REJECTED`

**Document types (all required to submit):**

- `DRIVERS_LICENCE`
- `IDENTITY_DOCUMENT`
- `VEHICLE_REGISTRATION`
- `INSURANCE`
- `ROADWORTHINESS`

**Vehicle types:** `MOTORCYCLE`, `CAR`, `PICKUP`, `VAN`, `TRUCK`

Documents live on disk under `Backend/uploads/`. The API serves them only to the owning driver or an admin at `GET /api/documents/files/{filename}` (auth required — do not expect a public URL).

---

## API surface

Auth: `Authorization: Bearer <jwt>` on all routes except register, login, and health.

### Auth — `/api/auth`

| Method | Path          | Auth | Purpose                                          |
| ------ | ------------- | ---- | ------------------------------------------------ |
| POST   | `/register`   | no   | Create driver. Returns JWT.                      |
| POST   | `/login`      | no   | Body: `{ "phone_or_email", "password" }`.        |
| GET    | `/me`         | yes  | Current user + `application_status` for drivers. |
| POST   | `/send-otp`   | yes  | Send (or re-display in dev) OTP.                 |
| POST   | `/resend-otp` | yes  | Same as send.                                    |
| POST   | `/verify-otp` | yes  | Body: `{ "otp": "123456" }`.                     |

### Driver — `/api/driver` (verified driver)

| Method    | Path        |
| --------- | ----------- |
| GET / PUT | `/profile`  |
| GET / PUT | `/identity` |
| GET / PUT | `/vehicle`  |

### Documents — `/api/documents`

| Method | Path                | Notes                                           |
| ------ | ------------------- | ----------------------------------------------- |
| GET    | `/`                 | List own documents.                             |
| POST   | `/`                 | `multipart/form-data`: `document_type`, `file`. |
| DELETE | `/{document_id}`    | Owner only.                                     |
| GET    | `/files/{filename}` | Owner or admin.                                 |

### Application — `/api/application`

| Method | Path      |
| ------ | --------- | -------------------------------------------------------------------- |
| GET    | `/`       | Full review payload (profile, identity, vehicle, documents, status). |
| POST   | `/submit` | Validates completeness; sets `PENDING_REVIEW`.                       |

### Admin — `/api/admin` (admin JWT)

| Method | Path                        |
| ------ | --------------------------- | ------------------------------------------------------------------------------------------ |
| GET    | `/applications`             |
| GET    | `/applications/{id}`        |
| PATCH  | `/applications/{id}/status` | Body: `{ "status": "APPROVED" }` or `{ "status": "REJECTED", "rejection_reason": "..." }`. |

Interactive docs: [http://localhost:8000/docs](http://localhost:8000/docs).

---

## Frontend map

| Path                      | Page                     |
| ------------------------- | ------------------------ |
| `/`                       | Landing                  |
| `/login`                  | Login                    |
| `/register`               | Register                 |
| `/verify`                 | OTP                      |
| `/onboarding/personal`    | Personal                 |
| `/onboarding/identity`    | Identity                 |
| `/onboarding/vehicle`     | Vehicle                  |
| `/onboarding/documents`   | Documents                |
| `/onboarding/review`      | Review & submit          |
| `/onboarding/submitted`   | Submitted                |
| `/dashboard`              | Driver home (mock rides) |
| `/admin`                  | Application list         |
| `/admin/applications/:id` | Application detail       |

Shared UI lives in `Frontend/src/components/`. Theme/tokens: `Frontend/src/styles/theme.ts`. Styled-components throughout.

Useful scripts from `Frontend/`:

```bash
npm run dev       # Vite
npm run build     # tsc + vite build
npm run lint      # oxlint
npm run preview   # production build locally
```

---

## Typical first-day checklist

1. Backend venv + `.env` + Mongo reachable.
2. `uvicorn` on 8000; `/api/health` returns `ok`.
3. Frontend `.env` + `npm run dev`.
4. Log in as admin → you should see Tendai / Chiedza / Farai (and Rudo as draft).
5. Log in as Chiedza → submitted state, not the form wizard.
6. Log in as Rudo → onboarding, first incomplete step.
7. Register a throwaway user → OTP `123456` → upload fake PDFs → submit → note `TO-YYYY-#####`.
8. Switch to admin → open that application → Approve.
9. Confirm the list status updates.

Upload obviously fake files (for example `TEST DRIVER LICENCE.pdf`).

---

## Resetting demo data

Seed **does not** overwrite users that already exist (same email). Changing `ADMIN_PASSWORD` in `.env` after the first seed will not update the stored hash.

To start clean, drop the `takeoff` database in Atlas / Compass / `mongosh`, delete `Backend/uploads/*` (keep `.gitkeep` if present), and restart the API.

---

## Gotchas

- **CORS errors** — frontend origin must be in `CORS_ORIGINS`. Vite is `http://localhost:5173` by default; `127.0.0.1` is a different origin.
- **Empty admin list / failed login** — Mongo never connected, or you are hitting a different database than the one that was seeded.
- **Atlas timeout / SSL** — IP not allowlisted, or TLS issues; try local Mongo.
- **401 after restart with a new `JWT_SECRET`** — clear `localStorage.token` or use a private window.
- **Document preview 401 in a new tab** — file routes need the Bearer token; the in-app client sends it, a raw URL does not.
- **Cannot skip onboarding steps** — `OnboardingGuard` redirects to the first incomplete step.
- **Admin cannot use driver routes** — `/api/driver/*` and `/api/application` require role `DRIVER` and a verified phone.
- **Uvicorn cwd** — run it from `Backend/` so `UPLOAD_DIR=./uploads` and `.env` resolve correctly.
- No test suite is wired up yet. Use Swagger, the seeded accounts, and the checklist above.

---

## Production notes (out of scope for local work)

```env
ENVIRONMENT=production
MONGODB_URI=mongodb+srv://...
MONGODB_DB=takeoff
JWT_SECRET=<long-random>
OTP_PROVIDER=twilio
OTP_API_KEY=...
CORS_ORIGINS=https://your-frontend.vercel.app
```

Frontend: `VITE_API_URL=https://your-api-url`

Suggested hosting: Vercel (frontend), Render/Railway (backend), MongoDB Atlas (DB), object storage instead of local `uploads/`.

Known prototype limits:

- OTP SMS is simulated in development.
- Local disk uploads are not multi-instance safe.
- No refresh-token rotation, email, or real booking/payments/maps.
- Dashboard rides are static demo data.

---

## Where to change things

| If you want to…                | Start here                                                                 |
| ------------------------------ | -------------------------------------------------------------------------- |
| Add an API route               | `Backend/app/api/` then register the router in `main.py`                   |
| Change validation              | matching file in `Backend/app/schemas/`                                    |
| Change Mongo shape             | `Backend/app/models/`                                                      |
| Change seed accounts           | `Backend/app/db/seed.py` and this file                                     |
| Change env defaults            | `Backend/app/core/config.py` + `.env.example`                              |
| Change post-login redirects    | `Frontend/src/lib/routes.ts`                                               |
| Change onboarding completeness | `Frontend/src/lib/onboarding.ts` and `Backend/app/services/application.py` |
| Change API types on the client | `Frontend/src/api/client.ts`                                               |
| Change copy / enum labels      | `Frontend/src/lib/labels.ts`                                               |
