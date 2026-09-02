-- ============================================================
-- CRM RECORD MANAGEMENT
-- 1. Schema additions
-- ============================================================

-- ------------------------------------------------------------
-- Archive support
-- ------------------------------------------------------------

ALTER TABLE public.leads
    ADD COLUMN is_archived boolean NOT NULL DEFAULT false,
    ADD COLUMN archived_at timestamptz;

ALTER TABLE public.contacts
    ADD COLUMN is_archived boolean NOT NULL DEFAULT false,
    ADD COLUMN archived_at timestamptz;

ALTER TABLE public.deals
    ADD COLUMN is_archived boolean NOT NULL DEFAULT false,
    ADD COLUMN archived_at timestamptz;

ALTER TABLE public.customers
    ADD COLUMN is_archived boolean NOT NULL DEFAULT false,
    ADD COLUMN archived_at timestamptz;

ALTER TABLE public.tasks
    ADD COLUMN is_archived boolean NOT NULL DEFAULT false,
    ADD COLUMN archived_at timestamptz;


-- ------------------------------------------------------------
-- Avatar support
-- ------------------------------------------------------------

ALTER TABLE public.leads
    ADD COLUMN avatar_url text;

ALTER TABLE public.contacts
    ADD COLUMN avatar_url text;


-- ------------------------------------------------------------
-- Assignment support
-- ------------------------------------------------------------

ALTER TABLE public.leads
    ADD COLUMN assigned_to uuid;

ALTER TABLE public.contacts
    ADD COLUMN assigned_to uuid;

ALTER TABLE public.deals
    ADD COLUMN assigned_to uuid;

ALTER TABLE public.customers
    ADD COLUMN assigned_to uuid;


-- ------------------------------------------------------------
-- Human-readable display IDs
-- ------------------------------------------------------------

ALTER TABLE public.leads
    ADD COLUMN display_id text;

ALTER TABLE public.contacts
    ADD COLUMN display_id text;

ALTER TABLE public.deals
    ADD COLUMN display_id text;

ALTER TABLE public.customers
    ADD COLUMN display_id text;

ALTER TABLE public.tasks
    ADD COLUMN display_id text;

ALTER TABLE public.notes
    ADD COLUMN display_id text;

ALTER TABLE public.calls
    ADD COLUMN display_id text;


-- ============================================================
-- 2. Organization record counters
-- ============================================================

CREATE TABLE public.organization_record_counters (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL,
    record_type text NOT NULL,
    next_number bigint NOT NULL DEFAULT 1,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT organization_record_counters_org_type_key
        UNIQUE (org_id, record_type),

    CONSTRAINT organization_record_counters_org_id_fkey
        FOREIGN KEY (org_id)
        REFERENCES public.organizations(id)
        ON DELETE CASCADE,

    CONSTRAINT organization_record_counters_record_type_check
        CHECK (
            record_type IN (
                'lead',
                'contact',
                'deal',
                'customer',
                'task',
                'note',
                'call'
            )
        ),

    CONSTRAINT organization_record_counters_next_number_check
        CHECK (next_number >= 1)
);

CREATE INDEX organization_record_counters_org_id_idx
    ON public.organization_record_counters (org_id);


-- ============================================================
-- 3. Backfill existing display IDs
-- ============================================================

WITH numbered AS (
    SELECT
        id,
        org_id,
        ROW_NUMBER() OVER (
            PARTITION BY org_id
            ORDER BY created_at ASC NULLS LAST, id ASC
        ) AS number
    FROM public.leads
)
UPDATE public.leads AS l
SET display_id = 'L-' || LPAD(numbered.number::text, 6, '0')
FROM numbered
WHERE l.id = numbered.id;


WITH numbered AS (
    SELECT
        id,
        org_id,
        ROW_NUMBER() OVER (
            PARTITION BY org_id
            ORDER BY created_at ASC NULLS LAST, id ASC
        ) AS number
    FROM public.contacts
)
UPDATE public.contacts AS c
SET display_id = 'C-' || LPAD(numbered.number::text, 6, '0')
FROM numbered
WHERE c.id = numbered.id;


WITH numbered AS (
    SELECT
        id,
        org_id,
        ROW_NUMBER() OVER (
            PARTITION BY org_id
            ORDER BY created_at ASC NULLS LAST, id ASC
        ) AS number
    FROM public.deals
)
UPDATE public.deals AS d
SET display_id = 'D-' || LPAD(numbered.number::text, 6, '0')
FROM numbered
WHERE d.id = numbered.id;


