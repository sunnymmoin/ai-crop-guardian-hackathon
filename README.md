# AI Crop Guardian

AI crop-disease diagnosis for Pakistani farmers. A farmer uploads a leaf photo and gets the disease name, the pesticide and the dosage, in Urdu or English, with voice read-out.

**Features**
- **Diagnostics**: ResNet-18 model trained on PlantVillage (38 classes). Without the model file the API runs in a clearly labelled demo mode.
- **Phone login**: one account per farmer; scans are saved for that farmer.
- **Cultivation guide**: 100+ crop cards stored in MongoDB. Logged-in farmers can add more.
- **B2B analytics** (admins only): district disease heatmap built from real scans, plus ad campaigns.
- **WhatsApp simulator**: photos sent in the simulator use the same diagnosis API.
- **PWA**: installable on a phone.

| Layer    | Technology                                    |
| -------- | --------------------------------------------- |
| Backend  | Python 3.12, FastAPI, PyMongo (async), PyJWT  |
| Database | MongoDB Atlas (shared team cluster)           |
| AI model | PyTorch ResNet-18 (optional install)          |
| Frontend | React 18, Vite, Tailwind CSS, Axios           |

---

## How to run

You need **Python 3.12** and **Node.js 18+**.

### 1. Create the `.env` files

All settings come from `.env` files. Private values (database password, secrets) live **only** in these files, and git ignores them, so they never go to GitHub.

| File | Copy from | What to fill in |
|---|---|---|
| `backend/.env` | `backend/.env.example` | `MONGO_URI`, `JWT_SECRET`, `ADMIN_KEY` (required). Ask the team lead for the values. |
| `frontend/.env` | `frontend/.env.example` | Nothing for local development; the defaults work. |

On Windows:

```bash
copy backend\.env.example backend\.env
```

```bash
copy frontend\.env.example frontend\.env
```

Then open `backend/.env` and fill in the required lines. If something is missing, the backend refuses to start and tells you exactly which value it needs.

### 2. Start the backend

Open a terminal in the `backend` folder:

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

You only need the first three commands the first time. After that, just activate and run `uvicorn`.

Check it at http://127.0.0.1:8000/api/health. It should say `"database": "up"`. Interactive API docs are at http://127.0.0.1:8000/docs.

### 3. Start the frontend

Open a second terminal in the `frontend` folder:

```bash
npm install
npm run dev
```

Open **http://localhost:5173** in the browser. The frontend forwards `/api` calls to the backend (`API_PROXY_TARGET` in `frontend/.env`).

### 4. Add the demo data (once)

In the `backend` folder, with the virtual environment active:

```bash
python scripts\seed.py
```

This adds the demo accounts below, their scans, ad campaigns, and the 100 crop cards. It is safe to run again: it refreshes the demo data instead of duplicating it.

To remove the demo data later (real users are never touched):

```bash
python scripts\seed.py --clear
```

### "Cannot reach MongoDB" / health says `"database": "down"`

MongoDB Atlas only accepts computers whose IP address is on its allow list. Ask the Atlas account owner to add your IP:

