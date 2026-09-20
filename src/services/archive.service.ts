import { SupabaseClient } from "@supabase/supabase-js";
import type {
  ArchiveEntity,
  ArchiveListQuery,
  ArchiveRecord,
  ArchiveType,
} from "../types/archive";
import { AppError } from "../middleware/error.middleware";

type ArchiveRole = "owner" | "manager" | "agent";

type ArchiveMember = {
  id: string;
  profile:
    | {
        first_name: string | null;
        last_name: string | null;
      }
    | {
        first_name: string | null;
        last_name: string | null;
      }[]
    | null;
};

const getMemberDisplayName = (
  member: ArchiveMember | ArchiveMember[] | null | undefined
): { id: string; displayName: string } | null => {
  if (!member) {
    return null;
  }

  const actualMember = Array.isArray(member)
    ? member[0]
    : member;

  if (!actualMember) {
    return null;
  }

  const profile = Array.isArray(actualMember.profile)
    ? actualMember.profile[0]
    : actualMember.profile;

  return {
    id: actualMember.id,
    displayName: [profile?.first_name, profile?.last_name]
      .filter(Boolean)
      .join(" "),
  };
};

const applyAgentScope = (
  builder: any,
  entity: string,
  memberId: string
) => {
  switch (entity) {
    case "notes":
      return builder.eq("author_id", memberId);

    case "sms":
      return builder.eq("sender_id", memberId);

    default:
      return builder.eq("assigned_to", memberId);
  }
};

export const archiveRecordFromDB = async (
  supabase: SupabaseClient,
  orgId: string,
  memberId: string,
  role: ArchiveRole,
  entity: ArchiveEntity,
  id: string
): Promise<void> => {
  const allowedEntities: ArchiveEntity[] = [
    "leads",
    "contacts",
    "deals",
    "customers",
    "tasks",
    "notes",
    "calls",
    "sms",
  ];

  if (!allowedEntities.includes(entity)) {
    throw new AppError(400, "Invalid archive entity");
  }

  const archiveData = {
    is_archived: true,
    archived_at: new Date().toISOString(),
    archived_by: memberId,
  };

  let query = supabase
    .from(entity)
    .update(archiveData)
    .eq("id", id)
    .eq("org_id", orgId)
    .eq("is_archived", false);

  if (role === "agent") {
    query = applyAgentScope(query, entity, memberId);
  }

  const { data, error } = await query
    .select("id")
    .maybeSingle();

  if (error) {
    throw new AppError(500, error.message);
  }

  if (!data) {
    throw new AppError(
      404,
      "Record not found or you do not have permission to archive it"
    );
  }
};

const getRestoreUpdate = (
  entity: ArchiveEntity,
  type: ArchiveType
) => {
  if (type === "archived") {
    return {
      is_archived: false,
      archived_at: null,
      archived_by: null,
    };
  }

  if (entity === "calls") {
    return {
      deleted_at: null,
    };
  }

  return {
    deleted_at: null,
    deleted_by: null,
  };
};

export const restoreRecordFromDB = async (
  supabase: SupabaseClient,
  entity: ArchiveEntity,
  id: string,
  type: ArchiveType,
  orgId: string,
  memberId: string,
  role: ArchiveRole
): Promise<void> => {
  const allowedEntities: ArchiveEntity[] = [
    "leads",
    "contacts",
    "deals",
    "customers",
    "tasks",
    "notes",
    "calls",
    "sms",
  ];

  if (!allowedEntities.includes(entity)) {
    throw new AppError(400, "Invalid archive entity");
  }

  if (type === "deleted" && role === "agent") {
    throw new AppError(
      403,
      "Agents are not allowed to restore deleted records"
    );
  }

  const update = getRestoreUpdate(entity, type);

  let query = supabase
    .from(entity)
    .update(update)
    .eq("id", id)
    .eq("org_id", orgId);

  if (type === "archived") {
    query = query
      .eq("is_archived", true)
      .is("deleted_at", null);
  } else {
    query = query.not("deleted_at", "is", null);
  }

  if (role === "agent") {
    query = applyAgentScope(query, entity, memberId);
  }

  const { data, error } = await query
    .select("id")
    .maybeSingle();

  if (error) {
    throw new AppError(500, error.message);
  }

  if (!data) {
    throw new AppError(
      404,
      "Record not found or you do not have permission to restore it"
    );
  }
};

