-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.farm (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  country text,
  region text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT farm_pkey PRIMARY KEY (id)
);
CREATE TABLE public.farm_user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role text NOT NULL CHECK (role = ANY (ARRAY['owner'::text, 'manager'::text, 'worker'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT farm_user_roles_pkey PRIMARY KEY (id),
  CONSTRAINT farm_user_roles_farm_id_fkey FOREIGN KEY (farm_id) REFERENCES public.farm(id),
  CONSTRAINT farm_user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.user_profile (
  id uuid NOT NULL,
  full_name text,
  phone text,
  language text DEFAULT 'en'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT user_profile_pkey PRIMARY KEY (id)
);
CREATE TABLE public.audit_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  farm_id uuid,
  actor_user_id uuid,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT audit_events_pkey PRIMARY KEY (id),
  CONSTRAINT audit_events_actor_user_id_fkey FOREIGN KEY (actor_user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.fields (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL,
  name text NOT NULL,
  area_ha numeric,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT fields_pkey PRIMARY KEY (id),
  CONSTRAINT fields_farm_id_fkey FOREIGN KEY (farm_id) REFERENCES public.farm(id)
);
CREATE TABLE public.farm_documents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL,
  title text NOT NULL,
  document_type text,
  url text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT farm_documents_pkey PRIMARY KEY (id),
  CONSTRAINT farm_documents_farm_id_fkey FOREIGN KEY (farm_id) REFERENCES public.farm(id),
  CONSTRAINT farm_documents_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);
CREATE TABLE public.crop_types (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL,
  name text NOT NULL,
  variety_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT crop_types_pkey PRIMARY KEY (id),
  CONSTRAINT crop_types_farm_id_fkey FOREIGN KEY (farm_id) REFERENCES public.farm(id)
);
CREATE TABLE public.crop_cycles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL,
  crop_type_id uuid,
  name text,
  start_date date,
  end_date date,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT crop_cycles_pkey PRIMARY KEY (id),
  CONSTRAINT crop_cycles_farm_id_fkey FOREIGN KEY (farm_id) REFERENCES public.farm(id),
  CONSTRAINT crop_cycles_crop_type_id_fkey FOREIGN KEY (crop_type_id) REFERENCES public.crop_types(id)
);
CREATE TABLE public.crop_cycle_field_assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL,
  crop_cycle_id uuid NOT NULL,
  field_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT crop_cycle_field_assignments_pkey PRIMARY KEY (id),
  CONSTRAINT crop_cycle_field_assignments_farm_id_fkey FOREIGN KEY (farm_id) REFERENCES public.farm(id),
  CONSTRAINT crop_cycle_field_assignments_crop_cycle_id_fkey FOREIGN KEY (crop_cycle_id) REFERENCES public.crop_cycles(id),
  CONSTRAINT crop_cycle_field_assignments_field_id_fkey FOREIGN KEY (field_id) REFERENCES public.fields(id)
);
CREATE TABLE public.crop_operations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL,
  crop_cycle_id uuid NOT NULL,
  operation_type text NOT NULL,
  occurred_on date,
  notes text,
  performed_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT crop_operations_pkey PRIMARY KEY (id),
  CONSTRAINT crop_operations_farm_id_fkey FOREIGN KEY (farm_id) REFERENCES public.farm(id),
  CONSTRAINT crop_operations_crop_cycle_id_fkey FOREIGN KEY (crop_cycle_id) REFERENCES public.crop_cycles(id),
  CONSTRAINT crop_operations_performed_by_fkey FOREIGN KEY (performed_by) REFERENCES auth.users(id)
);
CREATE TABLE public.crop_measurements (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL,
  crop_cycle_id uuid NOT NULL,
  field_id uuid,
  measurement_type text NOT NULL,
  measured_at timestamp with time zone NOT NULL DEFAULT now(),
  value numeric,
  unit text,
  source text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT crop_measurements_pkey PRIMARY KEY (id),
  CONSTRAINT crop_measurements_farm_id_fkey FOREIGN KEY (farm_id) REFERENCES public.farm(id),
  CONSTRAINT crop_measurements_crop_cycle_id_fkey FOREIGN KEY (crop_cycle_id) REFERENCES public.crop_cycles(id),
  CONSTRAINT crop_measurements_field_id_fkey FOREIGN KEY (field_id) REFERENCES public.fields(id),
  CONSTRAINT crop_measurements_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);
