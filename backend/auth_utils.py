import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional

import bcrypt
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from backend.settings import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    ALGORITHM,
    EMAIL_VERIFICATION_EXPIRE_HOURS,
    PASSWORD_RESET_EXPIRE_HOURS,
    SECRET_KEY,
)
from backend.models import AuthToken, User


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


def create_access_token(user_id: str, email: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": user_id, "email": email, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None


def create_auth_token(db: Session, user_id: str, token_type: str) -> AuthToken:
    hours = EMAIL_VERIFICATION_EXPIRE_HOURS if token_type == "email_verify" else PASSWORD_RESET_EXPIRE_HOURS
    token = secrets.token_urlsafe(32)
    auth_token = AuthToken(
        user_id=user_id,
        token=token,
        token_type=token_type,
        expires_at=datetime.now(timezone.utc) + timedelta(hours=hours),
    )
    db.add(auth_token)
    db.commit()
    db.refresh(auth_token)
    return auth_token


def consume_auth_token(db: Session, token: str, token_type: str) -> Optional[User]:
    auth_token = (
        db.query(AuthToken)
        .filter(
            AuthToken.token == token,
            AuthToken.token_type == token_type,
            AuthToken.used.is_(False),
            AuthToken.expires_at > datetime.now(timezone.utc),
        )
        .first()
    )
    if not auth_token:
        return None
    auth_token.used = True
    db.commit()
    return auth_token.user