export const getArchivesFromDB = async (
  supabase: SupabaseClient,
  orgId: string,
  memberId: string,
  role: ArchiveRole,
  query: ArchiveListQuery
): Promise<ArchiveRecord[]> => {
  switch (query.entity) {
    case "leads":
      return getLeads(supabase, orgId, memberId, role, query);

    case "contacts":
      return getContacts(supabase, orgId, memberId, role, query);

    case "deals":
      return getDeals(supabase, orgId, memberId, role, query);

    case "customers":
      return getCustomers(supabase, orgId, memberId, role, query);

    case "tasks":
      return getTasks(supabase, orgId, memberId, role, query);

    case "notes":
      return getNotes(supabase, orgId, memberId, role, query);

    case "calls":
      return getCalls(supabase, orgId, memberId, role, query);

    case "sms":
      return getSms(supabase, orgId, memberId, role, query);

    case "all":
      return getAllArchives(
        supabase,
        orgId,
        memberId,
        role,
        query
      );

    default:
      throw new Error("Invalid archive entity");
  }
};

const getLeads = async (
  supabase: SupabaseClient,
  orgId: string,
  memberId: string,
  role: ArchiveRole,
  query: ArchiveListQuery
): Promise<ArchiveRecord[]> => {
  let builder = supabase
    .from("leads")
    .select(`
      id,
      first_name,
      last_name,
      suffix,
      display_id,
      created_at,
      archived_at,
      deleted_at,
      assigned_to,

      archived_member:organization_members!leads_archived_by_fkey (
        id,
        profile:profiles (
          first_name,
          last_name
        )
      ),

      deleted_member:organization_members!leads_deleted_by_fkey (
        id,
        profile:profiles (
          first_name,
          last_name
        )
      )
    `)
    .eq("org_id", orgId);

  if (query.type === "archived") {
    builder = builder
      .eq("is_archived", true)
      .is("deleted_at", null);
  } else {
    builder = builder.not("deleted_at", "is", null);
  }

  if (role === "agent") {
    builder = builder.eq("assigned_to", memberId);
  }

  if (query.search?.trim()) {
    const search = query.search.trim();

    builder = builder.or(
      `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,company_name.ilike.%${search}%,display_id.ilike.%${search}%`
    );
  }

  const { data, error } = await builder.order("created_at", {
    ascending: false,
  });

  if (error) {
    throw error;
  }

  return (data ?? []).map((lead) => ({
    id: lead.id,
    entityType: "leads" as const,
    displayId: lead.display_id,

    title: [
      lead.first_name,
      lead.last_name,
      lead.suffix,
    ]
      .filter(Boolean)
      .join(" "),

    archivedAt: lead.archived_at,
    archivedBy: getMemberDisplayName(lead.archived_member),

    deletedAt: lead.deleted_at,
    deletedBy: getMemberDisplayName(lead.deleted_member),

    createdAt: lead.created_at,
  }));
};

