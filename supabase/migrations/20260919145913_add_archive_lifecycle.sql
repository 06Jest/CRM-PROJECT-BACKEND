-- uniThread CRM
-- Archive lifecycle migration
-- Adds archived_by to existing archived entities and archive fields to notes/sms/calls.

BEGIN;

-- =========================================================
-- LEADS
-- Existing: is_archived, archived_at
-- =========================================================

ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS archived_by uuid NULL;

ALTER TABLE public.leads
ADD CONSTRAINT leads_archived_by_fkey
FOREIGN KEY (archived_by)
REFERENCES public.organization_members(id);

ALTER TABLE public.leads
DROP CONSTRAINT IF EXISTS leads_archive_consistency_check;

ALTER TABLE public.leads
ADD CONSTRAINT leads_archive_consistency_check
CHECK (
  (
    is_archived = false
    AND archived_at IS NULL
    AND archived_by IS NULL
  )
  OR
  (
    is_archived = true
    AND archived_at IS NOT NULL
    AND archived_by IS NOT NULL
  )
);

-- =========================================================
-- CONTACTS
-- Existing: is_archived, archived_at
-- =========================================================

ALTER TABLE public.contacts
ADD COLUMN IF NOT EXISTS archived_by uuid NULL;

ALTER TABLE public.contacts
ADD CONSTRAINT contacts_archived_by_fkey
FOREIGN KEY (archived_by)
REFERENCES public.organization_members(id);

ALTER TABLE public.contacts
DROP CONSTRAINT IF EXISTS contacts_archive_consistency_check;

ALTER TABLE public.contacts
ADD CONSTRAINT contacts_archive_consistency_check
CHECK (
  (
    is_archived = false
    AND archived_at IS NULL
    AND archived_by IS NULL
  )
  OR
  (
    is_archived = true
    AND archived_at IS NOT NULL
    AND archived_by IS NOT NULL
  )
);

-- =========================================================
-- DEALS
-- Existing: is_archived, archived_at
-- =========================================================

ALTER TABLE public.deals
ADD COLUMN IF NOT EXISTS archived_by uuid NULL;

ALTER TABLE public.deals
ADD CONSTRAINT deals_archived_by_fkey
FOREIGN KEY (archived_by)
REFERENCES public.organization_members(id);

ALTER TABLE public.deals
DROP CONSTRAINT IF EXISTS deals_archive_consistency_check;

ALTER TABLE public.deals
ADD CONSTRAINT deals_archive_consistency_check
CHECK (
  (
    is_archived = false
    AND archived_at IS NULL
    AND archived_by IS NULL
  )
  OR
  (
    is_archived = true
    AND archived_at IS NOT NULL
    AND archived_by IS NOT NULL
  )
);

-- =========================================================
-- CUSTOMERS
-- Existing: is_archived, archived_at
-- =========================================================

ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS archived_by uuid NULL;

ALTER TABLE public.customers
ADD CONSTRAINT customers_archived_by_fkey
FOREIGN KEY (archived_by)
REFERENCES public.organization_members(id);

ALTER TABLE public.customers
DROP CONSTRAINT IF EXISTS customers_archive_consistency_check;

ALTER TABLE public.customers
ADD CONSTRAINT customers_archive_consistency_check
CHECK (
  (
    is_archived = false
    AND archived_at IS NULL
    AND archived_by IS NULL
  )
  OR
  (
    is_archived = true
    AND archived_at IS NOT NULL
    AND archived_by IS NOT NULL
  )
);

-- =========================================================
-- NOTES
-- Existing archive fields: none
-- =========================================================

ALTER TABLE public.notes
ADD COLUMN IF NOT EXISTS is_archived boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS archived_at timestamp with time zone NULL,
ADD COLUMN IF NOT EXISTS archived_by uuid NULL;

ALTER TABLE public.notes
ADD CONSTRAINT notes_archived_by_fkey
FOREIGN KEY (archived_by)
REFERENCES public.organization_members(id);

ALTER TABLE public.notes
ADD CONSTRAINT notes_archive_consistency_check
CHECK (
  (
    is_archived = false
    AND archived_at IS NULL
    AND archived_by IS NULL
  )
  OR
  (
    is_archived = true
    AND archived_at IS NOT NULL
    AND archived_by IS NOT NULL
  )
);

-- =========================================================
-- TASKS
-- Existing: is_archived, archived_at
-- =========================================================

ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS archived_by uuid NULL;

ALTER TABLE public.tasks
ADD CONSTRAINT tasks_archived_by_fkey
FOREIGN KEY (archived_by)
REFERENCES public.organization_members(id);

ALTER TABLE public.tasks
DROP CONSTRAINT IF EXISTS tasks_archive_consistency_check;

ALTER TABLE public.tasks
ADD CONSTRAINT tasks_archive_consistency_check
CHECK (
  (
    is_archived = false
    AND archived_at IS NULL
    AND archived_by IS NULL
  )
  OR
  (
    is_archived = true
    AND archived_at IS NOT NULL
    AND archived_by IS NOT NULL
  )
);

-- =========================================================
-- CALLS
-- Existing archive fields: none
-- =========================================================

ALTER TABLE public.calls
ADD COLUMN IF NOT EXISTS is_archived boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS archived_at timestamp with time zone NULL,
ADD COLUMN IF NOT EXISTS archived_by uuid NULL;

ALTER TABLE public.calls
ADD CONSTRAINT calls_archived_by_fkey
FOREIGN KEY (archived_by)
REFERENCES public.organization_members(id);

ALTER TABLE public.calls
ADD CONSTRAINT calls_archive_consistency_check
CHECK (
  (
    is_archived = false
    AND archived_at IS NULL
    AND archived_by IS NULL
  )
  OR
  (
    is_archived = true
    AND archived_at IS NOT NULL
    AND archived_by IS NOT NULL
  )
);

-- =========================================================
-- SMS
-- Existing archive fields: none
-- =========================================================

ALTER TABLE public.sms
ADD COLUMN IF NOT EXISTS is_archived boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS archived_at timestamp with time zone NULL,
ADD COLUMN IF NOT EXISTS archived_by uuid NULL;

ALTER TABLE public.sms
ADD CONSTRAINT sms_archived_by_fkey
FOREIGN KEY (archived_by)
REFERENCES public.organization_members(id);

ALTER TABLE public.sms
ADD CONSTRAINT sms_archive_consistency_check
CHECK (
  (
    is_archived = false
    AND archived_at IS NULL
    AND archived_by IS NULL
  )
  OR
  (
    is_archived = true
    AND archived_at IS NOT NULL
    AND archived_by IS NOT NULL
  )
);

COMMIT;