WITH numbered AS (
    SELECT
        id,
        org_id,
        ROW_NUMBER() OVER (
            PARTITION BY org_id
            ORDER BY created_at ASC NULLS LAST, id ASC
        ) AS number
    FROM public.customers
)
UPDATE public.customers AS c
SET display_id = 'CU-' || LPAD(numbered.number::text, 6, '0')
FROM numbered
WHERE c.id = numbered.id;


WITH numbered AS (
    SELECT
        id,
        org_id,
        ROW_NUMBER() OVER (
            PARTITION BY org_id
            ORDER BY created_at ASC NULLS LAST, id ASC
        ) AS number
    FROM public.tasks
)
UPDATE public.tasks AS t
SET display_id = 'T-' || LPAD(numbered.number::text, 6, '0')
FROM numbered
WHERE t.id = numbered.id;


WITH numbered AS (
    SELECT
        id,
        org_id,
        ROW_NUMBER() OVER (
            PARTITION BY org_id
            ORDER BY created_at ASC NULLS LAST, id ASC
        ) AS number
    FROM public.notes
)
UPDATE public.notes AS n
SET display_id = 'N-' || LPAD(numbered.number::text, 6, '0')
FROM numbered
WHERE n.id = numbered.id;


WITH numbered AS (
    SELECT
        id,
        org_id,
        ROW_NUMBER() OVER (
            PARTITION BY org_id
            ORDER BY created_at ASC NULLS LAST, id ASC
        ) AS number
    FROM public.calls
)
UPDATE public.calls AS c
SET display_id = 'CA-' || LPAD(numbered.number::text, 6, '0')
FROM numbered
WHERE c.id = numbered.id;


-- ============================================================
-- 4. Initialize organization record counters
-- ============================================================

INSERT INTO public.organization_record_counters (
    org_id,
    record_type,
    next_number
)
SELECT
    org_id,
    'lead',
    COUNT(*) + 1
FROM public.leads
GROUP BY org_id;

INSERT INTO public.organization_record_counters (
    org_id,
    record_type,
    next_number
)
SELECT
    org_id,
    'contact',
    COUNT(*) + 1
FROM public.contacts
GROUP BY org_id;

INSERT INTO public.organization_record_counters (
    org_id,
    record_type,
    next_number
)
SELECT
    org_id,
    'deal',
    COUNT(*) + 1
FROM public.deals
GROUP BY org_id;

INSERT INTO public.organization_record_counters (
    org_id,
    record_type,
    next_number
)
SELECT
    org_id,
    'customer',
    COUNT(*) + 1
FROM public.customers
GROUP BY org_id;

INSERT INTO public.organization_record_counters (
    org_id,
    record_type,
    next_number
)
SELECT
    org_id,
    'task',
    COUNT(*) + 1
FROM public.tasks
GROUP BY org_id;

INSERT INTO public.organization_record_counters (
    org_id,
    record_type,
    next_number
)
SELECT
    org_id,
    'note',
    COUNT(*) + 1
FROM public.notes
GROUP BY org_id;

INSERT INTO public.organization_record_counters (
    org_id,
    record_type,
    next_number
)
SELECT
    org_id,
    'call',
    COUNT(*) + 1
FROM public.calls
GROUP BY org_id;


-- ============================================================
-- 5. Atomic record number generator
-- ============================================================

CREATE OR REPLACE FUNCTION public.next_record_number(
    p_org_id uuid,
    p_record_type text
)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_number bigint;
BEGIN
    INSERT INTO public.organization_record_counters (
        org_id,
        record_type,
        next_number
    )
    VALUES (
        p_org_id,
        p_record_type,
        2
    )
    ON CONFLICT (org_id, record_type)
    DO UPDATE
    SET
        next_number = public.organization_record_counters.next_number + 1,
        updated_at = now()
    RETURNING next_number
    INTO v_number;

    RETURN v_number - 1;
END;
$$;

-- ============================================================
-- 6. Automatic display ID generator
-- ============================================================

CREATE OR REPLACE FUNCTION public.set_record_display_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_record_type text;
    v_prefix text;
    v_number bigint;
