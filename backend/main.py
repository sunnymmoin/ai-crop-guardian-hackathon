# Entry point kept so `uvicorn main:app` keeps working. The app lives in the app/ package.
from app.main import app  # noqa: F401
