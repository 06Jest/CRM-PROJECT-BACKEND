SET local check_function_bodies = off;

CREATE EXTENSION "pg_cron";

CREATE SEQUENCE "public"."profile_display_id_seq" AS bigint INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1 NO CYCLE;

CREATE TABLE "public"."activities" (
  "id"          uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "org_id"      uuid                     NOT NULL,
  "lead_id"     uuid,
  "contact_id"  uuid,
  "customer_id" uuid,
  "created_by"  uuid                     NOT NULL,
  "type"        text                     NOT NULL,
  "action"      text                     NOT NULL,
  "title"       text                     NOT NULL,
  "description" text,
  "created_at"  timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"  timestamp with time zone NOT NULL DEFAULT now(),
  "deleted_at"  timestamp with time zone,
  "target_name" text,
  CONSTRAINT "activities_action_check"
    CHECK ((action = ANY (ARRAY['created'::text, 'updated'::text, 'deleted'::text, 'assigned'::text, 'completed'::text, 'cancelled'::text, 'started'::text, 'sent'::text]))),
  CONSTRAINT "activities_pkey" PRIMARY KEY (id),
  CONSTRAINT "activities_target_type_check"
    CHECK
    ((type = ANY (ARRAY['meeting'::text, 'visit'::text, 'follow_up'::text, 'other'::text, 'lead'::text, 'contact'::text, 'deal'::text, 'customer'::text, 'task'::text, 'call'::text,
    'note'::text, 'sms'::text, 'email'::text, 'system'::text])))
);

ALTER TABLE "public"."activities"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."calls" (
  "id"               uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "org_id"           uuid                     NOT NULL,
  "lead_id"          uuid,
  "contact_id"       uuid,
  "created_by"       uuid                     NOT NULL,
  "assigned_to"      uuid                     NOT NULL,
  "subject"          text                     NOT NULL,
  "notes"            character varying(5000),
  "type"             text                     NOT NULL,
  "status"           text                     NOT NULL DEFAULT 'scheduled'::text,
  "outcome"          text,
  "priority"         text                     NOT NULL DEFAULT 'medium'::text,
  "scheduled_for"    timestamp with time zone,
  "started_at"       timestamp with time zone,
  "ended_at"         timestamp with time zone,
  "duration_seconds" integer,
  "created_at"       timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"       timestamp with time zone NOT NULL DEFAULT now(),
  "deleted_at"       timestamp with time zone,
  "direction"        text                     NOT NULL DEFAULT 'outbound'::text,
  CONSTRAINT "calls_direction_check" CHECK ((direction = ANY (ARRAY['inbound'::text, 'outbound'::text]))),
  CONSTRAINT "calls_outcome_check"
    CHECK (((outcome IS NULL) OR (outcome = ANY (ARRAY['interested'::text, 'not_interested'::text, 'callback_requested'::text, 'resolved'::text, 'other'::text])))),
  CONSTRAINT "calls_owner_check" CHECK ((((lead_id IS NOT NULL) AND (contact_id IS NULL)) OR ((lead_id IS NULL) AND (contact_id IS NOT NULL)))),
  CONSTRAINT "calls_pkey" PRIMARY KEY (id),
  CONSTRAINT "calls_priority_check" CHECK ((priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text]))),
  CONSTRAINT "calls_status_check" CHECK ((status = ANY (ARRAY['scheduled'::text, 'dialing'::text, 'ringing'::text, 'active'::text, 'completed'::text, 'cancelled'::text]))),
  CONSTRAINT "calls_type_check" CHECK ((type = ANY (ARRAY['sales'::text, 'follow_up'::text, 'support'::text, 'demo'::text, 'onboarding'::text, 'renewal'::text, 'other'::text])))
);

ALTER TABLE "public"."calls"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."contacts" (
  "id"                     uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "email"                  text,
  "phone"                  text,
  "company_name"           text                     NOT NULL DEFAULT 'not provided'::text,
  "position"               text                     NOT NULL DEFAULT 'not provided'::text,
  "status"                 text                     NOT NULL DEFAULT 'Lead'::text,
  "owner_id"               uuid                     NOT NULL,
  "org_id"                 uuid                     NOT NULL,
  "created_at"             timestamp with time zone DEFAULT now(),
  "updated_at"             timestamp with time zone DEFAULT now(),
  "owner_name"             text                     NOT NULL DEFAULT ''::text,
  "first_name"             text                     NOT NULL,
  "last_name"              text                     NOT NULL,
  "suffix"                 text,
  "gender"                 text                     NOT NULL DEFAULT 'Prefer not to say'::text,
  "birth_date"             date,
  "department"             text,
  "priority"               text                     NOT NULL DEFAULT 'Low'::text,
  "notes"                  character varying(5000),
  "source"                 text                     NOT NULL DEFAULT 'Other'::text,
  "lead_id"                uuid,
  "deleted_at"             timestamp with time zone,
  "deleted_by"             uuid,
  "updated_by"             uuid,
  "linkedin"               character varying(100),
  "facebook"               character varying(100),
  "instagram"              character varying(100),
  "tiktok"                 character varying(100),
  "x"                      character varying(100),
  "telegram"               character varying(100),
  "whatsapp"               character varying(20),
  "viber"                  character varying(20),
  "industry"               character varying(100),
  "website"                text,
  "address"                text,
  "city"                   character varying(100),
  "country"                character varying(100),
  "latitude"               numeric(10,8),
  "longitude"              numeric(11,8),
  "preferred_contact_time" text                     DEFAULT '''Anytime'''::text,
  CONSTRAINT "chk_contact_address" CHECK (((address IS NULL) OR (address = ''::text) OR (length(TRIM(BOTH FROM address)) > 0))),
  CONSTRAINT "chk_contact_city" CHECK (((city IS NULL) OR ((city)::text = ''::text) OR (length(TRIM(BOTH FROM city)) > 0))),
  CONSTRAINT "chk_contact_country" CHECK (((country IS NULL) OR ((country)::text = ''::text) OR (length(TRIM(BOTH FROM country)) > 0))),
  CONSTRAINT "chk_contact_latitude" CHECK (((latitude IS NULL) OR ((latitude >= ('-90'::integer)::numeric) AND (latitude <= (90)::numeric)))),
  CONSTRAINT "chk_contact_longitude" CHECK (((longitude IS NULL) OR ((longitude >= ('-180'::integer)::numeric) AND (longitude <= (180)::numeric)))),
  CONSTRAINT "chk_contact_website" CHECK (((website IS NULL) OR (website = ''::text) OR (length(TRIM(BOTH FROM website)) > 0))),
  CONSTRAINT "contacts_company_name_length_check" CHECK ((char_length(company_name) <= 255)),
  CONSTRAINT "contacts_department_length_check" CHECK ((char_length(department) <= 100)),
  CONSTRAINT "contacts_email_length_check" CHECK ((char_length(email) <= 254)),
  CONSTRAINT "contacts_email_or_phone_required" CHECK (((email IS NOT NULL) OR (phone IS NOT NULL))),
  CONSTRAINT "contacts_facebook_check" CHECK (((facebook IS NULL) OR ((TRIM(BOTH FROM facebook) = (facebook)::text) AND ((facebook)::text ~ '^[A-Za-z0-9._-]{2,100}$'::text)))),
  CONSTRAINT "contacts_first_name_length_check" CHECK ((char_length(first_name) <= 100)),
  CONSTRAINT "contacts_gender_length_check" CHECK ((char_length(gender) <= 30)),
  CONSTRAINT "contacts_gender_values_check" CHECK ((gender = ANY (ARRAY['Male'::text, 'Female'::text, 'Prefer not to say'::text]))),
  CONSTRAINT "contacts_industry_length_check" CHECK (((industry IS NULL) OR (char_length(TRIM(BOTH FROM industry)) <= 100))),
  CONSTRAINT "contacts_instagram_check"
    CHECK (((instagram IS NULL) OR ((TRIM(BOTH FROM instagram) = (instagram)::text) AND ((instagram)::text ~ '^[A-Za-z0-9._-]{2,100}$'::text)))),
  CONSTRAINT "contacts_last_name_length_check" CHECK ((char_length(last_name) <= 100)),
  CONSTRAINT "contacts_linkedin_check" CHECK (((linkedin IS NULL) OR ((TRIM(BOTH FROM linkedin) = (linkedin)::text) AND ((linkedin)::text ~ '^[A-Za-z0-9._-]{2,100}$'::text)))),
  CONSTRAINT "contacts_notes_length_check" CHECK ((char_length((notes)::text) <= 5000)),
  CONSTRAINT "contacts_owner_name_length_check" CHECK ((char_length(owner_name) <= 100)),
  CONSTRAINT "contacts_phone_length_check" CHECK ((char_length(phone) <= 30)),
  CONSTRAINT "contacts_pkey" PRIMARY KEY (id),
  CONSTRAINT "contacts_position_length_check" CHECK ((char_length("position") <= 100)),
  CONSTRAINT "contacts_preferred_contact_time_check"
    CHECK
    (((preferred_contact_time IS NULL) OR (preferred_contact_time = ANY (ARRAY[('Morning'::character varying)::text, ('Afternoon'::character varying)::text, ('Evening'::character
    varying)::text, ('Anytime'::character varying)::text])))),
  CONSTRAINT "contacts_priority_length_check" CHECK ((char_length(priority) <= 20)),
  CONSTRAINT "contacts_priority_values_check" CHECK ((priority = ANY (ARRAY['Low'::text, 'High'::text, 'Highest'::text]))),
  CONSTRAINT "contacts_source_length_check" CHECK ((char_length(source) <= 50)),
  CONSTRAINT "contacts_source_values_check"
    CHECK
    ((source = ANY (ARRAY['Website'::text, 'Referral'::text, 'Facebook'::text, 'Instagram'::text, 'LinkedIn'::text, 'Google Search'::text, 'Google Ads'::text,
    'Email Campaign'::text,
    'Cold Call'::text,
    'Trade Show'::text,
    'Webinar'::text,
    'Partner'::text,
    'Walk-in'::text,
    'WhatsApp'::text,
    'Messenger'::text, 'Personal Network'::text, 'Direct Conversation'::text, 'Networking Event'::text, 'Conference'::text, 'Friend'::text, 'Family'::text, 'Other'::text]))),
  CONSTRAINT "contacts_suffix_length_check" CHECK ((char_length(suffix) <= 20)),
  CONSTRAINT "contacts_telegram_check" CHECK (((telegram IS NULL) OR ((TRIM(BOTH FROM telegram) = (telegram)::text) AND ((telegram)::text ~ '^[A-Za-z0-9._-]{2,100}$'::text)))),
  CONSTRAINT "contacts_tiktok_check" CHECK (((tiktok IS NULL) OR ((TRIM(BOTH FROM tiktok) = (tiktok)::text) AND ((tiktok)::text ~ '^[A-Za-z0-9._-]{2,100}$'::text)))),
  CONSTRAINT "contacts_viber_check" CHECK (((viber IS NULL) OR ((viber)::text ~ '^\+?[0-9]{7,15}$'::text))),
  CONSTRAINT "contacts_whatsapp_check" CHECK (((whatsapp IS NULL) OR ((whatsapp)::text ~ '^\+?[0-9]{7,15}$'::text))),
  CONSTRAINT "contacts_x_check" CHECK (((x IS NULL) OR ((TRIM(BOTH FROM x) = (x)::text) AND ((x)::text ~ '^[A-Za-z0-9._-]{2,100}$'::text))))
);

