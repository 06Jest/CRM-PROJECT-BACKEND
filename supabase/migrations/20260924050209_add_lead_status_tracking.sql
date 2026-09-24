CREATE OR REPLACE FUNCTION public.update_lead_status(
    p_lead_id UUID,
    p_org_id UUID,
    p_member_id UUID,
    p_status TEXT
)
RETURNS public.leads
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    v_lead public.leads%ROWTYPE;
    v_previous_status TEXT;
    v_now TIMESTAMPTZ := now();
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM public.organization_members om
        WHERE om.id = p_member_id
          AND om.org_id = p_org_id
          AND om.status = 'active'
          AND om.deleted_at IS NULL
          AND om.profile_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Invalid organization member';
    END IF;

    IF p_status NOT IN (
        'New',
        'Contacted',
        'Qualified',
        'Closed'
    ) THEN
        RAISE EXCEPTION 'Invalid lead status';
    END IF;

    SELECT *
    INTO v_lead
    FROM public.leads
    WHERE id = p_lead_id
      AND org_id = p_org_id
      AND deleted_at IS NULL
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Lead not found';
    END IF;

    v_previous_status := v_lead.status;

    IF v_previous_status = p_status THEN
        RAISE EXCEPTION 'Lead is already in this status';
    END IF;

    UPDATE public.leads
    SET
        status = p_status,
        updated_by = p_member_id
    WHERE id = p_lead_id
      AND org_id = p_org_id
    RETURNING *
    INTO v_lead;

    INSERT INTO public.lead_status_history (
        lead_id,
        org_id,
        from_status,
        to_status,
        changed_at,
        changed_by
    )
    VALUES (
        p_lead_id,
        p_org_id,
        v_previous_status,
        p_status,
        v_now,
        p_member_id
    );

    RETURN v_lead;
END;
$$;