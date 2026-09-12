


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE TYPE "public"."email_provider" AS ENUM (
    'resend'
);


ALTER TYPE "public"."email_provider" OWNER TO "postgres";


CREATE TYPE "public"."email_status" AS ENUM (
    'draft',
    'queued',
    'sent',
    'failed'
);


ALTER TYPE "public"."email_status" OWNER TO "postgres";


CREATE TYPE "public"."status" AS ENUM (
    'draft',
    'queued',
    'sent',
    'failed'
);


ALTER TYPE "public"."status" OWNER TO "postgres";


CREATE TYPE "public"."task_type" AS ENUM (
    'call',
    'email',
    'sms',
    'meeting',
    'other'
);


ALTER TYPE "public"."task_type" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."auto_update_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."auto_update_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cleanup_old_activities"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
    org record;
    retention_months integer;
    cutoff_date timestamptz;
begin

    for org in
        select
            o.id,
            s.plan
        from organizations o
        join subscriptions s
        on s.organization_id = o.id
    loop

        case org.plan

            when 'Free' then
                retention_months := 3;

            when 'Starter' then
                retention_months := 12;

            when 'Team' then
                retention_months := 36;

            when 'Business' then
                retention_months := 60;

            when 'Enterprise' then
                retention_months := null;

        end case;


        if retention_months is not null then

            cutoff_date :=
                date_trunc(
                    'month',
                    now() - (retention_months || ' months')::interval
                );


            delete from activities
            where org_id = org.id
            and created_at < cutoff_date;


        end if;

    end loop;

end;
$$;


ALTER FUNCTION "public"."cleanup_old_activities"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."conversation_belongs_to_current_org"("target_conversation_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.conversations c
    WHERE c.id = target_conversation_id
      AND c.org_id = (auth.jwt() ->> 'org_id')::uuid
  );
$$;


ALTER FUNCTION "public"."conversation_belongs_to_current_org"("target_conversation_id" "uuid") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."super_admin_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "super_admin_id" "uuid" NOT NULL,
    "session_token" "text" NOT NULL,
    "ip_address" "text",
    "user_agent" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "last_activity" timestamp with time zone DEFAULT "now"(),
    "expires_at" timestamp with time zone DEFAULT ("now"() + '30 days'::interval)
);


ALTER TABLE "public"."super_admin_sessions" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_super_admin_session"("p_admin_id" "uuid", "p_token" "text", "p_ip" "text", "p_ua" "text") RETURNS SETOF "public"."super_admin_sessions"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  return query
  insert into public.super_admin_sessions (
    super_admin_id,
    session_token,
    ip_address,
    user_agent
  )
  values (
    p_admin_id,
    p_token,
    p_ip,
    p_ua
  )
  returning *;
end;
$$;


ALTER FUNCTION "public"."create_super_admin_session"("p_admin_id" "uuid", "p_token" "text", "p_ip" "text", "p_ua" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_super_admin_session"("p_token" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  delete from public.super_admin_sessions
  where session_token = p_token;
end;
$$;


ALTER FUNCTION "public"."delete_super_admin_session"("p_token" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_member_code"("p_org_id" "uuid", "p_role" "text") RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    next_number INTEGER;
    prefix TEXT;
BEGIN

    INSERT INTO public.organization_member_counters(org_id)
    VALUES (p_org_id)
    ON CONFLICT (org_id)
    DO NOTHING;


    IF p_role = 'owner' THEN

        UPDATE public.organization_member_counters
        SET owner_count = owner_count + 1
        WHERE org_id = p_org_id
        RETURNING owner_count INTO next_number;

        prefix := 'O';


    ELSIF p_role = 'manager' THEN

        UPDATE public.organization_member_counters
        SET manager_count = manager_count + 1
        WHERE org_id = p_org_id
        RETURNING manager_count INTO next_number;

        prefix := 'M';


    ELSIF p_role = 'agent' THEN

        UPDATE public.organization_member_counters
        SET agent_count = agent_count + 1
        WHERE org_id = p_org_id
        RETURNING agent_count INTO next_number;

        prefix := 'A';


    ELSE
        RAISE EXCEPTION 'Invalid role';
    END IF;


    RETURN prefix || '-' ||
        LPAD(next_number::TEXT, 5, '0');

END;
$$;


ALTER FUNCTION "public"."generate_member_code"("p_org_id" "uuid", "p_role" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_org_display_id"() RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INT;
BEGIN
  FOR i IN 1..6 LOOP
    result := result ||
      substr(
        chars,
        floor(random() * length(chars) + 1)::int,
        1
      );
  END LOOP;

  RETURN 'ORG-' || result;
END;
$$;


ALTER FUNCTION "public"."generate_org_display_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_profile_display_id"() RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN 'USR-' ||
    LPAD(
      nextval('profile_display_id_seq')::TEXT,
      5,
      '0'
    );
END;
$$;


ALTER FUNCTION "public"."generate_profile_display_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    ),
    coalesce(new.raw_user_meta_data->>'role', 'admin')
  )
  on conflict (id) do update
    set
      email = excluded.email,
      name  = coalesce(excluded.name, profiles.name);
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."has_org_role"("target_org_id" "uuid", "allowed_roles" "text"[]) RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$SELECT EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE org_id = target_org_id
      AND profile_id = auth.uid()
      AND role = ANY(allowed_roles)
  );$$;


ALTER FUNCTION "public"."has_org_role"("target_org_id" "uuid", "allowed_roles" "text"[]) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_active_current_org_member"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members om
    WHERE om.id = (auth.jwt() ->> 'member_id')::uuid
      AND om.org_id = (auth.jwt() ->> 'org_id')::uuid
      AND om.status = 'active'
  );
$$;


ALTER FUNCTION "public"."is_active_current_org_member"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_conversation_member"("p_conversation_id" "uuid", "p_profile_id" "uuid") RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.conversation_members
        WHERE conversation_id = p_conversation_id
          AND member_id = p_profile_id
    );
$$;