ALTER TABLE "public"."contacts"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."conversation_members" (
  "id"              uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "conversation_id" uuid                     NOT NULL,
  "member_id"       uuid                     NOT NULL,
  "joined_at"       timestamp with time zone NOT NULL DEFAULT now(),
  "last_read_at"    timestamp with time zone,
  CONSTRAINT "conversation_members_conversation_id_profile_id_key" UNIQUE (conversation_id, member_id),
  CONSTRAINT "conversation_members_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."conversation_members"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."conversations" (
  "id"              uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "org_id"          uuid                     NOT NULL,
  "type"            text                     NOT NULL,
  "created_by"      uuid                     NOT NULL,
  "created_at"      timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"      timestamp with time zone NOT NULL DEFAULT now(),
  "deleted_at"      timestamp with time zone,
  "last_message_id" uuid,
  "industry"        text,
  CONSTRAINT "conversations_pkey" PRIMARY KEY (id),
  CONSTRAINT "conversations_type_check" CHECK ((type = ANY (ARRAY['announcement'::text, 'organization'::text, 'direct'::text])))
);

ALTER TABLE "public"."conversations"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."customers" (
  "id"         uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "contact_id" uuid                     NOT NULL,
  "notes"      text,
  "status"     character varying(20)    NOT NULL DEFAULT 'Active'::character varying,
  "owner_id"   uuid                     NOT NULL,
  "org_id"     uuid                     NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  "deleted_at" timestamp with time zone,
  "deleted_by" uuid,
  "updated_by" uuid,
  CONSTRAINT "chk_customer_status"
    CHECK (((status)::text = ANY ((ARRAY['Active'::character varying, 'Inactive'::character varying, 'At Risk'::character varying, 'Churned'::character varying])::text[]))),
  CONSTRAINT "customers_notes_length_check" CHECK ((char_length(notes) <= 5000)),
  CONSTRAINT "customers_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."customers"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."deals" (
  "id"         uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "contact_id" uuid                     NOT NULL,
  "title"      character varying(150)   NOT NULL,
  "stage"      text                     NOT NULL,
  "notes"      character varying(5000),
  "owner_id"   uuid                     NOT NULL,
  "org_id"     uuid                     NOT NULL,
  "value"      numeric(12,2)            NOT NULL DEFAULT 0,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "close_date" timestamp with time zone,
  "closed_by"  uuid,
  "deleted_at" timestamp with time zone,
  "deleted_by" uuid,
  "updated_by" uuid,
  CONSTRAINT "deals_pkey" PRIMARY KEY (id),
  CONSTRAINT "deals_stage_check" CHECK ((stage = ANY (ARRAY['Prospecting'::text, 'Proposal'::text, 'Negotiation'::text, 'Closed Won'::text, 'Closed Lost'::text]))),
  CONSTRAINT "deals_value_check" CHECK ((value >= (0)::numeric))
);

ALTER TABLE "public"."deals"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."emails" (
  "id"                  uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "org_id"              uuid                     NOT NULL,
  "sender_id"           uuid                     NOT NULL,
  "lead_id"             uuid,
  "contact_id"          uuid,
  "customer_id"         uuid,
  "recipient_email"     text                     NOT NULL,
  "subject"             text                     NOT NULL,
  "provider"            text                     NOT NULL DEFAULT 'resend'::text,
  "provider_message_id" text,
  "error_message"       text,
  "sent_at"             timestamp with time zone,
  "created_at"          timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"          timestamp with time zone NOT NULL DEFAULT now(),
  "deleted_at"          timestamp with time zone,
  "sender_name"         text                     NOT NULL DEFAULT ''::text,
  "sender_email"        text                     NOT NULL DEFAULT ''::text,
  "body_text"           text                     NOT NULL DEFAULT ''::text,
  "preview_text"        text                     NOT NULL DEFAULT ''::text,
  "body_html"           text,
  CONSTRAINT "emails_body_text_length_check" CHECK ((char_length(body_text) <= 5000)),
  CONSTRAINT "emails_pkey" PRIMARY KEY (id),
  CONSTRAINT "emails_provider_check" CHECK ((provider = 'resend'::text)),
  CONSTRAINT "emails_single_owner_check" CHECK ((((((lead_id IS NOT NULL))::integer + ((contact_id IS NOT NULL))::integer) + ((customer_id IS NOT NULL))::integer) = 1))
);

ALTER TABLE "public"."emails"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."feedbacks" (
  "id"         uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "name"       text,
  "email"      text,
  "rating"     smallint,
  "message"    text                     NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "user_type"  text                     NOT NULL DEFAULT 'prefer_not_to_say'::text,
  CONSTRAINT "feedback_message_check" CHECK (((char_length(TRIM(BOTH FROM message)) >= 1) AND (char_length(TRIM(BOTH FROM message)) <= 1000))),
  CONSTRAINT "feedback_pkey" PRIMARY KEY (id),
  CONSTRAINT "feedback_rating_check" CHECK (((rating IS NULL) OR ((rating >= 1) AND (rating <= 5)))),
  CONSTRAINT "feedback_user_type_check" CHECK ((user_type = ANY (ARRAY['everyday_user'::text, 'manager'::text, 'technical'::text, 'prefer_not_to_say'::text])))
);

ALTER TABLE "public"."feedbacks"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."leads" (
  "id"                     uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "first_name"             text                     NOT NULL,
  "last_name"              text,
  "suffix"                 text,
  "gender"                 text                     NOT NULL DEFAULT 'Prefer not to say'::text,
  "birth_date"             date,
  "email"                  text,
  "phone"                  text,
  "company_name"           text,
  "department"             text,
  "position"               text,
  "status"                 text                     NOT NULL DEFAULT 'New'::text,
  "owner_id"               uuid                     NOT NULL,
  "org_id"                 uuid                     NOT NULL,
  "notes"                  character varying(5000),
  "priority"               text                     NOT NULL DEFAULT 'Low'::text,
  "created_at"             timestamp with time zone DEFAULT now(),
  "updated_at"             timestamp with time zone DEFAULT now(),
  "title"                  text                     NOT NULL,
  "source"                 text                     NOT NULL DEFAULT 'Other'::text,
  "deleted_at"             timestamp with time zone,
  "deleted_by"             uuid,
  "updated_by"             uuid,
  "industry"               character varying(100),
  "linkedin"               character varying(255),
  "facebook"               character varying(255),
  "instagram"              character varying(255),
  "tiktok"                 character varying(255),
  "x"                      character varying(255),
  "whatsapp"               character varying(50),
  "telegram"               character varying(100),
  "viber"                  character varying(50),
  "preferred_contact_time" character varying(20),
  "website"                text,
  CONSTRAINT "leads_company_name_length_check" CHECK ((char_length(company_name) <= 100)),
  CONSTRAINT "leads_department_length_check" CHECK ((char_length(department) <= 100)),
  CONSTRAINT "leads_email_length_check" CHECK ((char_length(email) <= 254)),
  CONSTRAINT "leads_first_name_length_check" CHECK ((char_length(first_name) <= 50)),
  CONSTRAINT "leads_gender_length_check" CHECK ((char_length(gender) <= 30)),
  CONSTRAINT "leads_gender_values_check" CHECK ((gender = ANY (ARRAY['Male'::text, 'Female'::text, 'Prefer not to say'::text]))),
  CONSTRAINT "leads_last_name_length_check" CHECK ((char_length(last_name) <= 50)),
  CONSTRAINT "leads_notes_length_check" CHECK ((char_length((notes)::text) <= 5000)),
  CONSTRAINT "leads_phone_length_check" CHECK ((char_length(phone) <= 25)),
  CONSTRAINT "leads_pkey" PRIMARY KEY (id),
  CONSTRAINT "leads_position_length_check" CHECK ((char_length("position") <= 100)),
  CONSTRAINT "leads_preferred_contact_time_check"
    CHECK
    (((preferred_contact_time IS NULL) OR ((preferred_contact_time)::text = ANY ((ARRAY['Morning'::character varying, 'Afternoon'::character varying, 'Evening'::character varying,
    'Anytime'::character varying])::text[])))),
  CONSTRAINT "leads_priority_length_check" CHECK ((char_length(priority) <= 20)),
  CONSTRAINT "leads_priority_values_check" CHECK ((priority = ANY (ARRAY['Low'::text, 'High'::text, 'Highest'::text]))),
  CONSTRAINT "leads_source_length_check" CHECK ((char_length(source) <= 50)),
  CONSTRAINT "leads_source_values_check"
    CHECK
    ((source = ANY (ARRAY['Website'::text, 'Referral'::text, 'Facebook'::text, 'Instagram'::text, 'LinkedIn'::text, 'Google Search'::text, 'Google Ads'::text,
    'Email Campaign'::text,
    'Cold Call'::text,
    'Trade Show'::text,
    'Webinar'::text,
    'Partner'::text,
    'Walk-in'::text,
    'WhatsApp'::text,
    'Messenger'::text, 'Personal Network'::text, 'Direct Conversation'::text, 'Networking Event'::text, 'Conference'::text, 'Friend'::text, 'Family'::text, 'Other'::text]))),
  CONSTRAINT "leads_status_values_check" CHECK ((status = ANY (ARRAY['New'::text, 'Contacted'::text, 'Qualified'::text, 'Closed'::text]))),
  CONSTRAINT "leads_suffix_length_check" CHECK ((char_length(suffix) <= 10)),
  CONSTRAINT "leads_title_length_check" CHECK ((char_length(title) <= 100))
);