const getContacts = async (
  supabase: SupabaseClient,
  orgId: string,
  memberId: string,
  role: ArchiveRole,
  query: ArchiveListQuery
): Promise<ArchiveRecord[]> => {
  let builder = supabase
    .from("contacts")
    .select(`
      id,
      first_name,
      last_name,
      suffix,
      email,
      company_name,
      display_id,
      created_at,
      archived_at,
      deleted_at,
      assigned_to,

      archived_member:organization_members!contacts_archived_by_fkey (
        id,
        profile:profiles (
          first_name,
          last_name
        )
      ),

      deleted_member:organization_members!contacts_deleted_by_fkey (
        id,
        profile:profiles (
          first_name,
          last_name
        )
      )
    `)
    .eq("org_id", orgId);

  if (query.type === "archived") {
    builder = builder
      .eq("is_archived", true)
      .is("deleted_at", null);
  } else {
    builder = builder.not("deleted_at", "is", null);
  }

  if (role === "agent") {
    builder = builder.eq("assigned_to", memberId);
  }

  if (query.search?.trim()) {
    const search = query.search.trim();

    builder = builder.or(
      `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,company_name.ilike.%${search}%,display_id.ilike.%${search}%`
    );
  }

  const { data, error } = await builder.order("created_at", {
    ascending: false,
  });

  if (error) {
    throw error;
  }

  return (data ?? []).map((contact) => ({
    id: contact.id,
    entityType: "contacts" as const,
    displayId: contact.display_id,

    title: [
      contact.first_name,
      contact.last_name,
      contact.suffix,
    ]
      .filter(Boolean)
      .join(" "),

    archivedAt: contact.archived_at,
    archivedBy: getMemberDisplayName(contact.archived_member),

    deletedAt: contact.deleted_at,
    deletedBy: getMemberDisplayName(contact.deleted_member),

    createdAt: contact.created_at,
  }));
};

const getDeals = async (
  supabase: SupabaseClient,
  orgId: string,
  memberId: string,
  role: ArchiveRole,
  query: ArchiveListQuery
): Promise<ArchiveRecord[]> => {
  let builder = supabase
    .from("deals")
    .select(`
      id,
      title,
      display_id,
      created_at,
      archived_at,
      deleted_at,
      assigned_to,

      archived_member:organization_members!deals_archived_by_fkey (
        id,
        profile:profiles (
          first_name,
          last_name
        )
      ),

      deleted_member:organization_members!deals_deleted_by_fkey (
        id,
        profile:profiles (
          first_name,
          last_name
        )
      )
    `)
    .eq("org_id", orgId);

  if (query.type === "archived") {
    builder = builder
      .eq("is_archived", true)
      .is("deleted_at", null);
  } else {
    builder = builder.not("deleted_at", "is", null);
  }

  if (role === "agent") {
    builder = builder.eq("assigned_to", memberId);
  }

  if (query.search?.trim()) {
    const search = query.search.trim();

    builder = builder.or(
      `title.ilike.%${search}%,display_id.ilike.%${search}%`
    );
  }

  const { data, error } = await builder.order("created_at", {
    ascending: false,
  });

  if (error) {
    throw error;
  }

  return (data ?? []).map((deal) => ({
    id: deal.id,
    entityType: "deals" as const,
    displayId: deal.display_id,
    title: deal.title,

    archivedAt: deal.archived_at,
    archivedBy: getMemberDisplayName(deal.archived_member),

    deletedAt: deal.deleted_at,
    deletedBy: getMemberDisplayName(deal.deleted_member),

    createdAt: deal.created_at,
  }));
};

const getCustomers = async (
  supabase: SupabaseClient,
  orgId: string,
  memberId: string,
  role: ArchiveRole,
  query: ArchiveListQuery
): Promise<ArchiveRecord[]> => {
  let builder = supabase
    .from("customers")
    .select(`
      id,
      display_id,
      created_at,
      archived_at,
      deleted_at,
      assigned_to,

      contact:contacts!fk_customer_contact (
        first_name,
        last_name,
        suffix,
        email,
        company_name
      ),

      archived_member:organization_members!customers_archived_by_fkey (
        id,
        profile:profiles (
          first_name,
          last_name
        )
      ),

      deleted_member:organization_members!customers_deleted_by_fkey (
        id,
        profile:profiles (
          first_name,
          last_name
        )
      )
    `)
    .eq("org_id", orgId);

  if (query.type === "archived") {
    builder = builder
      .eq("is_archived", true)
      .is("deleted_at", null);
  } else {
    builder = builder.not("deleted_at", "is", null);
  }

  if (role === "agent") {
    builder = builder.eq("assigned_to", memberId);
  }

  if (query.search?.trim()) {
    const search = query.search.trim();

    builder = builder.or(
      `display_id.ilike.%${search}%`
    );
  }

  const { data, error } = await builder.order("created_at", {
    ascending: false,
  });

  if (error) {
    throw error;
  }

  return (data ?? []).map((customer) => ({
    id: customer.id,
    entityType: "customers" as const,
    displayId: customer.display_id,

    title: [
      customer.contact?.[0]?.first_name,
      customer.contact?.[0]?.last_name,
      customer.contact?.[0]?.suffix,
    ]
      .filter(Boolean)
      .join(" "),

    archivedAt: customer.archived_at,
    archivedBy: getMemberDisplayName(customer.archived_member),

    deletedAt: customer.deleted_at,
    deletedBy: getMemberDisplayName(customer.deleted_member),

    createdAt: customer.created_at,
  }));
};

