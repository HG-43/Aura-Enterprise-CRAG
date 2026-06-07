import json
import sys
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
import httpx

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from backend.auth_utils import (
    consume_auth_token,
    create_access_token,
    create_auth_token,
    hash_password,
    verify_password,
)
from backend.settings import FRONTEND_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, BACKEND_URL
from backend.database import get_db
from backend.dependencies import get_current_user
from backend.email_service import get_google_auth_url, send_password_reset_email, send_verification_email
from backend.models import User
from backend.schemas import (
    ForgotPassword,
    PasswordChange,
    ProfileUpdate,
    ResetPassword,
    TokenResponse,
    UserLogin,
    UserRegister,
    UserResponse,
    VerifyEmail,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _user_response(user: User) -> UserResponse:
    return UserResponse.model_validate(user)


def _token_response(user: User) -> TokenResponse:
    return TokenResponse(
        access_token=create_access_token(user.id, user.email),
        user=_user_response(user),
    )


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email.lower()).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        email=payload.email.lower(),
        name=payload.name.strip(),
        hashed_password=hash_password(payload.password),
        is_verified=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_auth_token(db, user.id, "email_verify")
    send_verification_email(user.email, token.token)
    return _token_response(user)


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user or not user.hashed_password or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account deactivated")
    return _token_response(user)


@router.get("/me", response_model=UserResponse)
def me(user: User = Depends(get_current_user)):
    return _user_response(user)


@router.patch("/profile", response_model=UserResponse)
def update_profile(payload: ProfileUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if payload.name is not None:
        user.name = payload.name.strip()
    if payload.theme is not None:
        user.theme = payload.theme
    if payload.notifications_enabled is not None:
        user.notifications_enabled = payload.notifications_enabled
    db.commit()
    db.refresh(user)
    return _user_response(user)


@router.post("/change-password")
def change_password(payload: PasswordChange, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not user.hashed_password or not verify_password(payload.current_password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    user.hashed_password = hash_password(payload.new_password)
    db.commit()
    return {"message": "Password updated successfully"}


@router.post("/forgot-password")
def forgot_password(payload: ForgotPassword, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if user:
        token = create_auth_token(db, user.id, "password_reset")
        send_password_reset_email(user.email, token.token)
    return {"message": "If that email exists, a reset link has been sent"}


@router.post("/reset-password")
def reset_password(payload: ResetPassword, db: Session = Depends(get_db)):
    user = consume_auth_token(db, payload.token, "password_reset")
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    user.hashed_password = hash_password(payload.new_password)
    db.commit()
    return {"message": "Password reset successfully"}


@router.post("/verify-email")
def verify_email(payload: VerifyEmail, db: Session = Depends(get_db)):
    user = consume_auth_token(db, payload.token, "email_verify")
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired verification token")
    user.is_verified = True
    db.commit()
    return {"message": "Email verified successfully"}


@router.post("/resend-verification")
def resend_verification(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.is_verified:
        return {"message": "Email already verified"}
    token = create_auth_token(db, user.id, "email_verify")
    send_verification_email(user.email, token.token)
    return {"message": "Verification email sent"}


@router.get("/google")
def google_login():
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=503, detail="Google OAuth not configured")
    return {"url": get_google_auth_url()}


@router.get("/google/callback")
async def google_callback(code: str, db: Session = Depends(get_db)):
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        raise HTTPException(status_code=503, detail="Google OAuth not configured")

    redirect_uri = f"{BACKEND_URL}/api/auth/google/callback"
    async with httpx.AsyncClient() as client:
        token_resp = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "redirect_uri": redirect_uri,
                "grant_type": "authorization_code",
            },
        )
        if token_resp.status_code != 200:
            return RedirectResponse(f"{FRONTEND_URL}/login?error=oauth_failed")
        tokens = token_resp.json()
        userinfo_resp = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {tokens['access_token']}"},
        )
        if userinfo_resp.status_code != 200:
            return RedirectResponse(f"{FRONTEND_URL}/login?error=oauth_failed")
        info = userinfo_resp.json()

    email = info["email"].lower()
    google_id = info["id"]
    user = db.query(User).filter((User.google_id == google_id) | (User.email == email)).first()
    if not user:
        user = User(
            email=email,
            name=info.get("name", email.split("@")[0]),
            google_id=google_id,
            avatar_url=info.get("picture"),
            is_verified=True,
        )
        db.add(user)
    else:
        user.google_id = google_id
        user.is_verified = True
        if info.get("picture"):
            user.avatar_url = info["picture"]
    db.commit()
    db.refresh(user)
    access_token = create_access_token(user.id, user.email)
    return RedirectResponse(f"{FRONTEND_URL}/auth/callback?token={access_token}")