ALTER TABLE "public"."leads"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."messages" (
  "id"              uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "conversation_id" uuid                     NOT NULL,
  "sender_id"       uuid                     NOT NULL,
  "content"         text                     NOT NULL,
  "entity_type"     text,
  "entity_id"       uuid,
  "created_at"      timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"      timestamp with time zone NOT NULL DEFAULT now(),
  "edited_at"       timestamp with time zone,
  "deleted_at"      timestamp with time zone,
  CONSTRAINT "messages_check" CHECK ((((entity_type IS NULL) AND (entity_id IS NULL)) OR ((entity_type IS NOT NULL) AND (entity_id IS NOT NULL)))),
  CONSTRAINT "messages_content_check" CHECK ((btrim(content) <> ''::text)),
  CONSTRAINT "messages_content_length_check" CHECK ((char_length(content) <= 5000)),
  CONSTRAINT "messages_entity_type_check" CHECK ((entity_type = ANY (ARRAY['lead'::text, 'contact'::text, 'deal'::text, 'customer'::text]))),
  CONSTRAINT "messages_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."messages"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."notes" (
  "id"          uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "org_id"      uuid                     NOT NULL,
  "author_id"   uuid                     NOT NULL,
  "target_type" character varying(20)    NOT NULL,
  "target_id"   uuid,
  "content"     text                     NOT NULL,
  "visibility"  character varying(20)    NOT NULL DEFAULT 'private'::character varying,
  "created_at"  timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"  timestamp with time zone NOT NULL DEFAULT now(),
  "deleted_at"  timestamp with time zone,
  "deleted_by"  uuid,
  "updated_by"  uuid,
  "title"       text                     NOT NULL DEFAULT ''::text,
  "pinned"      boolean                  NOT NULL DEFAULT false,
  CONSTRAINT "notes_content_length_check" CHECK ((char_length(content) <= 5000)),
  CONSTRAINT "notes_pkey" PRIMARY KEY (id),
  CONSTRAINT "notes_target_type_check"
    CHECK
    (((target_type)::text = ANY ((ARRAY['lead'::character varying, 'contact'::character varying, 'deal'::character varying, 'customer'::character varying, 'personal'::character
    varying])::text[]))),
  CONSTRAINT "notes_visibility_check" CHECK (((visibility)::text = ANY ((ARRAY['public'::character varying, 'private'::character varying])::text[])))
);

ALTER TABLE "public"."notes"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."organization_invite_acceptances" (
  "id"          uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "invite_id"   uuid                     NOT NULL,
  "profile_id"  uuid                     NOT NULL,
  "accepted_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "organization_invite_acceptances_invite_id_profile_id_key" UNIQUE (invite_id, profile_id),
  CONSTRAINT "organization_invite_acceptances_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."organization_invite_acceptances"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."organization_invites" (
  "id"         uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "org_id"     uuid                     NOT NULL,
  "code"       text                     NOT NULL,
  "role"       text                     NOT NULL,
  "email"      text,
  "max_uses"   integer                  NOT NULL DEFAULT 1,
  "used_count" integer                  NOT NULL DEFAULT 0,
  "status"     text                     NOT NULL DEFAULT 'active'::text,
  "expires_at" timestamp with time zone NOT NULL,
  "created_by" uuid                     NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "organization_invites_max_uses_check" CHECK ((max_uses > 0)),
  CONSTRAINT "organization_invites_pkey" PRIMARY KEY (id),
  CONSTRAINT "organization_invites_role_check" CHECK ((role = ANY (ARRAY['owner'::text, 'manager'::text, 'agent'::text]))),
  CONSTRAINT "organization_invites_status_check" CHECK ((status = ANY (ARRAY['active'::text, 'completed'::text, 'expired'::text, 'revoked'::text]))),
  CONSTRAINT "organization_invites_usage_check" CHECK ((used_count <= max_uses)),
  CONSTRAINT "organization_invites_used_count_check" CHECK ((used_count >= 0))
);

ALTER TABLE "public"."organization_invites"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."organization_member_counters" (
  "id"            uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "org_id"        uuid                     NOT NULL,
  "owner_count"   integer                  NOT NULL DEFAULT 0,
  "manager_count" integer                  NOT NULL DEFAULT 0,
  "agent_count"   integer                  NOT NULL DEFAULT 0,
  "created_at"    timestamp with time zone DEFAULT now(),
  "updated_at"    timestamp with time zone DEFAULT now(),
  CONSTRAINT "organization_member_counters_org_id_key" UNIQUE (org_id),
  CONSTRAINT "organization_member_counters_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."organization_member_counters"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."organization_members" (
  "id"         uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "org_id"     uuid                     NOT NULL,
  "profile_id" uuid                     NOT NULL,
  "role"       text                     NOT NULL DEFAULT 'agent'::text,
  "status"     text                     NOT NULL DEFAULT 'active'::text,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "display_id" text                     NOT NULL,
  "deleted_at" timestamp with time zone,
  CONSTRAINT "organization_members_org_display_id_unique" UNIQUE (org_id, display_id),
  CONSTRAINT "organization_members_pkey" PRIMARY KEY (id),
  CONSTRAINT "organization_members_role_check" CHECK ((role = ANY (ARRAY['owner'::text, 'manager'::text, 'agent'::text]))),
  CONSTRAINT "organization_members_status_check" CHECK ((status = ANY (ARRAY['invited'::text, 'active'::text, 'suspended'::text, 'removed'::text]))),
  CONSTRAINT "organization_members_unique" UNIQUE (org_id, profile_id)
);

ALTER TABLE "public"."organization_members"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."organizations" (
  "id"           uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "name"         text                     NOT NULL,
  "created_at"   timestamp with time zone DEFAULT now(),
  "industry"     text,
  "product_type" text,
  "company_size" text,
  "website"      text,
  "description"  text,
  "logo_url"     text,
  "country"      text,
  "timezone"     text,
  "updated_at"   timestamp with time zone DEFAULT now(),
  "type"         text                     NOT NULL DEFAULT 'personal'::text,
  "slug"         text,
  CONSTRAINT "organizations_pkey" PRIMARY KEY (id),
  CONSTRAINT "organizations_slug_key" UNIQUE (slug),
  CONSTRAINT "organizations_type_check" CHECK ((type = ANY (ARRAY['personal'::text, 'business'::text])))
);

ALTER TABLE "public"."organizations"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."profiles" (
  "id"                   uuid                     NOT NULL,
  "display_name"         text,
  "avatar_url"           text,
  "created_at"           timestamp with time zone NOT NULL DEFAULT now(),
  "last_login"           timestamp with time zone,
  "first_name"           text,
  "last_name"            text,
  "job_title"            text,
  "deleted_at"           timestamp with time zone,
  "status"               text                     NOT NULL DEFAULT 'pending'::text,
  "email"                text                     NOT NULL,
  "onboarding_completed" boolean                  NOT NULL DEFAULT false,
  "onboarding_step"      smallint                 NOT NULL DEFAULT 0,
  CONSTRAINT "profiles_avatar_url_length" CHECK (((avatar_url IS NULL) OR (char_length(avatar_url) <= 2048))),
  CONSTRAINT "profiles_display_name_length" CHECK ((char_length(display_name) <= 100)),
  CONSTRAINT "profiles_email_key" UNIQUE (email),
  CONSTRAINT "profiles_first_name_length" CHECK ((char_length(first_name) <= 50)),
  CONSTRAINT "profiles_last_name_length" CHECK ((char_length(last_name) <= 50)),
  CONSTRAINT "profiles_pkey" PRIMARY KEY (id),
  CONSTRAINT "profiles_position_length" CHECK (((job_title IS NULL) OR (char_length(job_title) <= 100))),
  CONSTRAINT "profiles_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'inactive'::text, 'active'::text, 'banned'::text, 'deleted'::text])))
);

ALTER TABLE "public"."profiles"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."refresh_tokens" (
  "id"             uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "profile_id"     uuid                     NOT NULL,
  "token_hash"     text                     NOT NULL,
  "expires_at"     timestamp with time zone NOT NULL,
  "created_at"     timestamp with time zone NOT NULL DEFAULT now(),
  "revoked_at"     timestamp with time zone,
  "replaced_by_id" uuid,
  "ip_address"     inet,
  "user_agent"     text,
  "last_seen_at"   timestamp with time zone DEFAULT now(),
  "org_id"         uuid,
  CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY (id),
  CONSTRAINT "refresh_tokens_token_hash_key" UNIQUE (token_hash)
);

ALTER TABLE "public"."refresh_tokens"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."sms" (
  "id"         uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "org_id"     uuid                     NOT NULL,
  "lead_id"    uuid,
  "contact_id" uuid,
  "sender_id"  uuid                     NOT NULL,
  "content"    text                     NOT NULL,
  "status"     text                     NOT NULL DEFAULT 'sent'::text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  "deleted_at" timestamp with time zone,
  CONSTRAINT "sms_content_length_check" CHECK ((char_length(content) <= 5000)),
  CONSTRAINT "sms_pkey" PRIMARY KEY (id),
  CONSTRAINT "sms_single_recipient" CHECK ((((lead_id IS NOT NULL) AND (contact_id IS NULL)) OR ((lead_id IS NULL) AND (contact_id IS NOT NULL)))),
  CONSTRAINT "sms_status_check" CHECK ((status = ANY (ARRAY['queued'::text, 'sending'::text, 'sent'::text, 'delivered'::text, 'failed'::text])))
);

ALTER TABLE "public"."sms"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."subscriptions" (
  "id"                   uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "org_id"               uuid                     NOT NULL,
  "plan"                 text                     NOT NULL DEFAULT 'Free'::text,
  "status"               text                     NOT NULL DEFAULT 'active'::text,
  "current_period_start" timestamp with time zone,
  "current_period_end"   timestamp with time zone,
  "cancel_at_period_end" boolean                  DEFAULT false,
  "created_at"           timestamp with time zone DEFAULT now(),
  "updated_at"           timestamp with time zone DEFAULT now(),
  "payment_provider"     text                     NOT NULL DEFAULT 'none'::text,
  "provider_reference"   text,
  "billing_cycle"        text                     NOT NULL DEFAULT 'monthly'::text,
  CONSTRAINT "subscriptions_billing_cycle_check" CHECK ((billing_cycle = ANY (ARRAY['monthly'::text, 'yearly'::text, 'none'::text]))),
  CONSTRAINT "subscriptions_organization_unique" UNIQUE (org_id),
  CONSTRAINT "subscriptions_payment_provider_check" CHECK ((payment_provider = ANY (ARRAY['stripe'::text, 'paypal'::text, 'gcash'::text, 'maya'::text, 'none'::text]))),
  CONSTRAINT "subscriptions_pkey" PRIMARY KEY (id),
  CONSTRAINT "subscriptions_plan_check" CHECK ((plan = ANY (ARRAY['Free'::text, 'Starter'::text, 'Team'::text, 'Business'::text, 'Enterprise'::text]))),
  CONSTRAINT "subscriptions_status_check" CHECK ((status = ANY (ARRAY['active'::text, 'cancelled'::text, 'expired'::text, 'past_due'::text])))
);

