import { createSupabaseUserClient, supabaseAdmin } from "../config/supabase";
import { AppError } from "../middleware/error.middleware";
import { Roles } from "../types/global";
import { CreateOrganizationMemberDTO, DisplayOrganizationMember, OrganizationMember, OrganizationMemberStatus } from "../types/organization.member";
import { table } from '../config/tables';

const tab = table.orgmembers;
const fkey = 'organization_members_profile_fkey';
const selectAllWithProfile = `*, 
      profile:profiles!${fkey} (
        id,
        first_name,
        last_name,
        email,
        avatar_url
      )`

const all = selectAllWithProfile;


export const getMembershipForAuthFromDB = async (
  profileId: string
): Promise<OrganizationMember | null> => {

  const { data, error } = await supabaseAdmin
    .from(tab)
    .select("*")
    .eq("profile_id", profileId)
    .eq("status", "active")
    .maybeSingle();

    
  if (error) {
    throw new AppError(
      500,
      `Failed to fetch membership: ${error.message}`
    );
  }

  return data;
};

export const getMemberIDbyProfileID = async (
  profileId: string
): Promise<{id: string}> => {

  const { data, error } = await supabaseAdmin
    .from(tab)
    .select("id")
    .eq("profile_id", profileId)
    .eq("status", "active")
    .single();

    
  if (error) {
    throw new AppError(
      500,
      `Failed to fetch membership: ${error.message}`
    );
  }

  return data;
};

export const getMembersListItemFromDB = async (
  orgId: string,
  accessToken: string
): Promise<DisplayOrganizationMember[]> => {

  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .select(all)
    .eq('org_id', orgId)
    .is('deleted_at', null);

  console.log("MEMBERS QUERY ERROR:", error);
  console.log("MEMBERS QUERY DATA:", data);

  if (error) {
    throw new AppError(500, `Failed to fetch profile: ${error.message}`);
  }

  return data ?? [];
};

export const addOrganizationMemberToDB = async (
  dto: CreateOrganizationMemberDTO,
  accessToken: string
): Promise<OrganizationMember> => {

  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .insert({
      org_id: dto.org_id,
      profile_id: dto.profile_id,
      role: dto.role,
      status: dto.status ?? "active",
    })
    .select()
    .single();

  if (error) {
    throw new AppError(
      500,
      `Failed to add organization member: ${error.message}`
    );
  }

  return data;
};


export const getOrganizationMemberByIdFromDB = async (
  memberId: string,
  orgId: string,
  accessToken: string
): Promise<OrganizationMember> => {

  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .select("*")
    .eq("profile_id", memberId)
    .eq("org_id", orgId)
    .single();


  if (error || !data) {
    throw new AppError(
      403,
      "User is not a member of this organization"
    );
  }

  return data;
};

export const requireRole = (
 role:string,
 allowed:string[]
)=>{
 if(!allowed.includes(role)){
   throw new AppError(
     403,
     "Insufficient permissions"
   );
 }
};

export const getOrganizationMembersFromDB = async(
  orgId:string,
  accessToken:string
):Promise<OrganizationMember[]>=>{

  const db=createSupabaseUserClient(accessToken);


  const {data,error}=await db
    .from(tab)
    .select(`
      *,
      profile:profiles(
        id,
        first_name,
        last_name,
        email,
        avatar_url
      )
    `)
    .eq(
      "org_id",
      orgId
    );

 if(error){
   throw new AppError(
     500,
     error.message
   );
 }

 return data ?? [];
};

export const getActiveProfilesFromDB = async (
  orgId: string,
  accessToken: string
): Promise<DisplayOrganizationMember[]> => {

  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .select('*')
    .eq('org_id', orgId)
    .eq('status', 'active')
    .is('deleted_at', null)
    .order("created_at", { ascending: false });

  if (error) {
    throw new AppError(500, `Failed to fetch member profiles: ${error.message}`);
  }

  return data ?? [];
};

export const getAllAgentsFromDB = async (
  orgId: string,
  accessToken: string
): Promise<OrganizationMember[]> => {

  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .select('*')
    .eq('org_id', orgId)
    .eq('role', 'agent')
    .is('deleted_at', null)
    .order("created_at", { ascending: false });

  if (error) {
    throw new AppError(500, `Failed to fetch member agents: ${error.message}`);
  }

  return data ?? [];
};



export const updateMemberRoleFromDB = async(
 memberId:string,
 role:Roles,
 accessToken:string
)=>{
 const db=createSupabaseUserClient(accessToken);


 const {data,error}=await db
 .from(tab)
 .update({
    role
 })
 .eq(
    "id",
    memberId
 )
 .select()
 .single();


 if(error){
   throw new AppError(
    500,
    error.message
   );
 }


 return data;
};

export const updateMemberStatusFromDB = async (
  memberId: string,
  orgId: string,
  status: OrganizationMemberStatus,
  accessToken: string
): Promise<OrganizationMember> => {

  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .update({
      status
    })
    .eq('org_id', orgId)
    .eq('id', memberId)
    .select()
    .single();

  if (error) {
    throw new AppError(
      500,
      `Failed to update status: ${error.message}`
    );
  }

  return data;
};

export const createOwnerMemberToDB = async(
 orgId:string,
 userId:string,
)=>{

 const db = supabaseAdmin;


 const {data, error} = await db
 .from(tab)
 .insert({
    org_id:orgId,
    profile_id:userId,
    role:"owner",
    status:"active"
 })
 .select()
 .single();


 if(error){
   throw new AppError(
    500,
    error.message
   );
 }


 return data;
};

export const removeOrganizationMemberFromDB = async (
  memberId: string,
  orgId: string,
  accessToken: string
): Promise<string> => {

  const db = createSupabaseUserClient(accessToken);

  const { error } = await db
    .from(tab)
    .update({
      deleted_at: new Date().toISOString(),
      status: "inactive",
    })
    .eq("id", memberId)
    .eq("org_id", orgId);

  if (error) {
    throw new AppError(
      500,
      `Failed to remove member: ${error.message}`
    );
  }

  return memberId;
};