CREATE TABLE public.livestock_types (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL,
  name text NOT NULL,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT livestock_types_pkey PRIMARY KEY (id),
  CONSTRAINT livestock_types_farm_id_fkey FOREIGN KEY (farm_id) REFERENCES public.farm(id)
);
CREATE TABLE public.livestock_units (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL,
  livestock_type_id uuid,
  name text NOT NULL,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT livestock_units_pkey PRIMARY KEY (id),
  CONSTRAINT livestock_units_farm_id_fkey FOREIGN KEY (farm_id) REFERENCES public.farm(id),
  CONSTRAINT livestock_units_livestock_type_id_fkey FOREIGN KEY (livestock_type_id) REFERENCES public.livestock_types(id)
);
CREATE TABLE public.livestock_animals (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL,
  livestock_unit_id uuid NOT NULL,
  external_tag text,
  animal_name text,
  species_notes text,
  birth_date date,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT livestock_animals_pkey PRIMARY KEY (id),
  CONSTRAINT livestock_animals_farm_id_fkey FOREIGN KEY (farm_id) REFERENCES public.farm(id),
  CONSTRAINT livestock_animals_livestock_unit_id_fkey FOREIGN KEY (livestock_unit_id) REFERENCES public.livestock_units(id)
);
CREATE TABLE public.livestock_health_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL,
  livestock_animal_id uuid NOT NULL,
  event_type text NOT NULL,
  occurred_on date NOT NULL,
  notes text,
  recorded_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT livestock_health_events_pkey PRIMARY KEY (id),
  CONSTRAINT livestock_health_events_farm_id_fkey FOREIGN KEY (farm_id) REFERENCES public.farm(id),
  CONSTRAINT livestock_health_events_livestock_animal_id_fkey FOREIGN KEY (livestock_animal_id) REFERENCES public.livestock_animals(id),
  CONSTRAINT livestock_health_events_recorded_by_fkey FOREIGN KEY (recorded_by) REFERENCES auth.users(id)
);
CREATE TABLE public.livestock_weights (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL,
  livestock_animal_id uuid NOT NULL,
  measured_at timestamp with time zone NOT NULL DEFAULT now(),
  weight_kg numeric,
  source text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT livestock_weights_pkey PRIMARY KEY (id),
  CONSTRAINT livestock_weights_farm_id_fkey FOREIGN KEY (farm_id) REFERENCES public.farm(id),
  CONSTRAINT livestock_weights_livestock_animal_id_fkey FOREIGN KEY (livestock_animal_id) REFERENCES public.livestock_animals(id),
  CONSTRAINT livestock_weights_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);