ALTER TABLE "public"."subscriptions"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."super_admin_audit_log" (
  "id"             uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "event_type"     text                     NOT NULL,
  "super_admin_id" uuid,
  "target_user_id" uuid,
  "target_org_id"  uuid,
  "ip_address"     text,
  "details"        jsonb                    DEFAULT '{}'::jsonb,
  "created_at"     timestamp with time zone DEFAULT now(),
  CONSTRAINT "super_admin_audit_log_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."super_admin_audit_log"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."super_admin_sessions" (
  "id"             uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "super_admin_id" uuid                     NOT NULL,
  "session_token"  text                     NOT NULL,
  "ip_address"     text,
  "user_agent"     text,
  "created_at"     timestamp with time zone DEFAULT now(),
  "last_activity"  timestamp with time zone DEFAULT now(),
  "expires_at"     timestamp with time zone DEFAULT (now() + '30 days'::interval),
  CONSTRAINT "super_admin_sessions_pkey" PRIMARY KEY (id),
  CONSTRAINT "super_admin_sessions_session_token_key" UNIQUE (session_token)
);

ALTER TABLE "public"."super_admin_sessions"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."tasks" (
  "id"           uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "org_id"       uuid                     NOT NULL,
  "author_id"    uuid                     NOT NULL,
  "assigned_to"  uuid,
  "target_type"  character varying(20)    NOT NULL,
  "target_id"    uuid,
  "title"        text                     NOT NULL,
  "description"  text                     NOT NULL DEFAULT ''::text,
  "status"       character varying(20)    NOT NULL DEFAULT 'todo'::character varying,
  "priority"     character varying(20)    NOT NULL DEFAULT 'medium'::character varying,
  "visibility"   character varying(20)    NOT NULL DEFAULT 'private'::character varying,
  "due_date"     timestamp with time zone,
  "reminder_at"  timestamp with time zone,
  "completed_at" timestamp with time zone,
  "created_at"   timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"   timestamp with time zone NOT NULL DEFAULT now(),
  "updated_by"   uuid,
  "deleted_at"   timestamp with time zone,
  "deleted_by"   uuid,
  CONSTRAINT "tasks_description_length_check" CHECK ((char_length(description) <= 2000)),
  CONSTRAINT "tasks_pkey" PRIMARY KEY (id),
  CONSTRAINT "tasks_priority_check"
    CHECK (((priority)::text = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying, 'urgent'::character varying])::text[]))),
  CONSTRAINT "tasks_status_check"
    CHECK (((status)::text = ANY ((ARRAY['todo'::character varying, 'in_progress'::character varying, 'completed'::character varying, 'cancelled'::character varying])::text[]))),
  CONSTRAINT "tasks_target_type_check"
    CHECK
    (((target_type)::text = ANY ((ARRAY['lead'::character varying, 'contact'::character varying, 'deal'::character varying, 'customer'::character varying, 'personal'::character
    varying])::text[]))),
  CONSTRAINT "tasks_visibility_check" CHECK (((visibility)::text = ANY ((ARRAY['public'::character varying, 'private'::character varying])::text[])))
);

ALTER TABLE "public"."tasks"
  ENABLE ROW LEVEL SECURITY;

CREATE TYPE "public"."email_provider" AS ENUM (
  'resend'
);

CREATE TYPE "public"."email_status" AS ENUM (
  'draft',
  'queued',
  'sent',
  'failed'
);

ALTER TABLE "public"."emails"
  ADD COLUMN "status" public.email_status NOT NULL;

CREATE TYPE "public"."status" AS ENUM (
  'draft',
  'queued',
  'sent',
  'failed'
);

CREATE TYPE "public"."task_type" AS ENUM (
  'call',
  'email',
  'sms',
  'meeting',
  'other'
);

ALTER TABLE "public"."tasks"
  ADD COLUMN "task_type" public.task_type NOT NULL DEFAULT 'other'::public.task_type;

CREATE OR REPLACE FUNCTION public.auto_update_updated_at()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.cleanup_old_activities()
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.conversation_belongs_to_current_org (
  target_conversation_id uuid
)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.conversations c
    WHERE c.id = target_conversation_id
      AND c.org_id = (auth.jwt() ->> 'org_id')::uuid
  );
$function$;

CREATE OR REPLACE FUNCTION public.create_super_admin_session (
  p_admin_id uuid,
  p_token    text,
  p_ip       text,
  p_ua       text
)
  RETURNS SETOF public.super_admin_sessions
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.delete_super_admin_session (
  p_token text
)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
begin
  delete from public.super_admin_sessions
  where session_token = p_token;
end;
$function$;

CREATE OR REPLACE FUNCTION public.generate_member_code (
  p_org_id uuid,
  p_role   text
)
  RETURNS text
  LANGUAGE plpgsql
  AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.generate_org_display_id()
  RETURNS text
  LANGUAGE plpgsql
  AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.generate_profile_display_id()
  RETURNS text
  LANGUAGE plpgsql
  AS $function$
BEGIN
  RETURN 'USR-' ||
    LPAD(
      nextval('profile_display_id_seq')::TEXT,
      5,
      '0'
    );
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.has_org_role (
  target_org_id uuid,
  allowed_roles text[]
)
  RETURNS boolean
  LANGUAGE sql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$SELECT EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE org_id = target_org_id
      AND profile_id = auth.uid()
      AND role = ANY(allowed_roles)
  );$function$;

CREATE OR REPLACE FUNCTION public.is_active_current_org_member()
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members om
    WHERE om.id = (auth.jwt() ->> 'member_id')::uuid
      AND om.org_id = (auth.jwt() ->> 'org_id')::uuid
      AND om.status = 'active'
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_conversation_member (
  p_conversation_id uuid,
  p_profile_id      uuid
)
  RETURNS boolean
  LANGUAGE sql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
    SELECT EXISTS (
        SELECT 1
        FROM public.conversation_members
        WHERE conversation_id = p_conversation_id
          AND member_id = p_profile_id
    );
$function$;

CREATE OR REPLACE FUNCTION public.is_current_org_member (
  target_member_id uuid
)
  RETURNS boolean
  LANGUAGE sql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$SELECT EXISTS (
    SELECT 1
    FROM public.organization_members om
    WHERE om.id = target_member_id
      AND om.profile_id = auth.uid()
      AND om.org_id = (auth.jwt() ->> 'org_id')::uuid
  );$function$;

CREATE OR REPLACE FUNCTION public.is_org_member (
  target_org_id uuid
)
  RETURNS boolean
  LANGUAGE sql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$SELECT EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE org_id = target_org_id
      AND profile_id = auth.uid()
  );$function$;

CREATE OR REPLACE FUNCTION public.log_super_admin_event (
  p_event_type     text,
  p_super_admin_id uuid,
  p_ip_address     text,
  p_details        jsonb
)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.member_belongs_to_current_org (
  target_member_id uuid
)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$SELECT EXISTS (
    SELECT 1
    FROM public.organization_members om
    WHERE om.id = target_member_id
      AND om.org_id = (auth.jwt() ->> 'org_id')::uuid
  );$function$;

CREATE OR REPLACE FUNCTION public.set_member_display_id()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $function$
begin

  new.display_id := generate_member_code(
      new.org_id,
      new.role
  );

  return new;

end;
$function$;

CREATE OR REPLACE FUNCTION public.update_admin_last_login (
  p_admin_id uuid
)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $function$
BEGIN
  UPDATE public.profiles SET last_login = now() WHERE id = p_admin_id;
END; $function$;

CREATE OR REPLACE FUNCTION public.update_conversation_last_message()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $function$
begin
  update public.conversations
  set
    last_message_id = new.id,
    updated_at = now()
  where id = new.conversation_id;

  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.update_super_admin_activity (
  p_token text
)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
begin
  update public.super_admin_sessions
  set last_activity = now()
  where session_token = p_token;
end;
$function$;

CREATE OR REPLACE FUNCTION public.update_super_admin_last_login (
  p_admin_id uuid
)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
begin
  update public.profiles
  set last_login = now()
  where id = p_admin_id;
end;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.verify_super_admin_session (
  p_token text
)
  RETURNS SETOF public.super_admin_sessions
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
begin
  return query
  select *
  from public.super_admin_sessions
  where session_token = p_token
    and expires_at > now();
end;
$function$;

ALTER TABLE "public"."activities"
  ADD CONSTRAINT "activities_contact_id_fkey" FOREIGN KEY (contact_id) REFERENCES public.contacts(id) ON DELETE SET NULL;

ALTER TABLE "public"."calls"
  ADD CONSTRAINT "calls_contact_id_fkey" FOREIGN KEY (contact_id) REFERENCES public.contacts(id) ON DELETE CASCADE;

ALTER TABLE "public"."conversation_members"
  ADD CONSTRAINT "conversation_members_conversation_id_fkey" FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;

ALTER TABLE "public"."activities"
  ADD CONSTRAINT "activities_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE SET NULL;

ALTER TABLE "public"."customers"
  ADD CONSTRAINT "fk_customer_contact" FOREIGN KEY (contact_id) REFERENCES public.contacts(id) ON DELETE RESTRICT;

ALTER TABLE "public"."deals"
  ADD CONSTRAINT "deals_contact_id_fkey" FOREIGN KEY (contact_id) REFERENCES public.contacts(id);

ALTER TABLE "public"."emails"
  ADD CONSTRAINT "fk_email_contact" FOREIGN KEY (contact_id) REFERENCES public.contacts(id) ON DELETE SET NULL;

ALTER TABLE "public"."emails"
  ADD CONSTRAINT "fk_email_customer" FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE SET NULL;

ALTER TABLE "public"."activities"
  ADD CONSTRAINT "activities_lead_id_fkey" FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE SET NULL;

ALTER TABLE "public"."calls"
  ADD CONSTRAINT "calls_lead_id_fkey" FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE CASCADE;

ALTER TABLE "public"."contacts"
  ADD CONSTRAINT "contacts_lead_id_fkey" FOREIGN KEY (lead_id) REFERENCES public.leads(id);

ALTER TABLE "public"."emails"
  ADD CONSTRAINT "fk_email_lead" FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE SET NULL;

ALTER TABLE "public"."messages"
  ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;

ALTER TABLE "public"."conversations"
  ADD CONSTRAINT "conversations_last_message_id_fkey" FOREIGN KEY (last_message_id) REFERENCES public.messages(id);

ALTER TABLE "public"."organization_invite_acceptances"
  ADD CONSTRAINT "organization_invite_acceptances_invite_id_fkey" FOREIGN KEY (invite_id) REFERENCES public.organization_invites(id) ON DELETE CASCADE;