1. Log in to [MongoDB Atlas](https://cloud.mongodb.com).
2. Go to **Network Access**, then **Add IP Address**.
3. Choose **Add Current IP Address**, or `0.0.0.0/0` to allow everyone.

---

## Demo accounts

Farmers log in with their **phone number only**; there is no password. Click **Farmer Login**, enter the phone number, and press the login button.

| Role | Name | Phone | District | Password |
|---|---|---|---|---|
| **Admin** | Crop Guardian Admin | `03000000001` | Karachi | Admin Key = the `ADMIN_KEY` value in `backend/.env` |
| Farmer | Ghulam Rasool | `03000000002` | Multan | none (phone only) |
| Farmer | Ayesha Bibi | `03000000003` | Sukkur | none (phone only) |
| Farmer | Muhammad Akram | `03000000004` | Hyderabad | none (phone only) |
| Farmer | Rukhsana Parveen | `03000000005` | Mirpurkhas | none (phone only) |
| Farmer | Abdul Sattar | `03000000006` | Rahim Yar Khan | none (phone only) |
| Farmer | Nasreen Akhtar | `03000000007` | Shaheed Benazirabad | none (phone only) |

**Admin login:** enter `03000000001` as the phone and your `ADMIN_KEY` in the **Admin Key** field. Only the admin can open the **B2B Analytics** tab and launch ad campaigns. The admin phone must be listed in `ADMIN_PHONES` in `backend/.env`.

A new farmer can also register from the same login form with any phone number.

## What the seeder adds

| Collection | Demo data |
|---|---|
| `users` | The 7 accounts above |
| `scans` | 102 diagnoses spread over the 6 farmers and the last 30 days (for example, mostly Late Blight in Multan and Early Blight in Sukkur). These feed the B2B heatmap. |
| `ads` | 3 campaigns: Sukkur Fertilizer Broadcast, Multan Potato Blight Protection, Hyderabad Chili Care Advisory |
| `crops` | The 100 cards from `backend/crop_profiles.json`, only if the collection is empty |

All demo rows have `is_sample: true`, so they are easy to find in MongoDB Compass and `--clear` removes only them.

## Configuration reference

`backend/app/config.py` reads every setting from `backend/.env` (or from environment variables with the same name, which win over the file). Private values have **no default** in the code.

**Backend (`backend/.env`)**

| Variable | Required | Default | Meaning |
|---|---|---|---|
| `MONGO_URI` | yes | – | MongoDB connection string (Atlas or `mongodb://localhost:27017`) |
| `MONGO_DB` | no | `crop_guardian_db` | Database name |
| `SEED_CROPS` | no | `true` | Load the 100 crop cards on startup if the collection is empty |
| `JWT_SECRET` | yes | – | At least 32 random characters; signs login tokens |
| `JWT_EXPIRE_DAYS` | no | `30` | How long a login stays valid |
| `ADMIN_PHONES` | yes | – | Comma-separated admin phone numbers |
| `ADMIN_KEY` | yes | – | At least 8 characters; typed by admins at login |
| `CORS_ORIGINS` | no | `http://localhost:5173,http://127.0.0.1:5173` | Frontend URLs allowed to call the API |
| `RATE_LIMIT_AUTH_PER_MIN` | no | `10` | Login/register attempts per IP per minute |
| `RATE_LIMIT_PREDICT_PER_MIN` | no | `30` | Diagnoses per IP per minute |
| `MODEL_PATH` | no | `crop_model.pt` | Trained model file, relative to `backend/` |
| `CONFIDENCE_THRESHOLD` | no | `0.5` | Below this, the photo is "Unrecognized Image" |
| `MAX_UPLOAD_MB` | no | `5` | Largest photo accepted |

A new `JWT_SECRET` can be generated with:

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

**Frontend (`frontend/.env`)**

| Variable | When | Meaning |
|---|---|---|
| `API_PROXY_TARGET` | `npm run dev` | Where `/api` calls are forwarded (default `http://127.0.0.1:8000`) |
| `VITE_API_URL` | production build | Full backend URL ending in `/api`. Leave empty locally. |

---

## Optional: real AI model

1. Install the ML packages: `pip install -r requirements-ml.txt`. On Windows, PyTorch also needs the [Microsoft Visual C++ Redistributable](https://aka.ms/vs/17/release/vc_redist.x64.exe).
2. Put the trained `crop_model.pt` in `backend/` (created by `ml_pipeline/train.py`).
3. Restart the backend. `/api/health` should now show `"model_mode": "model"`.

Without the model, every diagnosis is marked **"Demo result – AI model not loaded"**.

## Tests

```bash
cd backend
pip install -r requirements-dev.txt
pytest
```

The tests need MongoDB installed locally at `mongodb://localhost:27017`. They set their own settings, use a throwaway `crop_guardian_test` database that is deleted afterwards, and never touch Atlas or your `.env` values.

## Project structure

```
backend/
  main.py                 # entry point: `uvicorn main:app`
  .env.example            # every backend setting, explained
  app/
    main.py               # app factory: middleware, routers, startup
    config.py             # reads settings from backend/.env
    db.py                 # MongoDB connection, indexes, crop seeding
    deps.py               # route guards: login, admin, rate limits
    middleware.py         # request ID / timing / logging, error format
    routers/              # health, auth, diagnose, cultivation, analytics, whatsapp
    services/             # AI predictor, bilingual treatment lookup
  scripts/seed.py         # demo users, scans, ads, crops
  tests/                  # pytest suite
  ml_pipeline/            # dataset cleaning / split / training scripts
  disease_treatments.json # 38 diseases with English + Urdu treatments
  crop_profiles.json      # 100 crop cards
frontend/
  .env.example            # frontend settings, explained
  src/App.jsx             # the whole UI
  src/api/client.js       # every backend call goes through here
```

## API

All routes are under `/api`. Errors always come back as `{"detail": "...", "request_id": "..."}`.

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/health` | public | Database + model status |
| POST | `/auth/register` | public, rate-limited | Create a farmer account → token |
| POST | `/auth/login` | public, rate-limited | Log in by phone (+ admin key) → token |
| GET | `/auth/me` | logged in | Current user |
| POST | `/predict` | public, rate-limited | Diagnose a leaf photo (saved as a scan when logged in) |
| GET | `/cultivation` | public | All crop cards |
| POST | `/cultivation` | logged in | Add a crop card |
| GET | `/analytics/summary` | admin | Scan totals, active ads, estimated savings |
| GET | `/analytics/heatmap` | admin | Disease spread per district |
| GET / POST | `/ads` | admin | List / create ad campaigns |
| POST | `/whatsapp/webhook` | Twilio | Placeholder WhatsApp reply |

**Middleware**
- **Global**: CORS for `CORS_ORIGINS`, request ID + timing headers with one log line per request, gzip, and a consistent JSON error format (including 500s).
- **Per route** (FastAPI dependencies): JWT login check, admin check, in-memory rate limits, and image validation (type, size limit, Pillow check).

## Deploying

- **Backend (e.g. Render)**
  - Root directory: `backend`
  - Build command: `pip install -r requirements.txt`
  - Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT --proxy-headers --forwarded-allow-ips="*"`
  - Add every variable from `backend/.env` in the dashboard's Environment section. Add the frontend URL to `CORS_ORIGINS`.
- **Frontend (e.g. Vercel)**
  - Root directory: `frontend`
  - Set `VITE_API_URL=https://<your-backend>/api` in the project's environment variables.

## Security

- Never commit `.env` files; `.gitignore` already blocks them. Share them privately (for example in a direct message), not in the repo or a group chat.
- Older commits on GitHub contain the previous Atlas password, so change it in Atlas (**Database Access**, then edit the user) and update `MONGO_URI` in everyone's `backend/.env`.
- Farmers log in with a phone number only, so anyone who knows a number can open that account. Admin access also requires `ADMIN_KEY`.

## License

This project is for educational purposes.