CREATE TABLE public.inventory_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL,
  name text NOT NULL,
  sku text,
  item_type text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT inventory_items_pkey PRIMARY KEY (id),
  CONSTRAINT inventory_items_farm_id_fkey FOREIGN KEY (farm_id) REFERENCES public.farm(id)
);
CREATE TABLE public.inventory_item_units (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL,
  item_id uuid NOT NULL,
  unit_name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT inventory_item_units_pkey PRIMARY KEY (id),
  CONSTRAINT inventory_item_units_farm_id_fkey FOREIGN KEY (farm_id) REFERENCES public.farm(id),
  CONSTRAINT inventory_item_units_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.inventory_items(id)
);
CREATE TABLE public.inventory_locations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL,
  name text NOT NULL,
  location_type text,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT inventory_locations_pkey PRIMARY KEY (id),
  CONSTRAINT inventory_locations_farm_id_fkey FOREIGN KEY (farm_id) REFERENCES public.farm(id)
);
CREATE TABLE public.inventory_batches (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL,
  item_id uuid NOT NULL,
  batch_code text NOT NULL,
  manufactured_at date,
  received_at date,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT inventory_batches_pkey PRIMARY KEY (id),
  CONSTRAINT inventory_batches_farm_id_fkey FOREIGN KEY (farm_id) REFERENCES public.farm(id),
  CONSTRAINT inventory_batches_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.inventory_items(id)
);
CREATE TABLE public.inventory_expirations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL,
  batch_id uuid NOT NULL,
  expires_on date,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT inventory_expirations_pkey PRIMARY KEY (id),
  CONSTRAINT inventory_expirations_farm_id_fkey FOREIGN KEY (farm_id) REFERENCES public.farm(id),
  CONSTRAINT inventory_expirations_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.inventory_batches(id)
);
CREATE TABLE public.inventory_adjustment_reason_codes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL,
  code text NOT NULL,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT inventory_adjustment_reason_codes_pkey PRIMARY KEY (id),
  CONSTRAINT inventory_adjustment_reason_codes_farm_id_fkey FOREIGN KEY (farm_id) REFERENCES public.farm(id)
);
CREATE TABLE public.inventory_movements (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL,
  item_id uuid NOT NULL,
  location_id uuid NOT NULL,
  batch_id uuid,
  movement_type text NOT NULL,
  occurred_on date NOT NULL DEFAULT CURRENT_DATE,
  quantity numeric NOT NULL,
  unit text,
  reason_code_id uuid,
  reference text,
  performed_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT inventory_movements_pkey PRIMARY KEY (id),
  CONSTRAINT inventory_movements_farm_id_fkey FOREIGN KEY (farm_id) REFERENCES public.farm(id),
  CONSTRAINT inventory_movements_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.inventory_items(id),
  CONSTRAINT inventory_movements_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.inventory_locations(id),
  CONSTRAINT inventory_movements_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.inventory_batches(id),
  CONSTRAINT inventory_movements_reason_code_id_fkey FOREIGN KEY (reason_code_id) REFERENCES public.inventory_adjustment_reason_codes(id),
  CONSTRAINT inventory_movements_performed_by_fkey FOREIGN KEY (performed_by) REFERENCES auth.users(id)
);
CREATE TABLE public.stock_levels (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL,
  item_id uuid NOT NULL,
  location_id uuid NOT NULL,
  quantity numeric NOT NULL DEFAULT 0,
  unit text,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT stock_levels_pkey PRIMARY KEY (id),
  CONSTRAINT stock_levels_farm_id_fkey FOREIGN KEY (farm_id) REFERENCES public.farm(id),
  CONSTRAINT stock_levels_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.inventory_items(id),
  CONSTRAINT stock_levels_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.inventory_locations(id)
);
CREATE TABLE public.financial_accounts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL,
  account_type text NOT NULL,
  name text NOT NULL,
  currency text DEFAULT 'XAF'::text,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT financial_accounts_pkey PRIMARY KEY (id),
  CONSTRAINT financial_accounts_farm_id_fkey FOREIGN KEY (farm_id) REFERENCES public.farm(id)
);
CREATE TABLE public.financial_transaction_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT financial_transaction_categories_pkey PRIMARY KEY (id),
  CONSTRAINT financial_transaction_categories_farm_id_fkey FOREIGN KEY (farm_id) REFERENCES public.farm(id)
);
CREATE TABLE public.financial_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL,
  account_id uuid NOT NULL,
  category_id uuid,
  transaction_type text NOT NULL,
  occurred_on date NOT NULL DEFAULT CURRENT_DATE,
  amount numeric NOT NULL,
  currency text DEFAULT 'XAF'::text,
  memo text,
  performed_by uuid,
  inventory_movement_id uuid,
  crop_operation_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT financial_transactions_pkey PRIMARY KEY (id),
  CONSTRAINT financial_transactions_farm_id_fkey FOREIGN KEY (farm_id) REFERENCES public.farm(id),
  CONSTRAINT financial_transactions_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.financial_accounts(id),
  CONSTRAINT financial_transactions_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.financial_transaction_categories(id),
  CONSTRAINT financial_transactions_performed_by_fkey FOREIGN KEY (performed_by) REFERENCES auth.users(id),
  CONSTRAINT financial_transactions_inventory_movement_id_fkey FOREIGN KEY (inventory_movement_id) REFERENCES public.inventory_movements(id),
  CONSTRAINT financial_transactions_crop_operation_id_fkey FOREIGN KEY (crop_operation_id) REFERENCES public.crop_operations(id)
);
CREATE TABLE public.activity_types (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT activity_types_pkey PRIMARY KEY (id),
  CONSTRAINT activity_types_farm_id_fkey FOREIGN KEY (farm_id) REFERENCES public.farm(id)
);
CREATE TABLE public.activities (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL,
  activity_type_id uuid,
  occurred_on timestamp with time zone NOT NULL DEFAULT now(),
  actor_user_id uuid,
  notes text,
  field_id uuid,
  crop_cycle_id uuid,
  livestock_animal_id uuid,
  inventory_movement_id uuid,
  financial_transaction_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT activities_pkey PRIMARY KEY (id),
  CONSTRAINT activities_farm_id_fkey FOREIGN KEY (farm_id) REFERENCES public.farm(id),
  CONSTRAINT activities_activity_type_id_fkey FOREIGN KEY (activity_type_id) REFERENCES public.activity_types(id),
  CONSTRAINT activities_actor_user_id_fkey FOREIGN KEY (actor_user_id) REFERENCES auth.users(id),
  CONSTRAINT activities_field_id_fkey FOREIGN KEY (field_id) REFERENCES public.fields(id),
  CONSTRAINT activities_crop_cycle_id_fkey FOREIGN KEY (crop_cycle_id) REFERENCES public.crop_cycles(id),
  CONSTRAINT activities_livestock_animal_id_fkey FOREIGN KEY (livestock_animal_id) REFERENCES public.livestock_animals(id),
  CONSTRAINT activities_inventory_movement_id_fkey FOREIGN KEY (inventory_movement_id) REFERENCES public.inventory_movements(id),
  CONSTRAINT activities_financial_transaction_id_fkey FOREIGN KEY (financial_transaction_id) REFERENCES public.financial_transactions(id)
);
CREATE TABLE public.task_statuses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL,
  name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT task_statuses_pkey PRIMARY KEY (id),
  CONSTRAINT task_statuses_farm_id_fkey FOREIGN KEY (farm_id) REFERENCES public.farm(id)
);
CREATE TABLE public.tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL,
  status_id uuid,
  title text NOT NULL,
  description text,
  priority integer NOT NULL DEFAULT 3,
  due_date date,
  field_id uuid,
  crop_cycle_id uuid,
  livestock_animal_id uuid,
  inventory_movement_id uuid,
  financial_transaction_id uuid,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT tasks_pkey PRIMARY KEY (id),
  CONSTRAINT tasks_farm_id_fkey FOREIGN KEY (farm_id) REFERENCES public.farm(id),
  CONSTRAINT tasks_status_id_fkey FOREIGN KEY (status_id) REFERENCES public.task_statuses(id),
  CONSTRAINT tasks_field_id_fkey FOREIGN KEY (field_id) REFERENCES public.fields(id),
  CONSTRAINT tasks_crop_cycle_id_fkey FOREIGN KEY (crop_cycle_id) REFERENCES public.crop_cycles(id),
  CONSTRAINT tasks_livestock_animal_id_fkey FOREIGN KEY (livestock_animal_id) REFERENCES public.livestock_animals(id),
  CONSTRAINT tasks_inventory_movement_id_fkey FOREIGN KEY (inventory_movement_id) REFERENCES public.inventory_movements(id),
  CONSTRAINT tasks_financial_transaction_id_fkey FOREIGN KEY (financial_transaction_id) REFERENCES public.financial_transactions(id),
  CONSTRAINT tasks_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);
