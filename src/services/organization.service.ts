import { supabaseAdmin } from '../config/supabase';
import { Organization,  CreateOrgDTO } from '../types/organization';
import { logAuditEvent } from './audit.service';
import { AppError } from '../middleware/error.middleware';
import { table } from '../config/tables';

const tab = table.org;

export const createOrganization = async (
  dto: CreateOrgDTO
): Promise<Organization> => {
  const { data, error } = await supabaseAdmin
      .from(tab)
      .insert(dto)
      .select()
      .single()

    if (error) {
      throw new AppError(500, `Failed to create Organization: ${error.message}`);
    }
    return data;
}

export const renameOrganization = async (
  orgId: string,
  name: string,
): Promise<Organization> => {
  const { data, error } = await supabaseAdmin
      .from(tab)
      .update({name: name})
      .eq('org_id', orgId)
      .select()
      .single()

    if (error) {
      throw new AppError(500, `Failed to update Organization: ${error.message}`);
    }
    return data;
}

export const changeOrganizationSubscriber = async (
  orgId: string,
  id: string,
): Promise<Organization> => {
  const { data, error } = await supabaseAdmin
      .from(tab)
      .update({admin_id: id})
      .eq('org_id', orgId)
      .eq('role', 'admin')
      .select()
      .single()

    if (error) {
      throw new AppError(500, `Failed to change Organization owner account: ${error.message}`);
    }
    return data;
}



// export const pauseOrganization = async (
//   orgId: string,
//   superAdminId: string,
//   ipAddress: string
// ): Promise<void> => {
//   try {
//     const { data: org } = await supabaseAdmin
//       .from('organizations')
//       .select('name')
//       .eq('id', orgId)
//       .single();

//     const { error } = await supabaseAdmin
//       .from('organizations')
//       .update({ subscription_status: 'paused' })
//       .eq('id', orgId);

//     if (error) throw error;

//     await logAuditEvent({
//       event_type: 'ORG_PAUSED',
//       super_admin_id: superAdminId,
//       target_org_id: orgId,
//       ip_address: ipAddress,
//       details: { org_name: org?.name },
//     });

//     console.log(`✅ Organization ${orgId} paused by super admin ${superAdminId}`);
//   } catch (err) {
//     console.error('Error pausing organization:', err);
//     throw err;
//   }
// };

// export const resumeOrganization = async (
//   orgId: string,
//   superAdminId: string,
//   ipAddress: string
// ): Promise<void> => {
//   try {
//     const { data: org } = await supabaseAdmin
//       .from('organizations')
//       .select('name')
//       .eq('id', orgId)
//       .single();

//     const { error } = await supabaseAdmin
//       .from('organizations')
//       .update({ subscription_status: 'active' })
//       .eq('id', orgId);

//     if (error) throw error;

//     await logAuditEvent({
//       event_type: 'ORG_RESUMED',
//       super_admin_id: superAdminId,
//       target_org_id: orgId,
//       ip_address: ipAddress,
//       details: { org_name: org?.name },
//     });

//     console.log(`✅ Organization ${orgId} resumed by super admin ${superAdminId}`);
//   } catch (err) {
//     console.error('Error resuming organization:', err);
//     throw err;
//   }
// };


// export const deleteOrganization = async (
//   orgId: string,
//   superAdminId: string,
//   ipAddress: string
// ): Promise<void> => {
//   const { data: org } = await supabaseAdmin
//     .from('organizations')
//     .select('name')
//     .eq('id', orgId)
//     .single();

//   const { error } = await supabaseAdmin
//     .from('organizations')
//     .delete()
//     .eq('id', orgId);

//   if (error) throw error;

//   await logAuditEvent({
//     event_type: 'ORG_DELETED',
//     super_admin_id: superAdminId,
//     target_org_id: orgId,
//     ip_address: ipAddress,
//     details: { org_name: org?.name },
//   });

//   console.log(`✅ Organization ${orgId} deleted by super admin ${superAdminId}`);
// if (error) {
//       throw new AppError(500, `Failed to change Organization owner account: ${error.message}`);
//     }
//     return data;
// };