const getNotes = async (
  supabase: SupabaseClient,
  orgId: string,
  memberId: string,
  role: ArchiveRole,
  query: ArchiveListQuery
): Promise<ArchiveRecord[]> => {
  let builder = supabase
    .from("notes")
    .select(`
      id,
      title,
      content,
      display_id,
      created_at,
      archived_at,
      deleted_at,
      author_id,

      archived_member:organization_members!notes_archived_by_fkey (
        id,
        profile:profiles (
          first_name,
          last_name
        )
      ),

      deleted_member:organization_members!notes_deleted_by_fkey (
        id,
        profile:profiles (
          first_name,
          last_name
        )
      )
    `)
    .eq("org_id", orgId);

  if (query.type === "archived") {
    builder = builder
      .eq("is_archived", true)
      .is("deleted_at", null);
  } else {
    builder = builder.not("deleted_at", "is", null);
  }

  if (role === "agent") {
    builder = builder.eq("author_id", memberId);
  }

  if (query.search?.trim()) {
    const search = query.search.trim();

    builder = builder.or(
      `title.ilike.%${search}%,content.ilike.%${search}%,display_id.ilike.%${search}%`
    );
  }

  const { data, error } = await builder.order("created_at", {
    ascending: false,
  });

  if (error) {
    throw error;
  }

  return (data ?? []).map((note) => ({
    id: note.id,
    entityType: "notes" as const,
    displayId: note.display_id,
    title: note.title || "Untitled Note",

    archivedAt: note.archived_at,
    archivedBy: getMemberDisplayName(note.archived_member),

    deletedAt: note.deleted_at,
    deletedBy: getMemberDisplayName(note.deleted_member),

    createdAt: note.created_at,
  }));
};

const getTasks = async (
  supabase: SupabaseClient,
  orgId: string,
  memberId: string,
  role: ArchiveRole,
  query: ArchiveListQuery
): Promise<ArchiveRecord[]> => {
  let builder = supabase
    .from("tasks")
    .select(`
      id,
      title,
      display_id,
      created_at,
      archived_at,
      deleted_at,
      assigned_to,

      archived_member:organization_members!tasks_archived_by_fkey (
        id,
        profile:profiles (
          first_name,
          last_name
        )
      ),

      deleted_member:organization_members!tasks_deleted_by_fkey (
        id,
        profile:profiles (
          first_name,
          last_name
        )
      )
    `)
    .eq("org_id", orgId);

  if (query.type === "archived") {
    builder = builder
      .eq("is_archived", true)
      .is("deleted_at", null);
  } else {
    builder = builder.not("deleted_at", "is", null);
  }

  if (role === "agent") {
    builder = builder.eq("assigned_to", memberId);
  }

  if (query.search?.trim()) {
    const search = query.search.trim();

    builder = builder.or(
      `title.ilike.%${search}%,display_id.ilike.%${search}%`
    );
  }

  const { data, error } = await builder.order("created_at", {
    ascending: false,
  });

  if (error) {
    throw error;
  }

  return (data ?? []).map((task) => ({
    id: task.id,
    entityType: "tasks" as const,
    displayId: task.display_id,
    title: task.title,

    archivedAt: task.archived_at,
    archivedBy: getMemberDisplayName(task.archived_member),

    deletedAt: task.deleted_at,
    deletedBy: getMemberDisplayName(task.deleted_member),

    createdAt: task.created_at,
  }));
};

