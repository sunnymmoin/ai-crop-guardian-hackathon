from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.asynchronous.database import AsyncDatabase
from pymongo.errors import DuplicateKeyError

from ..config import Settings, get_settings
from ..db import get_db, serialize_user, utcnow
from ..deps import auth_rate_limit, get_current_user
from ..schemas import AuthOut, LoginIn, RegisterIn, UserOut
from ..security import admin_key_matches, create_access_token, is_admin_phone, is_valid_phone, normalize_phone

router = APIRouter(prefix="/auth", tags=["auth"])


def _clean_phone(raw: str) -> str:
    phone = normalize_phone(raw)
    if not is_valid_phone(phone):
        raise HTTPException(status_code=422, detail="Please enter a valid phone number (at least 10 digits).")
    return phone


def _resolve_role(phone: str, admin_key: str | None, settings: Settings) -> str:
    """Admin needs both: a phone in ADMIN_PHONES and the right ADMIN_KEY."""
    if not admin_key:
        return "farmer"
    if is_admin_phone(phone, settings) and admin_key_matches(admin_key, settings):
        return "admin"
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid admin key for this phone number.")


def _auth_response(user: dict, role: str, settings: Settings) -> dict:
    return {
        "user": serialize_user(user, role),
        "token": create_access_token(str(user["_id"]), role, settings),
    }


@router.post("/register", response_model=AuthOut, status_code=201, dependencies=[Depends(auth_rate_limit)])
async def register(
    body: RegisterIn,
    db: AsyncDatabase = Depends(get_db),
    settings: Settings = Depends(get_settings),
):
    phone = _clean_phone(body.phone)
    role = _resolve_role(phone, body.admin_key, settings)
    user = {
        "name": body.name.strip() or "Registered Farmer",
        "phone": phone,
        "district": body.district.strip() or "Karachi",
        "scans": 0,
        "created_at": utcnow(),
    }
    try:
        result = await db.users.insert_one(user)
    except DuplicateKeyError:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Mobile number already registered. Please log in.")
    user["_id"] = result.inserted_id
    return _auth_response(user, role, settings)


@router.post("/login", response_model=AuthOut, dependencies=[Depends(auth_rate_limit)])
async def login(
    body: LoginIn,
    db: AsyncDatabase = Depends(get_db),
    settings: Settings = Depends(get_settings),
):
    phone = _clean_phone(body.phone)
    user = await db.users.find_one({"phone": phone})
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found. Please register first.")
    role = _resolve_role(phone, body.admin_key, settings)
    return _auth_response(user, role, settings)


@router.get("/me", response_model=UserOut)
async def me(user: dict = Depends(get_current_user)):
    return serialize_user(user, user["role"])
