from typing import Literal

from pydantic import BaseModel, Field


class RegisterIn(BaseModel):
    name: str = Field("Registered Farmer", max_length=80)
    phone: str = Field(..., max_length=20)
    district: str = Field("Karachi", max_length=80)
    admin_key: str | None = Field(None, max_length=200)


class LoginIn(BaseModel):
    phone: str = Field(..., max_length=20)
    admin_key: str | None = Field(None, max_length=200)


class UserOut(BaseModel):
    id: str
    name: str
    phone: str
    district: str
    scans: int
    joined: str | None
    role: Literal["farmer", "admin"]


class AuthOut(BaseModel):
    user: UserOut
    token: str


class CropIn(BaseModel):
    name: str = Field(..., min_length=1, max_length=80)
    seed_identification: str = Field(..., min_length=1, max_length=500)
    planting: str = Field(..., min_length=1, max_length=500)
    sunlight: str | None = Field(None, max_length=200)
    temperature: str | None = Field(None, max_length=200)
    watering: str | None = Field(None, max_length=200)
    fertilizer: str | None = Field(None, max_length=200)
    harvest: str | None = Field(None, max_length=200)


class AdIn(BaseModel):
    title: str = Field(..., min_length=1, max_length=120)
    target_district: str = Field(..., min_length=1, max_length=80)
    budget: str = Field(..., min_length=1, max_length=40)
    status: Literal["Active", "Paused"] = "Active"
