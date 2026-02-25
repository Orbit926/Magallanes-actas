/**
 * contractApi.js
 *
 * Helper functions for sending the contract PDF via the deployed
 * API Gateway → Lambda → Zoho Mail pipeline.
 */

const API_BASE_URL = import.meta.env.VITE_CONTRACT_API_BASE_URL || '';

/**
 * Convert an ArrayBuffer to a base64 string.
 * @param {ArrayBuffer} buffer
 * @returns {string} base64-encoded string
 */
export function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 8192;
  let binary = '';
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, chunk);
  }
  return btoa(binary);
}

/**
 * Send the contract PDF to the client (and seller) via email.
 *
 * @param {Object} params
 * @param {string} params.clientEmail - Recipient email address
 * @param {string} params.fileName   - PDF file name (e.g. "Acta_Entrega_...pdf")
 * @param {string} params.pdfBase64  - Base64-encoded PDF content
 * @param {number} [params.timeoutMs=25000] - Request timeout in milliseconds
 * @returns {Promise<{ ok: boolean, message?: string, error?: string }>}
 */
export async function sendContractEmail({ clientEmail, fileName, pdfBase64, timeoutMs = 25000 }) {
  if (!API_BASE_URL) {
    console.warn('[contractApi] VITE_CONTRACT_API_BASE_URL is not configured. Skipping email send.');
    return { ok: false, error: 'API URL no configurada' };
  }

  if (!clientEmail || !pdfBase64 || !fileName) {
    return { ok: false, error: 'Faltan datos para enviar el correo' };
  }

  const url = `${API_BASE_URL}/send-contract`;

  console.log(`[contractApi] Sending contract email to: ${clientEmail}`);
  console.log(`[contractApi] File: ${fileName} (${Math.round(pdfBase64.length * 0.75 / 1024)} KB)`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        client_email: clientEmail,
        file_name: fileName,
        file_base64: pdfBase64,
        mime_type: 'application/pdf',
      }),
    });

    clearTimeout(timeoutId);

    const data = await response.json().catch(() => ({}));

    if (response.ok && data.ok) {
      console.log('[contractApi] Email sent successfully');
      return { ok: true, message: data.message || 'Correo enviado' };
    }

    console.error('[contractApi] API error:', response.status, data);
    return {
      ok: false,
      error: data.error || `Error del servidor (${response.status})`,
    };
  } catch (err) {
    clearTimeout(timeoutId);

    if (err.name === 'AbortError') {
      console.error('[contractApi] Request timed out');
      return { ok: false, error: 'Tiempo de espera agotado. Intenta de nuevo.' };
    }

    console.error('[contractApi] Network error:', err.message);
    return { ok: false, error: 'Error de red. Verifica tu conexión.' };
  }
}
