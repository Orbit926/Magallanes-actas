/**
 * Lambda: email-sender
 *
 * Receives a JSON payload from API Gateway (HTTP API v2) with:
 *   - client_email  (string)
 *   - file_name     (string)
 *   - file_base64   (string, base64-encoded file)
 *   - mime_type     (string)
 *
 * Sends the file as an attachment via Zoho Mail API to:
 *   To:  client_email
 *   Cc:  SELLER_EMAIL (env var)
 *
 * The Zoho OAuth token is fetched from AWS Secrets Manager at runtime.
 *
 * ──────────────────────────────────────────────────
 * ZOHO MAIL API NOTES
 * ──────────────────────────────────────────────────
 * This implementation targets the Zoho Mail "Send Mail" endpoint:
 *   POST {ZOHO_API_BASE_URL}/api/accounts/{accountId}/messages
 *
 * If you use ZeptoMail instead, the endpoint and payload differ.
 * See README.md for guidance on adapting.
 *
 * The Zoho Mail API requires a Zoho Account ID. You can either:
 *   a) Store it alongside the token in the secret JSON, or
 *   b) Add it as an env var (ZOHO_ACCOUNT_ID).
 *
 * This code expects the secret JSON to have the shape:
 *   { "access_token": "...", "account_id": "..." }
 * ──────────────────────────────────────────────────
 */

const https = require("https");
const http = require("http");
const {
  SecretsManagerClient,
  GetSecretValueCommand,
} = require("@aws-sdk/client-secrets-manager");

// ── AWS SDK client (reused across invocations) ──
const smClient = new SecretsManagerClient({});

// ── Cached secret (warm-start optimisation) ─────
let cachedSecret = null;

// ── Helpers ─────────────────────────────────────

/** Validate a very basic email pattern */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Fetch and cache the Zoho secret from Secrets Manager */
async function getZohoSecret() {
  if (cachedSecret) return cachedSecret;

  const secretName = process.env.ZOHO_TOKEN_SECRET_NAME;
  if (!secretName) throw new Error("ZOHO_TOKEN_SECRET_NAME env var is not set");

  console.log("[secrets] Fetching secret:", secretName);
  const resp = await smClient.send(
    new GetSecretValueCommand({ SecretId: secretName })
  );

  cachedSecret = JSON.parse(resp.SecretString);
  console.log("[secrets] Secret loaded successfully");
  return cachedSecret;
}

/** Make an HTTPS request and return { statusCode, body } */
function request(url, options, body) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const lib = parsedUrl.protocol === "https:" ? https : http;

    const req = lib.request(url, options, (res) => {
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => {
        const raw = Buffer.concat(chunks).toString("utf-8");
        let parsed;
        try {
          parsed = JSON.parse(raw);
        } catch {
          parsed = raw;
        }
        resolve({ statusCode: res.statusCode, body: parsed });
      });
    });

    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

/** Build a standard JSON response for API Gateway v2 */
function response(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

// ── Handler ─────────────────────────────────────

exports.handler = async (event) => {
  console.log("[handler] Invoked. HTTP method:", event.requestContext?.http?.method);

  // ── Parse body ────────────────────────────────
  let payload;
  try {
    payload =
      typeof event.body === "string" ? JSON.parse(event.body) : event.body;
  } catch (err) {
    console.error("[handler] Invalid JSON body:", err.message);
    return response(400, { ok: false, error: "Invalid JSON body" });
  }

  if (!payload) {
    return response(400, { ok: false, error: "Empty request body" });
  }

  const { client_email, file_name, file_base64, mime_type } = payload;

  // ── Validate inputs ───────────────────────────
  if (!client_email || !isValidEmail(client_email)) {
    return response(400, {
      ok: false,
      error: "Missing or invalid client_email",
    });
  }

  if (!file_base64 || file_base64.length === 0) {
    return response(400, { ok: false, error: "file_base64 is required" });
  }

  if (!file_name) {
    return response(400, { ok: false, error: "file_name is required" });
  }

  const mimeType = mime_type || "application/pdf";
  const sellerEmail = process.env.SELLER_EMAIL;
  const fromEmail = process.env.ZOHO_FROM_EMAIL;
  const apiBase = process.env.ZOHO_API_BASE_URL;

  if (!sellerEmail || !fromEmail || !apiBase) {
    console.error("[handler] Missing env vars: SELLER_EMAIL, ZOHO_FROM_EMAIL, or ZOHO_API_BASE_URL");
    return response(500, { ok: false, error: "Server misconfiguration" });
  }

  // ── Get Zoho credentials ──────────────────────
  let accessToken, accountId;
  try {
    const secret = await getZohoSecret();
    accessToken = secret.access_token;
    accountId = secret.account_id;

    if (!accessToken || !accountId) {
      throw new Error("Secret JSON must contain access_token and account_id");
    }
  } catch (err) {
    console.error("[handler] Failed to retrieve Zoho secret:", err.message);
    return response(500, { ok: false, error: "Failed to retrieve credentials" });
  }

  // ── Build Zoho Mail API payload ───────────────
  //
  // Zoho Mail "Send Mail" endpoint:
  //   POST /api/accounts/{accountId}/messages
  //
  // Attachments are sent as inline base64 objects.
  // Ref: https://www.zoho.com/mail/help/api/post-send-an-email.html
  //
  // NOTE: Depending on your Zoho plan/API version the attachment
  // format may vary. This uses the documented "attachments" array
  // approach. If your Zoho variant expects multipart, adjust
  // accordingly (see README).

  const zohoPayload = {
    fromAddress: fromEmail,
    toAddress: client_email,
    ccAddress: sellerEmail,
    subject: "Contrato",
    content: "Adjunto el contrato.",
    contentType: "plaintext",
    attachments: [
      {
        storeName: file_name,
        attachmentName: file_name,
        mimeType: mimeType,
        content: file_base64,
      },
    ],
  };

  const zohoUrl = `${apiBase}/api/accounts/${accountId}/messages`;
  const bodyStr = JSON.stringify(zohoPayload);

  console.log("[handler] Sending email via Zoho. To:", client_email, "Cc:", sellerEmail);
  console.log("[handler] Zoho endpoint:", zohoUrl);

  // ── Call Zoho API ─────────────────────────────
  try {
    const result = await request(zohoUrl, {
      method: "POST",
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(bodyStr),
      },
    }, bodyStr);

    console.log("[handler] Zoho response status:", result.statusCode);
    console.log("[handler] Zoho response body:", JSON.stringify(result.body));

    if (result.statusCode >= 200 && result.statusCode < 300) {
      return response(200, { ok: true, message: "Email sent successfully" });
    }

    // Zoho returned an error
    console.error("[handler] Zoho API error:", result.statusCode, JSON.stringify(result.body));
    return response(502, {
      ok: false,
      error: "Zoho API returned an error",
      zoho_status: result.statusCode,
      zoho_message: typeof result.body === "object" ? result.body : undefined,
    });
  } catch (err) {
    console.error("[handler] Network/request error:", err.message);
    return response(500, { ok: false, error: "Failed to send email" });
  }
};
