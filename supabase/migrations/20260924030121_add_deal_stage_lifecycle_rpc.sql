CREATE OR REPLACE FUNCTION public.update_deal_stage(
    p_deal_id UUID,
    p_org_id UUID,
    p_member_id UUID,
    p_stage TEXT
)
RETURNS public.deals
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    v_deal public.deals%ROWTYPE;
    v_previous_stage TEXT;
    v_now TIMESTAMPTZ := now();
BEGIN
    -- Validate the member belongs to the organization
    -- and is the authenticated user making the request.
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

    -- Validate the requested stage.
    IF p_stage NOT IN (
        'Prospecting',
        'Proposal',
        'Negotiation',
        'Closed Won',
        'Closed Lost'
    ) THEN
        RAISE EXCEPTION 'Invalid deal stage';
    END IF;

    -- Lock and fetch the deal.
    SELECT *
    INTO v_deal
    FROM public.deals
    WHERE id = p_deal_id
      AND org_id = p_org_id
      AND deleted_at IS NULL
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Deal not found';
    END IF;

    v_previous_stage := v_deal.stage;

    -- Nothing to do if the stage hasn't changed.
    IF v_previous_stage = p_stage THEN
        RAISE EXCEPTION 'Deal is already in this stage';
    END IF;

    -- Update lifecycle state.
    UPDATE public.deals
    SET
        stage = p_stage,
        updated_by = p_member_id,

        won_at = CASE
            WHEN p_stage = 'Closed Won' THEN v_now
            WHEN v_previous_stage = 'Closed Won' THEN NULL
            ELSE won_at
        END,

        lost_at = CASE
            WHEN p_stage = 'Closed Lost' THEN v_now
            WHEN v_previous_stage = 'Closed Lost' THEN NULL
            ELSE lost_at
        END,

        closed_by = CASE
            WHEN p_stage IN ('Closed Won', 'Closed Lost') THEN p_member_id
            WHEN v_previous_stage IN ('Closed Won', 'Closed Lost') THEN NULL
            ELSE closed_by
        END

    WHERE id = p_deal_id
      AND org_id = p_org_id
    RETURNING *
    INTO v_deal;

    -- Record the transition.
    INSERT INTO public.deal_stage_history (
        deal_id,
        org_id,
        from_stage,
        to_stage,
        changed_at,
        changed_by
    )
    VALUES (
        p_deal_id,
        p_org_id,
        v_previous_stage,
        p_stage,
        v_now,
        p_member_id
    );

    RETURN v_deal;
END;
$$;