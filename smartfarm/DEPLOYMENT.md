# Deploying SmartFarm

SmartFarm runs on **Vercel** (the Next.js app) and **Supabase** (database and login).
The database scripts and the app code depend on each other, so do steps 1 and 2 together.

## 1. Supabase

### 1.1 Run the SQL scripts

In the Supabase dashboard, open **SQL Editor** and run these files from `supabase/`, in this order. Paste each whole file and click **Run**.

1. `schema_additions.sql` adds invite codes, user emails, market prices and team messages.
2. `enable_rls_policies.sql` turns on row level security (RLS) and adds the access rules and helper functions.

Both scripts are safe to run again. Re-run `enable_rls_policies.sql` whenever you add a table; see the comments inside it.

> `fix_rls_policies.sql` turns security **off**. Never run it on the live project.

### 1.2 Auth settings

Under **Authentication → URL Configuration**:

- **Site URL**: your production URL, e.g. `https://smartfarm.vercel.app`
- **Redirect URLs**: add `https://smartfarm.vercel.app/**` and `http://localhost:3000/**`

Without these, the sign-up confirmation email links point to the wrong site.

### 1.3 Keys

Under **Project Settings → API**, copy the **Project URL** and the **publishable (anon) key**. You need them in step 2.
Don't put the `service_role` key in Vercel. The app doesn't use it, and it bypasses every security rule.

## 2. Vercel

1. **Add New → Project**, then import the `smart_farm` GitHub repository.
2. **Root Directory**: `smartfarm`. The app isn't at the repository root.
3. Framework preset: **Next.js**. Keep the default build and install commands; `npm ci` uses `package-lock.json`.
4. **Environment Variables**, all environments:

   | Name | Required | Value |
   |---|---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | yes | Project URL from 1.3 |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | yes | Publishable/anon key from 1.3 |
   | `OPENWEATHER_API_KEY` | for real weather | Free key from openweathermap.org (without it, Weather shows sample data) |
   | `NEXT_PUBLIC_WEATHER_LOCATION` | no | Fallback town, default `Buea` |
   | `TWILIO_ACCOUNT_SID` | for SMS | From the Twilio console |
   | `TWILIO_AUTH_TOKEN` | for SMS | From the Twilio console |
   | `TWILIO_FROM_NUMBER` | for SMS | SMS-capable number (`+1…`) or approved sender ID |

5. Click **Deploy**. Changing environment variables later needs a redeploy to take effect.

## 3. Check the live site

Use two accounts: an owner and a worker.

- [ ] Sign up as a new user, confirm the email, and create a farm.
- [ ] Add a field, a livestock group, an inventory item, a task and a finance transaction.
- [ ] **Team** page: copy the invite code. In a private window, sign up as the second user and join with it.
- [ ] As the worker: Finance and Reports are hidden, delete buttons don't remove anything, and the Team page shows no invite code.
- [ ] As the owner: the worker appears on **Team**. Promote them to manager, then back to worker.
- [ ] **Messages**: the worker posts a message and the owner sees it within about 20 seconds. The owner posts an announcement.
- [ ] **Market Prices**: record two prices for the same crop on different dates and check that the trend chart appears.
- [ ] **Weather** shows real data. If you see a "sample data" banner, `OPENWEATHER_API_KEY` is missing.
- [ ] If SMS is configured: add your phone on **Team** in `+237…` format, then send yourself an SMS from **Messages**.

## 4. If something breaks

- **Creating or joining a farm fails**: the SQL scripts haven't been run, or ran in the wrong order. Run both again (step 1.1).
- **Lists come back empty after login**: check Vercel's environment variables point at the same Supabase project you ran the SQL on.
- **Emergency only**: `fix_rls_policies.sql` turns security off so the app works while you investigate. Run `enable_rls_policies.sql` again as soon as possible.
- To roll back the app, open Vercel → **Deployments**, pick the previous deployment and choose **Promote to Production**.
