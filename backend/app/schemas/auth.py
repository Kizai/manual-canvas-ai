from pydantic import BaseModel, EmailStr, Field
from app.schemas.common import Timestamped


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    nickname: str | None = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserRead(Timestamped):
    email: str
    nickname: str | None = None
