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
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders

# ── Env vars (loaded once per cold start) ────────
ZOHO_SMTP_HOST = os.environ.get("ZOHO_SMTP_HOST", "smtp.zoho.com")
ZOHO_SMTP_PORT = int(os.environ.get("ZOHO_SMTP_PORT", "465"))
ZOHO_SMTP_USER = os.environ.get("ZOHO_SMTP_USER", "")
ZOHO_SMTP_PASS = os.environ.get("ZOHO_SMTP_PASS", "")
ZOHO_FROM_EMAIL = os.environ.get("ZOHO_FROM_EMAIL", "")
SELLER_EMAIL = os.environ.get("SELLER_EMAIL", "")

# ── Brand colors ─────────────────────────────────
PRIMARY_COLOR = "#CC5629"
DARK_COLOR = "#0F1F3D"
SECONDARY_COLOR = "#C49A6C"
BG_COLOR = "#F5F7FA"


def build_html_email(file_name: str) -> str:
    """Build premium HTML email template with Magallanes branding."""
    return f"""
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Acta de Entrega-Recepción</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: {BG_COLOR};">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: {BG_COLOR};">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 24px rgba(15, 31, 61, 0.08); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, {DARK_COLOR} 0%, #1a2d4d 100%); padding: 40px 40px 30px; text-align: center;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <!-- Logo text fallback -->
                    <h1 style="margin: 0; font-size: 36px; font-weight: 300; letter-spacing: 2px; color: {PRIMARY_COLOR};">
                      <span style="font-weight: 600;">M</span><span style="color: {SECONDARY_COLOR};">R</span>
                    </h1>
                    <p style="margin: 8px 0 0; font-size: 18px; font-weight: 600; letter-spacing: 4px; color: #ffffff; text-transform: uppercase;">
                      Magallanes
                    </p>
                    <p style="margin: 4px 0 0; font-size: 11px; font-weight: 400; letter-spacing: 3px; color: {SECONDARY_COLOR}; text-transform: uppercase;">
                      — Residencial —
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Accent line -->
          <tr>
            <td style="height: 4px; background: linear-gradient(90deg, {PRIMARY_COLOR} 0%, {SECONDARY_COLOR} 100%);"></td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 50px 40px;">
              <h2 style="margin: 0 0 24px; font-size: 24px; font-weight: 600; color: {DARK_COLOR}; text-align: center;">
                Acta de Entrega-Recepción
              </h2>
              
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.7; color: #4a5568; text-align: center;">
                Estimado propietario,
              </p>
              
              <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.7; color: #4a5568; text-align: center;">
                Nos complace hacerle llegar el acta de entrega-recepción de su vivienda. 
                Este documento formaliza la entrega de su nuevo hogar en <strong style="color: {DARK_COLOR};">Magallanes Residencial</strong>.
              </p>
              
              <!-- Document card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 30px 0;">
                <tr>
                  <td style="background-color: {BG_COLOR}; border-radius: 12px; padding: 24px; border-left: 4px solid {PRIMARY_COLOR};">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td width="50" valign="top">
                          <div style="width: 44px; height: 44px; background-color: {PRIMARY_COLOR}; border-radius: 10px; text-align: center; line-height: 44px;">
                            <span style="font-size: 20px;">📄</span>
                          </div>
                        </td>
                        <td style="padding-left: 16px;">
                          <p style="margin: 0 0 4px; font-size: 14px; font-weight: 600; color: {DARK_COLOR};">
                            Documento adjunto
                          </p>
                          <p style="margin: 0; font-size: 13px; color: #718096;">
                            {file_name}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 0; font-size: 15px; line-height: 1.7; color: #4a5568; text-align: center;">
                Le recomendamos guardar este documento en un lugar seguro para futuras referencias.
              </p>
            </td>
          </tr>
          
          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <div style="height: 1px; background-color: #e2e8f0;"></div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px 40px;">
              <p style="margin: 0 0 16px; font-size: 14px; color: #718096; text-align: center;">
                Gracias por confiar en nosotros para su nuevo hogar.
              </p>
              <p style="margin: 0; font-size: 13px; color: #a0aec0; text-align: center;">
                <strong style="color: {PRIMARY_COLOR};">Magallanes Residencial</strong><br>
                Este correo fue generado automáticamente. Por favor no responder.
              </p>
            </td>
          </tr>
          
        </table>
        
        <!-- Bottom branding -->
        <table role="presentation" width="600" cellspacing="0" cellpadding="0">
          <tr>
            <td style="padding: 24px 20px; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #a0aec0;">
                © 2026 Magallanes Residencial. Todos los derechos reservados.
              </p>
            </td>
          </tr>
        </table>
        
      </td>
    </tr>
  </table>
</body>
</html>
"""


def build_plain_text(file_name: str) -> str:
    """Build plain text fallback for email clients that don't support HTML."""
    return f"""
MAGALLANES RESIDENCIAL
━━━━━━━━━━━━━━━━━━━━━━

ACTA DE ENTREGA-RECEPCIÓN

Estimado propietario,

Nos complace hacerle llegar el acta de entrega-recepción de su vivienda.
Este documento formaliza la entrega de su nuevo hogar en Magallanes Residencial.

📄 Documento adjunto: {file_name}

Le recomendamos guardar este documento en un lugar seguro para futuras referencias.

━━━━━━━━━━━━━━━━━━━━━━

Gracias por confiar en nosotros para su nuevo hogar.

Magallanes Residencial
Este correo fue generado automáticamente. Por favor no responder.

© 2026 Magallanes Residencial. Todos los derechos reservados.
"""


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
    # Outer container for body + attachment
    msg = MIMEMultipart("mixed")
    msg["From"] = ZOHO_FROM_EMAIL
    msg["To"] = client_email
    msg["Bcc"] = SELLER_EMAIL
    msg["Subject"] = "Acta de Entrega-Recepción | Magallanes Residencial"

    # Inner container for text/html alternatives
    msg_alt = MIMEMultipart("alternative")

    # Plain text fallback
    plain_text = build_plain_text(file_name)
    part_plain = MIMEText(plain_text, "plain", "utf-8")
    msg_alt.attach(part_plain)

    # HTML version (preferred)
    html_content = build_html_email(file_name)
    part_html = MIMEText(html_content, "html", "utf-8")
    msg_alt.attach(part_html)

    msg.attach(msg_alt)

    # Attachment
    maintype, _, subtype = mime_type.partition("/")
    if not subtype:
        maintype, subtype = "application", "pdf"

    attachment = MIMEBase(maintype, subtype)
    attachment.set_payload(file_bytes)
    encoders.encode_base64(attachment)
    attachment.add_header(
        "Content-Disposition",
        f"attachment; filename=\"{file_name}\""
    )
    msg.attach(attachment)

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