CREATE TABLE public.task_assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL,
  task_id uuid NOT NULL,
  worker_user_id uuid NOT NULL,
  assigned_at timestamp with time zone NOT NULL DEFAULT now(),
  assigned_by uuid,
  deleted_at timestamp with time zone,
  CONSTRAINT task_assignments_pkey PRIMARY KEY (id),
  CONSTRAINT task_assignments_farm_id_fkey FOREIGN KEY (farm_id) REFERENCES public.farm(id),
  CONSTRAINT task_assignments_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id),
  CONSTRAINT task_assignments_worker_user_id_fkey FOREIGN KEY (worker_user_id) REFERENCES auth.users(id),
  CONSTRAINT task_assignments_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES auth.users(id)
);
CREATE TABLE public.task_attachments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL,
  task_id uuid NOT NULL,
  url text NOT NULL,
  attachment_type text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT task_attachments_pkey PRIMARY KEY (id),
  CONSTRAINT task_attachments_farm_id_fkey FOREIGN KEY (farm_id) REFERENCES public.farm(id),
  CONSTRAINT task_attachments_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id)
);
CREATE TABLE public.report_definitions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL,
  name text NOT NULL,
  report_type text NOT NULL,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT report_definitions_pkey PRIMARY KEY (id),
  CONSTRAINT report_definitions_farm_id_fkey FOREIGN KEY (farm_id) REFERENCES public.farm(id),
  CONSTRAINT report_definitions_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);