const getCalls = async (
  supabase: SupabaseClient,
  orgId: string,
  memberId: string,
  role: ArchiveRole,
  query: ArchiveListQuery
): Promise<ArchiveRecord[]> => {
  let builder = supabase
    .from("calls")
    .select(`
      id,
      subject,
      display_id,
      created_at,
      archived_at,
      deleted_at,
      assigned_to,

      archived_member:organization_members!calls_archived_by_fkey (
        id,
        profile:profiles (
          first_name,
          last_name
        )
      )
    `)
    .eq("org_id", orgId);

  if (query.type === "archived") {
    builder = builder
      .eq("is_archived", true)
      .is("deleted_at", null);
  } else {
    builder = builder.not("deleted_at", "is", null);
  }

  if (role === "agent") {
    builder = builder.eq("assigned_to", memberId);
  }

  if (query.search?.trim()) {
    const search = query.search.trim();

    builder = builder.or(
      `subject.ilike.%${search}%,display_id.ilike.%${search}%`
    );
  }

  const { data, error } = await builder.order("created_at", {
    ascending: false,
  });

  if (error) {
    throw error;
  }

  return (data ?? []).map((call) => ({
    id: call.id,
    entityType: "calls" as const,
    displayId: call.display_id,
    title: call.subject,

    archivedAt: call.archived_at,
    archivedBy: getMemberDisplayName(call.archived_member),

    deletedAt: call.deleted_at,
    deletedBy: null,

    createdAt: call.created_at,
  }));
};

const getSms = async (
  supabase: SupabaseClient,
  orgId: string,
  memberId: string,
  role: ArchiveRole,
  query: ArchiveListQuery
): Promise<ArchiveRecord[]> => {
  let builder = supabase
    .from("sms")
    .select(`
      id,
      content,
      created_at,
      archived_at,
      deleted_at,
      sender_id,

      archived_member:organization_members!sms_archived_by_fkey (
        id,
        profile:profiles (
          first_name,
          last_name
        )
      )
    `)
    .eq("org_id", orgId);

  if (query.type === "archived") {
    builder = builder
      .eq("is_archived", true)
      .is("deleted_at", null);
  } else {
    builder = builder.not("deleted_at", "is", null);
  }

  if (role === "agent") {
    builder = builder.eq("sender_id", memberId);
  }

  if (query.search?.trim()) {
    const search = query.search.trim();

    builder = builder.or(
      `content.ilike.%${search}%`
    );
  }

  const { data, error } = await builder.order("created_at", {
    ascending: false,
  });

  if (error) {
    throw error;
  }

  return (data ?? []).map((sms) => ({
    id: sms.id,
    entityType: "sms" as const,
    title: sms.content,

    archivedAt: sms.archived_at,
    archivedBy: getMemberDisplayName(sms.archived_member),

    deletedAt: sms.deleted_at,
    deletedBy: null,

    createdAt: sms.created_at,
  }));
};

const getAllArchives = async (
  supabase: SupabaseClient,
  orgId: string,
  memberId: string,
  role: ArchiveRole,
  query: ArchiveListQuery
): Promise<ArchiveRecord[]> => {
  const results = await Promise.all([
    getLeads(supabase, orgId, memberId, role, query),
    getContacts(supabase, orgId, memberId, role, query),
    getDeals(supabase, orgId, memberId, role, query),
    getCustomers(supabase, orgId, memberId, role, query),
    getTasks(supabase, orgId, memberId, role, query),
    getNotes(supabase, orgId, memberId, role, query),
    getCalls(supabase, orgId, memberId, role, query),
    getSms(supabase, orgId, memberId, role, query),
  ]);

  return results
    .flat()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );
};