ALTER FUNCTION "public"."is_conversation_member"("p_conversation_id" "uuid", "p_profile_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_current_org_member"("target_member_id" "uuid") RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$SELECT EXISTS (
    SELECT 1
    FROM public.organization_members om
    WHERE om.id = target_member_id
      AND om.profile_id = auth.uid()
      AND om.org_id = (auth.jwt() ->> 'org_id')::uuid
  );$$;


ALTER FUNCTION "public"."is_current_org_member"("target_member_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_org_member"("target_org_id" "uuid") RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$SELECT EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE org_id = target_org_id
      AND profile_id = auth.uid()
  );$$;


ALTER FUNCTION "public"."is_org_member"("target_org_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_super_admin_event"("p_event_type" "text", "p_super_admin_id" "uuid", "p_ip_address" "text", "p_details" "jsonb") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  insert into super_admin_audit_log (
    event_type,
    super_admin_id,
    ip_address,
    details
  )
  values (
    p_event_type,
    p_super_admin_id,
    p_ip_address,
    p_details
  );
end;
$$;


ALTER FUNCTION "public"."log_super_admin_event"("p_event_type" "text", "p_super_admin_id" "uuid", "p_ip_address" "text", "p_details" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."member_belongs_to_current_org"("target_member_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$SELECT EXISTS (
    SELECT 1
    FROM public.organization_members om
    WHERE om.id = target_member_id
      AND om.org_id = (auth.jwt() ->> 'org_id')::uuid
  );$$;


ALTER FUNCTION "public"."member_belongs_to_current_org"("target_member_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_member_display_id"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin

  new.display_id := generate_member_code(
      new.org_id,
      new.role
  );

  return new;

end;
$$;


ALTER FUNCTION "public"."set_member_display_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_admin_last_login"("p_admin_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  UPDATE public.profiles SET last_login = now() WHERE id = p_admin_id;
END; $$;


ALTER FUNCTION "public"."update_admin_last_login"("p_admin_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_conversation_last_message"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  update public.conversations
  set
    last_message_id = new.id,
    updated_at = now()
  where id = new.conversation_id;

  return new;
end;
$$;


ALTER FUNCTION "public"."update_conversation_last_message"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_super_admin_activity"("p_token" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  update public.super_admin_sessions
  set last_activity = now()
  where session_token = p_token;
end;
$$;


ALTER FUNCTION "public"."update_super_admin_activity"("p_token" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_super_admin_last_login"("p_admin_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  update public.profiles
  set last_login = now()
  where id = p_admin_id;
end;
$$;


ALTER FUNCTION "public"."update_super_admin_last_login"("p_admin_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."update_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."verify_super_admin_session"("p_token" "text") RETURNS SETOF "public"."super_admin_sessions"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  return query
  select *
  from public.super_admin_sessions
  where session_token = p_token
    and expires_at > now();
end;
$$;


ALTER FUNCTION "public"."verify_super_admin_session"("p_token" "text") OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."activities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "lead_id" "uuid",
    "contact_id" "uuid",
    "customer_id" "uuid",
    "created_by" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "action" "text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "target_name" "text",
    CONSTRAINT "activities_action_check" CHECK (("action" = ANY (ARRAY['created'::"text", 'updated'::"text", 'deleted'::"text", 'assigned'::"text", 'completed'::"text", 'cancelled'::"text", 'started'::"text", 'sent'::"text"]))),
    CONSTRAINT "activities_target_type_check" CHECK (("type" = ANY (ARRAY['meeting'::"text", 'visit'::"text", 'follow_up'::"text", 'other'::"text", 'lead'::"text", 'contact'::"text", 'deal'::"text", 'customer'::"text", 'task'::"text", 'call'::"text", 'note'::"text", 'sms'::"text", 'email'::"text", 'system'::"text"])))
);


ALTER TABLE "public"."activities" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."calls" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "lead_id" "uuid",
    "contact_id" "uuid",
    "created_by" "uuid" NOT NULL,
    "assigned_to" "uuid" NOT NULL,
    "subject" "text" NOT NULL,
    "notes" character varying(5000),
    "type" "text" NOT NULL,
    "status" "text" DEFAULT 'scheduled'::"text" NOT NULL,
    "outcome" "text",
    "priority" "text" DEFAULT 'medium'::"text" NOT NULL,
    "scheduled_for" timestamp with time zone,
    "started_at" timestamp with time zone,
    "ended_at" timestamp with time zone,
    "duration_seconds" integer,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "direction" "text" DEFAULT 'outbound'::"text" NOT NULL,
    CONSTRAINT "calls_direction_check" CHECK (("direction" = ANY (ARRAY['inbound'::"text", 'outbound'::"text"]))),
    CONSTRAINT "calls_outcome_check" CHECK ((("outcome" IS NULL) OR ("outcome" = ANY (ARRAY['interested'::"text", 'not_interested'::"text", 'callback_requested'::"text", 'resolved'::"text", 'other'::"text"])))),
    CONSTRAINT "calls_owner_check" CHECK (((("lead_id" IS NOT NULL) AND ("contact_id" IS NULL)) OR (("lead_id" IS NULL) AND ("contact_id" IS NOT NULL)))),
    CONSTRAINT "calls_priority_check" CHECK (("priority" = ANY (ARRAY['low'::"text", 'medium'::"text", 'high'::"text"]))),
    CONSTRAINT "calls_status_check" CHECK (("status" = ANY (ARRAY['scheduled'::"text", 'dialing'::"text", 'ringing'::"text", 'active'::"text", 'completed'::"text", 'cancelled'::"text"]))),
    CONSTRAINT "calls_type_check" CHECK (("type" = ANY (ARRAY['sales'::"text", 'follow_up'::"text", 'support'::"text", 'demo'::"text", 'onboarding'::"text", 'renewal'::"text", 'other'::"text"])))
);


ALTER TABLE "public"."calls" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."contacts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "email" "text",
    "phone" "text",
    "company_name" "text" DEFAULT 'not provided'::"text" NOT NULL,
    "position" "text" DEFAULT 'not provided'::"text" NOT NULL,
    "status" "text" DEFAULT 'Lead'::"text" NOT NULL,
    "owner_id" "uuid" NOT NULL,
    "org_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "owner_name" "text" DEFAULT ''::"text" NOT NULL,
    "first_name" "text" NOT NULL,
    "last_name" "text" NOT NULL,
    "suffix" "text",
    "gender" "text" DEFAULT 'Prefer not to say'::"text" NOT NULL,
    "birth_date" "date",
    "department" "text",
    "priority" "text" DEFAULT 'Low'::"text" NOT NULL,
    "notes" character varying(5000),
    "source" "text" DEFAULT 'Other'::"text" NOT NULL,
    "lead_id" "uuid",
    "deleted_at" timestamp with time zone,
    "deleted_by" "uuid",
    "updated_by" "uuid",
    "linkedin" character varying(100),
    "facebook" character varying(100),
    "instagram" character varying(100),
    "tiktok" character varying(100),
    "x" character varying(100),
    "telegram" character varying(100),
    "whatsapp" character varying(20),
    "viber" character varying(20),
    "industry" character varying(100),
    "website" "text",
    "address" "text",
    "city" character varying(100),
    "country" character varying(100),
    "latitude" numeric(10,8),
    "longitude" numeric(11,8),
    "preferred_contact_time" "text" DEFAULT '''Anytime'''::"text",
    CONSTRAINT "chk_contact_address" CHECK ((("address" IS NULL) OR ("address" = ''::"text") OR ("length"(TRIM(BOTH FROM "address")) > 0))),
    CONSTRAINT "chk_contact_city" CHECK ((("city" IS NULL) OR (("city")::"text" = ''::"text") OR ("length"(TRIM(BOTH FROM "city")) > 0))),
    CONSTRAINT "chk_contact_country" CHECK ((("country" IS NULL) OR (("country")::"text" = ''::"text") OR ("length"(TRIM(BOTH FROM "country")) > 0))),
    CONSTRAINT "chk_contact_latitude" CHECK ((("latitude" IS NULL) OR (("latitude" >= ('-90'::integer)::numeric) AND ("latitude" <= (90)::numeric)))),
    CONSTRAINT "chk_contact_longitude" CHECK ((("longitude" IS NULL) OR (("longitude" >= ('-180'::integer)::numeric) AND ("longitude" <= (180)::numeric)))),
    CONSTRAINT "chk_contact_website" CHECK ((("website" IS NULL) OR ("website" = ''::"text") OR ("length"(TRIM(BOTH FROM "website")) > 0))),
    CONSTRAINT "contacts_company_name_length_check" CHECK (("char_length"("company_name") <= 255)),
    CONSTRAINT "contacts_department_length_check" CHECK (("char_length"("department") <= 100)),
    CONSTRAINT "contacts_email_length_check" CHECK (("char_length"("email") <= 254)),
    CONSTRAINT "contacts_email_or_phone_required" CHECK ((("email" IS NOT NULL) OR ("phone" IS NOT NULL))),
    CONSTRAINT "contacts_facebook_check" CHECK ((("facebook" IS NULL) OR ((TRIM(BOTH FROM "facebook") = ("facebook")::"text") AND (("facebook")::"text" ~ '^[A-Za-z0-9._-]{2,100}$'::"text")))),
    CONSTRAINT "contacts_first_name_length_check" CHECK (("char_length"("first_name") <= 100)),
    CONSTRAINT "contacts_gender_length_check" CHECK (("char_length"("gender") <= 30)),
    CONSTRAINT "contacts_gender_values_check" CHECK (("gender" = ANY (ARRAY['Male'::"text", 'Female'::"text", 'Prefer not to say'::"text"]))),
    CONSTRAINT "contacts_industry_length_check" CHECK ((("industry" IS NULL) OR ("char_length"(TRIM(BOTH FROM "industry")) <= 100))),
    CONSTRAINT "contacts_instagram_check" CHECK ((("instagram" IS NULL) OR ((TRIM(BOTH FROM "instagram") = ("instagram")::"text") AND (("instagram")::"text" ~ '^[A-Za-z0-9._-]{2,100}$'::"text")))),
    CONSTRAINT "contacts_last_name_length_check" CHECK (("char_length"("last_name") <= 100)),
    CONSTRAINT "contacts_linkedin_check" CHECK ((("linkedin" IS NULL) OR ((TRIM(BOTH FROM "linkedin") = ("linkedin")::"text") AND (("linkedin")::"text" ~ '^[A-Za-z0-9._-]{2,100}$'::"text")))),
    CONSTRAINT "contacts_notes_length_check" CHECK (("char_length"(("notes")::"text") <= 5000)),
    CONSTRAINT "contacts_owner_name_length_check" CHECK (("char_length"("owner_name") <= 100)),
    CONSTRAINT "contacts_phone_length_check" CHECK (("char_length"("phone") <= 30)),
    CONSTRAINT "contacts_position_length_check" CHECK (("char_length"("position") <= 100)),
    CONSTRAINT "contacts_preferred_contact_time_check" CHECK ((("preferred_contact_time" IS NULL) OR ("preferred_contact_time" = ANY (ARRAY[('Morning'::character varying)::"text", ('Afternoon'::character varying)::"text", ('Evening'::character varying)::"text", ('Anytime'::character varying)::"text"])))),
    CONSTRAINT "contacts_priority_length_check" CHECK (("char_length"("priority") <= 20)),
    CONSTRAINT "contacts_priority_values_check" CHECK (("priority" = ANY (ARRAY['Low'::"text", 'High'::"text", 'Highest'::"text"]))),
    CONSTRAINT "contacts_source_length_check" CHECK (("char_length"("source") <= 50)),
    CONSTRAINT "contacts_source_values_check" CHECK (("source" = ANY (ARRAY['Website'::"text", 'Referral'::"text", 'Facebook'::"text", 'Instagram'::"text", 'LinkedIn'::"text", 'Google Search'::"text", 'Google Ads'::"text", 'Email Campaign'::"text", 'Cold Call'::"text", 'Trade Show'::"text", 'Webinar'::"text", 'Partner'::"text", 'Walk-in'::"text", 'WhatsApp'::"text", 'Messenger'::"text", 'Personal Network'::"text", 'Direct Conversation'::"text", 'Networking Event'::"text", 'Conference'::"text", 'Friend'::"text", 'Family'::"text", 'Other'::"text"]))),
    CONSTRAINT "contacts_suffix_length_check" CHECK (("char_length"("suffix") <= 20)),
    CONSTRAINT "contacts_telegram_check" CHECK ((("telegram" IS NULL) OR ((TRIM(BOTH FROM "telegram") = ("telegram")::"text") AND (("telegram")::"text" ~ '^[A-Za-z0-9._-]{2,100}$'::"text")))),
    CONSTRAINT "contacts_tiktok_check" CHECK ((("tiktok" IS NULL) OR ((TRIM(BOTH FROM "tiktok") = ("tiktok")::"text") AND (("tiktok")::"text" ~ '^[A-Za-z0-9._-]{2,100}$'::"text")))),
    CONSTRAINT "contacts_viber_check" CHECK ((("viber" IS NULL) OR (("viber")::"text" ~ '^\+?[0-9]{7,15}$'::"text"))),
    CONSTRAINT "contacts_whatsapp_check" CHECK ((("whatsapp" IS NULL) OR (("whatsapp")::"text" ~ '^\+?[0-9]{7,15}$'::"text"))),
    CONSTRAINT "contacts_x_check" CHECK ((("x" IS NULL) OR ((TRIM(BOTH FROM "x") = ("x")::"text") AND (("x")::"text" ~ '^[A-Za-z0-9._-]{2,100}$'::"text"))))
);


ALTER TABLE "public"."contacts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."conversation_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "conversation_id" "uuid" NOT NULL,
    "member_id" "uuid" NOT NULL,
    "joined_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "last_read_at" timestamp with time zone
);


ALTER TABLE "public"."conversation_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."conversations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "last_message_id" "uuid",
    "industry" "text",
    CONSTRAINT "conversations_type_check" CHECK (("type" = ANY (ARRAY['announcement'::"text", 'organization'::"text", 'direct'::"text"])))
);


ALTER TABLE "public"."conversations" OWNER TO "postgres";


COMMENT ON COLUMN "public"."conversations"."industry" IS '`';



CREATE TABLE IF NOT EXISTS "public"."customers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "contact_id" "uuid" NOT NULL,
    "notes" "text",
    "status" character varying(20) DEFAULT 'Active'::character varying NOT NULL,
    "owner_id" "uuid" NOT NULL,
    "org_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "deleted_by" "uuid",
    "updated_by" "uuid",
    CONSTRAINT "chk_customer_status" CHECK ((("status")::"text" = ANY (ARRAY[('Active'::character varying)::"text", ('Inactive'::character varying)::"text", ('At Risk'::character varying)::"text", ('Churned'::character varying)::"text"]))),
    CONSTRAINT "customers_notes_length_check" CHECK (("char_length"("notes") <= 5000))
);


ALTER TABLE "public"."customers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."deals" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "contact_id" "uuid" NOT NULL,
    "title" character varying(150) NOT NULL,
    "stage" "text" NOT NULL,
    "notes" character varying(5000),
    "owner_id" "uuid" NOT NULL,
    "org_id" "uuid" NOT NULL,
    "value" numeric(12,2) DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "close_date" timestamp with time zone,
    "closed_by" "uuid",
    "deleted_at" timestamp with time zone,
    "deleted_by" "uuid",
    "updated_by" "uuid",
    CONSTRAINT "deals_stage_check" CHECK (("stage" = ANY (ARRAY['Prospecting'::"text", 'Proposal'::"text", 'Negotiation'::"text", 'Closed Won'::"text", 'Closed Lost'::"text"]))),
    CONSTRAINT "deals_value_check" CHECK (("value" >= (0)::numeric))
);


ALTER TABLE "public"."deals" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."emails" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "sender_id" "uuid" NOT NULL,
    "lead_id" "uuid",
    "contact_id" "uuid",
    "customer_id" "uuid",
    "recipient_email" "text" NOT NULL,
    "subject" "text" NOT NULL,
    "provider" "text" DEFAULT 'resend'::"text" NOT NULL,
    "provider_message_id" "text",
    "error_message" "text",
    "sent_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "sender_name" "text" DEFAULT ''::"text" NOT NULL,
    "sender_email" "text" DEFAULT ''::"text" NOT NULL,
    "body_text" "text" DEFAULT ''::"text" NOT NULL,
    "preview_text" "text" DEFAULT ''::"text" NOT NULL,
    "body_html" "text",
    "status" "public"."email_status" NOT NULL,
    CONSTRAINT "emails_body_text_length_check" CHECK (("char_length"("body_text") <= 5000)),
    CONSTRAINT "emails_provider_check" CHECK (("provider" = 'resend'::"text")),
    CONSTRAINT "emails_single_owner_check" CHECK (((((("lead_id" IS NOT NULL))::integer + (("contact_id" IS NOT NULL))::integer) + (("customer_id" IS NOT NULL))::integer) = 1))
);


