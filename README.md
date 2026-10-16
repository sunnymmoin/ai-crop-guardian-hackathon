# AI Crop Guardian

AI crop-disease diagnosis for Pakistani farmers. A farmer uploads a leaf photo and gets the disease name, the pesticide and the dosage, in Urdu or English, with voice read-out.

**Features**
- **Diagnostics**: ResNet-18 model trained on PlantVillage (38 classes). Without the model file the API runs in a clearly labelled demo mode.
- **Phone login**: one account per farmer; scans are saved for that farmer.
- **Cultivation guide**: 100+ crop cards stored in MongoDB. Logged-in farmers can add more.
- **B2B analytics** (admins only): district disease heatmap built from real scans, plus ad campaigns.
- **WhatsApp simulator**: photos sent in the simulator use the same diagnosis API.
- **PWA**: installable on a phone.

| Layer    | Technology                                         |
| -------- | -------------------------------------------------- |
| Backend  | Python 3.12, FastAPI, PyMongo (async), PyJWT       |
| Database | MongoDB (local or Atlas)                           |
| AI model | PyTorch ResNet-18 (optional install)               |
| Frontend | React 18, Vite, Tailwind CSS, Axios                |

## Project structure

```
backend/
  main.py                 # entry point: `uvicorn main:app`
  app/
    main.py               # app factory: middleware, routers, startup
    config.py             # settings from backend/.env
    db.py                 # MongoDB connection, indexes, crop seeding
    deps.py               # route guards: login, admin, rate limits
    middleware.py         # request ID / timing / logging, error format
    routers/              # health, auth, diagnose, cultivation, analytics, whatsapp
    services/             # AI predictor, bilingual treatment lookup
  scripts/seed_demo.py    # sample scans + ads for demos
  tests/                  # pytest suite
  ml_pipeline/            # dataset cleaning / split / training scripts
  disease_treatments.json # 38 diseases with English + Urdu treatments
  crop_profiles.json      # 100 crop cards (seeded into MongoDB)
frontend/
  src/App.jsx             # the whole UI
  src/api/client.js       # every backend call goes through here
```

## Run locally (Windows)

You need **Python 3.12**, **Node.js 18+** and **MongoDB** (local server or an Atlas cluster).

### 1. Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

Open `backend/.env` and fill in the values:
- `MONGO_URI`: your MongoDB connection string
- `JWT_SECRET`: any long random string
- `ADMIN_PHONES`: your phone number(s)
- `ADMIN_KEY`: a secret word for admin login

Then start the server:

```bash
uvicorn main:app --reload --port 8000
```

Check it at http://127.0.0.1:8000/api/health. Interactive API docs are at http://127.0.0.1:8000/docs.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. Vite forwards `/api` calls to the backend on port 8000.

### Admin login
Open **Farmer Login**, enter a phone number listed in `ADMIN_PHONES`, and type `ADMIN_KEY` into the **Admin Key** field. Only admins can open the B2B tab and create ad campaigns.

### Optional: real AI model
1. Install the ML packages: `pip install -r requirements-ml.txt`. On Windows, PyTorch also needs the [Microsoft Visual C++ Redistributable](https://aka.ms/vs/17/release/vc_redist.x64.exe).
2. Put the trained `crop_model.pt` in `backend/` (created by `ml_pipeline/train.py`).
3. Restart the backend. `/api/health` should now show `"model_mode": "model"`.

### Optional: demo data for the B2B dashboard
```bash
python scripts\seed_demo.py
```
Use `--clear` to remove it again. Sample rows are tagged `is_sample` and real data is never touched.

## Tests

```bash
cd backend
pip install -r requirements-dev.txt
pytest
```
The tests need a local MongoDB at `mongodb://localhost:27017`. They use a throwaway `crop_guardian_test` database, which is deleted afterwards.

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
- **Global**: CORS limited to `CORS_ORIGINS`, request ID + timing headers with one log line per request, gzip, and a consistent JSON error format (including 500s).
- **Per route** (FastAPI dependencies): JWT login check, admin check, in-memory rate limits, and image validation (type, 5 MB size limit, Pillow check).

## Deploying

- **Backend (e.g. Render)**
  - Root directory: `backend`
  - Build command: `pip install -r requirements.txt`
  - Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT --proxy-headers --forwarded-allow-ips="*"`
  - Set the same variables as in `.env`. Add the frontend URL to `CORS_ORIGINS`.
- **Frontend (e.g. Vercel)**
  - Root directory: `frontend`
  - Set `VITE_API_URL=https://<your-backend>/api`

## Security

- Never commit `backend/.env`; it is gitignored. If a password was ever committed, change it at the provider (MongoDB Atlas). Deleting it from the code isn't enough, because git history keeps it.
- Farmers log in with a phone number only, so anyone who knows a number can open that account. Admin access also requires `ADMIN_KEY`.

## License

This project is for educational purposes.
