CREATE OR REPLACE FUNCTION public.update_customer_status(
    p_customer_id UUID,
    p_org_id UUID,
    p_member_id UUID,
    p_status TEXT
)
RETURNS public.customers
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    v_customer public.customers%ROWTYPE;
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
        'Active',
        'Inactive',
        'At Risk',
        'Churned'
    ) THEN
        RAISE EXCEPTION 'Invalid customer status';
    END IF;

    SELECT *
    INTO v_customer
    FROM public.customers
    WHERE id = p_customer_id
      AND org_id = p_org_id
      AND deleted_at IS NULL
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Customer not found';
    END IF;

    v_previous_status := v_customer.status;

    IF v_previous_status = p_status THEN
        RAISE EXCEPTION 'Customer is already in this status';
    END IF;

    UPDATE public.customers
    SET
        status = p_status,
        updated_by = p_member_id,
        churned_at = CASE
            WHEN p_status = 'Churned' THEN v_now
            WHEN v_previous_status = 'Churned' THEN NULL
            ELSE churned_at
        END
    WHERE id = p_customer_id
      AND org_id = p_org_id
    RETURNING *
    INTO v_customer;

    INSERT INTO public.customer_status_history (
        customer_id,
        org_id,
        from_status,
        to_status,
        changed_at,
        changed_by
    )
    VALUES (
        p_customer_id,
        p_org_id,
        v_previous_status,
        p_status,
        v_now,
        p_member_id
    );

    RETURN v_customer;
END;
$$;