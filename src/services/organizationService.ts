import { supabaseAdmin } from '../utils/supabase';
import { logAuditEvent } from './auditService';

/**
 * Pause an organization's subscription
 * Prevents logins for all users in the org
 */
export const pauseOrganization = async (
  orgId: string,
  superAdminId: string,
  ipAddress: string
): Promise<void> => {
  try {
    // Get org name before updating
    const { data: org } = await supabaseAdmin
      .from('organizations')
      .select('name')
      .eq('id', orgId)
      .single();

    // Update org status
    const { error } = await supabaseAdmin
      .from('organizations')
      .update({ subscription_status: 'paused' })
      .eq('id', orgId);

    if (error) throw error;

    // Log to audit
    await logAuditEvent({
      event_type: 'ORG_PAUSED',
      super_admin_id: superAdminId,
      target_org_id: orgId,
      ip_address: ipAddress,
      details: { org_name: org?.name },
    });

    console.log(`✅ Organization ${orgId} paused by super admin ${superAdminId}`);
  } catch (err) {
    console.error('Error pausing organization:', err);
    throw err;
  }
};

/**
 * Resume an organization's subscription
 */
export const resumeOrganization = async (
  orgId: string,
  superAdminId: string,
  ipAddress: string
): Promise<void> => {
  try {
    const { data: org } = await supabaseAdmin
      .from('organizations')
      .select('name')
      .eq('id', orgId)
      .single();

    const { error } = await supabaseAdmin
      .from('organizations')
      .update({ subscription_status: 'active' })
      .eq('id', orgId);

    if (error) throw error;

    await logAuditEvent({
      event_type: 'ORG_RESUMED',
      super_admin_id: superAdminId,
      target_org_id: orgId,
      ip_address: ipAddress,
      details: { org_name: org?.name },
    });

    console.log(`✅ Organization ${orgId} resumed by super admin ${superAdminId}`);
  } catch (err) {
    console.error('Error resuming organization:', err);
    throw err;
  }
};

/**
 * Permanently delete an organization and ALL its data
 * CANNOT BE UNDONE - Deletes all users, contacts, deals, etc in the org
 */
export const deleteOrganization = async (
  orgId: string,
  superAdminId: string,
  ipAddress: string
): Promise<void> => {
  try {
    // Get org name before deleting
    const { data: org } = await supabaseAdmin
      .from('organizations')
      .select('name')
      .eq('id', orgId)
      .single();

    // Delete organization (cascades to all related data)
    const { error } = await supabaseAdmin
      .from('organizations')
      .delete()
      .eq('id', orgId);

    if (error) throw error;

    // Log to audit
    await logAuditEvent({
      event_type: 'ORG_DELETED',
      super_admin_id: superAdminId,
      target_org_id: orgId,
      ip_address: ipAddress,
      details: { org_name: org?.name },
    });

    console.log(`✅ Organization ${orgId} deleted by super admin ${superAdminId}`);
  } catch (err) {
    console.error('Error deleting organization:', err);
    throw err;
  }
};