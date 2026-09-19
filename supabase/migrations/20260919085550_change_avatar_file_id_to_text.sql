ALTER TABLE public.leads
ALTER COLUMN avatar_file_id TYPE TEXT
USING avatar_file_id::TEXT;

ALTER TABLE public.contacts
ALTER COLUMN avatar_file_id TYPE TEXT
USING avatar_file_id::TEXT;

ALTER TABLE public.organizations
ALTER COLUMN avatar_file_id TYPE TEXT
USING avatar_file_id::TEXT;