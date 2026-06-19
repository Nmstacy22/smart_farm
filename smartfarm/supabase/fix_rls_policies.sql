-- ==========================================================
-- SMARTFARM SQL: DISABLE RLS FOR PRESENTATION
-- Run this script in the Supabase SQL Editor to temporarily turn off Row Level Security.
-- This is intended only for demo/presentation purposes.
-- ==========================================================

ALTER TABLE public.farm DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.fields DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.livestock_units DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.livestock_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transaction_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_statuses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select for authenticated users" ON public.farm;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.farm;
DROP POLICY IF EXISTS "Allow update for farm owners and managers" ON public.farm;
DROP POLICY IF EXISTS "Allow delete for farm owners" ON public.farm;

DROP POLICY IF EXISTS "Allow select for farm members and own roles" ON public.farm_user_roles;
DROP POLICY IF EXISTS "Allow insert for own roles or farm managers" ON public.farm_user_roles;
DROP POLICY IF EXISTS "Allow update for farm owners and managers" ON public.farm_user_roles;
DROP POLICY IF EXISTS "Allow delete for farm owners and managers" ON public.farm_user_roles;

DROP POLICY IF EXISTS "Allow select for farm members" ON public.fields;
DROP POLICY IF EXISTS "Allow insert for farm members" ON public.fields;
DROP POLICY IF EXISTS "Allow update for farm members" ON public.fields;
DROP POLICY IF EXISTS "Allow delete for farm members" ON public.fields;

DROP POLICY IF EXISTS "Allow select for farm members" ON public.livestock_units;
DROP POLICY IF EXISTS "Allow insert for farm members" ON public.livestock_units;
DROP POLICY IF EXISTS "Allow update for farm members" ON public.livestock_units;
DROP POLICY IF EXISTS "Allow delete for farm members" ON public.livestock_units;

DROP POLICY IF EXISTS "Allow select for farm members" ON public.livestock_types;
DROP POLICY IF EXISTS "Allow insert for farm members" ON public.livestock_types;
DROP POLICY IF EXISTS "Allow update for farm members" ON public.livestock_types;
DROP POLICY IF EXISTS "Allow delete for farm members" ON public.livestock_types;

DROP POLICY IF EXISTS "Allow select for farm members" ON public.inventory_items;
DROP POLICY IF EXISTS "Allow insert for farm members" ON public.inventory_items;
DROP POLICY IF EXISTS "Allow update for farm members" ON public.inventory_items;
DROP POLICY IF EXISTS "Allow delete for farm members" ON public.inventory_items;

DROP POLICY IF EXISTS "Allow select for farm members" ON public.financial_accounts;
DROP POLICY IF EXISTS "Allow insert for farm members" ON public.financial_accounts;
DROP POLICY IF EXISTS "Allow update for farm members" ON public.financial_accounts;
DROP POLICY IF EXISTS "Allow delete for farm members" ON public.financial_accounts;

DROP POLICY IF EXISTS "Allow select for farm members" ON public.financial_transactions;
DROP POLICY IF EXISTS "Allow insert for farm members" ON public.financial_transactions;
DROP POLICY IF EXISTS "Allow update for farm members" ON public.financial_transactions;
DROP POLICY IF EXISTS "Allow delete for farm members" ON public.financial_transactions;

DROP POLICY IF EXISTS "Allow select for farm members" ON public.financial_transaction_categories;
DROP POLICY IF EXISTS "Allow insert for farm members" ON public.financial_transaction_categories;
DROP POLICY IF EXISTS "Allow update for farm members" ON public.financial_transaction_categories;
DROP POLICY IF EXISTS "Allow delete for farm members" ON public.financial_transaction_categories;

DROP POLICY IF EXISTS "Allow select for farm members" ON public.tasks;
DROP POLICY IF EXISTS "Allow insert for farm members" ON public.tasks;
DROP POLICY IF EXISTS "Allow update for farm members" ON public.tasks;
DROP POLICY IF EXISTS "Allow delete for farm members" ON public.tasks;

DROP POLICY IF EXISTS "Allow select for farm members" ON public.task_statuses;
DROP POLICY IF EXISTS "Allow insert for farm members" ON public.task_statuses;
DROP POLICY IF EXISTS "Allow update for farm members" ON public.task_statuses;
DROP POLICY IF EXISTS "Allow delete for farm members" ON public.task_statuses;

DROP POLICY IF EXISTS "Allow select for farm members" ON public.activities;
DROP POLICY IF EXISTS "Allow insert for farm owners and managers" ON public.activities;
DROP POLICY IF EXISTS "Allow update for farm owners and managers" ON public.activities;
DROP POLICY IF EXISTS "Allow delete for farm owners" ON public.activities;

DROP FUNCTION IF EXISTS public.is_farm_member(uuid);
DROP FUNCTION IF EXISTS public.is_farm_owner_or_manager(uuid);
DROP FUNCTION IF EXISTS public.is_farm_owner(uuid);
