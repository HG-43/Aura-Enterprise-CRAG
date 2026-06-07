import logging
import smtplib
from email.mime.text import MIMEText

from backend.settings import (
    BACKEND_URL,
    FROM_EMAIL,
    FRONTEND_URL,
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    SMTP_HOST,
    SMTP_PASSWORD,
    SMTP_PORT,
    SMTP_USER,
)

logger = logging.getLogger(__name__)


def send_email(to: str, subject: str, html_body: str) -> bool:
    if not SMTP_HOST or not SMTP_USER:
        logger.info("SMTP not configured — email to %s: %s", to, subject)
        logger.info("Link/content: %s", html_body[:500])
        return True
    try:
        msg = MIMEText(html_body, "html")
        msg["Subject"] = subject
        msg["From"] = FROM_EMAIL
        msg["To"] = to
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)
        return True
    except Exception as e:
        logger.error("Failed to send email: %s", e)
        return False


def send_verification_email(email: str, token: str) -> None:
    link = f"{FRONTEND_URL}/verify-email?token={token}"
    html = f"""
    <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px;">
      <h2 style="color:#a78bfa;">Verify your Aura Intelligence account</h2>
      <p>Click the button below to verify your email address.</p>
      <a href="{link}" style="display:inline-block;background:linear-gradient(135deg,#c084fc,#818cf8);
         color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
        Verify Email
      </a>
      <p style="color:#888;font-size:13px;margin-top:24px;">Or copy this link: {link}</p>
    </div>
    """
    send_email(email, "Verify your Aura Intelligence account", html)


def send_password_reset_email(email: str, token: str) -> None:
    link = f"{FRONTEND_URL}/reset-password?token={token}"
    html = f"""
    <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px;">
      <h2 style="color:#a78bfa;">Reset your password</h2>
      <p>Click below to reset your Aura Intelligence password. This link expires in 1 hour.</p>
      <a href="{link}" style="display:inline-block;background:linear-gradient(135deg,#c084fc,#818cf8);
         color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
        Reset Password
      </a>
      <p style="color:#888;font-size:13px;margin-top:24px;">Or copy this link: {link}</p>
    </div>
    """
    send_email(email, "Reset your Aura Intelligence password", html)


def get_google_auth_url() -> str:
    redirect_uri = f"{BACKEND_URL}/api/auth/google/callback"
    scope = "openid email profile"
    return (
        f"https://accounts.google.com/o/oauth2/v2/auth"
        f"?client_id={GOOGLE_CLIENT_ID}"
        f"&redirect_uri={redirect_uri}"
        f"&response_type=code"
        f"&scope={scope.replace(' ', '%20')}"
        f"&access_type=offline"
        f"&prompt=select_account"
    )
