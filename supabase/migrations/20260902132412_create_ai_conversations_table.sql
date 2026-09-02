CREATE TABLE public.ai_conversations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,

    profile_id uuid NOT NULL,
    org_id uuid,

    agent_id text NOT NULL,

    title text,

    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,

    CONSTRAINT ai_conversations_profile_id_fkey
        FOREIGN KEY (profile_id)
        REFERENCES public.profiles(id)
        ON DELETE CASCADE,

    CONSTRAINT ai_conversations_org_id_fkey
        FOREIGN KEY (org_id)
        REFERENCES public.organizations(id)
        ON DELETE CASCADE
);

CREATE INDEX ai_conversations_profile_id_idx
    ON public.ai_conversations(profile_id);

CREATE INDEX ai_conversations_org_id_idx
    ON public.ai_conversations(org_id);

CREATE INDEX ai_conversations_profile_org_idx
    ON public.ai_conversations(profile_id, org_id);