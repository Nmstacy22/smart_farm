// Talks to the local Supabase API directly with the public key, the way an attacker could,
// and checks the RLS rules hold without the app's UI in the way.
import { test, expect } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { localSupabase } from '../env';
import { email, PASSWORD } from './helpers';

test.describe.configure({ mode: 'serial' });

const { url, anonKey } = localSupabase();
const client = () => createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });

async function newUser(who: string): Promise<{ db: SupabaseClient; id: string }> {
  const db = client();
  const { data, error } = await db.auth.signUp({ email: email(`sec-${who}`), password: PASSWORD });
  if (error || !data.user) throw error || new Error('no user');
  return { db, id: data.user.id };
}

let alice: { db: SupabaseClient; id: string };
let bob: { db: SupabaseClient; id: string };
let carol: { db: SupabaseClient; id: string };
let farmA = '';
let fieldA = '';

test.beforeAll(async () => {
  alice = await newUser('alice'); // owner of farm A
  bob = await newUser('bob'); // owner of another farm, outsider to A
  carol = await newUser('carol'); // worker on farm A
  farmA = (await alice.db.rpc('create_farm', { p_name: 'Security Farm A' })).data;
  await bob.db.rpc('create_farm', { p_name: 'Security Farm B' });
  const code = (await alice.db.rpc('get_join_code', { p_farm_id: farmA })).data;
  expect((await carol.db.rpc('join_farm', { p_code: code })).error).toBeNull();
  const { data } = await alice.db.from('fields').insert({ farm_id: farmA, name: 'Secret Field' }).select('id').single();
  fieldA = data!.id;
  const account = await alice.db.from('financial_accounts').insert({ farm_id: farmA, name: 'Main', account_type: 'Cash' }).select('id').single();
  await alice.db.from('financial_transactions').insert({ farm_id: farmA, account_id: account.data!.id, amount: 1000, transaction_type: 'income', occurred_on: new Date().toISOString() });
});

test('signed-out visitors can read nothing', async () => {
  const anon = client();
  for (const table of ['farm', 'fields', 'farm_user_roles', 'user_profile', 'financial_transactions', 'farm_messages', 'market_prices']) {
    const { data } = await anon.from(table).select('*');
    expect(data ?? [], table).toHaveLength(0);
  }
  expect((await anon.rpc('create_farm', { p_name: 'x' })).error).not.toBeNull();
});

test("an outsider can't read, change or join another farm's data", async () => {
  expect((await bob.db.from('fields').select('*').eq('farm_id', farmA)).data).toHaveLength(0);
  expect((await bob.db.from('farm').select('*').eq('id', farmA)).data).toHaveLength(0);
  expect((await bob.db.from('fields').update({ name: 'pwned' }).eq('id', fieldA).select()).data).toHaveLength(0);
  expect((await bob.db.from('fields').insert({ farm_id: farmA, name: 'Injected' })).error).not.toBeNull();
  // Can't add themself to the farm directly, or read its invite code
  expect((await bob.db.from('farm_user_roles').insert({ farm_id: farmA, user_id: bob.id, role: 'owner' })).error).not.toBeNull();
  expect((await bob.db.rpc('get_join_code', { p_farm_id: farmA })).error).not.toBeNull();
  // The farm ID is not a valid join code
  expect((await bob.db.rpc('join_farm', { p_code: farmA })).error?.message).toBe('Invalid Join Code');
  // Can't see farm A's members' profiles
  const { data: profiles } = await bob.db.from('user_profile').select('id');
  expect(profiles!.map((p) => p.id)).toEqual([bob.id]);
});

test('a worker can work but not delete, see finance, or escalate', async () => {
  expect((await carol.db.from('fields').select('name').eq('farm_id', farmA)).data).toHaveLength(1);
  expect((await carol.db.from('fields').insert({ farm_id: farmA, name: 'Worker Field' })).error).toBeNull();
  expect((await carol.db.from('fields').delete().eq('id', fieldA).select()).data).toHaveLength(0);
  expect((await carol.db.from('financial_transactions').select('*')).data).toHaveLength(0);
  expect((await carol.db.from('farm_user_roles').update({ role: 'owner' }).eq('user_id', carol.id).select()).data).toHaveLength(0);
  expect((await carol.db.from('farm').update({ name: 'Mine now' }).eq('id', farmA).select()).data).toHaveLength(0);
  expect((await carol.db.from('farm_messages').insert({ farm_id: farmA, author_id: carol.id, body: 'boss', is_announcement: true })).error).not.toBeNull();
  expect((await carol.db.from('farm_messages').insert({ farm_id: farmA, author_id: alice.id, body: 'spoofed' })).error).not.toBeNull();
});

test('the last owner cannot leave or be demoted', async () => {
  const demote = await alice.db.from('farm_user_roles').update({ role: 'worker' }).eq('user_id', alice.id).eq('farm_id', farmA);
  expect(demote.error?.message).toMatch(/at least one owner/);
  const leave = await alice.db.from('farm_user_roles').delete().eq('user_id', alice.id).eq('farm_id', farmA);
  expect(leave.error?.message).toMatch(/at least one owner/);
});

test('sign-up creates a profile with the email', async () => {
  const { data } = await alice.db.from('user_profile').select('email').eq('id', alice.id).single();
  expect(data!.email).toBe(email('sec-alice'));
});