ALTER TABLE "public"."emails" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."feedbacks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text",
    "email" "text",
    "rating" smallint,
    "message" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_type" "text" DEFAULT 'prefer_not_to_say'::"text" NOT NULL,
    CONSTRAINT "feedback_message_check" CHECK ((("char_length"(TRIM(BOTH FROM "message")) >= 1) AND ("char_length"(TRIM(BOTH FROM "message")) <= 1000))),
    CONSTRAINT "feedback_rating_check" CHECK ((("rating" IS NULL) OR (("rating" >= 1) AND ("rating" <= 5)))),
    CONSTRAINT "feedback_user_type_check" CHECK (("user_type" = ANY (ARRAY['everyday_user'::"text", 'manager'::"text", 'technical'::"text", 'prefer_not_to_say'::"text"])))
);


ALTER TABLE "public"."feedbacks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."leads" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "first_name" "text" NOT NULL,
    "last_name" "text",
    "suffix" "text",
    "gender" "text" DEFAULT 'Prefer not to say'::"text" NOT NULL,
    "birth_date" "date",
    "email" "text",
    "phone" "text",
    "company_name" "text",
    "department" "text",
    "position" "text",
    "status" "text" DEFAULT 'New'::"text" NOT NULL,
    "owner_id" "uuid" NOT NULL,
    "org_id" "uuid" NOT NULL,
    "notes" character varying(5000),
    "priority" "text" DEFAULT 'Low'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "title" "text" NOT NULL,
    "source" "text" DEFAULT 'Other'::"text" NOT NULL,
    "deleted_at" timestamp with time zone,
    "deleted_by" "uuid",
    "updated_by" "uuid",
    "industry" character varying(100),
    "linkedin" character varying(255),
    "facebook" character varying(255),
    "instagram" character varying(255),
    "tiktok" character varying(255),
    "x" character varying(255),
    "whatsapp" character varying(50),
    "telegram" character varying(100),
    "viber" character varying(50),
    "preferred_contact_time" character varying(20),
    "website" "text",
    CONSTRAINT "leads_company_name_length_check" CHECK (("char_length"("company_name") <= 100)),
    CONSTRAINT "leads_department_length_check" CHECK (("char_length"("department") <= 100)),
    CONSTRAINT "leads_email_length_check" CHECK (("char_length"("email") <= 254)),
    CONSTRAINT "leads_first_name_length_check" CHECK (("char_length"("first_name") <= 50)),
    CONSTRAINT "leads_gender_length_check" CHECK (("char_length"("gender") <= 30)),
    CONSTRAINT "leads_gender_values_check" CHECK (("gender" = ANY (ARRAY['Male'::"text", 'Female'::"text", 'Prefer not to say'::"text"]))),
    CONSTRAINT "leads_last_name_length_check" CHECK (("char_length"("last_name") <= 50)),
    CONSTRAINT "leads_notes_length_check" CHECK (("char_length"(("notes")::"text") <= 5000)),
    CONSTRAINT "leads_phone_length_check" CHECK (("char_length"("phone") <= 25)),
    CONSTRAINT "leads_position_length_check" CHECK (("char_length"("position") <= 100)),
    CONSTRAINT "leads_preferred_contact_time_check" CHECK ((("preferred_contact_time" IS NULL) OR (("preferred_contact_time")::"text" = ANY (ARRAY[('Morning'::character varying)::"text", ('Afternoon'::character varying)::"text", ('Evening'::character varying)::"text", ('Anytime'::character varying)::"text"])))),
    CONSTRAINT "leads_priority_length_check" CHECK (("char_length"("priority") <= 20)),
    CONSTRAINT "leads_priority_values_check" CHECK (("priority" = ANY (ARRAY['Low'::"text", 'High'::"text", 'Highest'::"text"]))),
    CONSTRAINT "leads_source_length_check" CHECK (("char_length"("source") <= 50)),
    CONSTRAINT "leads_source_values_check" CHECK (("source" = ANY (ARRAY['Website'::"text", 'Referral'::"text", 'Facebook'::"text", 'Instagram'::"text", 'LinkedIn'::"text", 'Google Search'::"text", 'Google Ads'::"text", 'Email Campaign'::"text", 'Cold Call'::"text", 'Trade Show'::"text", 'Webinar'::"text", 'Partner'::"text", 'Walk-in'::"text", 'WhatsApp'::"text", 'Messenger'::"text", 'Personal Network'::"text", 'Direct Conversation'::"text", 'Networking Event'::"text", 'Conference'::"text", 'Friend'::"text", 'Family'::"text", 'Other'::"text"]))),
    CONSTRAINT "leads_status_values_check" CHECK (("status" = ANY (ARRAY['New'::"text", 'Contacted'::"text", 'Qualified'::"text", 'Closed'::"text"]))),
    CONSTRAINT "leads_suffix_length_check" CHECK (("char_length"("suffix") <= 10)),
    CONSTRAINT "leads_title_length_check" CHECK (("char_length"("title") <= 100))
);


ALTER TABLE "public"."leads" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "conversation_id" "uuid" NOT NULL,
    "sender_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "entity_type" "text",
    "entity_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "edited_at" timestamp with time zone,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "messages_check" CHECK (((("entity_type" IS NULL) AND ("entity_id" IS NULL)) OR (("entity_type" IS NOT NULL) AND ("entity_id" IS NOT NULL)))),
    CONSTRAINT "messages_content_check" CHECK (("btrim"("content") <> ''::"text")),
    CONSTRAINT "messages_content_length_check" CHECK (("char_length"("content") <= 5000)),
    CONSTRAINT "messages_entity_type_check" CHECK (("entity_type" = ANY (ARRAY['lead'::"text", 'contact'::"text", 'deal'::"text", 'customer'::"text"])))
);


ALTER TABLE "public"."messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "author_id" "uuid" NOT NULL,
    "target_type" character varying(20) NOT NULL,
    "target_id" "uuid",
    "content" "text" NOT NULL,
    "visibility" character varying(20) DEFAULT 'private'::character varying NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "deleted_by" "uuid",
    "updated_by" "uuid",
    "title" "text" DEFAULT ''::"text" NOT NULL,
    "pinned" boolean DEFAULT false NOT NULL,
    CONSTRAINT "notes_content_length_check" CHECK (("char_length"("content") <= 5000)),
    CONSTRAINT "notes_target_type_check" CHECK ((("target_type")::"text" = ANY (ARRAY[('lead'::character varying)::"text", ('contact'::character varying)::"text", ('deal'::character varying)::"text", ('customer'::character varying)::"text", ('personal'::character varying)::"text"]))),
    CONSTRAINT "notes_visibility_check" CHECK ((("visibility")::"text" = ANY (ARRAY[('public'::character varying)::"text", ('private'::character varying)::"text"])))
);


ALTER TABLE "public"."notes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organization_invite_acceptances" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "invite_id" "uuid" NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "accepted_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."organization_invite_acceptances" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organization_invites" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "code" "text" NOT NULL,
    "role" "text" NOT NULL,
    "email" "text",
    "max_uses" integer DEFAULT 1 NOT NULL,
    "used_count" integer DEFAULT 0 NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "organization_invites_max_uses_check" CHECK (("max_uses" > 0)),
    CONSTRAINT "organization_invites_role_check" CHECK (("role" = ANY (ARRAY['owner'::"text", 'manager'::"text", 'agent'::"text"]))),
    CONSTRAINT "organization_invites_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'completed'::"text", 'expired'::"text", 'revoked'::"text"]))),
    CONSTRAINT "organization_invites_usage_check" CHECK (("used_count" <= "max_uses")),
    CONSTRAINT "organization_invites_used_count_check" CHECK (("used_count" >= 0))
);


ALTER TABLE "public"."organization_invites" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organization_member_counters" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "owner_count" integer DEFAULT 0 NOT NULL,
    "manager_count" integer DEFAULT 0 NOT NULL,
    "agent_count" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."organization_member_counters" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organization_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "role" "text" DEFAULT 'agent'::"text" NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "display_id" "text" NOT NULL,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "organization_members_role_check" CHECK (("role" = ANY (ARRAY['owner'::"text", 'manager'::"text", 'agent'::"text"]))),
    CONSTRAINT "organization_members_status_check" CHECK (("status" = ANY (ARRAY['invited'::"text", 'active'::"text", 'suspended'::"text", 'removed'::"text"])))
);


ALTER TABLE "public"."organization_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organizations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "industry" "text",
    "product_type" "text",
    "company_size" "text",
    "website" "text",
    "description" "text",
    "logo_url" "text",
    "country" "text",
    "timezone" "text",
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "type" "text" DEFAULT 'personal'::"text" NOT NULL,
    "slug" "text",
    "display_id" "text" DEFAULT "public"."generate_org_display_id"() NOT NULL,
    CONSTRAINT "organizations_type_check" CHECK (("type" = ANY (ARRAY['personal'::"text", 'business'::"text"])))
);


ALTER TABLE "public"."organizations" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."profile_display_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."profile_display_id_seq" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "display_name" "text",
    "avatar_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "last_login" timestamp with time zone,
    "first_name" "text",
    "last_name" "text",
    "job_title" "text",
    "deleted_at" timestamp with time zone,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "email" "text" NOT NULL,
    "onboarding_completed" boolean DEFAULT false NOT NULL,
    "onboarding_step" smallint DEFAULT 0 NOT NULL,
    CONSTRAINT "profiles_avatar_url_length" CHECK ((("avatar_url" IS NULL) OR ("char_length"("avatar_url") <= 2048))),
    CONSTRAINT "profiles_display_name_length" CHECK (("char_length"("display_name") <= 100)),
    CONSTRAINT "profiles_first_name_length" CHECK (("char_length"("first_name") <= 50)),
    CONSTRAINT "profiles_last_name_length" CHECK (("char_length"("last_name") <= 50)),
    CONSTRAINT "profiles_position_length" CHECK ((("job_title" IS NULL) OR ("char_length"("job_title") <= 100))),
    CONSTRAINT "profiles_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'inactive'::"text", 'active'::"text", 'banned'::"text", 'deleted'::"text"])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."refresh_tokens" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "token_hash" "text" NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "revoked_at" timestamp with time zone,
    "replaced_by_id" "uuid",
    "ip_address" "inet",
    "user_agent" "text",
    "last_seen_at" timestamp with time zone DEFAULT "now"(),
    "org_id" "uuid"
);


