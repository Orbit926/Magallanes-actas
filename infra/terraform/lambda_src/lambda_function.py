"""
Lambda: email-sender (SMTP version)

Receives JSON from API Gateway HTTP v2:
  - client_email  (string)
  - file_name     (string)
  - file_base64   (string, base64-encoded PDF)
  - mime_type     (string, default "application/pdf")

Sends the PDF as a real SMTP attachment via Zoho SMTP (SSL 465):
  To:  client_email
  Bcc: SELLER_EMAIL (env var)

Credentials come from environment variables — no Secrets Manager, no OAuth.
"""

import json
import os
import base64
import smtplib
from email.message import EmailMessage

# ── Env vars (loaded once per cold start) ────────
ZOHO_SMTP_HOST = os.environ.get("ZOHO_SMTP_HOST", "smtp.zoho.com")
ZOHO_SMTP_PORT = int(os.environ.get("ZOHO_SMTP_PORT", "465"))
ZOHO_SMTP_USER = os.environ.get("ZOHO_SMTP_USER", "")
ZOHO_SMTP_PASS = os.environ.get("ZOHO_SMTP_PASS", "")
ZOHO_FROM_EMAIL = os.environ.get("ZOHO_FROM_EMAIL", "")
SELLER_EMAIL = os.environ.get("SELLER_EMAIL", "")


def response(status_code, body):
    """Build API Gateway v2 compatible JSON response."""
    return {
        "statusCode": status_code,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps(body),
    }


def is_valid_email(email):
    """Very basic email validation."""
    return email and "@" in email and "." in email.split("@")[-1]


def lambda_handler(event, context):
    print("[handler] Invoked. Method:", event.get("requestContext", {}).get("http", {}).get("method"))

    # ── Parse body ───────────────────────────────
    raw_body = event.get("body", "")
    if not raw_body:
        return response(400, {"ok": False, "error": "Empty request body"})

    try:
        payload = json.loads(raw_body) if isinstance(raw_body, str) else raw_body
    except (json.JSONDecodeError, TypeError) as e:
        print(f"[handler] Invalid JSON: {e}")
        return response(400, {"ok": False, "error": "Invalid JSON body"})

    client_email = payload.get("client_email", "").strip()
    file_name = payload.get("file_name", "").strip()
    file_base64 = payload.get("file_base64", "")
    mime_type = payload.get("mime_type", "application/pdf")

    # ── Validate inputs ──────────────────────────
    if not is_valid_email(client_email):
        return response(400, {"ok": False, "error": "Missing or invalid client_email"})

    if not file_base64:
        return response(400, {"ok": False, "error": "file_base64 is required"})

    if not file_name:
        return response(400, {"ok": False, "error": "file_name is required"})

    # ── Validate env vars ────────────────────────
    if not all([ZOHO_SMTP_USER, ZOHO_SMTP_PASS, ZOHO_FROM_EMAIL, SELLER_EMAIL]):
        print("[handler] Missing env vars: ZOHO_SMTP_USER, ZOHO_SMTP_PASS, ZOHO_FROM_EMAIL, or SELLER_EMAIL")
        return response(500, {"ok": False, "error": "Server misconfiguration"})

    # ── Decode attachment ────────────────────────
    try:
        file_bytes = base64.b64decode(file_base64)
    except Exception as e:
        print(f"[handler] base64 decode error: {e}")
        return response(400, {"ok": False, "error": "Invalid base64 in file_base64"})

    print(f"[handler] Attachment: {file_name} ({len(file_bytes)} bytes)")

    # ── Build email ──────────────────────────────
    maintype, _, subtype = mime_type.partition("/")
    if not subtype:
        maintype, subtype = "application", "pdf"

    msg = EmailMessage()
    msg["From"] = ZOHO_FROM_EMAIL
    msg["To"] = client_email
    msg["Bcc"] = SELLER_EMAIL
    msg["Subject"] = "Acta de Entrega-Recepción"
    msg.set_content(
        "Adjunto encontrarás el acta de entrega-recepción de tu vivienda.\n\n"
        "Este correo fue generado automáticamente. Por favor no responder."
    )
    msg.add_attachment(
        file_bytes,
        maintype=maintype,
        subtype=subtype,
        filename=file_name,
    )

    # ── Send via SMTP SSL ────────────────────────
    print(f"[handler] Sending email via {ZOHO_SMTP_HOST}:{ZOHO_SMTP_PORT}")
    print(f"[handler] From: {ZOHO_FROM_EMAIL}  To: {client_email}  Bcc: {SELLER_EMAIL}")

    try:
        with smtplib.SMTP_SSL(ZOHO_SMTP_HOST, ZOHO_SMTP_PORT, timeout=20) as server:
            server.login(ZOHO_SMTP_USER, ZOHO_SMTP_PASS)
            server.send_message(msg)
    except smtplib.SMTPAuthenticationError as e:
        print(f"[handler] SMTP auth error: {e}")
        return response(500, {"ok": False, "error": "SMTP authentication failed"})
    except smtplib.SMTPException as e:
        print(f"[handler] SMTP error: {e}")
        return response(500, {"ok": False, "error": "Failed to send email via SMTP"})
    except Exception as e:
        print(f"[handler] Unexpected error: {e}")
        return response(500, {"ok": False, "error": "Failed to send email"})

    print("[handler] Email sent successfully")
    return response(200, {"ok": True, "message": "Email sent successfully"})