BEGIN
    -- Do not overwrite an explicitly supplied display ID.
    IF NEW.display_id IS NOT NULL THEN
        RETURN NEW;
    END IF;

    CASE TG_TABLE_NAME
        WHEN 'leads' THEN
            v_record_type := 'lead';
            v_prefix := 'L';

        WHEN 'contacts' THEN
            v_record_type := 'contact';
            v_prefix := 'C';

        WHEN 'deals' THEN
            v_record_type := 'deal';
            v_prefix := 'D';

        WHEN 'customers' THEN
            v_record_type := 'customer';
            v_prefix := 'CU';

        WHEN 'tasks' THEN
            v_record_type := 'task';
            v_prefix := 'T';

        WHEN 'notes' THEN
            v_record_type := 'note';
            v_prefix := 'N';

        WHEN 'calls' THEN
            v_record_type := 'call';
            v_prefix := 'CA';

        ELSE
            RAISE EXCEPTION
                'Unsupported table for display ID generation: %',
                TG_TABLE_NAME;
    END CASE;

    v_number := public.next_record_number(
        NEW.org_id,
        v_record_type
    );

    NEW.display_id :=
        v_prefix || '-' || LPAD(v_number::text, 6, '0');

    RETURN NEW;
END;
$$;

-- ============================================================
-- 7. Display ID triggers
-- ============================================================

CREATE TRIGGER leads_set_display_id
    BEFORE INSERT ON public.leads
    FOR EACH ROW
    EXECUTE FUNCTION public.set_record_display_id();

CREATE TRIGGER contacts_set_display_id
    BEFORE INSERT ON public.contacts
    FOR EACH ROW
    EXECUTE FUNCTION public.set_record_display_id();

CREATE TRIGGER deals_set_display_id
    BEFORE INSERT ON public.deals
    FOR EACH ROW
    EXECUTE FUNCTION public.set_record_display_id();

CREATE TRIGGER customers_set_display_id
    BEFORE INSERT ON public.customers
    FOR EACH ROW
    EXECUTE FUNCTION public.set_record_display_id();

CREATE TRIGGER tasks_set_display_id
    BEFORE INSERT ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.set_record_display_id();

CREATE TRIGGER notes_set_display_id
    BEFORE INSERT ON public.notes
    FOR EACH ROW
    EXECUTE FUNCTION public.set_record_display_id();

CREATE TRIGGER calls_set_display_id
    BEFORE INSERT ON public.calls
    FOR EACH ROW
    EXECUTE FUNCTION public.set_record_display_id();


-- ============================================================
-- 8. Assignment foreign keys
-- ============================================================

ALTER TABLE public.leads
    ADD CONSTRAINT leads_assigned_to_fkey
    FOREIGN KEY (assigned_to)
    REFERENCES public.organization_members(id);

ALTER TABLE public.contacts
    ADD CONSTRAINT contacts_assigned_to_fkey
    FOREIGN KEY (assigned_to)
    REFERENCES public.organization_members(id);

ALTER TABLE public.deals
    ADD CONSTRAINT deals_assigned_to_fkey
    FOREIGN KEY (assigned_to)
    REFERENCES public.organization_members(id);

ALTER TABLE public.customers
    ADD CONSTRAINT customers_assigned_to_fkey
    FOREIGN KEY (assigned_to)
    REFERENCES public.organization_members(id);


-- ============================================================
-- 9. Assignment indexes
-- ============================================================

CREATE INDEX leads_assigned_to_idx
    ON public.leads (assigned_to);

CREATE INDEX contacts_assigned_to_idx
    ON public.contacts (assigned_to);

CREATE INDEX deals_assigned_to_idx
    ON public.deals (assigned_to);

CREATE INDEX customers_assigned_to_idx
    ON public.customers (assigned_to);



-- ============================================================
-- 10. Display ID constraints
-- ============================================================

ALTER TABLE public.leads
    ALTER COLUMN display_id SET NOT NULL;

ALTER TABLE public.contacts
    ALTER COLUMN display_id SET NOT NULL;

ALTER TABLE public.deals
    ALTER COLUMN display_id SET NOT NULL;

ALTER TABLE public.customers
    ALTER COLUMN display_id SET NOT NULL;

ALTER TABLE public.tasks
    ALTER COLUMN display_id SET NOT NULL;

ALTER TABLE public.notes
    ALTER COLUMN display_id SET NOT NULL;

ALTER TABLE public.calls
    ALTER COLUMN display_id SET NOT NULL;


-- ------------------------------------------------------------
-- Display IDs are unique within each organization
-- ------------------------------------------------------------

ALTER TABLE public.leads
    ADD CONSTRAINT leads_org_display_id_key
    UNIQUE (org_id, display_id);

ALTER TABLE public.contacts
    ADD CONSTRAINT contacts_org_display_id_key
    UNIQUE (org_id, display_id);

ALTER TABLE public.deals
    ADD CONSTRAINT deals_org_display_id_key
    UNIQUE (org_id, display_id);

