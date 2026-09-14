create or replace function public.consume_ai_quota(
  p_profile_id uuid default null,
  p_visitor_id uuid default null
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_usage public.ai_usage%rowtype;
  v_now timestamptz := now();
  v_limit integer;
  v_identity_column text;
begin
  if p_profile_id is not null then
    v_limit := 10;

    select *
    into v_usage
    from public.ai_usage
    where profile_id = p_profile_id
    for update;

  elsif p_visitor_id is not null then
    v_limit := 5;

    select *
    into v_usage
    from public.ai_usage
    where visitor_id = p_visitor_id
    for update;

  else
    raise exception 'Either profile_id or visitor_id is required';
  end if;

  if not found then
    if p_profile_id is not null then
      insert into public.ai_usage (
        profile_id,
        prompts_used,
        window_started_at,
        window_expires_at
      )
      values (
        p_profile_id,
        1,
        v_now,
        v_now + interval '12 hours'
      )
      returning *
      into v_usage;
    else
      insert into public.ai_usage (
        visitor_id,
        prompts_used,
        window_started_at,
        window_expires_at
      )
      values (
        p_visitor_id,
        1,
        v_now,
        v_now + interval '12 hours'
      )
      returning *
      into v_usage;
    end if;

    return json_build_object(
      'allowed', true,
      'prompts_used', v_usage.prompts_used,
      'prompts_remaining', v_limit - v_usage.prompts_used,
      'limit', v_limit,
      'window_expires_at', v_usage.window_expires_at
    );
  end if;

  if v_usage.window_expires_at <= v_now then
    update public.ai_usage
    set
      prompts_used = 1,
      window_started_at = v_now,
      window_expires_at = v_now + interval '12 hours',
      updated_at = v_now
    where id = v_usage.id
    returning *
    into v_usage;

    return json_build_object(
      'allowed', true,
      'prompts_used', v_usage.prompts_used,
      'prompts_remaining', v_limit - v_usage.prompts_used,
      'limit', v_limit,
      'window_expires_at', v_usage.window_expires_at
    );
  end if;

  if v_usage.prompts_used >= v_limit then
    return json_build_object(
      'allowed', false,
      'prompts_used', v_usage.prompts_used,
      'prompts_remaining', 0,
      'limit', v_limit,
      'window_expires_at', v_usage.window_expires_at
    );
  end if;

  update public.ai_usage
  set
    prompts_used = prompts_used + 1,
    updated_at = v_now
  where id = v_usage.id
  returning *
  into v_usage;

  return json_build_object(
    'allowed', true,
    'prompts_used', v_usage.prompts_used,
    'prompts_remaining', v_limit - v_usage.prompts_used,
    'limit', v_limit,
    'window_expires_at', v_usage.window_expires_at
  );
end;
$$;