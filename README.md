# AI Crop Guardian

AI-powered web application for detecting crop diseases from leaf images. Upload a photo of a crop leaf and receive instant diagnosis with confidence scores, disease identification, and actionable maintenance recommendations.

## Features

- **Drag-and-Drop Image Upload** — Easily upload leaf images for analysis
- **Instant AI Diagnosis** — Get predictions powered by machine learning with confidence scores
- **Disease Identification** — Receive the predicted disease name along with detailed descriptions
- **Maintenance Recommendations** — Actionable treatment and prevention guidance for identified diseases

## Tech Stack

| Layer     | Technology                          |
| --------- | ----------------------------------- |
| Backend   | Python 3.10+, FastAPI, Uvicorn      |
| Frontend  | React, Vite, Tailwind CSS           |
| API Client| Axios                               |

## Project Structure

```
ai-crop-guardian/
├── backend/            # FastAPI backend
│   ├── main.py         # Application entry point
│   ├── requirements.txt
│   └── ...
├── frontend/           # React + Vite frontend
│   ├── package.json
│   ├── vite.config.*
│   └── ...
└── raw_dataset/        # Raw crop leaf image dataset
```

## Prerequisites

- **Python** 3.10 or higher
- **Node.js** 18 or higher
- **npm** 9 or higher

## Getting Started

### Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Create and activate a virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Start the development server
uvicorn main:app --reload
```

The backend will be available at **http://localhost:8000**.

### Frontend Setup

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at **http://localhost:5173**.

> The Vite dev server proxies `/api/*` requests to the backend, so CORS issues are avoided during local development.

## API

The backend exposes a REST API under the `/api` prefix. The frontend communicates with the backend through this API using Axios.

## License

This project is for educational purposes.


