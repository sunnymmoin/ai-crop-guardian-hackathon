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

## How to run (no .env needed)

Everything is already configured in `backend/app/config.py`. You do **not** need to create a `.env` file or a database.

You need **Python 3.12** and **Node.js 18+**.

### 1. Start the backend

Open a terminal in the `backend` folder:

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

You only need the first three commands the first time. After that, just activate and run `uvicorn`.

Check it at http://127.0.0.1:8000/api/health. It should say `"database": "up"`. Interactive API docs are at http://127.0.0.1:8000/docs.

### 2. Start the frontend

Open a second terminal in the `frontend` folder:

```bash
npm install
npm run dev
```

Open **http://localhost:5173** in the browser. The frontend forwards `/api` calls to the backend on port 8000.

### 3. Add the demo data (once)

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
| **Admin** | Crop Guardian Admin | `03000000001` | Karachi | Admin Key: `cropguardian-admin-2026` |
| Farmer | Ghulam Rasool | `03000000002` | Multan | none (phone only) |
| Farmer | Ayesha Bibi | `03000000003` | Sukkur | none (phone only) |
| Farmer | Muhammad Akram | `03000000004` | Hyderabad | none (phone only) |
| Farmer | Rukhsana Parveen | `03000000005` | Mirpurkhas | none (phone only) |
| Farmer | Abdul Sattar | `03000000006` | Rahim Yar Khan | none (phone only) |
| Farmer | Nasreen Akhtar | `03000000007` | Shaheed Benazirabad | none (phone only) |

**Admin login:** enter `03000000001` as the phone and `cropguardian-admin-2026` in the **Admin Key** field. Only the admin can open the **B2B Analytics** tab and launch ad campaigns.

A new farmer can also register from the same login form with any phone number.

## What the seeder adds

| Collection | Demo data |
|---|---|
| `users` | The 7 accounts above |
| `scans` | 102 diagnoses spread over the 6 farmers and the last 30 days (for example, mostly Late Blight in Multan and Early Blight in Sukkur). These feed the B2B heatmap. |
| `ads` | 3 campaigns: Sukkur Fertilizer Broadcast, Multan Potato Blight Protection, Hyderabad Chili Care Advisory |
| `crops` | The 100 cards from `backend/crop_profiles.json`, only if the collection is empty |

All demo rows have `is_sample: true`, so they are easy to find in MongoDB Compass and `--clear` removes only them.

## Configuration

All settings live in `backend/app/config.py`:

| Setting | Value |
|---|---|
| `mongo_uri` | The team's MongoDB Atlas cluster (`cluster0.dh3tmxx.mongodb.net`, user `sunnymmoin_db_user`) |
| `mongo_db` | `crop_guardian_db` |
| `admin_phones` | `03000000001` |
| `admin_key` | `cropguardian-admin-2026` |
| `jwt_secret` | Fixed demo secret, so logins survive a backend restart |
| `cors_origins` | `http://localhost:5173`, `http://127.0.0.1:5173` |
| `model_path` | `backend/crop_model.pt` |

To change a value, edit `config.py`. On a server you can instead set an environment variable with the same name in capitals (for example `MONGO_URI`).

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

The tests need MongoDB installed locally at `mongodb://localhost:27017`. They use a throwaway `crop_guardian_test` database, which is deleted afterwards. They never touch Atlas.

## Project structure

```
backend/
  main.py                 # entry point: `uvicorn main:app`
  app/
    main.py               # app factory: middleware, routers, startup
    config.py             # all settings (database, admin, secrets)
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
- **Global**: CORS for `cors_origins`, request ID + timing headers with one log line per request, gzip, and a consistent JSON error format (including 500s).
- **Per route** (FastAPI dependencies): JWT login check, admin check, in-memory rate limits, and image validation (type, 5 MB size limit, Pillow check).

## Deploying

- **Backend (e.g. Render)**
  - Root directory: `backend`
  - Build command: `pip install -r requirements.txt`
  - Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT --proxy-headers --forwarded-allow-ips="*"`
  - Add the frontend URL to `cors_origins` in `config.py`.
- **Frontend (e.g. Vercel)**
  - Root directory: `frontend`
  - Set the environment variable `VITE_API_URL=https://<your-backend>/api`

## Security note

The database password, admin key and JWT secret are written in `config.py` and in this README, so anyone who can see this repository can read, change or delete the database and log in as admin. This is fine for a hackathon demo. Before real farmers use the app, change the Atlas password and move these values to environment variables.

## License

This project is for educational purposes.
