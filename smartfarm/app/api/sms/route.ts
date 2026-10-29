import { createClient } from '../../../lib/supabase/server';
import { isSmsConfigured, PHONE_PATTERN, sendSms } from '../../../lib/sms';

const MAX_RECIPIENTS = 50;
const MAX_LENGTH = 480; // about 3 SMS segments

/** Lets the Communication page show setup instructions when no SMS provider is configured. */
export async function GET() {
  return Response.json({ configured: isSmsConfigured() });
}

/**
 * Sends an SMS to members of a farm. Only owners/managers may send, and only to people who
 * are on that farm's team with a phone number in their profile. Arbitrary numbers are
 * rejected, so the endpoint can't be used to spam outsiders.
 *
 * Body: { farmId: string, recipientIds: string[], message: string }
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Not signed in' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const farmId = typeof body?.farmId === 'string' ? body.farmId : '';
  const message = typeof body?.message === 'string' ? body.message.trim() : '';
  const recipientIds: string[] = Array.isArray(body?.recipientIds)
    ? [...new Set<string>(body.recipientIds.filter((id: unknown) => typeof id === 'string'))]
    : [];

  if (!farmId || !message || recipientIds.length === 0) {
    return Response.json({ error: 'farmId, recipientIds and message are required' }, { status: 400 });
  }
  if (message.length > MAX_LENGTH) {
    return Response.json({ error: `Message is longer than ${MAX_LENGTH} characters` }, { status: 400 });
  }
  if (recipientIds.length > MAX_RECIPIENTS) {
    return Response.json({ error: `At most ${MAX_RECIPIENTS} recipients per message` }, { status: 400 });
  }

  // RLS only returns rows for farms the user belongs to, so a missing row means "not a member"
  const { data: me } = await supabase
    .from('farm_user_roles')
    .select('role')
    .eq('farm_id', farmId)
    .eq('user_id', user.id)
    .maybeSingle();
  if (!me || !['owner', 'manager'].includes(me.role)) {
    return Response.json({ error: 'Only farm owners and managers can send SMS' }, { status: 403 });
  }

  if (!isSmsConfigured()) {
    return Response.json({ error: 'SMS is not configured on the server' }, { status: 503 });
  }

  // Keep only recipients who are actually on this farm's team
  const { data: members } = await supabase
    .from('farm_user_roles')
    .select('user_id')
    .eq('farm_id', farmId)
    .in('user_id', recipientIds);
  const memberIds = (members || []).map((m) => m.user_id as string);

  const { data: profiles } = memberIds.length
    ? await supabase.from('user_profile').select('id, full_name, email, phone').in('id', memberIds)
    : { data: [] };

  const results = await Promise.all(
    (profiles || []).map(async (p) => {
      const name = p.full_name || p.email || 'Team member';
      if (!p.phone || !PHONE_PATTERN.test(p.phone)) {
        return { userId: p.id, name, status: 'no_phone' as const };
      }
      const sent = await sendSms(p.phone, message);
      return sent.ok
        ? { userId: p.id, name, status: 'sent' as const }
        : { userId: p.id, name, status: 'failed' as const, error: sent.error };
    })
  );

  return Response.json({
    sent: results.filter((r) => r.status === 'sent').length,
    results,
  });
}