ALTER TABLE "public"."activities"
  ADD CONSTRAINT "activities_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public.organization_members(id);

ALTER TABLE "public"."calls"
  ADD CONSTRAINT "calls_assigned_to_fkey" FOREIGN KEY (assigned_to) REFERENCES public.organization_members(id);

ALTER TABLE "public"."calls"
  ADD CONSTRAINT "calls_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public.organization_members(id);

ALTER TABLE "public"."contacts"
  ADD CONSTRAINT "contacts_deleted_by_fkey" FOREIGN KEY (deleted_by) REFERENCES public.organization_members(id);

ALTER TABLE "public"."contacts"
  ADD CONSTRAINT "contacts_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES public.organization_members(id);

ALTER TABLE "public"."contacts"
  ADD CONSTRAINT "contacts_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public.organization_members(id);

ALTER TABLE "public"."conversation_members"
  ADD CONSTRAINT "conversation_members_member_id_fkey" FOREIGN KEY (member_id) REFERENCES public.organization_members(id);

ALTER TABLE "public"."conversations"
  ADD CONSTRAINT "conversations_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public.organization_members(id);

ALTER TABLE "public"."customers"
  ADD CONSTRAINT "customers_deleted_by_fkey" FOREIGN KEY (deleted_by) REFERENCES public.organization_members(id);

ALTER TABLE "public"."customers"
  ADD CONSTRAINT "customers_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES public.organization_members(id);

ALTER TABLE "public"."customers"
  ADD CONSTRAINT "customers_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public.organization_members(id);

ALTER TABLE "public"."deals"
  ADD CONSTRAINT "deals_closed_by_fkey" FOREIGN KEY (closed_by) REFERENCES public.organization_members(id);

ALTER TABLE "public"."deals"
  ADD CONSTRAINT "deals_deleted_by_fkey" FOREIGN KEY (deleted_by) REFERENCES public.organization_members(id);

ALTER TABLE "public"."deals"
  ADD CONSTRAINT "deals_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES public.organization_members(id);

ALTER TABLE "public"."deals"
  ADD CONSTRAINT "deals_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public.organization_members(id);

ALTER TABLE "public"."emails"
  ADD CONSTRAINT "emails_sender_id_fkey" FOREIGN KEY (sender_id) REFERENCES public.organization_members(id);

ALTER TABLE "public"."leads"
  ADD CONSTRAINT "leads_deleted_by_fkey" FOREIGN KEY (deleted_by) REFERENCES public.organization_members(id);

ALTER TABLE "public"."leads"
  ADD CONSTRAINT "leads_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES public.organization_members(id);

ALTER TABLE "public"."leads"
  ADD CONSTRAINT "leads_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public.organization_members(id);

ALTER TABLE "public"."messages"
  ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY (sender_id) REFERENCES public.organization_members(id);

ALTER TABLE "public"."notes"
  ADD CONSTRAINT "notes_author_id_fkey" FOREIGN KEY (author_id) REFERENCES public.organization_members(id);

ALTER TABLE "public"."notes"
  ADD CONSTRAINT "notes_deleted_by_fkey" FOREIGN KEY (deleted_by) REFERENCES public.organization_members(id);

ALTER TABLE "public"."notes"
  ADD CONSTRAINT "notes_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public.organization_members(id);

ALTER TABLE "public"."activities"
  ADD CONSTRAINT "activities_org_id_fkey" FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE "public"."calls"
  ADD CONSTRAINT "calls_org_id_fkey" FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE "public"."contacts"
  ADD CONSTRAINT "contacts_org_id_fkey" FOREIGN KEY (org_id) REFERENCES public.organizations(id);

ALTER TABLE "public"."conversations"
  ADD CONSTRAINT "conversations_org_id_fkey" FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE "public"."customers"
  ADD CONSTRAINT "fk_customer_org" FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE "public"."deals"
  ADD CONSTRAINT "deals_org_id_fkey" FOREIGN KEY (org_id) REFERENCES public.organizations(id);

ALTER TABLE "public"."emails"
  ADD CONSTRAINT "fk_email_org" FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE "public"."leads"
  ADD CONSTRAINT "leads_org_id_fkey" FOREIGN KEY (org_id) REFERENCES public.organizations(id);

ALTER TABLE "public"."notes"
  ADD CONSTRAINT "notes_org_id_fkey" FOREIGN KEY (org_id) REFERENCES public.organizations(id);

ALTER TABLE "public"."organization_invites"
  ADD CONSTRAINT "organization_invites_org_id_fkey" FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE "public"."organization_member_counters"
  ADD CONSTRAINT "organization_member_counters_org_id_fkey" FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE "public"."organization_members"
  ADD CONSTRAINT "organization_members_org_id_fkey" FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE "public"."profiles"
  ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."organization_invite_acceptances"
  ADD CONSTRAINT "organization_invite_acceptances_profile_id_fkey" FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE "public"."organization_invites"
  ADD CONSTRAINT "organization_invites_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE "public"."organization_members"
  ADD CONSTRAINT "organization_members_profile_fkey" FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE "public"."refresh_tokens"
  ADD CONSTRAINT "refresh_tokens_org_id_fkey" FOREIGN KEY (org_id) REFERENCES public.organizations(id);

ALTER TABLE "public"."refresh_tokens"
  ADD CONSTRAINT "refresh_tokens_profile_id_fkey" FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE "public"."refresh_tokens"
  ADD CONSTRAINT "refresh_tokens_replaced_by_id_fkey" FOREIGN KEY (replaced_by_id) REFERENCES public.refresh_tokens(id);

ALTER TABLE "public"."sms"
  ADD CONSTRAINT "sms_contact_id_fkey" FOREIGN KEY (contact_id) REFERENCES public.contacts(id) ON DELETE SET NULL;

ALTER TABLE "public"."sms"
  ADD CONSTRAINT "sms_lead_id_fkey" FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE SET NULL;

ALTER TABLE "public"."sms"
  ADD CONSTRAINT "sms_org_id_fkey" FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE "public"."sms"
  ADD CONSTRAINT "sms_sender_id_fkey" FOREIGN KEY (sender_id) REFERENCES public.organization_members(id);

