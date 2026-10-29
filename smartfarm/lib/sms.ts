// Server-only SMS sending. Uses Twilio's REST API directly (no SDK needed).
// Configure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN and TWILIO_FROM_NUMBER (an SMS-capable
// number or alphanumeric sender ID) in the server environment. To switch provider,
// replace sendSms; the /api/sms route only depends on this file.
import { PHONE_PATTERN } from './constants';

export { PHONE_PATTERN };

export function isSmsConfigured(): boolean {
  return Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER);
}

export async function sendSms(to: string, body: string): Promise<{ ok: boolean; error?: string }> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  if (!sid || !token || !from) return { ok: false, error: 'SMS is not configured' };

  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ To: to, From: from, Body: body }),
  });

  if (res.ok) return { ok: true };
  const detail = await res.json().catch(() => null);
  return { ok: false, error: detail?.message || `Provider error ${res.status}` };
}