ALTER TABLE public.customers
    ADD CONSTRAINT customers_org_display_id_key
    UNIQUE (org_id, display_id);

ALTER TABLE public.tasks
    ADD CONSTRAINT tasks_org_display_id_key
    UNIQUE (org_id, display_id);

ALTER TABLE public.notes
    ADD CONSTRAINT notes_org_display_id_key
    UNIQUE (org_id, display_id);

ALTER TABLE public.calls
    ADD CONSTRAINT calls_org_display_id_key
    UNIQUE (org_id, display_id);


-- ============================================================
-- 11. Protect organization record counters
-- ============================================================

ALTER TABLE public.organization_record_counters
    ENABLE ROW LEVEL SECURITY;

REVOKE ALL
ON public.organization_record_counters
FROM anon, authenticated;

REVOKE EXECUTE
ON FUNCTION public.next_record_number(uuid, text)
FROM PUBLIC, anon, authenticated;


-- ============================================================
-- 12. Enforce database-generated display IDs
-- ============================================================

CREATE OR REPLACE FUNCTION public.set_record_display_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_record_type text;
    v_prefix text;
    v_number bigint;
BEGIN
    CASE TG_TABLE_NAME
        WHEN 'leads' THEN
            v_record_type := 'lead';
            v_prefix := 'L';

        WHEN 'contacts' THEN
            v_record_type := 'contact';
            v_prefix := 'C';

        WHEN 'deals' THEN
            v_record_type := 'deal';
            v_prefix := 'D';

        WHEN 'customers' THEN
            v_record_type := 'customer';
            v_prefix := 'CU';

        WHEN 'tasks' THEN
            v_record_type := 'task';
            v_prefix := 'T';

        WHEN 'notes' THEN
            v_record_type := 'note';
            v_prefix := 'N';

        WHEN 'calls' THEN
            v_record_type := 'call';
            v_prefix := 'CA';

        ELSE
            RAISE EXCEPTION
                'Unsupported table for display ID generation: %',
                TG_TABLE_NAME;
    END CASE;

    v_number := public.next_record_number(
        NEW.org_id,
        v_record_type
    );

    NEW.display_id :=
        v_prefix || '-' || LPAD(v_number::text, 6, '0');

    RETURN NEW;
END;
$$;

-- ============================================================
-- 13. Validate record types in counter generator
-- ============================================================

CREATE OR REPLACE FUNCTION public.next_record_number(
    p_org_id uuid,
    p_record_type text
)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_number bigint;
BEGIN
    IF p_record_type NOT IN (
        'lead',
        'contact',
        'deal',
        'customer',
        'task',
        'note',
        'call'
    ) THEN
        RAISE EXCEPTION
            'Unsupported record type: %',
            p_record_type;
    END IF;

    INSERT INTO public.organization_record_counters (
        org_id,
        record_type,
        next_number
    )
    VALUES (
        p_org_id,
        p_record_type,
        2
    )
    ON CONFLICT (org_id, record_type)
    DO UPDATE
    SET
        next_number = public.organization_record_counters.next_number + 1,
        updated_at = now()
    RETURNING next_number
    INTO v_number;

    RETURN v_number - 1;
END;
$$;

-- ============================================================
-- 14. Archive integrity
-- ============================================================

ALTER TABLE public.leads
    ADD CONSTRAINT leads_archive_consistency_check
    CHECK (
        (is_archived = false AND archived_at IS NULL)
        OR
        (is_archived = true AND archived_at IS NOT NULL)
    );

ALTER TABLE public.contacts
    ADD CONSTRAINT contacts_archive_consistency_check
    CHECK (
        (is_archived = false AND archived_at IS NULL)
        OR
        (is_archived = true AND archived_at IS NOT NULL)
    );

ALTER TABLE public.deals
    ADD CONSTRAINT deals_archive_consistency_check
    CHECK (
        (is_archived = false AND archived_at IS NULL)
        OR
        (is_archived = true AND archived_at IS NOT NULL)
    );

ALTER TABLE public.customers
    ADD CONSTRAINT customers_archive_consistency_check
    CHECK (
        (is_archived = false AND archived_at IS NULL)
        OR
        (is_archived = true AND archived_at IS NOT NULL)
    );

ALTER TABLE public.tasks
    ADD CONSTRAINT tasks_archive_consistency_check
    CHECK (
        (is_archived = false AND archived_at IS NULL)
        OR
        (is_archived = true AND archived_at IS NOT NULL)
    );

-- ============================================================
-- 15. Final database cleanup
-- ============================================================

DROP INDEX public.organization_record_counters_org_id_idx;