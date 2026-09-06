ALTER TABLE public.notes
ADD COLUMN profile_id uuid;

ALTER TABLE public.tasks
ADD COLUMN profile_id uuid;

ALTER TABLE public.notes
ALTER COLUMN org_id DROP NOT NULL,
ALTER COLUMN author_id DROP NOT NULL;

ALTER TABLE public.tasks
ALTER COLUMN org_id DROP NOT NULL,
ALTER COLUMN author_id DROP NOT NULL;

ALTER TABLE public.notes
ADD CONSTRAINT notes_profile_id_fkey
FOREIGN KEY (profile_id)
REFERENCES public.profiles (id)
ON DELETE CASCADE;

ALTER TABLE public.tasks
ADD CONSTRAINT tasks_profile_id_fkey
FOREIGN KEY (profile_id)
REFERENCES public.profiles (id)
ON DELETE CASCADE;

CREATE UNIQUE INDEX notes_personal_display_id_unique
ON public.notes (profile_id, display_id)
WHERE org_id IS NULL;

CREATE UNIQUE INDEX tasks_personal_display_id_unique
ON public.tasks (profile_id, display_id)
WHERE org_id IS NULL;


UPDATE public.notes n
SET profile_id = om.profile_id
FROM public.organization_members om
WHERE n.author_id = om.id
  AND n.profile_id IS NULL;

UPDATE public.tasks t
SET profile_id = om.profile_id
FROM public.organization_members om
WHERE t.author_id = om.id
  AND t.profile_id IS NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.notes
    WHERE profile_id IS NULL
  ) THEN
    RAISE EXCEPTION 'Migration failed: some notes could not be assigned a profile_id.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.tasks
    WHERE profile_id IS NULL
  ) THEN
    RAISE EXCEPTION 'Migration failed: some tasks could not be assigned a profile_id.';
  END IF;
END;
$$;



CREATE TABLE public.personal_record_counters (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  record_type text NOT NULL,
  next_number bigint NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT personal_record_counters_pkey
    PRIMARY KEY (id),

  CONSTRAINT personal_record_counters_profile_type_key
    UNIQUE (profile_id, record_type),

  CONSTRAINT personal_record_counters_profile_id_fkey
    FOREIGN KEY (profile_id)
    REFERENCES public.profiles (id)
    ON DELETE CASCADE,

  CONSTRAINT personal_record_counters_next_number_check
    CHECK (next_number >= 1),

  CONSTRAINT personal_record_counters_record_type_check
    CHECK (record_type IN ('task', 'note'))
);

CREATE OR REPLACE FUNCTION public.next_personal_record_number(
  p_profile_id uuid,
  p_record_type text
)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_number bigint;
BEGIN
  IF p_record_type NOT IN ('task', 'note') THEN
    RAISE EXCEPTION
      'Unsupported personal record type: %',
      p_record_type;
  END IF;

  INSERT INTO public.personal_record_counters (
    profile_id,
    record_type,
    next_number
  )
  VALUES (
    p_profile_id,
    p_record_type,
    2
  )
  ON CONFLICT (profile_id, record_type)
  DO UPDATE
  SET
    next_number =
      public.personal_record_counters.next_number + 1,
    updated_at = now()
  RETURNING next_number
  INTO v_number;

  RETURN v_number - 1;
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_record_display_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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

    IF NEW.org_id IS NULL THEN
        v_number := public.next_personal_record_number(
            NEW.profile_id,
            v_record_type
        );
    ELSE
        v_number := public.next_record_number(
            NEW.org_id,
            v_record_type
        );
    END IF;

    NEW.display_id :=
        v_prefix || '-' || LPAD(v_number::text, 6, '0');

    RETURN NEW;
END;
$function$;

ALTER TABLE public.notes
ALTER COLUMN profile_id SET NOT NULL;

ALTER TABLE public.tasks
ALTER COLUMN profile_id SET NOT NULL;
