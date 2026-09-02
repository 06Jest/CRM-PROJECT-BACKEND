CREATE TABLE public.ai_messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,

    conversation_id uuid NOT NULL,

    role text NOT NULL,

    content text NOT NULL,

    created_at timestamptz DEFAULT now() NOT NULL,

    CONSTRAINT ai_messages_conversation_id_fkey
        FOREIGN KEY (conversation_id)
        REFERENCES public.ai_conversations(id)
        ON DELETE CASCADE,

    CONSTRAINT ai_messages_role_check
        CHECK (
            role IN ('user', 'assistant', 'tool')
        ),

    CONSTRAINT ai_messages_content_check
        CHECK (
            btrim(content) <> ''
        )
);

CREATE INDEX ai_messages_conversation_id_idx
    ON public.ai_messages(conversation_id);

CREATE INDEX ai_messages_conversation_created_idx
    ON public.ai_messages(conversation_id, created_at);