create or replace function public.merge_guest_ai_usage(
  p_visitor_id uuid,
  p_profile_id uuid
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_guest_usage public.ai_usage%rowtype;
  v_profile_usage public.ai_usage%rowtype;
  v_now timestamptz := now();
  v_combined_prompts integer;
  v_window_expires_at timestamptz;
begin
  if p_visitor_id is null or p_profile_id is null then
    raise exception 'visitor_id and profile_id are required';
  end if;

  /*
   * Lock the guest record first.
   */
  select *
  into v_guest_usage
  from public.ai_usage
  where visitor_id = p_visitor_id
  for update;

  /*
   * Nothing to merge.
   */
  if not found then
    return json_build_object(
      'merged', false,
      'reason', 'guest_usage_not_found'
    );
  end if;

  /*
   * Lock the authenticated profile record if it exists.
   */
  select *
  into v_profile_usage
  from public.ai_usage
  where profile_id = p_profile_id
  for update;

  /*
   * If the guest window has expired, its usage should not
   * carry over.
   */
  if v_guest_usage.window_expires_at <= v_now then
    delete from public.ai_usage
    where id = v_guest_usage.id;

    return json_build_object(
      'merged', false,
      'reason', 'guest_window_expired'
    );
  end if;

  /*
   * If the profile has no existing usage record,
   * transfer the guest usage to the profile.
   */
  if not found then
    update public.ai_usage
    set
      profile_id = p_profile_id,
      visitor_id = null,
      updated_at = v_now
    where id = v_guest_usage.id;

    return json_build_object(
      'merged', true,
      'prompts_used', v_guest_usage.prompts_used,
      'prompts_remaining',
        greatest(0, 10 - v_guest_usage.prompts_used),
      'window_expires_at', v_guest_usage.window_expires_at
    );
  end if;

  /*
   * Both guest and profile records exist.
   * Combine their usage counts.
   */
  v_combined_prompts :=
    v_guest_usage.prompts_used + v_profile_usage.prompts_used;

  /*
   * Use the earlier expiration time so the guest record
   * cannot extend the authenticated user's quota window.
   */
  v_window_expires_at := least(
    v_guest_usage.window_expires_at,
    v_profile_usage.window_expires_at
  );

  update public.ai_usage
  set
    prompts_used = least(10, v_combined_prompts),
    window_started_at = least(
      v_guest_usage.window_started_at,
      v_profile_usage.window_started_at
    ),
    window_expires_at = v_window_expires_at,
    updated_at = v_now
  where id = v_profile_usage.id;

  delete from public.ai_usage
  where id = v_guest_usage.id;

  return json_build_object(
    'merged', true,
    'prompts_used', least(10, v_combined_prompts),
    'prompts_remaining',
      greatest(0, 10 - v_combined_prompts),
    'window_expires_at', v_window_expires_at
  );
end;
$$;