ALTER TABLE "public"."refresh_tokens" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sms" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "lead_id" "uuid",
    "contact_id" "uuid",
    "sender_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "status" "text" DEFAULT 'sent'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "sms_content_length_check" CHECK (("char_length"("content") <= 5000)),
    CONSTRAINT "sms_single_recipient" CHECK (((("lead_id" IS NOT NULL) AND ("contact_id" IS NULL)) OR (("lead_id" IS NULL) AND ("contact_id" IS NOT NULL)))),
    CONSTRAINT "sms_status_check" CHECK (("status" = ANY (ARRAY['queued'::"text", 'sending'::"text", 'sent'::"text", 'delivered'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."sms" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subscriptions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "plan" "text" DEFAULT 'Free'::"text" NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "current_period_start" timestamp with time zone,
    "current_period_end" timestamp with time zone,
    "cancel_at_period_end" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "payment_provider" "text" DEFAULT 'none'::"text" NOT NULL,
    "provider_reference" "text",
    "billing_cycle" "text" DEFAULT 'monthly'::"text" NOT NULL,
    CONSTRAINT "subscriptions_billing_cycle_check" CHECK (("billing_cycle" = ANY (ARRAY['monthly'::"text", 'yearly'::"text", 'none'::"text"]))),
    CONSTRAINT "subscriptions_payment_provider_check" CHECK (("payment_provider" = ANY (ARRAY['stripe'::"text", 'paypal'::"text", 'gcash'::"text", 'maya'::"text", 'none'::"text"]))),
    CONSTRAINT "subscriptions_plan_check" CHECK (("plan" = ANY (ARRAY['Free'::"text", 'Starter'::"text", 'Team'::"text", 'Business'::"text", 'Enterprise'::"text"]))),
    CONSTRAINT "subscriptions_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'cancelled'::"text", 'expired'::"text", 'past_due'::"text"])))
);


ALTER TABLE "public"."subscriptions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."super_admin_audit_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "event_type" "text" NOT NULL,
    "super_admin_id" "uuid",
    "target_user_id" "uuid",
    "target_org_id" "uuid",
    "ip_address" "text",
    "details" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."super_admin_audit_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tasks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "author_id" "uuid" NOT NULL,
    "assigned_to" "uuid",
    "target_type" character varying(20) NOT NULL,
    "target_id" "uuid",
    "title" "text" NOT NULL,
    "description" "text" DEFAULT ''::"text" NOT NULL,
    "status" character varying(20) DEFAULT 'todo'::character varying NOT NULL,
    "priority" character varying(20) DEFAULT 'medium'::character varying NOT NULL,
    "visibility" character varying(20) DEFAULT 'private'::character varying NOT NULL,
    "due_date" timestamp with time zone,
    "reminder_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_by" "uuid",
    "deleted_at" timestamp with time zone,
    "deleted_by" "uuid",
    "task_type" "public"."task_type" DEFAULT 'other'::"public"."task_type" NOT NULL,
    CONSTRAINT "tasks_description_length_check" CHECK (("char_length"("description") <= 2000)),
    CONSTRAINT "tasks_priority_check" CHECK ((("priority")::"text" = ANY (ARRAY[('low'::character varying)::"text", ('medium'::character varying)::"text", ('high'::character varying)::"text", ('urgent'::character varying)::"text"]))),
    CONSTRAINT "tasks_status_check" CHECK ((("status")::"text" = ANY (ARRAY[('todo'::character varying)::"text", ('in_progress'::character varying)::"text", ('completed'::character varying)::"text", ('cancelled'::character varying)::"text"]))),
    CONSTRAINT "tasks_target_type_check" CHECK ((("target_type")::"text" = ANY (ARRAY[('lead'::character varying)::"text", ('contact'::character varying)::"text", ('deal'::character varying)::"text", ('customer'::character varying)::"text", ('personal'::character varying)::"text"]))),
    CONSTRAINT "tasks_visibility_check" CHECK ((("visibility")::"text" = ANY (ARRAY[('public'::character varying)::"text", ('private'::character varying)::"text"])))
);


ALTER TABLE "public"."tasks" OWNER TO "postgres";


ALTER TABLE ONLY "public"."activities"
    ADD CONSTRAINT "activities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."calls"
    ADD CONSTRAINT "calls_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."contacts"
    ADD CONSTRAINT "contacts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."conversation_members"
    ADD CONSTRAINT "conversation_members_conversation_id_profile_id_key" UNIQUE ("conversation_id", "member_id");



ALTER TABLE ONLY "public"."conversation_members"
    ADD CONSTRAINT "conversation_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."customers"
    ADD CONSTRAINT "customers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."deals"
    ADD CONSTRAINT "deals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."emails"
    ADD CONSTRAINT "emails_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."feedbacks"
    ADD CONSTRAINT "feedback_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."leads"
    ADD CONSTRAINT "leads_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notes"
    ADD CONSTRAINT "notes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organization_invite_acceptances"
    ADD CONSTRAINT "organization_invite_acceptances_invite_id_profile_id_key" UNIQUE ("invite_id", "profile_id");



ALTER TABLE ONLY "public"."organization_invite_acceptances"
    ADD CONSTRAINT "organization_invite_acceptances_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organization_invites"
    ADD CONSTRAINT "organization_invites_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organization_member_counters"
    ADD CONSTRAINT "organization_member_counters_org_id_key" UNIQUE ("org_id");



ALTER TABLE ONLY "public"."organization_member_counters"
    ADD CONSTRAINT "organization_member_counters_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organization_members"
    ADD CONSTRAINT "organization_members_org_display_id_unique" UNIQUE ("org_id", "display_id");



ALTER TABLE ONLY "public"."organization_members"
    ADD CONSTRAINT "organization_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organization_members"
    ADD CONSTRAINT "organization_members_unique" UNIQUE ("org_id", "profile_id");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_display_id_key" UNIQUE ("display_id");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."refresh_tokens"
    ADD CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."refresh_tokens"
    ADD CONSTRAINT "refresh_tokens_token_hash_key" UNIQUE ("token_hash");



ALTER TABLE ONLY "public"."sms"
    ADD CONSTRAINT "sms_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_organization_unique" UNIQUE ("org_id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."super_admin_audit_log"
    ADD CONSTRAINT "super_admin_audit_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."super_admin_sessions"
    ADD CONSTRAINT "super_admin_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."super_admin_sessions"
    ADD CONSTRAINT "super_admin_sessions_session_token_key" UNIQUE ("session_token");



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_pkey" PRIMARY KEY ("id");



CREATE INDEX "contacts_org_id_idx" ON "public"."contacts" USING "btree" ("org_id");



CREATE INDEX "contacts_owner_id_idx" ON "public"."contacts" USING "btree" ("owner_id");



CREATE INDEX "idx_activities_contact" ON "public"."activities" USING "btree" ("contact_id");



CREATE INDEX "idx_activities_created_at" ON "public"."activities" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_activities_creator" ON "public"."activities" USING "btree" ("created_by");



CREATE INDEX "idx_activities_customer" ON "public"."activities" USING "btree" ("customer_id");



CREATE INDEX "idx_activities_lead" ON "public"."activities" USING "btree" ("lead_id");



CREATE INDEX "idx_activities_org" ON "public"."activities" USING "btree" ("org_id");



CREATE INDEX "idx_activities_org_created" ON "public"."activities" USING "btree" ("org_id", "created_at" DESC);



CREATE INDEX "idx_calls_assigned_to" ON "public"."calls" USING "btree" ("assigned_to");



CREATE INDEX "idx_calls_contact_id" ON "public"."calls" USING "btree" ("contact_id");



CREATE INDEX "idx_calls_created_at" ON "public"."calls" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_calls_lead_id" ON "public"."calls" USING "btree" ("lead_id");



CREATE INDEX "idx_calls_org_id" ON "public"."calls" USING "btree" ("org_id");



CREATE INDEX "idx_calls_scheduled_for" ON "public"."calls" USING "btree" ("scheduled_for");



CREATE INDEX "idx_calls_status" ON "public"."calls" USING "btree" ("status");



CREATE INDEX "idx_conversation_members_conversation" ON "public"."conversation_members" USING "btree" ("conversation_id");



CREATE INDEX "idx_conversation_members_profile" ON "public"."conversation_members" USING "btree" ("member_id");



CREATE INDEX "idx_conversation_members_profile_conversation" ON "public"."conversation_members" USING "btree" ("member_id", "conversation_id");



CREATE INDEX "idx_conversations_org" ON "public"."conversations" USING "btree" ("org_id") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_customers_contact_id" ON "public"."customers" USING "btree" ("contact_id");



CREATE INDEX "idx_customers_org_id" ON "public"."customers" USING "btree" ("org_id");



CREATE INDEX "idx_customers_owner_id" ON "public"."customers" USING "btree" ("owner_id");



CREATE INDEX "idx_customers_status" ON "public"."customers" USING "btree" ("status");



CREATE INDEX "idx_deals_contact_id" ON "public"."deals" USING "btree" ("contact_id");



CREATE INDEX "idx_deals_org_id" ON "public"."deals" USING "btree" ("org_id");



CREATE INDEX "idx_deals_owner_id" ON "public"."deals" USING "btree" ("owner_id");



CREATE INDEX "idx_deals_stage" ON "public"."deals" USING "btree" ("stage");



CREATE INDEX "idx_emails_contact" ON "public"."emails" USING "btree" ("contact_id");



CREATE INDEX "idx_emails_contact_history" ON "public"."emails" USING "btree" ("contact_id", "created_at" DESC);



CREATE INDEX "idx_emails_created_at" ON "public"."emails" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_emails_customer" ON "public"."emails" USING "btree" ("customer_id");



CREATE INDEX "idx_emails_customer_history" ON "public"."emails" USING "btree" ("customer_id", "created_at" DESC);



CREATE INDEX "idx_emails_lead" ON "public"."emails" USING "btree" ("lead_id");



CREATE INDEX "idx_emails_lead_history" ON "public"."emails" USING "btree" ("lead_id", "created_at" DESC);



CREATE INDEX "idx_emails_org" ON "public"."emails" USING "btree" ("org_id");



CREATE INDEX "idx_emails_preview_text" ON "public"."emails" USING "btree" ("preview_text");



CREATE INDEX "idx_emails_recipient_email" ON "public"."emails" USING "btree" ("recipient_email");



CREATE INDEX "idx_emails_sender" ON "public"."emails" USING "btree" ("sender_id");



CREATE INDEX "idx_emails_sender_email" ON "public"."emails" USING "btree" ("sender_email");



CREATE INDEX "idx_emails_sent_at" ON "public"."emails" USING "btree" ("sent_at" DESC);



CREATE INDEX "idx_emails_status" ON "public"."emails" USING "btree" ("status");



CREATE INDEX "idx_emails_subject" ON "public"."emails" USING "btree" ("subject");



CREATE INDEX "idx_feedback_created_at" ON "public"."feedbacks" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_messages_conversation_created" ON "public"."messages" USING "btree" ("conversation_id", "created_at") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_messages_entity" ON "public"."messages" USING "btree" ("entity_type", "entity_id");



CREATE INDEX "idx_messages_sender" ON "public"."messages" USING "btree" ("sender_id");



CREATE UNIQUE INDEX "idx_org_invites_code" ON "public"."organization_invites" USING "btree" ("code");



CREATE INDEX "idx_org_invites_email" ON "public"."organization_invites" USING "btree" ("email");



CREATE INDEX "idx_org_invites_expires" ON "public"."organization_invites" USING "btree" ("expires_at");



CREATE INDEX "idx_org_invites_lookup" ON "public"."organization_invites" USING "btree" ("code", "status");



CREATE INDEX "idx_org_invites_organization" ON "public"."organization_invites" USING "btree" ("org_id");



CREATE INDEX "idx_org_invites_status" ON "public"."organization_invites" USING "btree" ("status");



CREATE INDEX "idx_organization_members_display_id" ON "public"."organization_members" USING "btree" ("display_id");



CREATE INDEX "idx_refresh_tokens_active" ON "public"."refresh_tokens" USING "btree" ("profile_id") WHERE ("revoked_at" IS NULL);



CREATE INDEX "idx_refresh_tokens_profile_id" ON "public"."refresh_tokens" USING "btree" ("profile_id");



CREATE INDEX "idx_refresh_tokens_token_hash" ON "public"."refresh_tokens" USING "btree" ("token_hash");



CREATE INDEX "idx_sms_contact_id" ON "public"."sms" USING "btree" ("contact_id");



CREATE INDEX "idx_sms_created_at" ON "public"."sms" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_sms_lead_id" ON "public"."sms" USING "btree" ("lead_id");



CREATE INDEX "idx_sms_org_deleted_at" ON "public"."sms" USING "btree" ("org_id", "deleted_at");



CREATE INDEX "idx_sms_org_id" ON "public"."sms" USING "btree" ("org_id");



CREATE INDEX "idx_sms_sender_id" ON "public"."sms" USING "btree" ("sender_id");



CREATE INDEX "idx_sms_status" ON "public"."sms" USING "btree" ("status");



CREATE INDEX "idx_super_admin_audit_log_created_at" ON "public"."super_admin_audit_log" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_super_admin_audit_log_event_type" ON "public"."super_admin_audit_log" USING "btree" ("event_type");



CREATE INDEX "idx_super_admin_audit_log_super_admin_id" ON "public"."super_admin_audit_log" USING "btree" ("super_admin_id");



CREATE INDEX "leads_org_id_idx" ON "public"."leads" USING "btree" ("org_id");



CREATE INDEX "leads_owner_id_idx" ON "public"."leads" USING "btree" ("owner_id");



CREATE INDEX "notes_author_idx" ON "public"."notes" USING "btree" ("author_id");



CREATE INDEX "notes_org_idx" ON "public"."notes" USING "btree" ("org_id");



CREATE INDEX "notes_target_idx" ON "public"."notes" USING "btree" ("target_type", "target_id");



CREATE INDEX "tasks_assigned_to_idx" ON "public"."tasks" USING "btree" ("assigned_to");



CREATE INDEX "tasks_author_idx" ON "public"."tasks" USING "btree" ("author_id");



CREATE INDEX "tasks_due_date_idx" ON "public"."tasks" USING "btree" ("due_date");



CREATE INDEX "tasks_org_idx" ON "public"."tasks" USING "btree" ("org_id");



CREATE INDEX "tasks_priority_idx" ON "public"."tasks" USING "btree" ("priority");



CREATE INDEX "tasks_status_idx" ON "public"."tasks" USING "btree" ("status");



CREATE INDEX "tasks_target_idx" ON "public"."tasks" USING "btree" ("target_type", "target_id");



CREATE UNIQUE INDEX "uniq_org_announcement" ON "public"."conversations" USING "btree" ("org_id") WHERE (("type" = 'announcement'::"text") AND ("deleted_at" IS NULL));



CREATE UNIQUE INDEX "uniq_org_general" ON "public"."conversations" USING "btree" ("org_id") WHERE (("type" = 'organization'::"text") AND ("deleted_at" IS NULL));



CREATE OR REPLACE TRIGGER "conversations_updated_at" BEFORE UPDATE ON "public"."conversations" FOR EACH ROW EXECUTE FUNCTION "public"."auto_update_updated_at"();



CREATE OR REPLACE TRIGGER "messages_updated_at" BEFORE UPDATE ON "public"."messages" FOR EACH ROW EXECUTE FUNCTION "public"."auto_update_updated_at"();



CREATE OR REPLACE TRIGGER "organization_members_display_id_trigger" BEFORE INSERT ON "public"."organization_members" FOR EACH ROW EXECUTE FUNCTION "public"."set_member_display_id"();



CREATE OR REPLACE TRIGGER "set_notes_updated_at" BEFORE UPDATE ON "public"."notes" FOR EACH ROW EXECUTE FUNCTION "public"."auto_update_updated_at"();



CREATE OR REPLACE TRIGGER "set_sms_updated_at" BEFORE UPDATE ON "public"."sms" FOR EACH ROW EXECUTE FUNCTION "public"."auto_update_updated_at"();



CREATE OR REPLACE TRIGGER "set_tasks_updated_at" BEFORE UPDATE ON "public"."tasks" FOR EACH ROW EXECUTE FUNCTION "public"."auto_update_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."activities" FOR EACH ROW EXECUTE FUNCTION "public"."auto_update_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."calls" FOR EACH ROW EXECUTE FUNCTION "public"."auto_update_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."contacts" FOR EACH ROW EXECUTE FUNCTION "public"."auto_update_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."customers" FOR EACH ROW EXECUTE FUNCTION "public"."auto_update_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."deals" FOR EACH ROW EXECUTE FUNCTION "public"."auto_update_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."emails" FOR EACH ROW EXECUTE FUNCTION "public"."auto_update_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."leads" FOR EACH ROW EXECUTE FUNCTION "public"."auto_update_updated_at"();



CREATE OR REPLACE TRIGGER "trg_organizations_updated_at" BEFORE UPDATE ON "public"."organizations" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "trg_update_conversation_last_message" AFTER INSERT ON "public"."messages" FOR EACH ROW EXECUTE FUNCTION "public"."update_conversation_last_message"();



ALTER TABLE ONLY "public"."activities"
    ADD CONSTRAINT "activities_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."activities"
    ADD CONSTRAINT "activities_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."organization_members"("id");



ALTER TABLE ONLY "public"."activities"
    ADD CONSTRAINT "activities_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."activities"
    ADD CONSTRAINT "activities_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."activities"
    ADD CONSTRAINT "activities_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."calls"
    ADD CONSTRAINT "calls_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "public"."organization_members"("id");



ALTER TABLE ONLY "public"."calls"
    ADD CONSTRAINT "calls_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."calls"
    ADD CONSTRAINT "calls_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."organization_members"("id");



ALTER TABLE ONLY "public"."calls"
    ADD CONSTRAINT "calls_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."calls"
    ADD CONSTRAINT "calls_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."contacts"
    ADD CONSTRAINT "contacts_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "public"."organization_members"("id");



ALTER TABLE ONLY "public"."contacts"
    ADD CONSTRAINT "contacts_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id");



ALTER TABLE ONLY "public"."contacts"
    ADD CONSTRAINT "contacts_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."contacts"
    ADD CONSTRAINT "contacts_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."organization_members"("id");



ALTER TABLE ONLY "public"."contacts"
    ADD CONSTRAINT "contacts_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."organization_members"("id");



ALTER TABLE ONLY "public"."conversation_members"
    ADD CONSTRAINT "conversation_members_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."conversation_members"
    ADD CONSTRAINT "conversation_members_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."organization_members"("id");



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."organization_members"("id");



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_last_message_id_fkey" FOREIGN KEY ("last_message_id") REFERENCES "public"."messages"("id");



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."customers"
    ADD CONSTRAINT "customers_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "public"."organization_members"("id");



ALTER TABLE ONLY "public"."customers"
    ADD CONSTRAINT "customers_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."organization_members"("id");



ALTER TABLE ONLY "public"."customers"
    ADD CONSTRAINT "customers_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."organization_members"("id");



ALTER TABLE ONLY "public"."deals"
    ADD CONSTRAINT "deals_closed_by_fkey" FOREIGN KEY ("closed_by") REFERENCES "public"."organization_members"("id");



ALTER TABLE ONLY "public"."deals"
    ADD CONSTRAINT "deals_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id");



ALTER TABLE ONLY "public"."deals"
    ADD CONSTRAINT "deals_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "public"."organization_members"("id");



ALTER TABLE ONLY "public"."deals"
    ADD CONSTRAINT "deals_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."deals"
    ADD CONSTRAINT "deals_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."organization_members"("id");



ALTER TABLE ONLY "public"."deals"
    ADD CONSTRAINT "deals_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."organization_members"("id");



ALTER TABLE ONLY "public"."emails"
    ADD CONSTRAINT "emails_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."organization_members"("id");



ALTER TABLE ONLY "public"."customers"
    ADD CONSTRAINT "fk_customer_contact" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."customers"
    ADD CONSTRAINT "fk_customer_org" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."emails"
    ADD CONSTRAINT "fk_email_contact" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."emails"
    ADD CONSTRAINT "fk_email_customer" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."emails"
    ADD CONSTRAINT "fk_email_lead" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."emails"
    ADD CONSTRAINT "fk_email_org" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."leads"
    ADD CONSTRAINT "leads_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "public"."organization_members"("id");



ALTER TABLE ONLY "public"."leads"
    ADD CONSTRAINT "leads_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."leads"
    ADD CONSTRAINT "leads_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."organization_members"("id");



ALTER TABLE ONLY "public"."leads"
    ADD CONSTRAINT "leads_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."organization_members"("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."organization_members"("id");



ALTER TABLE ONLY "public"."notes"
    ADD CONSTRAINT "notes_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."organization_members"("id");



ALTER TABLE ONLY "public"."notes"
    ADD CONSTRAINT "notes_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "public"."organization_members"("id");



ALTER TABLE ONLY "public"."notes"
    ADD CONSTRAINT "notes_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."notes"
    ADD CONSTRAINT "notes_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."organization_members"("id");



ALTER TABLE ONLY "public"."organization_invite_acceptances"
    ADD CONSTRAINT "organization_invite_acceptances_invite_id_fkey" FOREIGN KEY ("invite_id") REFERENCES "public"."organization_invites"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organization_invite_acceptances"
    ADD CONSTRAINT "organization_invite_acceptances_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organization_invites"
    ADD CONSTRAINT "organization_invites_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organization_invites"
    ADD CONSTRAINT "organization_invites_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organization_member_counters"
    ADD CONSTRAINT "organization_member_counters_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organization_members"
    ADD CONSTRAINT "organization_members_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organization_members"
    ADD CONSTRAINT "organization_members_profile_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."refresh_tokens"
    ADD CONSTRAINT "refresh_tokens_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."refresh_tokens"
    ADD CONSTRAINT "refresh_tokens_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."refresh_tokens"
    ADD CONSTRAINT "refresh_tokens_replaced_by_id_fkey" FOREIGN KEY ("replaced_by_id") REFERENCES "public"."refresh_tokens"("id");



ALTER TABLE ONLY "public"."sms"
    ADD CONSTRAINT "sms_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."sms"
    ADD CONSTRAINT "sms_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."sms"
    ADD CONSTRAINT "sms_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sms"
    ADD CONSTRAINT "sms_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."organization_members"("id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."super_admin_audit_log"
    ADD CONSTRAINT "super_admin_audit_log_super_admin_id_fkey" FOREIGN KEY ("super_admin_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."super_admin_audit_log"
    ADD CONSTRAINT "super_admin_audit_log_target_org_id_fkey" FOREIGN KEY ("target_org_id") REFERENCES "public"."organizations"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."super_admin_audit_log"
    ADD CONSTRAINT "super_admin_audit_log_target_user_id_fkey" FOREIGN KEY ("target_user_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."super_admin_sessions"
    ADD CONSTRAINT "super_admin_sessions_super_admin_id_fkey" FOREIGN KEY ("super_admin_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "public"."organization_members"("id");



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."organization_members"("id");



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "public"."organization_members"("id");



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."organization_members"("id");



CREATE POLICY "Admins can delete conversations" ON "public"."conversations" FOR DELETE TO "authenticated" USING ((("org_id" = (("auth"."jwt"() ->> 'org_id'::"text"))::"uuid") AND ((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = 'admin'::"text")));



CREATE POLICY "Admins can delete organization activities" ON "public"."activities" FOR DELETE TO "authenticated" USING ((("org_id" = (("auth"."jwt"() ->> 'org_id'::"text"))::"uuid") AND ((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = ANY (ARRAY['owner'::"text", 'manager'::"text"]))));



CREATE POLICY "Admins can delete organization calls" ON "public"."calls" FOR DELETE TO "authenticated" USING ((("org_id" = (("auth"."jwt"() ->> 'org_id'::"text"))::"uuid") AND ((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = ANY (ARRAY['owner'::"text", 'manager'::"text"]))));



CREATE POLICY "Admins can delete organization sms messages" ON "public"."sms" FOR DELETE TO "authenticated" USING ((("org_id" = (("auth"."jwt"() ->> 'org_id'::"text"))::"uuid") AND ((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = ANY (ARRAY['owner'::"text", 'manager'::"text"]))));



CREATE POLICY "Admins can delete organization tasks" ON "public"."tasks" FOR DELETE TO "authenticated" USING ((("org_id" = (("auth"."jwt"() ->> 'org_id'::"text"))::"uuid") AND ((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = ANY (ARRAY['owner'::"text", 'manager'::"text"]))));



CREATE POLICY "Creators can update conversations" ON "public"."conversations" FOR UPDATE TO "authenticated" USING ((("org_id" = (("auth"."jwt"() ->> 'org_id'::"text"))::"uuid") AND ("created_by" = "auth"."uid"()))) WITH CHECK (("org_id" = (("auth"."jwt"() ->> 'org_id'::"text"))::"uuid"));



CREATE POLICY "Members can add conversation members" ON "public"."conversation_members" FOR INSERT TO "authenticated" WITH CHECK (("public"."is_active_current_org_member"() AND "public"."conversation_belongs_to_current_org"("conversation_id") AND "public"."member_belongs_to_current_org"("member_id")));



CREATE POLICY "Members can create conversations" ON "public"."conversations" FOR INSERT TO "authenticated" WITH CHECK ((("org_id" = (("auth"."jwt"() ->> 'org_id'::"text"))::"uuid") AND ("created_by" = (("auth"."jwt"() ->> 'member_id'::"text"))::"uuid") AND (("type" = 'direct'::"text") OR (("type" = ANY (ARRAY['organization'::"text", 'announcement'::"text"])) AND ((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = 'owner'::"text")))));



CREATE POLICY "Members can create notes" ON "public"."notes" FOR INSERT TO "authenticated" WITH CHECK ((("org_id" = (("auth"."jwt"() ->> 'org_id'::"text"))::"uuid") AND ("author_id" = (("auth"."jwt"() ->> 'member_id'::"text"))::"uuid")));



CREATE POLICY "Members can create organization activities" ON "public"."activities" FOR INSERT TO "authenticated" WITH CHECK ((("org_id" = (("auth"."jwt"() ->> 'org_id'::"text"))::"uuid") AND ("created_by" = (("auth"."jwt"() ->> 'member_id'::"text"))::"uuid")));



CREATE POLICY "Members can create organization calls" ON "public"."calls" FOR INSERT TO "authenticated" WITH CHECK ((("org_id" = (("auth"."jwt"() ->> 'org_id'::"text"))::"uuid") AND ("created_by" = (("auth"."jwt"() ->> 'member_id'::"text"))::"uuid")));



CREATE POLICY "Members can create organization contacts" ON "public"."contacts" FOR INSERT TO "authenticated" WITH CHECK ((("org_id" = (("auth"."jwt"() ->> 'org_id'::"text"))::"uuid") AND ("owner_id" = (("auth"."jwt"() ->> 'member_id'::"text"))::"uuid")));



CREATE POLICY "Members can create organization customers" ON "public"."customers" FOR INSERT TO "authenticated" WITH CHECK ((("org_id" = (("auth"."jwt"() ->> 'org_id'::"text"))::"uuid") AND ("owner_id" = (("auth"."jwt"() ->> 'member_id'::"text"))::"uuid")));



CREATE POLICY "Members can create organization deals" ON "public"."deals" FOR INSERT TO "authenticated" WITH CHECK ((("org_id" = (("auth"."jwt"() ->> 'org_id'::"text"))::"uuid") AND ("owner_id" = (("auth"."jwt"() ->> 'member_id'::"text"))::"uuid")));



CREATE POLICY "Members can create organization emails" ON "public"."emails" FOR INSERT TO "authenticated" WITH CHECK ((("org_id" = (("auth"."jwt"() ->> 'org_id'::"text"))::"uuid") AND ("sender_id" = (("auth"."jwt"() ->> 'member_id'::"text"))::"uuid")));



CREATE POLICY "Members can create organization leads" ON "public"."leads" FOR INSERT TO "authenticated" WITH CHECK ((("org_id" = (("auth"."jwt"() ->> 'org_id'::"text"))::"uuid") AND ("owner_id" = (("auth"."jwt"() ->> 'member_id'::"text"))::"uuid")));



CREATE POLICY "Members can create organization sms messages" ON "public"."sms" FOR INSERT TO "authenticated" WITH CHECK ((("org_id" = (("auth"."jwt"() ->> 'org_id'::"text"))::"uuid") AND ("sender_id" = (("auth"."jwt"() ->> 'member_id'::"text"))::"uuid")));



CREATE POLICY "Members can create organization tasks" ON "public"."tasks" FOR INSERT TO "authenticated" WITH CHECK ((("org_id" = (("auth"."jwt"() ->> 'org_id'::"text"))::"uuid") AND ("author_id" = (("auth"."jwt"() ->> 'member_id'::"text"))::"uuid")));



CREATE POLICY "Members can send messages" ON "public"."messages" FOR INSERT TO "authenticated" WITH CHECK ((("sender_id" = (("auth"."jwt"() ->> 'member_id'::"text"))::"uuid") AND "public"."is_conversation_member"("conversation_id", (("auth"."jwt"() ->> 'member_id'::"text"))::"uuid")));



CREATE POLICY "Members can update accessible calls" ON "public"."calls" TO "authenticated" USING ((("org_id" = (("auth"."jwt"() ->> 'org_id'::"text"))::"uuid") AND (("created_by" = (("auth"."jwt"() ->> 'member_id'::"text"))::"uuid") OR ("assigned_to" = (("auth"."jwt"() ->> 'member_id'::"text"))::"uuid")))) WITH CHECK ((("org_id" = (("auth"."jwt"() ->> 'org_id'::"text"))::"uuid") AND (("created_by" = (("auth"."jwt"() ->> 'member_id'::"text"))::"uuid") OR ("assigned_to" = (("auth"."jwt"() ->> 'member_id'::"text"))::"uuid"))));



CREATE POLICY "Members can update accessible tasks" ON "public"."tasks" FOR UPDATE TO "authenticated" USING ((("org_id" = (("auth"."jwt"() ->> 'org_id'::"text"))::"uuid") AND (("author_id" = (("auth"."jwt"() ->> 'member_id'::"text"))::"uuid") OR ("assigned_to" = (("auth"."jwt"() ->> 'member_id'::"text"))::"uuid")))) WITH CHECK (("org_id" = (("auth"."jwt"() ->> 'org_id'::"text"))::"uuid"));



CREATE POLICY "Members can update organization" ON "public"."organizations" FOR UPDATE TO "authenticated" USING (("id" = (("auth"."jwt"() ->> 'org_id'::"text"))::"uuid")) WITH CHECK (("id" = (("auth"."jwt"() ->> 'org_id'::"text"))::"uuid"));



CREATE POLICY "Members can update organization activities" ON "public"."activities" FOR UPDATE TO "authenticated" USING ((("org_id" = (("auth"."jwt"() ->> 'org_id'::"text"))::"uuid") AND ("created_by" = (("auth"."jwt"() ->> 'member_id'::"text"))::"uuid"))) WITH CHECK ((("org_id" = (("auth"."jwt"() ->> 'org_id'::"text"))::"uuid") AND ("created_by" = (("auth"."jwt"() ->> 'member_id'::"text"))::"uuid")));



CREATE POLICY "Members can update organization contacts" ON "public"."contacts" FOR UPDATE TO "authenticated" USING (("org_id" = (("auth"."jwt"() ->> 'org_id'::"text"))::"uuid")) WITH CHECK (("org_id" = (("auth"."jwt"() ->> 'org_id'::"text"))::"uuid"));



CREATE POLICY "Members can update organization customers" ON "public"."customers" FOR UPDATE TO "authenticated" USING (("org_id" = (("auth"."jwt"() ->> 'org_id'::"text"))::"uuid")) WITH CHECK (("org_id" = (("auth"."jwt"() ->> 'org_id'::"text"))::"uuid"));



CREATE POLICY "Members can update organization deals" ON "public"."deals" FOR UPDATE TO "authenticated" USING (("org_id" = (("auth"."jwt"() ->> 'org_id'::"text"))::"uuid")) WITH CHECK (("org_id" = (("auth"."jwt"() ->> 'org_id'::"text"))::"uuid"));



CREATE POLICY "Members can update organization emails" ON "public"."emails" TO "authenticated" USING (("org_id" = (("auth"."jwt"() ->> 'org_id'::"text"))::"uuid")) WITH CHECK (("org_id" = (("auth"."jwt"() ->> 'org_id'::"text"))::"uuid"));



CREATE POLICY "Members can update organization leads" ON "public"."leads" FOR UPDATE TO "authenticated" USING (("org_id" = (("auth"."jwt"() ->> 'org_id'::"text"))::"uuid")) WITH CHECK (("org_id" = (("auth"."jwt"() ->> 'org_id'::"text"))::"uuid"));



CREATE POLICY "Members can update their conversation memberships" ON "public"."conversation_members" FOR UPDATE TO "authenticated" USING (("member_id" = (("auth"."jwt"() ->> 'member_id'::"text"))::"uuid")) WITH CHECK (("member_id" = (("auth"."jwt"() ->> 'member_id'::"text"))::"uuid"));



CREATE POLICY "Members can view accessible notes" ON "public"."notes" FOR SELECT TO "authenticated" USING (("org_id" = (("auth"."jwt"() ->> 'org_id'::"text"))::"uuid"));



CREATE POLICY "Members can view accessible organization tasks" ON "public"."tasks" FOR SELECT TO "authenticated" USING ((("org_id" = (("auth"."jwt"() ->> 'org_id'::"text"))::"uuid") AND ((("visibility")::"text" = 'public'::"text") OR ("author_id" = (("auth"."jwt"() ->> 'member_id'::"text"))::"uuid") OR ("assigned_to" = (("auth"."jwt"() ->> 'member_id'::"text"))::"uuid"))));



CREATE POLICY "Members can view all members of their conversations" ON "public"."conversation_members" FOR SELECT TO "authenticated" USING ("public"."is_conversation_member"("conversation_id", (("auth"."jwt"() ->> 'member_id'::"text"))::"uuid"));



CREATE POLICY "Members can view conversation members" ON "public"."conversation_members" FOR DELETE TO "authenticated" USING ("public"."is_conversation_member"("conversation_id", (("auth"."jwt"() ->> 'member_id'::"text"))::"uuid"));



CREATE POLICY "Members can view conversation messages" ON "public"."messages" FOR SELECT TO "authenticated" USING ("public"."is_conversation_member"("conversation_id", (("auth"."jwt"() ->> 'member_id'::"text"))::"uuid"));



CREATE POLICY "Members can view organization" ON "public"."organizations" FOR SELECT TO "authenticated" USING (("id" = (("auth"."jwt"() ->> 'org_id'::"text"))::"uuid"));



CREATE POLICY "Members can view organization activities" ON "public"."activities" FOR SELECT TO "authenticated" USING (("org_id" = (("auth"."jwt"() ->> 'org_id'::"text"))::"uuid"));



CREATE POLICY "Members can view organization calls" ON "public"."calls" FOR SELECT TO "authenticated" USING (("org_id" = (("auth"."jwt"() ->> 'org_id'::"text"))::"uuid"));



CREATE POLICY "Members can view organization contacts" ON "public"."contacts" FOR SELECT TO "authenticated" USING (("org_id" = (("auth"."jwt"() ->> 'org_id'::"text"))::"uuid"));



CREATE POLICY "Members can view organization customers" ON "public"."customers" FOR SELECT TO "authenticated" USING (("org_id" = (("auth"."jwt"() ->> 'org_id'::"text"))::"uuid"));



CREATE POLICY "Members can view organization deals" ON "public"."deals" FOR SELECT TO "authenticated" USING (("org_id" = (("auth"."jwt"() ->> 'org_id'::"text"))::"uuid"));



CREATE POLICY "Members can view organization emails" ON "public"."emails" FOR SELECT TO "authenticated" USING (("org_id" = (("auth"."jwt"() ->> 'org_id'::"text"))::"uuid"));



CREATE POLICY "Members can view organization invites" ON "public"."organization_invites" FOR SELECT TO "authenticated" USING (("org_id" IN ( SELECT "organization_invites"."org_id"
   FROM "public"."organization_members"
  WHERE (("organization_members"."profile_id" = "auth"."uid"()) AND ("organization_members"."status" = 'active'::"text")))));



CREATE POLICY "Members can view organization leads" ON "public"."leads" FOR SELECT TO "authenticated" USING (("org_id" = (("auth"."jwt"() ->> 'org_id'::"text"))::"uuid"));



CREATE POLICY "Members can view organization members" ON "public"."organization_members" FOR SELECT TO "authenticated" USING ("public"."is_org_member"("org_id"));



CREATE POLICY "Members can view organization sms messages" ON "public"."sms" FOR SELECT TO "authenticated" USING (("org_id" = (("auth"."jwt"() ->> 'org_id'::"text"))::"uuid"));



CREATE POLICY "Members can view organization subscription" ON "public"."subscriptions" FOR SELECT TO "authenticated" USING (("org_id" = (("auth"."jwt"() ->> 'org_id'::"text"))::"uuid"));



CREATE POLICY "Members can view their conversation memberships" ON "public"."conversation_members" FOR SELECT TO "authenticated" USING (("member_id" = ( SELECT "organization_members"."id"
   FROM "public"."organization_members"
  WHERE ("organization_members"."profile_id" = "auth"."uid"()))));



CREATE POLICY "Members can view their conversations" ON "public"."conversations" FOR SELECT TO "authenticated" USING ("public"."is_conversation_member"("id", (("auth"."jwt"() ->> 'member_id'::"text"))::"uuid"));



CREATE POLICY "No deletes" ON "public"."organizations" FOR DELETE TO "authenticated" USING (false);



CREATE POLICY "Organization members can view invite acceptances" ON "public"."organization_invite_acceptances" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."organization_invites" "i"
     JOIN "public"."organization_members" "om" ON (("om"."org_id" = "i"."org_id")))
  WHERE (("i"."id" = "organization_invite_acceptances"."invite_id") AND ("om"."profile_id" = "auth"."uid"())))));



CREATE POLICY "Organization members can view profiles" ON "public"."profiles" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."organization_members" "om"
  WHERE (("om"."profile_id" = "profiles"."id") AND ("om"."org_id" = (("auth"."jwt"() ->> 'org_id'::"text"))::"uuid") AND ("om"."deleted_at" IS NULL)))));



CREATE POLICY "Owners and Managers can delete organization contacts" ON "public"."contacts" FOR DELETE TO "authenticated" USING ((("org_id" = (("auth"."jwt"() ->> 'org_id'::"text"))::"uuid") AND ((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = ANY (ARRAY['owner'::"text", 'manager'::"text"]))));



CREATE POLICY "Owners and Managers can delete organization customers" ON "public"."customers" FOR DELETE TO "authenticated" USING ((("org_id" = (("auth"."jwt"() ->> 'org_id'::"text"))::"uuid") AND ((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = ANY (ARRAY['owner'::"text", 'manager'::"text"]))));



CREATE POLICY "Owners and Managers can delete organization deals" ON "public"."deals" FOR DELETE TO "authenticated" USING ((("org_id" = (("auth"."jwt"() ->> 'org_id'::"text"))::"uuid") AND ((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = ANY (ARRAY['owner'::"text", 'manager'::"text"]))));



CREATE POLICY "Owners and Managers can delete organization emails" ON "public"."emails" FOR DELETE TO "authenticated" USING ((("org_id" = (("auth"."jwt"() ->> 'org_id'::"text"))::"uuid") AND ((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = ANY (ARRAY['owner'::"text", 'manager'::"text"]))));



CREATE POLICY "Owners and Managers can delete organization leads" ON "public"."leads" FOR DELETE TO "authenticated" USING ((("org_id" = (("auth"."jwt"() ->> 'org_id'::"text"))::"uuid") AND ((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = ANY (ARRAY['owner'::"text", 'manager'::"text"]))));



CREATE POLICY "Owners and managers can create invites" ON "public"."organization_invites" FOR INSERT TO "authenticated" WITH CHECK (("org_id" IN ( SELECT "organization_invites"."org_id"
   FROM "public"."organization_members"
  WHERE (("organization_members"."profile_id" = "auth"."uid"()) AND ("organization_members"."status" = 'active'::"text") AND ("organization_members"."role" = ANY (ARRAY['owner'::"text", 'manager'::"text"]))))));



CREATE POLICY "Owners and managers can delete invites" ON "public"."organization_invites" FOR DELETE TO "authenticated" USING (("org_id" IN ( SELECT "organization_invites"."org_id"
   FROM "public"."organization_members"
  WHERE (("organization_members"."profile_id" = "auth"."uid"()) AND ("organization_members"."status" = 'active'::"text") AND ("organization_members"."role" = ANY (ARRAY['owner'::"text", 'manager'::"text"]))))));



CREATE POLICY "Owners and managers can update invites" ON "public"."organization_invites" FOR UPDATE TO "authenticated" USING (("org_id" IN ( SELECT "organization_invites"."org_id"
   FROM "public"."organization_members"
  WHERE (("organization_members"."profile_id" = "auth"."uid"()) AND ("organization_members"."status" = 'active'::"text") AND ("organization_members"."role" = ANY (ARRAY['owner'::"text", 'manager'::"text"])))))) WITH CHECK (("org_id" IN ( SELECT "organization_invites"."org_id"
   FROM "public"."organization_members"
  WHERE (("organization_members"."profile_id" = "auth"."uid"()) AND ("organization_members"."status" = 'active'::"text") AND ("organization_members"."role" = ANY (ARRAY['owner'::"text", 'manager'::"text"]))))));



CREATE POLICY "Owners and managers can update members" ON "public"."organization_members" FOR UPDATE TO "authenticated" USING ("public"."has_org_role"("org_id", ARRAY['owner'::"text", 'manager'::"text"])) WITH CHECK ("public"."has_org_role"("org_id", ARRAY['owner'::"text", 'manager'::"text"]));



CREATE POLICY "Owners can add organization members" ON "public"."organization_members" FOR INSERT TO "authenticated" WITH CHECK ("public"."has_org_role"("org_id", ARRAY['owner'::"text"]));



CREATE POLICY "Owners can create subscription" ON "public"."subscriptions" FOR INSERT TO "authenticated" WITH CHECK ((("org_id" = (("auth"."jwt"() ->> 'org_id'::"text"))::"uuid") AND ((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = 'owner'::"text")));



CREATE POLICY "Owners can delete subscription" ON "public"."subscriptions" FOR DELETE TO "authenticated" USING ((("org_id" = (("auth"."jwt"() ->> 'org_id'::"text"))::"uuid") AND ((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = 'owner'::"text")));



CREATE POLICY "Owners can remove organization members" ON "public"."organization_members" FOR DELETE TO "authenticated" USING ("public"."has_org_role"("org_id", ARRAY['owner'::"text"]));



CREATE POLICY "Owners can update subscription" ON "public"."subscriptions" FOR UPDATE TO "authenticated" USING ((("org_id" = (("auth"."jwt"() ->> 'org_id'::"text"))::"uuid") AND ((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = 'owner'::"text"))) WITH CHECK ((("org_id" = (("auth"."jwt"() ->> 'org_id'::"text"))::"uuid") AND ((("auth"."jwt"() -> 'user_metadata'::"text") ->> 'role'::"text") = 'owner'::"text")));



CREATE POLICY "Users can create their own profile" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can delete own messages" ON "public"."messages" FOR DELETE TO "authenticated" USING (("sender_id" = (("auth"."jwt"() ->> 'member_id'::"text"))::"uuid"));



CREATE POLICY "Users can delete own notes" ON "public"."notes" FOR DELETE TO "authenticated" USING ((("org_id" = (("auth"."jwt"() ->> 'org_id'::"text"))::"uuid") AND ("author_id" = (("auth"."jwt"() ->> 'member_id'::"text"))::"uuid")));



CREATE POLICY "Users can record their own invite acceptance" ON "public"."organization_invite_acceptances" FOR INSERT TO "authenticated" WITH CHECK (("profile_id" = "auth"."uid"()));



CREATE POLICY "Users can update own messages" ON "public"."messages" FOR UPDATE TO "authenticated" USING (("sender_id" = (("auth"."jwt"() ->> 'member_id'::"text"))::"uuid")) WITH CHECK (("sender_id" = (("auth"."jwt"() ->> 'member_id'::"text"))::"uuid"));



CREATE POLICY "Users can update own notes" ON "public"."notes" FOR UPDATE TO "authenticated" USING ((("org_id" = (("auth"."jwt"() ->> 'org_id'::"text"))::"uuid") AND ("author_id" = (("auth"."jwt"() ->> 'member_id'::"text"))::"uuid"))) WITH CHECK ((("org_id" = (("auth"."jwt"() ->> 'org_id'::"text"))::"uuid") AND ("author_id" = (("auth"."jwt"() ->> 'member_id'::"text"))::"uuid")));



CREATE POLICY "Users can update own profile" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("id" = "auth"."uid"())) WITH CHECK (("id" = "auth"."uid"()));



CREATE POLICY "Users can view their own profile" ON "public"."profiles" FOR SELECT TO "authenticated" USING (("id" = "auth"."uid"()));



ALTER TABLE "public"."activities" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."calls" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."contacts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."conversation_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."conversations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."customers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."deals" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "deny_all_refresh_tokens" ON "public"."refresh_tokens" USING (false);



ALTER TABLE "public"."emails" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."feedbacks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."leads" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."organization_invite_acceptances" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."organization_invites" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."organization_member_counters" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."organization_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."organizations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."refresh_tokens" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sms" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."subscriptions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."super_admin_audit_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."super_admin_sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tasks" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."auto_update_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."auto_update_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."auto_update_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."cleanup_old_activities"() TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_old_activities"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_old_activities"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."conversation_belongs_to_current_org"("target_conversation_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."conversation_belongs_to_current_org"("target_conversation_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."conversation_belongs_to_current_org"("target_conversation_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."conversation_belongs_to_current_org"("target_conversation_id" "uuid") TO "service_role";



GRANT ALL ON TABLE "public"."super_admin_sessions" TO "anon";
GRANT ALL ON TABLE "public"."super_admin_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."super_admin_sessions" TO "service_role";



GRANT ALL ON FUNCTION "public"."create_super_admin_session"("p_admin_id" "uuid", "p_token" "text", "p_ip" "text", "p_ua" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_super_admin_session"("p_admin_id" "uuid", "p_token" "text", "p_ip" "text", "p_ua" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_super_admin_session"("p_admin_id" "uuid", "p_token" "text", "p_ip" "text", "p_ua" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_super_admin_session"("p_token" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."delete_super_admin_session"("p_token" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_super_admin_session"("p_token" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_member_code"("p_org_id" "uuid", "p_role" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."generate_member_code"("p_org_id" "uuid", "p_role" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_member_code"("p_org_id" "uuid", "p_role" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_org_display_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_org_display_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_org_display_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_profile_display_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_profile_display_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_profile_display_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."has_org_role"("target_org_id" "uuid", "allowed_roles" "text"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."has_org_role"("target_org_id" "uuid", "allowed_roles" "text"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_org_role"("target_org_id" "uuid", "allowed_roles" "text"[]) TO "service_role";



REVOKE ALL ON FUNCTION "public"."is_active_current_org_member"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."is_active_current_org_member"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_active_current_org_member"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_active_current_org_member"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_conversation_member"("p_conversation_id" "uuid", "p_profile_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_conversation_member"("p_conversation_id" "uuid", "p_profile_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_conversation_member"("p_conversation_id" "uuid", "p_profile_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_current_org_member"("target_member_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_current_org_member"("target_member_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_current_org_member"("target_member_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_org_member"("target_org_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_org_member"("target_org_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_org_member"("target_org_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."log_super_admin_event"("p_event_type" "text", "p_super_admin_id" "uuid", "p_ip_address" "text", "p_details" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."log_super_admin_event"("p_event_type" "text", "p_super_admin_id" "uuid", "p_ip_address" "text", "p_details" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_super_admin_event"("p_event_type" "text", "p_super_admin_id" "uuid", "p_ip_address" "text", "p_details" "jsonb") TO "service_role";



REVOKE ALL ON FUNCTION "public"."member_belongs_to_current_org"("target_member_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."member_belongs_to_current_org"("target_member_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."member_belongs_to_current_org"("target_member_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."member_belongs_to_current_org"("target_member_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_member_display_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_member_display_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_member_display_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_admin_last_login"("p_admin_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."update_admin_last_login"("p_admin_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_admin_last_login"("p_admin_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_conversation_last_message"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_conversation_last_message"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_conversation_last_message"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_super_admin_activity"("p_token" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."update_super_admin_activity"("p_token" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_super_admin_activity"("p_token" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_super_admin_last_login"("p_admin_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."update_super_admin_last_login"("p_admin_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_super_admin_last_login"("p_admin_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."verify_super_admin_session"("p_token" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."verify_super_admin_session"("p_token" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."verify_super_admin_session"("p_token" "text") TO "service_role";



GRANT ALL ON TABLE "public"."activities" TO "anon";
GRANT ALL ON TABLE "public"."activities" TO "authenticated";
GRANT ALL ON TABLE "public"."activities" TO "service_role";



GRANT ALL ON TABLE "public"."calls" TO "anon";
GRANT ALL ON TABLE "public"."calls" TO "authenticated";
GRANT ALL ON TABLE "public"."calls" TO "service_role";



GRANT ALL ON TABLE "public"."contacts" TO "anon";
GRANT ALL ON TABLE "public"."contacts" TO "authenticated";
GRANT ALL ON TABLE "public"."contacts" TO "service_role";



GRANT ALL ON TABLE "public"."conversation_members" TO "anon";
GRANT ALL ON TABLE "public"."conversation_members" TO "authenticated";
GRANT ALL ON TABLE "public"."conversation_members" TO "service_role";



GRANT ALL ON TABLE "public"."conversations" TO "anon";
GRANT ALL ON TABLE "public"."conversations" TO "authenticated";
GRANT ALL ON TABLE "public"."conversations" TO "service_role";



GRANT ALL ON TABLE "public"."customers" TO "anon";
GRANT ALL ON TABLE "public"."customers" TO "authenticated";
GRANT ALL ON TABLE "public"."customers" TO "service_role";



GRANT ALL ON TABLE "public"."deals" TO "anon";
GRANT ALL ON TABLE "public"."deals" TO "authenticated";
GRANT ALL ON TABLE "public"."deals" TO "service_role";



GRANT ALL ON TABLE "public"."emails" TO "anon";
GRANT ALL ON TABLE "public"."emails" TO "authenticated";
GRANT ALL ON TABLE "public"."emails" TO "service_role";



GRANT ALL ON TABLE "public"."feedbacks" TO "anon";
GRANT ALL ON TABLE "public"."feedbacks" TO "authenticated";
GRANT ALL ON TABLE "public"."feedbacks" TO "service_role";



GRANT ALL ON TABLE "public"."leads" TO "anon";
GRANT ALL ON TABLE "public"."leads" TO "authenticated";
GRANT ALL ON TABLE "public"."leads" TO "service_role";



GRANT ALL ON TABLE "public"."messages" TO "anon";
GRANT ALL ON TABLE "public"."messages" TO "authenticated";
GRANT ALL ON TABLE "public"."messages" TO "service_role";



GRANT ALL ON TABLE "public"."notes" TO "anon";
GRANT ALL ON TABLE "public"."notes" TO "authenticated";
GRANT ALL ON TABLE "public"."notes" TO "service_role";



GRANT ALL ON TABLE "public"."organization_invite_acceptances" TO "anon";
GRANT ALL ON TABLE "public"."organization_invite_acceptances" TO "authenticated";
GRANT ALL ON TABLE "public"."organization_invite_acceptances" TO "service_role";



GRANT ALL ON TABLE "public"."organization_invites" TO "anon";
GRANT ALL ON TABLE "public"."organization_invites" TO "authenticated";
GRANT ALL ON TABLE "public"."organization_invites" TO "service_role";



GRANT ALL ON TABLE "public"."organization_member_counters" TO "anon";
GRANT ALL ON TABLE "public"."organization_member_counters" TO "authenticated";
GRANT ALL ON TABLE "public"."organization_member_counters" TO "service_role";



GRANT ALL ON TABLE "public"."organization_members" TO "anon";
GRANT ALL ON TABLE "public"."organization_members" TO "authenticated";
GRANT ALL ON TABLE "public"."organization_members" TO "service_role";



GRANT ALL ON TABLE "public"."organizations" TO "anon";
GRANT ALL ON TABLE "public"."organizations" TO "authenticated";
GRANT ALL ON TABLE "public"."organizations" TO "service_role";



GRANT ALL ON SEQUENCE "public"."profile_display_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."profile_display_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."profile_display_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."refresh_tokens" TO "anon";
GRANT ALL ON TABLE "public"."refresh_tokens" TO "authenticated";
GRANT ALL ON TABLE "public"."refresh_tokens" TO "service_role";



GRANT ALL ON TABLE "public"."sms" TO "anon";
GRANT ALL ON TABLE "public"."sms" TO "authenticated";
GRANT ALL ON TABLE "public"."sms" TO "service_role";



GRANT ALL ON TABLE "public"."subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."subscriptions" TO "service_role";



GRANT ALL ON TABLE "public"."super_admin_audit_log" TO "anon";
GRANT ALL ON TABLE "public"."super_admin_audit_log" TO "authenticated";
GRANT ALL ON TABLE "public"."super_admin_audit_log" TO "service_role";



GRANT ALL ON TABLE "public"."tasks" TO "anon";
GRANT ALL ON TABLE "public"."tasks" TO "authenticated";
GRANT ALL ON TABLE "public"."tasks" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