CREATE TABLE public.report_runs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL,
  report_definition_id uuid NOT NULL,
  ran_by uuid,
  parameters jsonb NOT NULL DEFAULT '{}'::jsonb,
  output jsonb,
  status text NOT NULL DEFAULT 'completed'::text,
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT report_runs_pkey PRIMARY KEY (id),
  CONSTRAINT report_runs_farm_id_fkey FOREIGN KEY (farm_id) REFERENCES public.farm(id),
  CONSTRAINT report_runs_report_definition_id_fkey FOREIGN KEY (report_definition_id) REFERENCES public.report_definitions(id),
  CONSTRAINT report_runs_ran_by_fkey FOREIGN KEY (ran_by) REFERENCES auth.users(id)
);
CREATE TABLE public.sensor_devices (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  device_type text,
  external_id text UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT sensor_devices_pkey PRIMARY KEY (id)
);
CREATE TABLE public.sensor_device_farm_bindings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL,
  sensor_device_id uuid NOT NULL,
  bound_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid,
  deleted_at timestamp with time zone,
  CONSTRAINT sensor_device_farm_bindings_pkey PRIMARY KEY (id),
  CONSTRAINT sensor_device_farm_bindings_farm_id_fkey FOREIGN KEY (farm_id) REFERENCES public.farm(id),
  CONSTRAINT sensor_device_farm_bindings_sensor_device_id_fkey FOREIGN KEY (sensor_device_id) REFERENCES public.sensor_devices(id),
  CONSTRAINT sensor_device_farm_bindings_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);
CREATE TABLE public.sensor_measurements_raw (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  device_id uuid NOT NULL,
  captured_at timestamp with time zone NOT NULL DEFAULT now(),
  measurement_type text NOT NULL,
  value numeric,
  unit text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT sensor_measurements_raw_pkey PRIMARY KEY (id),
  CONSTRAINT sensor_measurements_raw_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.sensor_devices(id)
);
CREATE TABLE public.sensor_measurements_normalized (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL,
  raw_id uuid NOT NULL,
  measurement_type text NOT NULL,
  measured_at timestamp with time zone NOT NULL,
  value numeric,
  unit text,
  field_id uuid,
  crop_cycle_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT sensor_measurements_normalized_pkey PRIMARY KEY (id),
  CONSTRAINT sensor_measurements_normalized_farm_id_fkey FOREIGN KEY (farm_id) REFERENCES public.farm(id),
  CONSTRAINT sensor_measurements_normalized_raw_id_fkey FOREIGN KEY (raw_id) REFERENCES public.sensor_measurements_raw(id),
  CONSTRAINT sensor_measurements_normalized_field_id_fkey FOREIGN KEY (field_id) REFERENCES public.fields(id),
  CONSTRAINT sensor_measurements_normalized_crop_cycle_id_fkey FOREIGN KEY (crop_cycle_id) REFERENCES public.crop_cycles(id)
);
CREATE TABLE public.ai_jobs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL,
  job_type text NOT NULL,
  input jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'queued'::text,
  requested_by uuid,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT ai_jobs_pkey PRIMARY KEY (id),
  CONSTRAINT ai_jobs_farm_id_fkey FOREIGN KEY (farm_id) REFERENCES public.farm(id),
  CONSTRAINT ai_jobs_requested_by_fkey FOREIGN KEY (requested_by) REFERENCES auth.users(id)
);
CREATE TABLE public.ai_outputs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL,
  ai_job_id uuid NOT NULL,
  output_type text NOT NULL,
  related_task_id uuid,
  related_activity_id uuid,
  related_normalized_sensor_id uuid,
  output jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT ai_outputs_pkey PRIMARY KEY (id),
  CONSTRAINT ai_outputs_farm_id_fkey FOREIGN KEY (farm_id) REFERENCES public.farm(id),
  CONSTRAINT ai_outputs_ai_job_id_fkey FOREIGN KEY (ai_job_id) REFERENCES public.ai_jobs(id),
  CONSTRAINT ai_outputs_related_task_id_fkey FOREIGN KEY (related_task_id) REFERENCES public.tasks(id),
  CONSTRAINT ai_outputs_related_activity_id_fkey FOREIGN KEY (related_activity_id) REFERENCES public.activities(id),
  CONSTRAINT ai_outputs_related_normalized_sensor_id_fkey FOREIGN KEY (related_normalized_sensor_id) REFERENCES public.sensor_measurements_normalized(id)
);