ALTER TABLE "public"."subscriptions"
  ADD CONSTRAINT "subscriptions_org_id_fkey" FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE "public"."super_admin_audit_log"
  ADD CONSTRAINT "super_admin_audit_log_super_admin_id_fkey" FOREIGN KEY (super_admin_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE "public"."super_admin_audit_log"
  ADD CONSTRAINT "super_admin_audit_log_target_org_id_fkey" FOREIGN KEY (target_org_id) REFERENCES public.organizations(id) ON DELETE SET NULL;

ALTER TABLE "public"."super_admin_audit_log"
  ADD CONSTRAINT "super_admin_audit_log_target_user_id_fkey" FOREIGN KEY (target_user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE "public"."super_admin_sessions"
  ADD CONSTRAINT "super_admin_sessions_super_admin_id_fkey" FOREIGN KEY (super_admin_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE "public"."tasks"
  ADD CONSTRAINT "tasks_assigned_to_fkey" FOREIGN KEY (assigned_to) REFERENCES public.organization_members(id);

ALTER TABLE "public"."tasks"
  ADD CONSTRAINT "tasks_author_id_fkey" FOREIGN KEY (author_id) REFERENCES public.organization_members(id);

ALTER TABLE "public"."tasks"
  ADD CONSTRAINT "tasks_deleted_by_fkey" FOREIGN KEY (deleted_by) REFERENCES public.organization_members(id);

ALTER TABLE "public"."tasks"
  ADD CONSTRAINT "tasks_org_id_fkey" FOREIGN KEY (org_id) REFERENCES public.organizations(id);

ALTER TABLE "public"."tasks"
  ADD CONSTRAINT "tasks_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public.organization_members(id);

CREATE INDEX contacts_org_id_idx ON public.contacts USING btree (org_id);

CREATE INDEX contacts_owner_id_idx ON public.contacts USING btree (owner_id);

CREATE INDEX idx_activities_contact ON public.activities USING btree (contact_id);

CREATE INDEX idx_activities_created_at ON public.activities USING btree (created_at DESC);

CREATE INDEX idx_activities_creator ON public.activities USING btree (created_by);

CREATE INDEX idx_activities_customer ON public.activities USING btree (customer_id);

CREATE INDEX idx_activities_lead ON public.activities USING btree (lead_id);

CREATE INDEX idx_activities_org_created ON public.activities USING btree (org_id, created_at DESC);

CREATE INDEX idx_activities_org ON public.activities USING btree (org_id);

CREATE INDEX idx_calls_assigned_to ON public.calls USING btree (assigned_to);

CREATE INDEX idx_calls_contact_id ON public.calls USING btree (contact_id);

CREATE INDEX idx_calls_created_at ON public.calls USING btree (created_at DESC);

CREATE INDEX idx_calls_lead_id ON public.calls USING btree (lead_id);

CREATE INDEX idx_calls_org_id ON public.calls USING btree (org_id);

CREATE INDEX idx_calls_scheduled_for ON public.calls USING btree (scheduled_for);

CREATE INDEX idx_calls_status ON public.calls USING btree (status);

CREATE INDEX idx_conversation_members_conversation ON public.conversation_members USING btree (conversation_id);

CREATE INDEX idx_conversation_members_profile_conversation ON public.conversation_members USING btree (member_id, conversation_id);

CREATE INDEX idx_conversation_members_profile ON public.conversation_members USING btree (member_id);

CREATE INDEX idx_conversations_org ON public.conversations USING btree (org_id)
  WHERE (deleted_at IS NULL);

CREATE INDEX idx_customers_contact_id ON public.customers USING btree (contact_id);

CREATE INDEX idx_customers_org_id ON public.customers USING btree (org_id);

CREATE INDEX idx_customers_owner_id ON public.customers USING btree (owner_id);

CREATE INDEX idx_customers_status ON public.customers USING btree (status);

CREATE INDEX idx_deals_contact_id ON public.deals USING btree (contact_id);

CREATE INDEX idx_deals_org_id ON public.deals USING btree (org_id);

CREATE INDEX idx_deals_owner_id ON public.deals USING btree (owner_id);

CREATE INDEX idx_deals_stage ON public.deals USING btree (stage);

CREATE INDEX idx_emails_contact_history ON public.emails USING btree (contact_id, created_at DESC);

CREATE INDEX idx_emails_contact ON public.emails USING btree (contact_id);

CREATE INDEX idx_emails_created_at ON public.emails USING btree (created_at DESC);

CREATE INDEX idx_emails_customer_history ON public.emails USING btree (customer_id, created_at DESC);

CREATE INDEX idx_emails_customer ON public.emails USING btree (customer_id);

CREATE INDEX idx_emails_lead_history ON public.emails USING btree (lead_id, created_at DESC);

CREATE INDEX idx_emails_lead ON public.emails USING btree (lead_id);

CREATE INDEX idx_emails_org ON public.emails USING btree (org_id);

CREATE INDEX idx_emails_preview_text ON public.emails USING btree (preview_text);

CREATE INDEX idx_emails_recipient_email ON public.emails USING btree (recipient_email);

CREATE INDEX idx_emails_sender_email ON public.emails USING btree (sender_email);

CREATE INDEX idx_emails_sender ON public.emails USING btree (sender_id);

CREATE INDEX idx_emails_sent_at ON public.emails USING btree (sent_at DESC);

CREATE INDEX idx_emails_status ON public.emails USING btree (status);

CREATE INDEX idx_emails_subject ON public.emails USING btree (subject);

CREATE INDEX idx_feedback_created_at ON public.feedbacks USING btree (created_at DESC);

CREATE INDEX idx_messages_conversation_created ON public.messages USING btree (conversation_id, created_at)
  WHERE (deleted_at IS NULL);

CREATE INDEX idx_messages_entity ON public.messages USING btree (entity_type, entity_id);

CREATE INDEX idx_messages_sender ON public.messages USING btree (sender_id);

CREATE UNIQUE INDEX idx_org_invites_code ON public.organization_invites USING btree (code);

CREATE INDEX idx_org_invites_email ON public.organization_invites USING btree (email);

CREATE INDEX idx_org_invites_expires ON public.organization_invites USING btree (expires_at);

CREATE INDEX idx_org_invites_lookup ON public.organization_invites USING btree (code, status);

CREATE INDEX idx_org_invites_organization ON public.organization_invites USING btree (org_id);

CREATE INDEX idx_org_invites_status ON public.organization_invites USING btree (status);

CREATE INDEX idx_organization_members_display_id ON public.organization_members USING btree (display_id);

CREATE INDEX idx_refresh_tokens_active ON public.refresh_tokens USING btree (profile_id)
  WHERE (revoked_at IS NULL);

CREATE INDEX idx_refresh_tokens_profile_id ON public.refresh_tokens USING btree (profile_id);

CREATE INDEX idx_refresh_tokens_token_hash ON public.refresh_tokens USING btree (token_hash);

CREATE INDEX idx_sms_contact_id ON public.sms USING btree (contact_id);

CREATE INDEX idx_sms_created_at ON public.sms USING btree (created_at DESC);

CREATE INDEX idx_sms_lead_id ON public.sms USING btree (lead_id);

CREATE INDEX idx_sms_org_deleted_at ON public.sms USING btree (org_id, deleted_at);

CREATE INDEX idx_sms_org_id ON public.sms USING btree (org_id);

CREATE INDEX idx_sms_sender_id ON public.sms USING btree (sender_id);

CREATE INDEX idx_sms_status ON public.sms USING btree (status);

CREATE INDEX idx_super_admin_audit_log_created_at ON public.super_admin_audit_log USING btree (created_at DESC);

CREATE INDEX idx_super_admin_audit_log_event_type ON public.super_admin_audit_log USING btree (event_type);

CREATE INDEX idx_super_admin_audit_log_super_admin_id ON public.super_admin_audit_log USING btree (super_admin_id);

CREATE INDEX leads_org_id_idx ON public.leads USING btree (org_id);

CREATE INDEX leads_owner_id_idx ON public.leads USING btree (owner_id);

CREATE INDEX notes_author_idx ON public.notes USING btree (author_id);

CREATE INDEX notes_org_idx ON public.notes USING btree (org_id);

CREATE INDEX notes_target_idx ON public.notes USING btree (target_type, target_id);

CREATE INDEX tasks_assigned_to_idx ON public.tasks USING btree (assigned_to);

CREATE INDEX tasks_author_idx ON public.tasks USING btree (author_id);

CREATE INDEX tasks_due_date_idx ON public.tasks USING btree (due_date);

CREATE INDEX tasks_org_idx ON public.tasks USING btree (org_id);

CREATE INDEX tasks_priority_idx ON public.tasks USING btree (priority);

CREATE INDEX tasks_status_idx ON public.tasks USING btree (status);

CREATE INDEX tasks_target_idx ON public.tasks USING btree (target_type, target_id);

CREATE UNIQUE INDEX uniq_org_announcement ON public.conversations USING btree (org_id)
  WHERE ((TYPE = 'announcement'::text) AND (deleted_at IS NULL));

CREATE UNIQUE INDEX uniq_org_general ON public.conversations USING btree (org_id)
  WHERE ((TYPE = 'organization'::text) AND (deleted_at IS NULL));

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.activities
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_update_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.calls
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_update_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_update_updated_at();

CREATE TRIGGER conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_update_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_update_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.deals
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_update_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.emails
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_update_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_update_updated_at();

CREATE TRIGGER messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_update_updated_at();

CREATE TRIGGER trg_update_conversation_last_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_conversation_last_message();

CREATE TRIGGER set_notes_updated_at
  BEFORE UPDATE ON public.notes
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_update_updated_at();

CREATE TRIGGER organization_members_display_id_trigger
  BEFORE INSERT ON public.organization_members
  FOR EACH ROW
  EXECUTE FUNCTION public.set_member_display_id();

CREATE TRIGGER trg_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_sms_updated_at
  BEFORE UPDATE ON public.sms
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_update_updated_at();

CREATE TRIGGER set_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_update_updated_at();

CREATE POLICY "Admins can delete organization activities" ON "public"."activities"
  FOR DELETE
  TO "authenticated"
  USING (((org_id = ((auth.jwt() ->> 'org_id'::text))::uuid) AND (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = ANY (ARRAY['owner'::text, 'manager'::text]))));

CREATE POLICY "Members can create organization activities" ON "public"."activities"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (((org_id = ((auth.jwt() ->> 'org_id'::text))::uuid) AND (created_by = ((auth.jwt() ->> 'member_id'::text))::uuid)));

CREATE POLICY "Members can update organization activities" ON "public"."activities"
  FOR UPDATE
  TO "authenticated"
  USING (((org_id = ((auth.jwt() ->> 'org_id'::text))::uuid) AND (created_by = ((auth.jwt() ->> 'member_id'::text))::uuid)))
  WITH CHECK (((org_id = ((auth.jwt() ->> 'org_id'::text))::uuid) AND (created_by = ((auth.jwt() ->> 'member_id'::text))::uuid)));

CREATE POLICY "Members can view organization activities" ON "public"."activities"
  FOR SELECT
  TO "authenticated"
  USING ((org_id = ((auth.jwt() ->> 'org_id'::text))::uuid));

CREATE POLICY "Admins can delete organization calls" ON "public"."calls"
  FOR DELETE
  TO "authenticated"
  USING (((org_id = ((auth.jwt() ->> 'org_id'::text))::uuid) AND (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = ANY (ARRAY['owner'::text, 'manager'::text]))));

CREATE POLICY "Members can create organization calls" ON "public"."calls"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (((org_id = ((auth.jwt() ->> 'org_id'::text))::uuid) AND (created_by = ((auth.jwt() ->> 'member_id'::text))::uuid)));

CREATE POLICY "Members can update accessible calls" ON "public"."calls"
  FOR ALL
  TO "authenticated"
  USING
    (((org_id = ((auth.jwt() ->> 'org_id'::text))::uuid) AND ((created_by = ((auth.jwt() ->> 'member_id'::text))::uuid) OR (assigned_to = ((auth.jwt() ->>
    'member_id'::text))::uuid))))
  WITH
    CHECK
    (((org_id = ((auth.jwt() ->> 'org_id'::text))::uuid) AND ((created_by = ((auth.jwt() ->> 'member_id'::text))::uuid) OR (assigned_to = ((auth.jwt() ->>
    'member_id'::text))::uuid))));

CREATE POLICY "Members can view organization calls" ON "public"."calls"
  FOR SELECT
  TO "authenticated"
  USING ((org_id = ((auth.jwt() ->> 'org_id'::text))::uuid));

CREATE POLICY "Members can create organization contacts" ON "public"."contacts"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (((org_id = ((auth.jwt() ->> 'org_id'::text))::uuid) AND (owner_id = ((auth.jwt() ->> 'member_id'::text))::uuid)));

CREATE POLICY "Members can update organization contacts" ON "public"."contacts"
  FOR UPDATE
  TO "authenticated"
  USING ((org_id = ((auth.jwt() ->> 'org_id'::text))::uuid))
  WITH CHECK ((org_id = ((auth.jwt() ->> 'org_id'::text))::uuid));

CREATE POLICY "Members can view organization contacts" ON "public"."contacts"
  FOR SELECT
  TO "authenticated"
  USING ((org_id = ((auth.jwt() ->> 'org_id'::text))::uuid));

CREATE POLICY "Owners and Managers can delete organization contacts" ON "public"."contacts"
  FOR DELETE
  TO "authenticated"
  USING (((org_id = ((auth.jwt() ->> 'org_id'::text))::uuid) AND (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = ANY (ARRAY['owner'::text, 'manager'::text]))));

CREATE POLICY "Members can add conversation members" ON "public"."conversation_members"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((public.is_active_current_org_member() AND public.conversation_belongs_to_current_org(conversation_id) AND public.member_belongs_to_current_org(member_id)));

CREATE POLICY "Members can update their conversation memberships" ON "public"."conversation_members"
  FOR UPDATE
  TO "authenticated"
  USING ((member_id = ((auth.jwt() ->> 'member_id'::text))::uuid))
  WITH CHECK ((member_id = ((auth.jwt() ->> 'member_id'::text))::uuid));

CREATE POLICY "Members can view all members of their conversations" ON "public"."conversation_members"
  FOR SELECT
  TO "authenticated"
  USING (public.is_conversation_member(conversation_id, ((auth.jwt() ->> 'member_id'::text))::uuid));

CREATE POLICY "Members can view conversation members" ON "public"."conversation_members"
  FOR DELETE
  TO "authenticated"
  USING (public.is_conversation_member(conversation_id, ((auth.jwt() ->> 'member_id'::text))::uuid));

CREATE POLICY "Members can view their conversation memberships" ON "public"."conversation_members"
  FOR SELECT
  TO "authenticated"
  USING ((member_id = ( SELECT organization_members.id
   FROM public.organization_members
  WHERE (organization_members.profile_id = auth.uid()))));

CREATE POLICY "Admins can delete conversations" ON "public"."conversations"
  FOR DELETE
  TO "authenticated"
  USING (((org_id = ((auth.jwt() ->> 'org_id'::text))::uuid) AND (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text)));

CREATE POLICY "Creators can update conversations" ON "public"."conversations"
  FOR UPDATE
  TO "authenticated"
  USING (((org_id = ((auth.jwt() ->> 'org_id'::text))::uuid) AND (created_by = auth.uid())))
  WITH CHECK ((org_id = ((auth.jwt() ->> 'org_id'::text))::uuid));

CREATE POLICY "Members can create conversations" ON "public"."conversations"
  FOR INSERT
  TO "authenticated"
  WITH
    CHECK
    (((org_id = ((auth.jwt() ->> 'org_id'::text))::uuid) AND (created_by = ((auth.jwt() ->> 'member_id'::text))::uuid) AND ((type = 'direct'::text) OR ((type = ANY
    (ARRAY['organization'::text, 'announcement'::text])) AND (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'owner'::text)))));

CREATE POLICY "Members can view their conversations" ON "public"."conversations"
  FOR SELECT
  TO "authenticated"
  USING (public.is_conversation_member(id, ((auth.jwt() ->> 'member_id'::text))::uuid));

CREATE POLICY "Members can create organization customers" ON "public"."customers"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (((org_id = ((auth.jwt() ->> 'org_id'::text))::uuid) AND (owner_id = ((auth.jwt() ->> 'member_id'::text))::uuid)));

CREATE POLICY "Members can update organization customers" ON "public"."customers"
  FOR UPDATE
  TO "authenticated"
  USING ((org_id = ((auth.jwt() ->> 'org_id'::text))::uuid))
  WITH CHECK ((org_id = ((auth.jwt() ->> 'org_id'::text))::uuid));

CREATE POLICY "Members can view organization customers" ON "public"."customers"
  FOR SELECT
  TO "authenticated"
  USING ((org_id = ((auth.jwt() ->> 'org_id'::text))::uuid));

CREATE POLICY "Owners and Managers can delete organization customers" ON "public"."customers"
  FOR DELETE
  TO "authenticated"
  USING (((org_id = ((auth.jwt() ->> 'org_id'::text))::uuid) AND (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = ANY (ARRAY['owner'::text, 'manager'::text]))));

CREATE POLICY "Members can create organization deals" ON "public"."deals"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (((org_id = ((auth.jwt() ->> 'org_id'::text))::uuid) AND (owner_id = ((auth.jwt() ->> 'member_id'::text))::uuid)));

CREATE POLICY "Members can update organization deals" ON "public"."deals"
  FOR UPDATE
  TO "authenticated"
  USING ((org_id = ((auth.jwt() ->> 'org_id'::text))::uuid))
  WITH CHECK ((org_id = ((auth.jwt() ->> 'org_id'::text))::uuid));

CREATE POLICY "Members can view organization deals" ON "public"."deals"
  FOR SELECT
  TO "authenticated"
  USING ((org_id = ((auth.jwt() ->> 'org_id'::text))::uuid));

CREATE POLICY "Owners and Managers can delete organization deals" ON "public"."deals"
  FOR DELETE
  TO "authenticated"
  USING (((org_id = ((auth.jwt() ->> 'org_id'::text))::uuid) AND (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = ANY (ARRAY['owner'::text, 'manager'::text]))));

CREATE POLICY "Members can create organization emails" ON "public"."emails"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (((org_id = ((auth.jwt() ->> 'org_id'::text))::uuid) AND (sender_id = ((auth.jwt() ->> 'member_id'::text))::uuid)));

CREATE POLICY "Members can update organization emails" ON "public"."emails"
  FOR ALL
  TO "authenticated"
  USING ((org_id = ((auth.jwt() ->> 'org_id'::text))::uuid))
  WITH CHECK ((org_id = ((auth.jwt() ->> 'org_id'::text))::uuid));

CREATE POLICY "Members can view organization emails" ON "public"."emails"
  FOR SELECT
  TO "authenticated"
  USING ((org_id = ((auth.jwt() ->> 'org_id'::text))::uuid));

CREATE POLICY "Owners and Managers can delete organization emails" ON "public"."emails"
  FOR DELETE
  TO "authenticated"
  USING (((org_id = ((auth.jwt() ->> 'org_id'::text))::uuid) AND (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = ANY (ARRAY['owner'::text, 'manager'::text]))));

CREATE POLICY "Members can create organization leads" ON "public"."leads"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (((org_id = ((auth.jwt() ->> 'org_id'::text))::uuid) AND (owner_id = ((auth.jwt() ->> 'member_id'::text))::uuid)));

CREATE POLICY "Members can update organization leads" ON "public"."leads"
  FOR UPDATE
  TO "authenticated"
  USING ((org_id = ((auth.jwt() ->> 'org_id'::text))::uuid))
  WITH CHECK ((org_id = ((auth.jwt() ->> 'org_id'::text))::uuid));

CREATE POLICY "Members can view organization leads" ON "public"."leads"
  FOR SELECT
  TO "authenticated"
  USING ((org_id = ((auth.jwt() ->> 'org_id'::text))::uuid));

CREATE POLICY "Owners and Managers can delete organization leads" ON "public"."leads"
  FOR DELETE
  TO "authenticated"
  USING (((org_id = ((auth.jwt() ->> 'org_id'::text))::uuid) AND (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = ANY (ARRAY['owner'::text, 'manager'::text]))));

CREATE POLICY "Members can send messages" ON "public"."messages"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (((sender_id = ((auth.jwt() ->> 'member_id'::text))::uuid) AND public.is_conversation_member(conversation_id, ((auth.jwt() ->> 'member_id'::text))::uuid)));

CREATE POLICY "Members can view conversation messages" ON "public"."messages"
  FOR SELECT
  TO "authenticated"
  USING (public.is_conversation_member(conversation_id, ((auth.jwt() ->> 'member_id'::text))::uuid));

CREATE POLICY "Users can delete own messages" ON "public"."messages"
  FOR DELETE
  TO "authenticated"
  USING ((sender_id = ((auth.jwt() ->> 'member_id'::text))::uuid));

CREATE POLICY "Users can update own messages" ON "public"."messages"
  FOR UPDATE
  TO "authenticated"
  USING ((sender_id = ((auth.jwt() ->> 'member_id'::text))::uuid))
  WITH CHECK ((sender_id = ((auth.jwt() ->> 'member_id'::text))::uuid));

CREATE POLICY "Members can create notes" ON "public"."notes"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (((org_id = ((auth.jwt() ->> 'org_id'::text))::uuid) AND (author_id = ((auth.jwt() ->> 'member_id'::text))::uuid)));

CREATE POLICY "Members can view accessible notes" ON "public"."notes"
  FOR SELECT
  TO "authenticated"
  USING ((org_id = ((auth.jwt() ->> 'org_id'::text))::uuid));

CREATE POLICY "Users can delete own notes" ON "public"."notes"
  FOR DELETE
  TO "authenticated"
  USING (((org_id = ((auth.jwt() ->> 'org_id'::text))::uuid) AND (author_id = ((auth.jwt() ->> 'member_id'::text))::uuid)));

CREATE POLICY "Users can update own notes" ON "public"."notes"
  FOR UPDATE
  TO "authenticated"
  USING (((org_id = ((auth.jwt() ->> 'org_id'::text))::uuid) AND (author_id = ((auth.jwt() ->> 'member_id'::text))::uuid)))
  WITH CHECK (((org_id = ((auth.jwt() ->> 'org_id'::text))::uuid) AND (author_id = ((auth.jwt() ->> 'member_id'::text))::uuid)));

CREATE POLICY "Organization members can view invite acceptances" ON "public"."organization_invite_acceptances"
  FOR SELECT
  TO "authenticated"
  USING ((EXISTS ( SELECT 1
   FROM (public.organization_invites i
     JOIN public.organization_members om ON ((om.org_id = i.org_id)))
  WHERE ((i.id = organization_invite_acceptances.invite_id) AND (om.profile_id = auth.uid())))));

CREATE POLICY "Users can record their own invite acceptance" ON "public"."organization_invite_acceptances"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((profile_id = auth.uid()));

CREATE POLICY "Members can view organization invites" ON "public"."organization_invites"
  FOR SELECT
  TO "authenticated"
  USING ((org_id IN ( SELECT organization_invites.org_id
   FROM public.organization_members
  WHERE ((organization_members.profile_id = auth.uid()) AND (organization_members.status = 'active'::text)))));

CREATE POLICY "Owners and managers can create invites" ON "public"."organization_invites"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((org_id IN ( SELECT organization_invites.org_id
   FROM public.organization_members
  WHERE
    ((organization_members.profile_id = auth.uid()) AND (organization_members.status = 'active'::text) AND (organization_members.role = ANY (ARRAY['owner'::text,
    'manager'::text]))))));

CREATE POLICY "Owners and managers can delete invites" ON "public"."organization_invites"
  FOR DELETE
  TO "authenticated"
  USING ((org_id IN ( SELECT organization_invites.org_id
   FROM public.organization_members
  WHERE
    ((organization_members.profile_id = auth.uid()) AND (organization_members.status = 'active'::text) AND (organization_members.role = ANY (ARRAY['owner'::text,
    'manager'::text]))))));

CREATE POLICY "Owners and managers can update invites" ON "public"."organization_invites"
  FOR UPDATE
  TO "authenticated"
  USING ((org_id IN ( SELECT organization_invites.org_id
   FROM public.organization_members
  WHERE
    ((organization_members.profile_id = auth.uid()) AND (organization_members.status = 'active'::text) AND (organization_members.role = ANY (ARRAY['owner'::text,
    'manager'::text]))))))
  WITH CHECK ((org_id IN ( SELECT organization_invites.org_id
   FROM public.organization_members
  WHERE
    ((organization_members.profile_id = auth.uid()) AND (organization_members.status = 'active'::text) AND (organization_members.role = ANY (ARRAY['owner'::text,
    'manager'::text]))))));

CREATE POLICY "Members can view organization members" ON "public"."organization_members"
  FOR SELECT
  TO "authenticated"
  USING (public.is_org_member(org_id));

CREATE POLICY "Owners and managers can update members" ON "public"."organization_members"
  FOR UPDATE
  TO "authenticated"
  USING (public.has_org_role(org_id, ARRAY['owner'::text, 'manager'::text]))
  WITH CHECK (public.has_org_role(org_id, ARRAY['owner'::text, 'manager'::text]));

CREATE POLICY "Owners can add organization members" ON "public"."organization_members"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (public.has_org_role(org_id, ARRAY['owner'::text]));

CREATE POLICY "Owners can remove organization members" ON "public"."organization_members"
  FOR DELETE
  TO "authenticated"
  USING (public.has_org_role(org_id, ARRAY['owner'::text]));

CREATE POLICY "Members can update organization" ON "public"."organizations"
  FOR UPDATE
  TO "authenticated"
  USING ((id = ((auth.jwt() ->> 'org_id'::text))::uuid))
  WITH CHECK ((id = ((auth.jwt() ->> 'org_id'::text))::uuid));

CREATE POLICY "Members can view organization" ON "public"."organizations"
  FOR SELECT
  TO "authenticated"
  USING ((id = ((auth.jwt() ->> 'org_id'::text))::uuid));

CREATE POLICY "No deletes" ON "public"."organizations"
  FOR DELETE
  TO "authenticated"
  USING (false);

CREATE POLICY "Organization members can view profiles" ON "public"."profiles"
  FOR SELECT
  TO "authenticated"
  USING ((EXISTS ( SELECT 1
   FROM public.organization_members om
  WHERE ((om.profile_id = profiles.id) AND (om.org_id = ((auth.jwt() ->> 'org_id'::text))::uuid) AND (om.deleted_at IS NULL)))));

CREATE POLICY "Users can create their own profile" ON "public"."profiles"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((auth.uid() = id));

CREATE POLICY "Users can update own profile" ON "public"."profiles"
  FOR UPDATE
  TO "authenticated"
  USING ((id = auth.uid()))
  WITH CHECK ((id = auth.uid()));

CREATE POLICY "Users can view their own profile" ON "public"."profiles"
  FOR SELECT
  TO "authenticated"
  USING ((id = auth.uid()));

CREATE POLICY "deny_all_refresh_tokens" ON "public"."refresh_tokens"
  FOR ALL
  TO PUBLIC
  USING (false);

CREATE POLICY "Admins can delete organization sms messages" ON "public"."sms"
  FOR DELETE
  TO "authenticated"
  USING (((org_id = ((auth.jwt() ->> 'org_id'::text))::uuid) AND (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = ANY (ARRAY['owner'::text, 'manager'::text]))));

CREATE POLICY "Members can create organization sms messages" ON "public"."sms"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (((org_id = ((auth.jwt() ->> 'org_id'::text))::uuid) AND (sender_id = ((auth.jwt() ->> 'member_id'::text))::uuid)));

CREATE POLICY "Members can view organization sms messages" ON "public"."sms"
  FOR SELECT
  TO "authenticated"
  USING ((org_id = ((auth.jwt() ->> 'org_id'::text))::uuid));

CREATE POLICY "Members can view organization subscription" ON "public"."subscriptions"
  FOR SELECT
  TO "authenticated"
  USING ((org_id = ((auth.jwt() ->> 'org_id'::text))::uuid));

CREATE POLICY "Owners can create subscription" ON "public"."subscriptions"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (((org_id = ((auth.jwt() ->> 'org_id'::text))::uuid) AND (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'owner'::text)));

CREATE POLICY "Owners can delete subscription" ON "public"."subscriptions"
  FOR DELETE
  TO "authenticated"
  USING (((org_id = ((auth.jwt() ->> 'org_id'::text))::uuid) AND (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'owner'::text)));

CREATE POLICY "Owners can update subscription" ON "public"."subscriptions"
  FOR UPDATE
  TO "authenticated"
  USING (((org_id = ((auth.jwt() ->> 'org_id'::text))::uuid) AND (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'owner'::text)))
  WITH CHECK (((org_id = ((auth.jwt() ->> 'org_id'::text))::uuid) AND (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'owner'::text)));

CREATE POLICY "Admins can delete organization tasks" ON "public"."tasks"
  FOR DELETE
  TO "authenticated"
  USING (((org_id = ((auth.jwt() ->> 'org_id'::text))::uuid) AND (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = ANY (ARRAY['owner'::text, 'manager'::text]))));

CREATE POLICY "Members can create organization tasks" ON "public"."tasks"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (((org_id = ((auth.jwt() ->> 'org_id'::text))::uuid) AND (author_id = ((auth.jwt() ->> 'member_id'::text))::uuid)));

CREATE POLICY "Members can update accessible tasks" ON "public"."tasks"
  FOR UPDATE
  TO "authenticated"
  USING
    (((org_id = ((auth.jwt() ->> 'org_id'::text))::uuid) AND ((author_id = ((auth.jwt() ->> 'member_id'::text))::uuid) OR (assigned_to = ((auth.jwt() ->>
    'member_id'::text))::uuid))))
  WITH CHECK ((org_id = ((auth.jwt() ->> 'org_id'::text))::uuid));

CREATE POLICY "Members can view accessible organization tasks" ON "public"."tasks"
  FOR SELECT
  TO "authenticated"
  USING
    (((org_id = ((auth.jwt() ->> 'org_id'::text))::uuid) AND (((visibility)::text = 'public'::text) OR (author_id = ((auth.jwt() ->> 'member_id'::text))::uuid) OR (assigned_to =
    ((auth.jwt() ->> 'member_id'::text))::uuid))));

ALTER PUBLICATION "supabase_realtime" ADD TABLE "public"."conversation_members";

ALTER PUBLICATION "supabase_realtime" ADD TABLE "public"."conversations";

ALTER PUBLICATION "supabase_realtime" ADD TABLE "public"."messages";

COMMENT ON COLUMN "public"."conversations"."industry" IS '`';

COMMENT ON EXTENSION "pg_cron" IS 'Job scheduler for PostgreSQL';

GRANT EXECUTE ON FUNCTION "public"."auto_update_updated_at"() TO PUBLIC, "anon", "authenticated", "postgres", "service_role";

GRANT EXECUTE ON FUNCTION "public"."cleanup_old_activities"() TO PUBLIC, "anon", "authenticated", "postgres", "service_role";

REVOKE ALL ON FUNCTION "public"."conversation_belongs_to_current_org"(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."conversation_belongs_to_current_org"(uuid) TO "anon", "authenticated", "postgres", "service_role";

GRANT EXECUTE ON FUNCTION "public"."create_super_admin_session"(uuid, text, text, text) TO PUBLIC, "anon", "authenticated", "postgres", "service_role";

GRANT EXECUTE ON FUNCTION "public"."delete_super_admin_session"(text) TO PUBLIC, "anon", "authenticated", "postgres", "service_role";

GRANT EXECUTE ON FUNCTION "public"."generate_member_code"(uuid, text) TO PUBLIC, "anon", "authenticated", "postgres", "service_role";

GRANT EXECUTE ON FUNCTION "public"."generate_org_display_id"() TO PUBLIC, "anon", "authenticated", "postgres", "service_role";

GRANT EXECUTE ON FUNCTION "public"."generate_profile_display_id"() TO PUBLIC, "anon", "authenticated", "postgres", "service_role";

GRANT EXECUTE ON FUNCTION "public"."handle_new_user"() TO PUBLIC, "anon", "authenticated", "postgres", "service_role";

GRANT EXECUTE ON FUNCTION "public"."has_org_role"(uuid, text[]) TO PUBLIC, "anon", "authenticated", "postgres", "service_role";

REVOKE ALL ON FUNCTION "public"."is_active_current_org_member"() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."is_active_current_org_member"() TO "anon", "authenticated", "postgres", "service_role";

GRANT EXECUTE ON FUNCTION "public"."is_conversation_member"(uuid, uuid) TO PUBLIC, "anon", "authenticated", "postgres", "service_role";

GRANT EXECUTE ON FUNCTION "public"."is_current_org_member"(uuid) TO PUBLIC, "anon", "authenticated", "postgres", "service_role";

GRANT EXECUTE ON FUNCTION "public"."is_org_member"(uuid) TO PUBLIC, "anon", "authenticated", "postgres", "service_role";

GRANT EXECUTE ON FUNCTION "public"."log_super_admin_event"(text, uuid, text, jsonb) TO PUBLIC, "anon", "authenticated", "postgres", "service_role";

REVOKE ALL ON FUNCTION "public"."member_belongs_to_current_org"(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."member_belongs_to_current_org"(uuid) TO "anon", "authenticated", "postgres", "service_role";

GRANT EXECUTE ON FUNCTION "public"."set_member_display_id"() TO PUBLIC, "anon", "authenticated", "postgres", "service_role";

GRANT EXECUTE ON FUNCTION "public"."update_admin_last_login"(uuid) TO PUBLIC, "anon", "authenticated", "postgres", "service_role";

GRANT EXECUTE ON FUNCTION "public"."update_conversation_last_message"() TO PUBLIC, "anon", "authenticated", "postgres", "service_role";

GRANT EXECUTE ON FUNCTION "public"."update_super_admin_activity"(text) TO PUBLIC, "anon", "authenticated", "postgres", "service_role";

GRANT EXECUTE ON FUNCTION "public"."update_super_admin_last_login"(uuid) TO PUBLIC, "anon", "authenticated", "postgres", "service_role";

GRANT EXECUTE ON FUNCTION "public"."update_updated_at"() TO PUBLIC, "anon", "authenticated", "postgres", "service_role";

GRANT EXECUTE ON FUNCTION "public"."verify_super_admin_session"(text) TO PUBLIC, "anon", "authenticated", "postgres", "service_role";

GRANT SELECT, UPDATE, USAGE ON SEQUENCE "public"."profile_display_id_seq" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."activities" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."calls" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."contacts" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."conversation_members" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."conversations" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."customers" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."deals" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."emails" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."feedbacks" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."leads" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."messages" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."notes" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE
  ON TABLE "public"."organization_invite_acceptances"
  TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."organization_invites" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE
  ON TABLE "public"."organization_member_counters"
  TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."organization_members" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."organizations" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."profiles" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."refresh_tokens" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."sms" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."subscriptions" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."super_admin_audit_log" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."super_admin_sessions" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."tasks" TO "anon", "authenticated", "postgres", "service_role";

GRANT USAGE ON TYPE "public"."email_provider" TO "postgres";

GRANT USAGE ON TYPE "public"."email_status" TO "postgres";

GRANT USAGE ON TYPE "public"."status" TO "postgres";

GRANT USAGE ON TYPE "public"."task_type" TO "postgres";

SELECT cron.schedule_in_database('cleanup-old-activities', '0 2 * * *', 'select cleanup_old_activities();', 'postgres', NULL, true);

SELECT cron.schedule_in_database('cleanup-retention-data', '0 2 * * *', '
    select cleanup_old_activities();
    select cleanup_old_messages();
  ', 'postgres', NULL, true);

ALTER TABLE "public"."organizations"
  ADD COLUMN "display_id" text NOT NULL DEFAULT public.generate_org_display_id();

ALTER TABLE "public"."organizations"
  ADD CONSTRAINT "organizations_display_id_key" UNIQUE (display_id);

