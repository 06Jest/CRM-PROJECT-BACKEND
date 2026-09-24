-- ============================================================
-- Lifecycle Tracking
-- ============================================================


-- ============================================================
-- Lifecycle timestamps
-- ============================================================

ALTER TABLE public.leads
ADD COLUMN converted_at TIMESTAMPTZ NULL,
ADD COLUMN lost_at TIMESTAMPTZ NULL;

ALTER TABLE public.deals
ADD COLUMN won_at TIMESTAMPTZ NULL,
ADD COLUMN lost_at TIMESTAMPTZ NULL;

ALTER TABLE public.customers
ADD COLUMN churned_at TIMESTAMPTZ NULL;

ALTER TABLE public.sms
ADD COLUMN sent_at TIMESTAMPTZ NULL,
ADD COLUMN delivered_at TIMESTAMPTZ NULL,
ADD COLUMN failed_at TIMESTAMPTZ NULL;


-- ============================================================
-- Deal Stage History
-- ============================================================

CREATE TABLE public.deal_stage_history (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    deal_id UUID NOT NULL,
    org_id UUID NOT NULL,
    from_stage TEXT NULL,
    to_stage TEXT NOT NULL,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    changed_by UUID NULL,

    CONSTRAINT deal_stage_history_pkey
        PRIMARY KEY (id),

    CONSTRAINT deal_stage_history_deal_id_fkey
        FOREIGN KEY (deal_id)
        REFERENCES public.deals (id)
        ON DELETE CASCADE,

    CONSTRAINT deal_stage_history_org_id_fkey
        FOREIGN KEY (org_id)
        REFERENCES public.organizations (id)
        ON DELETE CASCADE,

    CONSTRAINT deal_stage_history_changed_by_fkey
        FOREIGN KEY (changed_by)
        REFERENCES public.organization_members (id)
        ON DELETE SET NULL
);

CREATE INDEX idx_deal_stage_history_deal_id
    ON public.deal_stage_history (deal_id);

CREATE INDEX idx_deal_stage_history_org_id
    ON public.deal_stage_history (org_id);

CREATE INDEX idx_deal_stage_history_changed_at
    ON public.deal_stage_history (changed_at DESC);

CREATE INDEX idx_deal_stage_history_deal_changed_at
    ON public.deal_stage_history (deal_id, changed_at DESC);

CREATE INDEX idx_deal_stage_history_org_changed_at
    ON public.deal_stage_history (org_id, changed_at DESC);

CREATE INDEX idx_deal_stage_history_changed_by
    ON public.deal_stage_history (changed_by);


-- ============================================================
-- Lead Status History
-- ============================================================

CREATE TABLE public.lead_status_history (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL,
    org_id UUID NOT NULL,
    from_status TEXT NULL,
    to_status TEXT NOT NULL,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    changed_by UUID NULL,

    CONSTRAINT lead_status_history_pkey
        PRIMARY KEY (id),

    CONSTRAINT lead_status_history_lead_id_fkey
        FOREIGN KEY (lead_id)
        REFERENCES public.leads (id)
        ON DELETE CASCADE,

    CONSTRAINT lead_status_history_org_id_fkey
        FOREIGN KEY (org_id)
        REFERENCES public.organizations (id)
        ON DELETE CASCADE,

    CONSTRAINT lead_status_history_changed_by_fkey
        FOREIGN KEY (changed_by)
        REFERENCES public.organization_members (id)
        ON DELETE SET NULL
);

CREATE INDEX idx_lead_status_history_lead_id
    ON public.lead_status_history (lead_id);

CREATE INDEX idx_lead_status_history_org_id
    ON public.lead_status_history (org_id);

CREATE INDEX idx_lead_status_history_changed_at
    ON public.lead_status_history (changed_at DESC);

CREATE INDEX idx_lead_status_history_lead_changed_at
    ON public.lead_status_history (lead_id, changed_at DESC);

CREATE INDEX idx_lead_status_history_org_changed_at
    ON public.lead_status_history (org_id, changed_at DESC);

CREATE INDEX idx_lead_status_history_changed_by
    ON public.lead_status_history (changed_by);


-- ============================================================
-- Customer Status History
-- ============================================================

CREATE TABLE public.customer_status_history (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL,
    org_id UUID NOT NULL,
    from_status TEXT NULL,
    to_status TEXT NOT NULL,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    changed_by UUID NULL,

    CONSTRAINT customer_status_history_pkey
        PRIMARY KEY (id),

    CONSTRAINT customer_status_history_customer_id_fkey
        FOREIGN KEY (customer_id)
        REFERENCES public.customers (id)
        ON DELETE CASCADE,

    CONSTRAINT customer_status_history_org_id_fkey
        FOREIGN KEY (org_id)
        REFERENCES public.organizations (id)
        ON DELETE CASCADE,

    CONSTRAINT customer_status_history_changed_by_fkey
        FOREIGN KEY (changed_by)
        REFERENCES public.organization_members (id)
        ON DELETE SET NULL
);

CREATE INDEX idx_customer_status_history_customer_id
    ON public.customer_status_history (customer_id);

CREATE INDEX idx_customer_status_history_org_id
    ON public.customer_status_history (org_id);

CREATE INDEX idx_customer_status_history_changed_at
    ON public.customer_status_history (changed_at DESC);

CREATE INDEX idx_customer_status_history_customer_changed_at
    ON public.customer_status_history (customer_id, changed_at DESC);

CREATE INDEX idx_customer_status_history_org_changed_at
    ON public.customer_status_history (org_id, changed_at DESC);

CREATE INDEX idx_customer_status_history_changed_by
    ON public.customer_status_history (changed_by);


-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE public.deal_stage_history
ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.lead_status_history
ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.customer_status_history
ENABLE ROW LEVEL SECURITY;


CREATE POLICY "Users can view deal stage history"
ON public.deal_stage_history
FOR SELECT
TO authenticated
USING (
    org_id = (auth.jwt() ->> 'org_id')::uuid
    -- existing CRM membership check goes here
);


CREATE POLICY "Users can view lead status history"
ON public.lead_status_history
FOR SELECT
TO authenticated
USING (
    org_id = (auth.jwt() ->> 'org_id')::uuid
    -- existing CRM membership check goes here
);


CREATE POLICY "Users can view customer status history"
ON public.customer_status_history
FOR SELECT
TO authenticated
USING (
    org_id = (auth.jwt() ->> 'org_id')::uuid
    -- existing CRM membership check goes here
);